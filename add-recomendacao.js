import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://ojxgshhyzvczdxcpenxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeGdzaGh5enZjemR4Y3BlbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDEyODEsImV4cCI6MjA2NzgxNzI4MX0.QoGWkfmu3TbgfbrT_gDOKNy6n8YxARFhy4NxrbsYtXY';
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
