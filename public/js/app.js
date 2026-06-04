let info = {};
let tokenAtual = null;
let tokenExpiresAt = null;
let renovacaoTimer = null;

async function gerarNovoToken() {
  try {
    const response = await fetch('/api/token', { method: 'POST' });
    const tokenData = await response.json();
    
    tokenAtual = tokenData.token;
    tokenExpiresAt = Date.now() + (tokenData.expiresIn * 1000);
    
    agendarRenovacaoToken(tokenData.expiresIn);
    
    return tokenAtual;
  } catch (erro) {
    console.error('Erro ao gerar token:', erro);
    throw erro;
  }
}

function agendarRenovacaoToken(expiresIn) {
  const tempoRenovacao = (expiresIn - 60) * 1000;
  
  if (renovacaoTimer) {
    clearTimeout(renovacaoTimer);
  }
  
  if (tempoRenovacao > 0) {
    renovacaoTimer = setTimeout(async () => {
      try {
        await gerarNovoToken();
      } catch (erro) {
        console.error('Erro ao renovar token:', erro);
      }
    }, tempoRenovacao);
  }
}

async function buscarDados(endpoint = '') {
  if (!tokenAtual) {
    await gerarNovoToken();
  }
  
  const url = endpoint ? `/api/${endpoint}?token=${tokenAtual}` : `/api/dados?token=${tokenAtual}`;
  
  try {
    const response = await fetch(url);
    
    if (response.status === 401) {
      await gerarNovoToken();
      return buscarDados(endpoint);
    }
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (erro) {
    console.error('Erro ao buscar dados:', erro);
    throw erro;
  }
}

async function carregarDados() {
  try {
    await gerarNovoToken();
    
    info = await buscarDados('dados');
    
    validarSchema(info, dataSchema);
    
    renderizarPagina();
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro);
    document.body.innerHTML = '<div style="text-align: center; margin-top: 100px; color: #e6f1ff;"><h1>Erro ao carregar dados</h1><p>Verifique se o servidor está rodando.</p></div>';
  }
}

function renderizarPagina() {
  document.getElementById('tituloPagina').innerText = info.config.tituloSite;
  document.getElementById('headerLogo').innerHTML = `${info.config.nomeEmpresa.slice(0,4)}<span style="color:white">${info.config.nomeEmpresa.slice(4)}</span>`;
  
  document.getElementById('heroTitulo').innerText = info.hero.titulo;
  document.getElementById('heroDesc').innerText = info.hero.desc;
  document.getElementById('heroBtn').innerText = info.hero.botao;
  
  document.getElementById('footerTexto').innerHTML = `&copy; 2026 ${info.config.nomeEmpresa} - Todos os direitos reservados.`;
  
  const waLink = `https://wa.me/${info.config.whatsapp}`;
  document.getElementById('floatWhats').href = waLink;
  document.getElementById('linkWhatsTexto').href = waLink;
  document.getElementById('linkWhatsTexto').innerText = `+${info.config.whatsapp}`;
  
  document.getElementById('sobreCorpo').innerHTML = `<h2 class="highlight">${info.sobre.titulo}</h2><p>${info.sobre.texto}</p>`;

  const nav = document.getElementById('navLinks');
  Object.entries(info.menu).forEach(([label, link]) => {
    nav.innerHTML += `<a href="${link}">${label}</a>`;
  });

  const container = document.getElementById('containerApps');
  info.apps.forEach(app => {
    container.innerHTML += `
      <div class="card" onclick="abrirModal('${app.id}')">
        <i class="fas ${app.icone}"></i>
        <h3>${app.nome}</h3>
        <span class="preco-tag">${app.preco}</span>
        <p>${app.desc}</p>
        <div class="btn-ver">VER DETALHES</div>
      </div>
    `;
  });

  document.getElementById('boxPersonalizado').innerHTML = `
    <h2>${info.personalizado.titulo}</h2>
    <p style="margin:20px 0;">${info.personalizado.desc}</p>
    <p style="font-size: 0.8rem; color: var(--texto-cinza); margin-bottom: 20px; font-style: italic;">${info.personalizado.obs}</p>
    <a href="${waLink}" class="btn-cta">${info.personalizado.botao}</a>
  `;
}

function abrirModal(appId) {
  const app = info.apps.find(a => a.id === appId);
  if (!app) return;
  
  const corpo = document.getElementById('modalCorpo');
  const waLink = `https://wa.me/${info.config.whatsapp}`;
  
  corpo.innerHTML = `
    <h2 class="highlight">${app.nome}</h2>
    <div class="galeria-modal">
      ${[1,2,3,4,5,6,7,8].map(n => 
        `<img src="/midias/${app.id}/${n}.png" onerror="this.src='https://via.placeholder.com/200x120/112240/007bff?text=Preview+${n}'"`
      ).join('')}
    </div>
    <a href="${waLink}?text=Interesse: ${app.nome}" class="btn-cta" target="_blank">ADQUIRIR POR ${app.preco}</a>
  `;
  
  document.getElementById('appModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('appModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', carregarDados);
