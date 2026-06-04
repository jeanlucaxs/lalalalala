# 🔐 Arquitetura de Segurança - Princípio da Desconfiança Total (Zero Trust)

## 📋 Estrutura Proposta

### 1. **Autenticação com JWT Robusto**
```
Cliente → POST /auth/login → Backend gera JWT (com signature)
Cliente → GET /api/dados (header: Authorization: Bearer JWT)
Backend → Valida JWT → Se OK, processa
```

### 2. **Autorização por Permissões**
```
JWT contém: { userId, roles, permissions, expiresAt }
Backend valida CADA endpoint se user tem permissão
```

### 3. **Validação Estrita de Dados**
```
Input → Tipagem (Zod/Joi) → Sanitização → Processamento
Banco de Dados → Parametrized Queries (SQL Injection prevention)
```

### 4. **Isolamento de Banco de Dados**
```
Apenas Backend acessa DB
DB tem users/roles/permissions próprios
Conexão com credenciais limitadas (read-only quando possível)
```

### 5. **Princípios Zero Trust**
```
✅ Nunca confiar em dados do cliente
✅ Validar e autorizar CADA requisição
✅ Falhar seguramente (deny by default)
✅ Logar tudo para auditoria
✅ CORS, Rate Limit, HTTPS
```

## 🏗️ Arquitetura do Projeto

```
/backend
  ├── src/
  │   ├── auth/
  │   │   ├── jwt.js          (geração, validação de JWT)
  │   │   ├── authMiddleware.js (validação de token)
  │   │   └── permissions.js  (verificação de permissões)
  │   ├── validators/
  │   │   ├── requestValidator.js (input validation)
  │   │   └── schemas.js      (Zod schemas)
  │   ├── database/
  │   │   ├── connection.js   (pool com credentials limitados)
  │   │   ├── models/
  │   │   │   ├── User.js
  │   │   │   ├── Role.js
  │   │   │   └── Permission.js
  │   │   └── migrations/     (versionamento de schema)
  │   ├── routes/
  │   │   ├── auth.js         (login, logout, refresh)
  │   │   ├── users.js        (CRUD com validação)
  │   │   └── data.js         (dados da empresa - público mas validado)
  │   ├── middleware/
  │   │   ├── errorHandler.js (não expor detalhes)
  │   │   ├── rateLimiter.js
  │   │   ├── cors.js
  │   │   └── logging.js      (auditoria)
  │   └── server.js           (main)
  ├── .env                    (secrets - nunca commit)
  ├── .env.example            (template sem valores)
  ├── package.json
  └── docker-compose.yml      (database isolado)

/frontend
  ├── public/
  │   ├── index.html          (com JS inline)
  │   └── css/
  └── src/
      └── api.js             (client SDK com token management)
```

## 🔑 JWT Seguro

```javascript
{
  "sub": "user123",           // Subject (user ID)
  "roles": ["user"],          // Roles
  "permissions": ["read:data"],
  "iat": 1623456789,          // Issued at
  "exp": 1623543189,          // Expires in (15 min)
  "aud": "jeaxlabs-api",      // Audience
  "iss": "jeaxlabs-auth"      // Issuer
}
```

## 🛡️ Validação em Camadas

```
1. HTTPS only (TLS 1.3+)
2. CORS restritivo
3. Rate limiting (100 req/min por IP)
4. JWT valido?
5. Permissão para endpoint?
6. Input schema válido?
7. Sanitização de strings
8. Parametrized queries
9. Erro handling seguro
```

## 📊 Fluxo de Requisição Segura

```
1. Cliente → Requisição com JWT no header
   ↓
2. CORS middleware → Valida origem
   ↓
3. Rate limiter → Valida limite de requisições
   ↓
4. Auth middleware → Decodifica e valida JWT
   ↓
5. Permission middleware → Valida se user pode acessar endpoint
   ↓
6. Validator middleware → Valida schema de input
   ↓
7. Controller/Handler → Processa e acessa DB
   ↓
8. DB query → Parametrized (safe)
   ↓
9. Response middleware → Remove dados sensíveis
   ↓
10. Cliente ← Resposta segura
```

## 🔐 Princípios Implementados

| Princípio | Implementação |
|-----------|---------------|
| **Autenticação** | JWT com signature e expiração |
| **Autorização** | Roles e Permissions por endpoint |
| **Validação** | Zod/Joi para input validation |
| **Isolamento BD** | Conexão separada com credenciais limitadas |
| **SQL Injection** | Parametrized queries |
| **CORS** | Whitelist de origens |
| **Rate Limit** | 100 req/min por IP |
| **HTTPS** | Obrigatório em produção |
| **Cookies** | HttpOnly, Secure, SameSite |
| **Logging** | Auditoria completa de ações |
| **Error Handling** | Não expor stack traces |
| **OWASP** | Top 10 vulnerabilities prevenidas |

## 🚀 Próximas Etapas

1. ✅ Implementar autenticação JWT
2. ✅ Adicionar validação com Zod
3. ✅ Criar sistema de roles/permissions
4. ✅ Isolamento de banco de dados
5. ✅ Rate limiting e CORS
6. ✅ Logging e auditoria
7. ✅ Testes de segurança
8. ✅ Documentação de API (OpenAPI/Swagger)

## 💾 Banco de Dados - Schema Seguro

```sql
-- Users com hash de senha
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  resource VARCHAR NOT NULL,
  action VARCHAR NOT NULL
);

-- User-Role association
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

-- Role-Permission association
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- Audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  resource VARCHAR NOT NULL,
  result VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Você quer que eu implemente essa arquitetura no projeto? Posso começar por:**

1. Adicionar JWT autenticação
2. Criar sistema de roles/permissions
3. Implementar validação com Zod
4. Adicionar rate limiting e logging
5. Estruturar banco de dados (se usar SQL)
