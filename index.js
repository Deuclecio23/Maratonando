import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função auxiliar para calcular média entre nota antiga e nova
function calcularMedia(antigo, novo) {
  if (!novo.historia && !novo.personagens) return antigo; // Se a pessoa não avaliou agora, mantém o antigo
  if (!antigo || !antigo.historia) return novo; // Se não havia avaliação antiga, usa a nova

  const camposParaMedia = ['historia', 'personagens', 'visual_estilo', 'emocao_vibe', 'surpresa'];
  const resultado = { ...novo };

  camposParaMedia.forEach(campo => {
    if (antigo[campo] !== null && novo[campo] !== null) {
      resultado[campo] = parseFloat(((antigo[campo] + novo[campo]) / 2).toFixed(1));
    }
  });
  
  // No comentário, juntamos as informações
  resultado.comentario_geral = `(Anterior): ${antigo.comentario_geral || ''} | (Nova Temp): ${novo.comentario_geral || ''}`;
  return resultado;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('avaliacao-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const isTemporada = document.getElementById('temporada').value !== "";

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
      .single();

    if (existente && isTemporada) {
      // 2. Se existe e é temporada, calculamos a média
      const updateData = {
        categoria: document.getElementById('categoria').value,
        imagem_url: document.getElementById('imagem_url').value,
        miri: calcularMedia(existente.miri, miriNotas),
        deudeu: calcularMedia(existente.deudeu, deudeuNotas)
      };

      const { error } = await supabase
        .from('avaliacoes')
        .update(updateData)
        .eq('id', existente.id);

      if (error) alert('Erro ao atualizar temporada: ' + error.message);
      else alert('Média da temporada atualizada com sucesso!');
    } else {
      // 3. Se não existe ou é obra completa, insere normal
      const novaAvaliacao = {
        titulo,
        categoria: document.getElementById('categoria').value,
        imagem_url: document.getElementById('imagem_url').value,
        miri: miriNotas,
        deudeu: deudeuNotas
      };

      const { error } = await supabase.from('avaliacoes').insert([novaAvaliacao]);
      if (error) alert('Erro ao salvar: ' + error.message);
      else alert('Guardado com sucesso!');
    }

    form.reset();
  });
});
