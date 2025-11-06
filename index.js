import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('avaliacao-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novaAvaliacao = {
      titulo: document.getElementById('titulo').value,
      categoria: document.getElementById('categoria').value,
      imagem_url: document.getElementById('imagem_url').value,
      miri: {
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
      },
      deudeu: {
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
      }
    };

    const { error } = await supabase.from('avaliacoes').insert([novaAvaliacao]);
    
    if (error) {
      alert('Eish... Deu erro a salvar: ' + error.message);
    } else {
      alert('Guardado com sucesso!');
      form.reset();
    }
  });
});
