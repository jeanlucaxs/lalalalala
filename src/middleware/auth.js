const { verificarJWT, extrairToken } = require('./jwt');

function authMiddleware(req, res, next) {
  const token = extrairToken(req);
  
  if (!token) {
    return res.status(401).json({ 
      erro: 'Token não fornecido',
      codigo: 'AUTH_001'
    });
  }
  
  const payload = verificarJWT(token);
  if (!payload) {
    return res.status(401).json({ 
      erro: 'Token inválido ou expirado',
      codigo: 'AUTH_002'
    });
  }
  
  req.usuario = payload;
  next();
}

function permissaoMiddleware(permissaoRequerida) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        erro: 'Não autenticado',
        codigo: 'AUTH_003'
      });
    }
    
    const permissoes = req.usuario.permissoes || [];
    if (!permissoes.includes(permissaoRequerida)) {
      return res.status(403).json({ 
        erro: 'Permissão insuficiente',
        codigo: 'AUTH_004',
        requerida: permissaoRequerida
      });
    }
    
    next();
  };
}

module.exports = {
  authMiddleware,
  permissaoMiddleware
};
