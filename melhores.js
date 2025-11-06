import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ATENÇÃO: Confirma que estes dados são os teus!
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
  if (error) {
    alert('Erro ao carregar avaliações para o pódio!');
    return [];
  }

  return data.map(av => ({
    ...av,
    notaFinal: calcularMediaFinal(av)
  })).sort((a, b) => b.notaFinal - a.notaFinal);
}

function renderizarPodio(avaliacoes, categoria) {
  const conteudo = document.getElementById('conteudo');
  conteudo.innerHTML = '';

  let filtradas = avaliacoes;
  if (categoria !== 'Geral') {
    filtradas = avaliacoes.filter(av => av.categoria === categoria);
  }

  if (filtradas.length === 0) {
    conteudo.innerHTML = '<p style="text-align: center;">Ainda não há nada no pódio para esta categoria.</p>';
    return;
  }

  filtradas.slice(0, 10).forEach((av, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="top-header" style="display: flex; justify-content: space-between; font-weight: bold;">
        <span class="top-pos" style="color: #d6336c; font-size: 1.5em;">#${index + 1}</span>
        <span class="top-nota" style="color: #4cab02; font-size: 1.5em;">${av.notaFinal.toFixed(1)}</span>
      </div>
      <h2 class="titulo">${av.titulo}</h2>
      <p class="categoria">${av.categoria}</p>
      <img class="imagem-obra" src="${av.imagem_url}" alt="Capa de ${av.titulo}" />
    `;
    conteudo.appendChild(card);
  });
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
