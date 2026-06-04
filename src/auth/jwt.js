require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jeaxlabs-secret-key-change-in-production';
const JWT_EXPIRY = '15m';

function gerarJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function verificarJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (erro) {
    return null;
  }
}

function extrairToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

module.exports = {
  gerarJWT,
  verificarJWT,
  extrairToken,
  JWT_SECRET,
  JWT_EXPIRY
};
