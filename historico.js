import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ojxgshhyzvczdxcpenxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeGdzaGh5enZjemR4Y3BlbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDEyODEsImV4cCI6MjA2NzgxNzI4MX0.QoGWkfmu3TbgfbrT_gDOKNy6n8YxARFhy4NxrbsYtXY'
);

const historico = document.getElementById('historico');
const template = document.getElementById('template-historico');
const buscaInput = document.getElementById('busca');

let todasAvaliacoes = []; // cache local para busca

async function carregarAvaliacoes() {
  historico.innerHTML = '';
  const { data } = await supabase.from('avaliacoes').select('*').order('inserted_at', { ascending: false });
  todasAvaliacoes = data || [];
  renderizarAvaliacoes(todasAvaliacoes);
}

function renderizarAvaliacoes(lista) {
  historico.innerHTML = '';
  lista.forEach(av => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.titulo').textContent = av.titulo;
    clone.querySelector('.categoria').textContent = av.categoria;
    clone.querySelector('.imagem-obra').src = av.imagem_url;

    const nc = clone.querySelector('.notas-categorias');
    const comentarios = clone.querySelector('.comentarios');
    nc.innerHTML = '';
    comentarios.innerHTML = '';

    const medias = {};
    const pessoas = ['miri', 'deudeu'];
    pessoas.forEach(pessoa => {
      const dados = av[pessoa];
      if (dados) {
        ['roteiro','desenvolvimento','desempenho','impacto','originalidade'].forEach(cat => {
          if (!medias[cat]) medias[cat] = [];
          if (typeof dados[cat] === 'number') medias[cat].push(dados[cat]);
        });
        if (dados.comentario) {
          const p = document.createElement('p');
          p.textContent = `${pessoa === 'miri' ? 'Miri' : 'Deudeu'}: ${dados.comentario}`;
          comentarios.appendChild(p);
        }
      }
    });

    let somaFinal = 0;
    let totalFinal = 0;
    for (const cat in medias) {
      const media = medias[cat].reduce((a,b)=>a+b,0) / medias[cat].length;
      somaFinal += media;
      totalFinal++;
      const p = document.createElement('p');
      p.textContent = `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${media.toFixed(1)}`;
      nc.appendChild(p);
    }

    const notaFinal = totalFinal ? (somaFinal / totalFinal).toFixed(1) : 'N/A';
    clone.querySelector('.nota-final').textContent = `Nota Final: ${notaFinal}`;

    // Botão excluir
    const btnExcluir = clone.querySelector('.btn-excluir');
    btnExcluir.addEventListener('click', async () => {
      if (confirm('Deseja realmente excluir esta avaliação?')) {
        await supabase.from('avaliacoes').delete().eq('id', av.id);
        carregarAvaliacoes();
      }
    });

    // Botão editar
    const btnEditar = clone.querySelector('.btn-editar');
    btnEditar.addEventListener('click', () => {
      window.location.href = `editar.html?id=${av.id}`;
    });

    historico.appendChild(clone);
  });
}

// Filtro por categoria
function filtrarCategoria(categoria) {
  const filtradas = todasAvaliacoes.filter(av => av.categoria === categoria);
  renderizarAvaliacoes(filtradas);
}

// Filtro de busca por título
buscaInput.addEventListener('input', () => {
  const termo = buscaInput.value.toLowerCase();
  const filtradas = todasAvaliacoes.filter(av =>
    av.titulo.toLowerCase().includes(termo)
  );
  renderizarAvaliacoes(filtradas);
});

// Botões de categorias
const categorias = [
  'Filmes',
  'Doramas',
  'Animes',
  'Séries',
  'Desenho animado',
  'Filme de desenho animado',
  'Filme de Anime',
  'Filme Coreano'
];

const categoriasContainer = document.getElementById('categorias');
categorias.forEach(cat => {
  const btn = document.createElement('button');
  btn.textContent = cat;
  btn.classList.add('categoria-btn');
  btn.onclick = () => filtrarCategoria(cat);
  categoriasContainer.appendChild(btn);
});

carregarAvaliacoes();
