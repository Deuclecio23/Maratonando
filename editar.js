import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';
// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const form = document.getElementById('editar-form');

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

  document.getElementById('titulo').value = data.titulo;
  document.getElementById('categoria').value = data.categoria;
  document.getElementById('imagem_url').value = data.imagem_url;

  const miri = data.miri || {};
  document.getElementById('miri_historia').value = miri.historia || '';
  document.getElementById('miri_personagens').value = miri.personagens || '';
  document.getElementById('miri_visual_estilo').value = miri.visual_estilo || '';
  document.getElementById('miri_emocao_vibe').value = miri.emocao_vibe || '';
  document.getElementById('miri_surpresa').value = miri.surpresa || '';
  document.getElementById('miri_personagem_favorito').value = miri.personagem_favorito || '';
  document.getElementById('miri_momento_favorito').value = miri.momento_favorito || '';
  document.getElementById('miri_frase_marcante').value = miri.frase_marcante || ''; 
  document.getElementById('miri_ver_de_novo').value = miri.ver_de_novo || '';       
  document.getElementById('miri_comentario_geral').value = miri.comentario_geral || ''; 

  const deudeu = data.deudeu || {};
  document.getElementById('deudeu_historia').value = deudeu.historia || '';
  document.getElementById('deudeu_personagens').value = deudeu.personagens || '';
  document.getElementById('deudeu_visual_estilo').value = deudeu.visual_estilo || '';
  document.getElementById('deudeu_emocao_vibe').value = deudeu.emocao_vibe || '';
  document.getElementById('deudeu_surpresa').value = deudeu.surpresa || '';
  document.getElementById('deudeu_personagem_favorito').value = deudeu.personagem_favorito || '';
  document.getElementById('deudeu_momento_favorito').value = deudeu.momento_favorito || '';
  document.getElementById('deudeu_frase_marcante').value = deudeu.frase_marcante || ''; 
  document.getElementById('deudeu_ver_de_novo').value = deudeu.ver_de_novo || '';       
  document.getElementById('deudeu_comentario_geral').value = deudeu.comentario_geral || ''; 
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const atualizada = {
    titulo: document.getElementById('titulo').value,
    categoria: document.getElementById('categoria').value,
    imagem_url: document.getElementById('imagem_url').value,
    miri: {
      historia: parseFloat(document.getElementById('miri_historia').value) || null,
      personagens: parseFloat(document.getElementById('miri_personagens').value) || null,
      visual_estilo: parseFloat(document.getElementById('miri_visual_estilo').value) || null,
      emocao_vibe: parseFloat(document.getElementById('miri_emocao_vibe').value) || null,
      surpresa: parseFloat(document.getElementById('miri_surpresa').value) || null,
      personagem_favorito: document.getElementById('miri_personagem_favorito').value,
      momento_favorito: document.getElementById('miri_momento_favorito').value,
      frase_marcante: document.getElementById('miri_frase_marcante').value, 
      ver_de_novo: document.getElementById('miri_ver_de_novo').value,       
      comentario_geral: document.getElementById('miri_comentario_geral').value 
    },
    deudeu: {
      historia: parseFloat(document.getElementById('deudeu_historia').value) || null,
      personagens: parseFloat(document.getElementById('deudeu_personagens').value) || null,
      visual_estilo: parseFloat(document.getElementById('deudeu_visual_estilo').value) || null,
      emocao_vibe: parseFloat(document.getElementById('deudeu_emocao_vibe').value) || null,
      surpresa: parseFloat(document.getElementById('deudeu_surpresa').value) || null,
      personagem_favorito: document.getElementById('deudeu_personagem_favorito').value,
      momento_favorito: document.getElementById('deudeu_momento_favorito').value,
      frase_marcante: document.getElementById('deudeu_frase_marcante').value, 
      ver_de_novo: document.getElementById('deudeu_ver_de_novo').value,       
      comentario_geral: document.getElementById('deudeu_comentario_geral').value 
    }
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
