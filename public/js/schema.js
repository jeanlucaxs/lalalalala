const dataSchema = {
  config: {
    nomeEmpresa: { type: 'string', required: true },
    tituloSite: { type: 'string', required: true },
    whatsapp: { type: 'string', required: true, pattern: /^\d{10,}$/ },
    cidade: { type: 'string', required: false },
    email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  },
  hero: {
    titulo: { type: 'string', required: true },
    desc: { type: 'string', required: true },
    botao: { type: 'string', required: true }
  },
  sobre: {
    titulo: { type: 'string', required: true },
    texto: { type: 'string', required: true }
  },
  menu: {
    type: 'object',
    required: true,
    items: { type: 'string' }
  },
  apps: {
    type: 'array',
    required: true,
    items: {
      id: { type: 'string', required: true },
      nome: { type: 'string', required: true },
      preco: { type: 'string', required: true },
      desc: { type: 'string', required: true },
      icone: { type: 'string', required: true }
    }
  },
  personalizado: {
    titulo: { type: 'string', required: true },
    desc: { type: 'string', required: true },
    obs: { type: 'string', required: true },
    botao: { type: 'string', required: true }
  }
};

function validarSchema(data, schema) {
  for (const [key, rules] of Object.entries(schema)) {
    if (!data.hasOwnProperty(key)) {
      if (rules.required) {
        throw new Error(`Campo obrigatório ausente: ${key}`);
      }
      continue;
    }

    const value = data[key];

    if (rules.type === 'string') {
      if (typeof value !== 'string') {
        throw new Error(`${key} deve ser string`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        throw new Error(`${key} possui formato inválido`);
      }
    }

    if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        throw new Error(`${key} deve ser array`);
      }
      if (rules.items) {
        value.forEach((item, idx) => {
          try {
            validarSchema(item, rules.items);
          } catch (e) {
            throw new Error(`${key}[${idx}]: ${e.message}`);
          }
        });
      }
    }

    if (rules.type === 'object') {
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${key} deve ser objeto`);
      }
      if (rules.items) {
        for (const [k, v] of Object.entries(value)) {
          if (typeof v !== rules.items.type) {
            throw new Error(`${key}.${k} deve ser ${rules.items.type}`);
          }
        }
      }
    }
  }
  return true;
}
