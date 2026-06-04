# JeaxLabs - Frontend e Backend Seguro

## 📋 Estrutura do Projeto

```
/workspaces/lalalalala/
├── public/                    # Frontend (visível para o usuário)
│   ├── index.html            # Página HTML
│   ├── css/
│   │   └── style.css         # Estilos
│   └── js/
│       └── app.js            # JavaScript que consome API
├── midias/                   # Mídias (imagens, fotos)
├── server.js                 # Backend (PRIVADO - API)
├── dados.json                # Dados da empresa (PRIVADO)
├── package.json              # Dependências
└── .gitignore               # Arquivos ignorados no Git
```

## 🚀 Como Começar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Servidor
```bash
npm start
```

O servidor rodará em `http://localhost:3000`

## 🔒 Segurança

- **Frontend**: Fica em `/public` - totalmente visível
- **Backend**: Fica em `server.js` - **PRIVADO** (não acessível de fora)
- **Dados**: Ficam em `dados.json` - **PRIVADO** (no servidor)

## 📡 API Endpoints

```
GET /api/dados              # Retorna todos os dados
GET /api/dados/:secao       # Retorna dados de uma seção específica
```

Exemplos:
- `http://localhost:3000/api/dados` - Todos os dados
- `http://localhost:3000/api/dados/config` - Apenas configurações
- `http://localhost:3000/api/dados/apps` - Apenas aplicativos

## ✏️ Como Editar os Dados

Os dados estão em `dados.json`. Para modificá-los:

1. Edite o arquivo `dados.json`
2. Reinicie o servidor (`npm start`)
3. O frontend carregará automaticamente os novos dados

## 🌐 Deployment

Para colocar em produção:

1. Faça deploy do projeto em um servidor (Heroku, Railway, etc.)
2. O backend será executado no servidor
3. O frontend será servido automaticamente
4. Ninguém poderá acessar `dados.json` ou `server.js` diretamente

## 📝 Notas Importantes

- O arquivo `dados.json` é seguro - está no backend
- O arquivo `server.js` é seguro - está no backend
- Apenas o conteúdo da pasta `/public` é acessível
- As requisições de dados vêm via API `/api/dados`
