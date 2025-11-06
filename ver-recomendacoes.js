import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ATENÇÃO: Confirma que estes dados são os teus!
const supabaseUrl = 'https://ojxgshhyzvczdxcpenxj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeGdzaGh5enZjemR4Y3BlbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDEyODEsImV4cCI6MjA2NzgxNzI4MX0.QoGWkfmu3TbgfbrT_gDOKNy6n8YxARFhy4NxrbsYtXY';
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('lista-recomendacoes-container');
const template = document.getElementById('template-recomendacao');

async function carregarRecomendacoes() {
  container.innerHTML = '<p style="text-align: center;">A carregar ideias...</p>';
  
  const { data, error } = await supabase
    .from('recomendacoes')
    .select('*')
    .order('inserted_at', { ascending: false });

  if (error) {
    alert('Erro ao carregar as recomendações!');
    return;
  }

  container.innerHTML = ''; // Limpa o "a carregar"
  
  data.forEach(rec => {
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.rec-titulo').textContent = rec.titulo;
    clone.querySelector('.rec-tipo').textContent = rec.tipo;
    clone.querySelector('.rec-quem').textContent = rec.quem_sugeriu;
    
    const link = clone.querySelector('.rec-link');
    if (rec.link_extra) {
      link.href = rec.link_extra;
    } else {
      link.style.display = 'none'; // Esconde o link se não existir
    }
    
    clone.querySelector('.rec-excluir').addEventListener('click', async () => {
      if (confirm(`Queres mesmo apagar a sugestão "${rec.titulo}"?`)) {
        await supabase.from('recomendacoes').delete().eq('id', rec.id);
        carregarRecomendacoes(); // Recarrega a lista
      }
    });
    
    container.appendChild(clone);
  });
}

carregarRecomendacoes();
