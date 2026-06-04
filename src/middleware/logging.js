const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function gerarTimestamp() {
  return new Date().toISOString();
}

function registrarAuditoria(tipo, usuario, acao, detalhes = {}) {
  const logEntry = {
    timestamp: gerarTimestamp(),
    tipo,
    usuario: usuario || 'ANONIMO',
    acao,
    detalhes,
    ip: detalhes.ip || 'DESCONHECIDO'
  };
  
  const logFile = path.join(logDir, `auditoria-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

function loggingMiddleware(req, res, next) {
  const inicio = Date.now();
  
  const resOriginal = res.json;
  res.json = function(data) {
    const tempo = Date.now() - inicio;
    const usuario = req.usuario?.sub || 'ANONIMO';
    
    registrarAuditoria('HTTP_REQUEST', usuario, `${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      tempoMs: tempo,
      ip: req.ip,
      resultado: data.erro ? 'ERRO' : 'SUCESSO'
    });
    
    return resOriginal.call(this, data);
  };
  
  next();
}

module.exports = {
  registrarAuditoria,
  loggingMiddleware,
  gerarTimestamp
};
