import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para adicionar temporada e recalcular a média global
function adicionarTemporada(antigo, novo, temporada) {
  const camposNumericos = ['historia', 'personagens', 'visual_estilo', 'emocao_vibe', 'surpresa'];
  // Se "antigo" existir, fazemos uma cópia, se não criamos um vazio
  const resultado = antigo ? { ...antigo } : {};

  // Garantir que existe o objeto 'temporadas'
  if (!resultado.temporadas) {
    resultado.temporadas = {};
    // Migrar dados antigos se eles existirem sem 'temporadas'
    const temDadosAntigos = camposNumericos.some(c => resultado[c] !== undefined && resultado[c] !== null);
    if (temDadosAntigos) {
      const copiaAntiga = {};
      Object.keys(resultado).forEach(k => {
        if (k !== 'temporadas') copiaAntiga[k] = resultado[k];
      });
      // Assumimos que a avaliação existente era a "1" para não perder histórico
      resultado.temporadas["1"] = copiaAntiga;
    }
  }

  // Qual a chave a usar? (O número da temporada ou "Geral")
  const chaveTemporada = temporada ? temporada.toString() : "Geral";
  resultado.temporadas[chaveTemporada] = { ...novo };

  // Recalcular as médias para o objeto principal
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
    // Se tiver mais de uma, tira a média. Se não, é a nota.
    resultado[campo] = count > 0 ? parseFloat((soma / count).toFixed(1)) : null;
  });

  return resultado;
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('avaliacao-form');
  const tituloInput = document.getElementById('titulo');
  const categoriaSelect = document.getElementById('categoria');
  const imagemUrlInput = document.getElementById('imagem_url');

  let obrasExistentes = [];

  // Buscar obras existentes para sugestão
  try {
    const { data, error } = await supabase.from('avaliacoes').select('titulo, categoria, imagem_url');
    if (!error && data) {
      obrasExistentes = data;
      const datalist = document.getElementById('sugestoes-obras');
      if (datalist) {
        const titulosUnicos = new Set();
        data.forEach(obra => {
          if (!titulosUnicos.has(obra.titulo)) {
            titulosUnicos.add(obra.titulo);
            const option = document.createElement('option');
            option.value = obra.titulo;
            datalist.appendChild(option);
          }
        });
      }
    }
  } catch (err) {
    console.error('Erro ao buscar obras para sugestão:', err);
  }

  // Auto-preencher categoria e imagem ao selecionar uma obra existente
  tituloInput.addEventListener('input', (e) => {
    const tituloDigitado = e.target.value;
    const obraEncontrada = obrasExistentes.find(o => o.titulo === tituloDigitado);
    if (obraEncontrada) {
      if (obraEncontrada.categoria) categoriaSelect.value = obraEncontrada.categoria;
      if (obraEncontrada.imagem_url) imagemUrlInput.value = obraEncontrada.imagem_url;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const temporadaValue = document.getElementById('temporada').value;

    const miriNotas = {
      historia: +document.getElementById('miri_historia').value || null,
      personagens: +document.getElementById('miri_personagens').value || null,
      visual_estilo: +document.getElementById('miri_visual_estilo').value || null,
      emocao_vibe: +document.getElementById('miri_emocao_vibe').value || null,
      surpresa: +document.getElementById('miri_surpresa').value || null,
      personagem_favorito: document.getElementById('miri_personagem_favorito').value,
      momento_favorito: document.getElementById('miri_momento_favorito').value,
      frase_marcante: document.getElementById('miri_frase_marcante').value,
      ver_de_novo: document.getElementById('miri_ver_de_novo').value,
      comentario_geral: document.getElementById('miri_comentario_geral').value
    };

    const deudeuNotas = {
      historia: +document.getElementById('deudeu_historia').value || null,
      personagens: +document.getElementById('deudeu_personagens').value || null,
      visual_estilo: +document.getElementById('deudeu_visual_estilo').value || null,
      emocao_vibe: +document.getElementById('deudeu_emocao_vibe').value || null,
      surpresa: +document.getElementById('deudeu_surpresa').value || null,
      personagem_favorito: document.getElementById('deudeu_personagem_favorito').value,
      momento_favorito: document.getElementById('deudeu_momento_favorito').value,
      frase_marcante: document.getElementById('deudeu_frase_marcante').value,
      ver_de_novo: document.getElementById('deudeu_ver_de_novo').value,
      comentario_geral: document.getElementById('deudeu_comentario_geral').value
    };

    // 1. Verificar se a obra já existe
    const { data: existente } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('titulo', titulo)
      .maybeSingle(); // Trocar single para maybeSingle para não dar erro se não existir

    if (existente) {
      // 2. Se existe, atualizamos adicionando a temporada ao grupo
      const updateData = {
        categoria: document.getElementById('categoria').value,
        imagem_url: document.getElementById('imagem_url').value,
        miri: adicionarTemporada(existente.miri, miriNotas, temporadaValue),
        deudeu: adicionarTemporada(existente.deudeu, deudeuNotas, temporadaValue)
      };

      const { error } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', existente.id);

      if (error) alert('Erro ao atualizar: ' + error.message);
      else alert('Avaliação da temporada adicionada à obra com sucesso!');
    } else {
      // 3. Se não existe, insere a primeira avaliação já formatada com temporada (se for o caso) ou "Geral"
      const novaAvaliacao = {
        titulo,
        categoria: document.getElementById('categoria').value,
        imagem_url: document.getElementById('imagem_url').value,
        miri: adicionarTemporada(null, miriNotas, temporadaValue),
        deudeu: adicionarTemporada(null, deudeuNotas, temporadaValue)
      };

      const { error } = await supabase.from('avaliacoes').insert([novaAvaliacao]);
      if (error) alert('Erro ao salvar: ' + error.message);
      else alert('Obra guardada com sucesso!');
    }

    form.reset();
  });
});
