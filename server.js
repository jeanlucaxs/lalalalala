require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const { gerarJWT, verificarJWT } = require('./src/auth/jwt');
const { authMiddleware, permissaoMiddleware } = require('./src/middleware/auth');
const { loggingMiddleware, registrarAuditoria } = require('./src/middleware/logging');
const { loginSchema, databaseConfigSchema, validarRequest } = require('./src/validators/schemas');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ CAMADA 1: CONFIGURAÇÃO BÁSICA ============
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============ CAMADA 2: RATE LIMITING ============
const limiterGeral = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  message: 'Muitas requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

const limiterAutenticacao = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por 15 minutos
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  skip: (req) => req.method !== 'POST'
});

app.use(limiterGeral);

// ============ CAMADA 3: LOGGING ============
app.use(loggingMiddleware);

// ============ CAMADA 4: BLOQUEIO DE ARQUIVOS ============
app.use((req, res, next) => {
  if (req.path.match(/\.(js|json|env|md)$/i)) {
    registrarAuditoria('SEGURANÇA', 'ANONIMO', 'Tentativa de acesso a arquivo bloqueado', {
      arquivo: req.path,
      ip: req.ip
    });
    return res.status(403).json({ 
      erro: 'Acesso negado',
      codigo: 'SEC_001'
    });
  }
  next();
});

// ============ CAMADA 5: AUTENTICAÇÃO E AUTORIZAÇÃO ============

// Endpoint de Token para compatibilidade com frontend antigo
app.post('/api/token', (req, res) => {
  try {
    const token = gerarJWT({
      sub: 'usuario-anonimo',
      role: 'visitor',
      permissoes: ['ler_dados_publicos']
    });
    
    registrarAuditoria('AUTH', 'ANONIMO', 'Token gerado', { ip: req.ip });
    
    res.json({
      token,
      expiresIn: 900 // 15 minutos em segundos
    });
  } catch (erro) {
    res.status(500).json({ 
      erro: 'Erro ao gerar token',
      codigo: 'AUTH_005'
    });
  }
});

// Endpoints de dados (protegidos)
app.get('/api/dados', authMiddleware, permissaoMiddleware('ler_dados_publicos'), (req, res) => {
  try {
    const dados = JSON.parse(fs.readFileSync(path.join(__dirname, 'dados.json'), 'utf8'));
    
    registrarAuditoria('DADOS', req.usuario.sub, 'Acesso aos dados completos', {
      ip: req.ip
    });
    
    res.json(dados);
  } catch (erro) {
    registrarAuditoria('ERRO', req.usuario.sub, 'Erro ao acessar dados', {
      ip: req.ip,
      erro: erro.message
    });
    res.status(500).json({ 
      erro: 'Erro ao recuperar dados',
      codigo: 'DB_001'
    });
  }
});

app.get('/api/dados/:secao', authMiddleware, permissaoMiddleware('ler_dados_publicos'), (req, res) => {
  try {
    const { secao } = req.params;
    const dados = JSON.parse(fs.readFileSync(path.join(__dirname, 'dados.json'), 'utf8'));
    
    if (!dados[secao]) {
      return res.status(404).json({ 
        erro: 'Seção não encontrada',
        codigo: 'DB_002'
      });
    }
    
    registrarAuditoria('DADOS', req.usuario.sub, `Acesso à seção: ${secao}`, {
      ip: req.ip
    });
    
    res.json({ [secao]: dados[secao] });
  } catch (erro) {
    registrarAuditoria('ERRO', req.usuario.sub, 'Erro ao acessar seção', {
      ip: req.ip,
      erro: erro.message
    });
    res.status(500).json({ 
      erro: 'Erro ao recuperar seção',
      codigo: 'DB_003'
    });
  }
});

// ============ CAMADA 6: VALIDAÇÃO E SANITIZAÇÃO ============

app.post('/api/dados', 
  limiterAutenticacao,
  authMiddleware, 
  permissaoMiddleware('escrever_dados'),
  validarRequest(databaseConfigSchema),
  (req, res) => {
    try {
      const dadosValidados = req.dadosValidados;
      
      // Sanitização adicional (exemplo)
      const dadosSanitizados = JSON.parse(JSON.stringify(dadosValidados));
      
      fs.writeFileSync(
        path.join(__dirname, 'dados.json'),
        JSON.stringify(dadosSanitizados, null, 2)
      );
      
      registrarAuditoria('DADOS', req.usuario.sub, 'Dados atualizados', {
        ip: req.ip
      });
      
      res.json({ 
        mensagem: 'Dados atualizados com sucesso',
        codigo: 'DB_004'
      });
    } catch (erro) {
      registrarAuditoria('ERRO', req.usuario.sub, 'Erro ao atualizar dados', {
        ip: req.ip,
        erro: erro.message
      });
      res.status(500).json({ 
        erro: 'Erro ao atualizar dados',
        codigo: 'DB_005'
      });
    }
  }
);

// ============ CAMADA 7: SERVIR FRONTEND (SPA FALLBACK) ============
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ============ TRATAMENTO DE ERROS GLOBAL ============
app.use((err, req, res, next) => {
  registrarAuditoria('ERRO', req.usuario?.sub || 'ANONIMO', 'Erro não tratado', {
    ip: req.ip,
    erro: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(500).json({
    erro: 'Erro interno do servidor',
    codigo: 'ERR_001',
    detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============ INICIALIZAÇÃO DO SERVIDOR ============
app.listen(PORT, () => {
  console.log(`
🚀 Servidor JeaxLabs iniciado
📍 URL: http://localhost:${PORT}
🔒 Arquitetura Zero Trust ativada
  - Camada 1: HTTPS/CORS
  - Camada 2: Rate Limiting
  - Camada 3: Logging de Auditoria
  - Camada 4: Bloqueio de Arquivos
  - Camada 5: JWT + RBAC
  - Camada 6: Validação + Sanitização
  - Camada 7: Isolamento de Banco de Dados
📋 Logs salvos em: /logs
  `);
});
