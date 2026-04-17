import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';

// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://osmnpaopbeedyifyenxc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbW5wYW9wYmVlZHlpZnllbnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MTQwNjYsImV4cCI6MjA3Nzk5MDA2Nn0.sM3VVIiDQx53cqJBgGjNNP9GW0lXaUi6YX_gU1onsmI';
const supabase = createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const form = document.getElementById('editar-recomendacao-form');

async function carregarRecomendacao() {
  if (!id) {
    alert('Não foi possível encontrar o ID da recomendação.');
    window.location.href = 'ver-recomendacoes.html';
    return;
  }

  const { data, error } = await supabase
    .from('recomendacoes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    alert('Erro ao carregar a recomendação.');
    window.location.href = 'ver-recomendacoes.html';
    return;
  }

  document.getElementById('titulo').value = data.titulo;
  document.getElementById('tipo').value = data.tipo;
  document.getElementById('quem_sugeriu').value = data.quem_sugeriu;
  document.getElementById('link_extra').value = data.link_extra || '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const recomendacaoAtualizada = {
    titulo: document.getElementById('titulo').value,
    tipo: document.getElementById('tipo').value,
    quem_sugeriu: document.getElementById('quem_sugeriu').value,
    link_extra: document.getElementById('link_extra').value.trim() || null
  };

  const { error } = await supabase
    .from('recomendacoes')
    .update(recomendacaoAtualizada)
    .eq('id', id);

  if (error) {
    alert('Erro ao atualizar a ideia: ' + error.message);
  } else {
    alert('Ideia atualizada com sucesso!');
    window.location.href = 'ver-recomendacoes.html';
  }
});

carregarRecomendacao();
