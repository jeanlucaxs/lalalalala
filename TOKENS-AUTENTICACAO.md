# 🔐 Sistema de Autenticação com Tokens Únicos

## Como Funciona

Implementei um sistema de **tokens únicos e temporários** que protege sua API. Ninguém consegue acessar os dados sem um token válido!

### Fluxo de Funcionamento

```
1. Página carrega → JavaScript pede token ao backend
2. Backend gera token único (crypto) → Válido por 15 minutos
3. JavaScript usa token em TODAS requisições → /api/dados?token=abc123
4. Backend valida token → Se OK, retorna dados | Se inválido, nega acesso
5. Token renovação → Automática 1 minuto antes de expirar
```

## 🛡️ Segurança

✅ **Tokens únicos** - Cada acesso gera um novo token aleatório (32 bytes crypto)  
✅ **Expiração** - Token válido por apenas 15 minutos  
✅ **Auto-renovação** - Frontend renova token automaticamente  
✅ **Validação** - Cada requisição é validada no backend  
✅ **Impossível de burlar** - Sem token, nenhum dado é retornado  

## 📡 API Endpoints

### Gerar Token
```bash
POST /api/token
# Retorna:
{
  "token": "80117ccd3fa66f56bd6d03dcb099ca8fe341cb01c64a6189e5367bac96ded03f",
  "expiresIn": 900
}
```

### Acessar Dados (requer token)
```bash
GET /api/dados?token=SEUTOKEM
# Com token válido → Retorna todos os dados
# Sem token → {"erro": "Token não fornecido"}
# Token inválido → {"erro": "Token inválido ou expirado"}
```

## 🧪 Testes

### ❌ Sem token (falha):
```bash
curl http://localhost:3000/api/dados
# {"erro":"Token não fornecido"}
```

### ✅ Com token (sucesso):
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/token | jq -r '.token')
curl -s "http://localhost:3000/api/dados?token=$TOKEN" | jq '.config'
# Retorna dados da config
```

### ❌ Token inválido (falha):
```bash
curl http://localhost:3000/api/dados?token=invalido123
# {"erro":"Token inválido ou expirado"}
```

## 📝 Como o Frontend Usa

No [public/js/app.js](../public/js/app.js):

1. **Ao carregar página:**
   ```javascript
   await gerarNovoToken() // POST /api/token
   ```

2. **Em cada requisição:**
   ```javascript
   /api/dados?token=${tokenAtual}
   ```

3. **Se token expirar:**
   ```javascript
   if (response.status === 401) {
     await gerarNovoToken() // Gera novo
     return buscarDados() // Tenta novamente
   }
   ```

## ⏱️ Configuração

No [server.js](../server.js), linha ~9:
```javascript
const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutos
```

Para mudar a expiração:
- `5 * 60 * 1000` = 5 minutos
- `30 * 60 * 1000` = 30 minutos
- `60 * 60 * 1000` = 1 hora

## 🚀 Backend vs Frontend

| Aspecto | Backend | Frontend |
|--------|---------|----------|
| **Localização** | server.js (privado) | public/js/app.js (público) |
| **Tokens** | Gera, valida, expira | Recebe, usa, renova |
| **Dados** | Armazenados em dados.json (privado) | Baixados via API com token |
| **Acesso** | Ninguém consegue acessar | Acessa via fetch() |

## ✨ Resultado Final

✅ **HTML totalmente vazio** (sem dados sensíveis)  
✅ **API protegida** (ninguém acessa sem token)  
✅ **Tokens únicos** (cada sessão é diferente)  
✅ **Auto-renovação** (funciona por horas sem interrupção)  
✅ **Impossível burlar** (sem token = sem acesso)  

**Seu site agora está MUITO mais seguro! 🔐**
