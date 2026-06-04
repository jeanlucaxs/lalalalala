const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const databaseConfigSchema = z.object({
  config: z.object({
    nomeEmpresa: z.string().min(1, 'Nome da empresa obrigatório'),
    tituloSite: z.string().min(1, 'Título do site obrigatório'),
    whatsapp: z.string().regex(/^\d{10,}$/, 'WhatsApp inválido'),
    email: z.string().email('Email inválido'),
    cidade: z.string().optional()
  }),
  hero: z.object({
    titulo: z.string().min(1),
    desc: z.string().min(1),
    botao: z.string().min(1)
  }),
  sobre: z.object({
    titulo: z.string().min(1),
    texto: z.string().min(1)
  }),
  menu: z.record(z.string()),
  apps: z.array(z.object({
    id: z.string(),
    nome: z.string().min(1),
    preco: z.string().min(1),
    desc: z.string().min(1),
    icone: z.string().min(1)
  })),
  personalizado: z.object({
    titulo: z.string().min(1),
    desc: z.string().min(1),
    obs: z.string().min(1),
    botao: z.string().min(1)
  })
});

function validarRequest(schema) {
  return (req, res, next) => {
    try {
      const resultado = schema.parse(req.body);
      req.dadosValidados = resultado;
      next();
    } catch (erro) {
      return res.status(400).json({ 
        erro: 'Dados inválidos',
        detalhes: erro.errors.map(e => ({
          campo: e.path.join('.'),
          mensagem: e.message
        }))
      });
    }
  };
}

module.exports = {
  loginSchema,
  databaseConfigSchema,
  validarRequest
};
