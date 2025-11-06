import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

const historico = document.getElementById('historico');
const template = document.getElementById('template-historico');
const buscaInput = document.getElementById('busca');

let todasAvaliacoes = [];

const nomesBonitos = {
  historia: "História",
  personagens: "Personagens",
  visual_estilo: "Visual e Estilo",
  emocao_vibe: "Emoção / Vibe",
  surpresa: "Nível de Surpresa"
};
const categoriasDeNotas = Object.keys(nomesBonitos);

async function carregarAvaliacoes() {
  historico.innerHTML = '<p>A carregar o baú...</p>';
  const { data, error } = await supabase.from('avaliacoes').select('*').order('inserted_at', { ascending: false });
  
  if (error) {
    alert('Erro ao carregar o baú!');
    return;
  }
  
  todasAvaliacoes = data || [];
  renderizarAvaliacoes(todasAvaliacoes);
}

function renderizarAvaliacoes(lista) {
  historico.innerHTML = '';
  if (lista.length === 0) {
    historico.innerHTML = '<p>Ainda não vimos nada com esse filtro...</p>';
    return;
  }

  lista.forEach(av => {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.titulo').textContent = av.titulo;
    clone.querySelector('.categoria').textContent = av.categoria;
    clone.querySelector('.imagem-obra').src = av.imagem_url;
    clone.querySelector('.imagem-obra').alt = `Capa de ${av.titulo}`;

    const nc = clone.querySelector('.notas-categorias');
    const respostasMiri = clone.querySelector('.respostas-miri');
    const respostasDeudeu = clone.querySelector('.respostas-deudeu');
    const comentarioMiri = clone.querySelector('.comentario-miri');
    const comentarioDeudeu = clone.querySelector('.comentario-deudeu');
    
    nc.innerHTML = '<h3>Notas (Média dos dois)</h3>';
    respostasMiri.innerHTML = '<span class="nome-miri">Miri:</span>';
    respostasDeudeu.innerHTML = '<span class="nome-deudeu">Deudeu:</span>';
    comentarioMiri.innerHTML = '<span class="nome-miri">Miri:</span>';
    comentarioDeudeu.innerHTML = '<span class="nome-deudeu">Deudeu:</span>';

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

        const containerRespostas = (pessoa === 'miri') ? respostasMiri : respostasDeudeu;
        if (dados.personagem_favorito) {
          containerRespostas.appendChild(criarParagrafo("Personagem:", dados.personagem_favorito));
        }
        if (dados.momento_favorito) {
          containerRespostas.appendChild(criarParagrafo("Momento:", dados.momento_favorito));
        }
        if (dados.frase_marcante) {
          containerRespostas.appendChild(criarParagrafo("Frase:", dados.frase_marcante));
        }
        if (dados.ver_de_novo) {
          containerRespostas.appendChild(criarParagrafo("Víamos de novo?", dados.ver_de_novo));
        }
        
        const containerComentarios = (pessoa === 'miri') ? comentarioMiri : comentarioDeudeu;
        if (dados.comentario_geral) {
          const p = document.createElement('p');
          p.textContent = dados.comentario_geral;
          containerComentarios.appendChild(p);
        }
      }
    });

    let somaMediaFinal = 0;
    let totalCategoriasFinal = 0;

    for (const cat in medias) {
      if (medias[cat].count > 0) {
        const media = medias[cat].soma / medias[cat].count;
        somaMediaFinal += media;
        totalCategoriasFinal++;
        
        const p = document.createElement('p');
        p.textContent = `${nomesBonitos[cat]}: ${media.toFixed(1)}`;
        nc.appendChild(p);
      }
    }

    const notaFinal = totalCategoriasFinal > 0 ? (somaMediaFinal / totalCategoriasFinal).toFixed(1) : 'N/A';
    clone.querySelector('.nota-final-numero').textContent = notaFinal;

    clone.querySelector('.btn-excluir').addEventListener('click', async () => {
      if (confirm(`Queres mesmo apagar "${av.titulo}"?`)) {
        await supabase.from('avaliacoes').delete().eq('id', av.id);
        carregarAvaliacoes();
      }
    });

    clone.querySelector('.btn-editar').addEventListener('click', () => {
      window.location.href = `editar.html?id=${av.id}`;
    });

    historico.appendChild(clone);
  });
}

function criarParagrafo(pergunta, resposta) {
  const p = document.createElement('p');
  p.innerHTML = `<strong>${pergunta}</strong> ${resposta}`;
  return p;
}

buscaInput.addEventListener('input', () => {
  const termo = buscaInput.value.toLowerCase();
  const filtradas = todasAvaliacoes.filter(av =>
    av.titulo.toLowerCase().includes(termo)
  );
  renderizarAvaliacoes(filtradas);
});

function criarBotoesCategoria() {
  const categoriasUnicas = [...new Set(todasAvaliacoes.map(av => av.categoria))];
  const categoriasContainer = document.getElementById('categorias');
  categoriasContainer.innerHTML = '';
  
  const btnTodos = document.createElement('button');
  btnTodos.textContent = 'Ver Tudo';
  btnTodos.onclick = () => renderizarAvaliacoes(todasAvaliacoes);
  categoriasContainer.appendChild(btnTodos);

  categoriasUnicas.forEach(cat => {
    if(cat) {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.classList.add('categoria-btn');
      btn.onclick = () => {
        const filtradas = todasAvaliacoes.filter(av => av.categoria === cat);
        renderizarAvaliacoes(filtradas);
      };
      categoriasContainer.appendChild(btn);
    }
  });
}

async function init() {
  await carregarAvaliacoes();
  criarBotoesCategoria();
}

init();
