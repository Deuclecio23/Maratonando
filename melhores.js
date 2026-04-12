import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

// ATENÇÃO: Confirma se estes dados são os teus!
const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

const nomesBonitos = {
  historia: "História",
  personagens: "Personagens",
  visual_estilo: "Visual e Estilo",
  emocao_vibe: "Emoção / Vibe",
  surpresa: "Nível de Surpresa"
};
const categoriasDeNotas = Object.keys(nomesBonitos);

function calcularMediaFinal(av) {
  const medias = {};
  const pessoas = ['miri', 'deudeu'];
  
  pessoas.forEach(pessoa => {
    const dados = av[pessoa];
    if (dados) {
      categoriasDeNotas.forEach(cat => {
        if (!medias[cat]) medias[cat] = { soma: 0, count: 0 };
        if (typeof dados[cat] === 'number') {
          medias[cat].soma += dados[cat];
          medias[cat].count++;
        }
      });
    }
  });

  let somaMediaFinal = 0;
  let totalCategoriasFinal = 0;
  for (const cat in medias) {
    if (medias[cat].count > 0) {
      const media = medias[cat].soma / medias[cat].count;
      somaMediaFinal += media;
      totalCategoriasFinal++;
    }
  }
  return totalCategoriasFinal > 0 ? (somaMediaFinal / totalCategoriasFinal) : 0;
}

async function carregarTopAvaliacoes() {
  const { data, error } = await supabase.from('avaliacoes').select('*');
  if (error) { console.error(error); return []; }

  return data.map(av => ({
    ...av,
    notaFinal: calcularMediaFinal(av)
  })).sort((a, b) => b.notaFinal - a.notaFinal);
}

function criarCardPodio(av, index) {
  const card = document.createElement('div');

  const configs = [
    { rankClass: 'rank-1', medalha: '🥇', label: 'TOP 1', slot: 'podio-slot-1' },
    { rankClass: 'rank-2', medalha: '🥈', label: 'TOP 2', slot: 'podio-slot-2' },
    { rankClass: 'rank-3', medalha: '🥉', label: 'TOP 3', slot: 'podio-slot-3' },
  ];

  const cfg = configs[index];
  card.className = `card ${cfg.rankClass} podio-card`;
  card.innerHTML = `
    <div class="podio-medalha">${cfg.medalha}</div>
    <img class="imagem-obra" src="${av.imagem_url}" alt="Capa de ${av.titulo}" />
    <h2 class="titulo">${av.titulo}</h2>
    <p class="categoria">${av.categoria}</p>
    <div class="podio-nota">${av.notaFinal.toFixed(1)}</div>
    <div class="podio-pedestal podio-pedestal-${index + 1}">
      <span class="podio-pedestal-label">${cfg.label}</span>
    </div>
  `;
  return card;
}

function criarCardLista(av, index) {
  const card = document.createElement('div');
  card.className = 'card rank-outros lista-card';
  card.innerHTML = `
    <div class="top-header" style="display: flex; justify-content: space-between; align-items: center; font-weight: bold;">
      <span class="top-pos" style="font-size:1.1em; color:#a08898;">#${index + 1}</span>
      <span class="top-nota" style="color: #e91e8c; font-size: 1.15em; font-weight:700;">${av.notaFinal.toFixed(1)}</span>
    </div>
    <img class="imagem-obra" src="${av.imagem_url}" alt="Capa de ${av.titulo}" />
    <h2 class="titulo">${av.titulo}</h2>
    <p class="categoria">${av.categoria}</p>
  `;
  return card;
}

function renderizarPodio(avaliacoes, categoria) {
  const conteudo = document.getElementById('conteudo');
  conteudo.innerHTML = '';

  let filtradas = avaliacoes;
  if (categoria !== 'Geral') {
    filtradas = avaliacoes.filter(av => av.categoria === categoria);
  }

  if (filtradas.length === 0) {
    conteudo.innerHTML = '<p style="text-align: center; color: #a08898; font-style: italic; margin-top: 40px;">Ainda não há nada no pódio para esta categoria. 🎬</p>';
    return;
  }

  const top3 = filtradas.slice(0, 3);
  const resto = filtradas.slice(3, 10);

  // === PÓDIO VISUAL (Top 3) ===
  // Ordem visual: 2º (esquerda), 1º (centro), 3º (direita)
  const podioWrapper = document.createElement('div');
  podioWrapper.className = 'podio-wrapper';

  const ordemVisual = [1, 0, 2]; // índices: 2º, 1º, 3º
  ordemVisual.forEach(i => {
    if (top3[i]) {
      const slot = document.createElement('div');
      slot.className = `podio-slot podio-slot-${i + 1}`;
      slot.appendChild(criarCardPodio(top3[i], i));
      podioWrapper.appendChild(slot);
    }
  });

  conteudo.appendChild(podioWrapper);

  // === LISTA (4º em diante) ===
  if (resto.length > 0) {
    const divisor = document.createElement('div');
    divisor.className = 'podio-divisor';
    divisor.innerHTML = '<span>✦ Mais obras ✦</span>';
    conteudo.appendChild(divisor);

    resto.forEach((av, i) => {
      conteudo.appendChild(criarCardLista(av, i + 4));
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const todasAvaliacoes = await carregarTopAvaliacoes();
  renderizarPodio(todasAvaliacoes, 'Geral');

  document.querySelectorAll('#tabs-categorias .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const categoria = tab.dataset.categoria;
      renderizarPodio(todasAvaliacoes, categoria);
    });
  });
});
