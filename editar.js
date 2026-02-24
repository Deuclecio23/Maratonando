import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';
// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const form = document.getElementById('editar-form');

let avaliacaoOriginal = null;

async function carregarAvaliacao() {
  if (!id) {
    alert('Ups, não encontrei o ID. Tenta de novo desde o histórico.');
    window.location.href = 'historico.html';
    return;
  }

  const { data, error } = await supabase.from('avaliacoes').select('*').eq('id', id).single();

  if (error || !data) {
    alert('Erro ao carregar avaliação.');
    return;
  }

  avaliacaoOriginal = data;

  document.getElementById('titulo').value = data.titulo;
  document.getElementById('categoria').value = data.categoria;
  document.getElementById('imagem_url').value = data.imagem_url;

  const seletorContainer = document.getElementById('seletor-temporada-container');
  const seletor = document.getElementById('seletor_temporada');
  seletor.innerHTML = '';

  let temTemporadas = false;
  let chavesTemporadas = [];

  if (data.miri && data.miri.temporadas) {
    chavesTemporadas = Object.keys(data.miri.temporadas);
    temTemporadas = true;
  } else if (data.deudeu && data.deudeu.temporadas) {
    // Caso Miri não tenha avaliado mas Deudeu sim (cenário improvável mas seguro)
    chavesTemporadas = Object.keys(data.deudeu.temporadas);
    temTemporadas = true;
  }

  if (temTemporadas) {
    seletorContainer.style.display = 'block';
    chavesTemporadas.sort().forEach(chave => {
      const opt = document.createElement('option');
      opt.value = chave;
      opt.textContent = chave === 'Geral' ? 'Nota Geral / Obra Completa' : `Temporada ${chave}`;
      seletor.appendChild(opt);
    });

    // Mostra a primeira por padrão
    preencherFormularioComTemporada(chavesTemporadas[0]);

    seletor.addEventListener('change', (e) => {
      preencherFormularioComTemporada(e.target.value);
    });
  } else {
    // Avaliação antiga, sem estrutura de temporadas
    seletorContainer.style.display = 'none';
    preencherFormularioAntigo(data);
  }
}

function preencherFormularioComTemporada(chave) {
  const miri = (avaliacaoOriginal.miri && avaliacaoOriginal.miri.temporadas && avaliacaoOriginal.miri.temporadas[chave]) || {};
  const deudeu = (avaliacaoOriginal.deudeu && avaliacaoOriginal.deudeu.temporadas && avaliacaoOriginal.deudeu.temporadas[chave]) || {};

  preencherCamposUsuario('miri', miri);
  preencherCamposUsuario('deudeu', deudeu);
}

function preencherFormularioAntigo(data) {
  const miri = data.miri || {};
  const deudeu = data.deudeu || {};

  preencherCamposUsuario('miri', miri);
  preencherCamposUsuario('deudeu', deudeu);
}

function preencherCamposUsuario(prefixo, dados) {
  document.getElementById(`${prefixo}_historia`).value = dados.historia || '';
  document.getElementById(`${prefixo}_personagens`).value = dados.personagens || '';
  document.getElementById(`${prefixo}_visual_estilo`).value = dados.visual_estilo || '';
  document.getElementById(`${prefixo}_emocao_vibe`).value = dados.emocao_vibe || '';
  document.getElementById(`${prefixo}_surpresa`).value = dados.surpresa || '';
  document.getElementById(`${prefixo}_personagem_favorito`).value = dados.personagem_favorito || '';
  document.getElementById(`${prefixo}_momento_favorito`).value = dados.momento_favorito || '';
  document.getElementById(`${prefixo}_frase_marcante`).value = dados.frase_marcante || '';
  document.getElementById(`${prefixo}_ver_de_novo`).value = dados.ver_de_novo || '';
  document.getElementById(`${prefixo}_comentario_geral`).value = dados.comentario_geral || '';
}

function extrairCamposUsuario(prefixo) {
  return {
    historia: parseFloat(document.getElementById(`${prefixo}_historia`).value) || null,
    personagens: parseFloat(document.getElementById(`${prefixo}_personagens`).value) || null,
    visual_estilo: parseFloat(document.getElementById(`${prefixo}_visual_estilo`).value) || null,
    emocao_vibe: parseFloat(document.getElementById(`${prefixo}_emocao_vibe`).value) || null,
    surpresa: parseFloat(document.getElementById(`${prefixo}_surpresa`).value) || null,
    personagem_favorito: document.getElementById(`${prefixo}_personagem_favorito`).value,
    momento_favorito: document.getElementById(`${prefixo}_momento_favorito`).value,
    frase_marcante: document.getElementById(`${prefixo}_frase_marcante`).value,
    ver_de_novo: document.getElementById(`${prefixo}_ver_de_novo`).value,
    comentario_geral: document.getElementById(`${prefixo}_comentario_geral`).value
  };
}

// Mesma lógica do index.js para não perder a informação original da pessoa e recalcular a média geral com as edições
function recalcularESalvarTemporada(antigaOriginal, novaEditada, chaveEditada) {
  const camposNumericos = ['historia', 'personagens', 'visual_estilo', 'emocao_vibe', 'surpresa'];
  const resultado = antigaOriginal ? JSON.parse(JSON.stringify(antigaOriginal)) : {};

  if (!resultado.temporadas) {
    resultado.temporadas = {};
    const temDadosAntigos = camposNumericos.some(c => resultado[c] !== undefined && resultado[c] !== null);
    if (temDadosAntigos) {
      const copiaAntiga = {};
      Object.keys(resultado).forEach(k => {
        if (k !== 'temporadas') copiaAntiga[k] = resultado[k];
      });
      // migração no momento do salvamento (segurança)
      resultado.temporadas["1"] = copiaAntiga;
    }
  }

  resultado.temporadas[chaveEditada] = { ...novaEditada };

  const todasAsTemps = Object.values(resultado.temporadas);
  camposNumericos.forEach(campo => {
    let soma = 0;
    let count = 0;
    todasAsTemps.forEach(temp => {
      if (temp[campo] !== null && temp[campo] !== undefined) {
        soma += parseFloat(temp[campo]);
        count++;
      }
    });
    resultado[campo] = count > 0 ? parseFloat((soma / count).toFixed(1)) : null;
  });

  return resultado;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const seletorContainer = document.getElementById('seletor-temporada-container');
  const seletor = document.getElementById('seletor_temporada');
  // Se está a editar um ficheiro sem temporadas convertidas, usa "Geral" para forçar a nova estrutura, ou "1".
  const chaveEditada = (seletorContainer.style.display === 'none') ? 'Geral' : seletor.value;

  const novaMiri = extrairCamposUsuario('miri');
  const novaDeudeu = extrairCamposUsuario('deudeu');

  const atualizada = {
    titulo: document.getElementById('titulo').value,
    categoria: document.getElementById('categoria').value,
    imagem_url: document.getElementById('imagem_url').value,
    miri: recalcularESalvarTemporada(avaliacaoOriginal.miri, novaMiri, chaveEditada),
    deudeu: recalcularESalvarTemporada(avaliacaoOriginal.deudeu, novaDeudeu, chaveEditada)
  };

  const { error } = await supabase.from('avaliacoes').update(atualizada).eq('id', id);

  if (error) {
    alert('Erro ao atualizar a avaliação!');
  } else {
    alert('Avaliação atualizada com sucesso!');
    window.location.href = 'historico.html';
  }
});

carregarAvaliacao();
