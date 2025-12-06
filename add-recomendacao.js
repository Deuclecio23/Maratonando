import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('recomendacao-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const novaRecomendacao = {
    titulo: document.getElementById('titulo').value,
    tipo: document.getElementById('tipo').value,
    quem_sugeriu: document.getElementById('quem_sugeriu').value,
    link_extra: document.getElementById('link_extra').value || null
  };

  const { error } = await supabase.from('recomendacoes').insert([novaRecomendacao]);

  if (error) {
    alert('Erro ao guardar a ideia: ' + error.message);
  } else {
    alert('Ideia guardada com sucesso!');
    form.reset();
    window.location.href = 'ver-recomendacoes.html';
  }
});
