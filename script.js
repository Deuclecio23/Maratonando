import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ojxgshhyzvczdxcpenxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeGdzaGh5enZjemR4Y3BlbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDEyODEsImV4cCI6MjA2NzgxNzI4MX0.QoGWkfmu3TbgfbrT_gDOKNy6n8YxARFhy4NxrbsYtXY'
);

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('avaliacao-form');
  const categoriaSelect = document.getElementById('categoria');

  const { data: avaliacoes } = await supabase.from('avaliacoes').select('categoria');
  const categoriasUnicas = [...new Set(avaliacoes.map(a => a.categoria))];
  categoriasUnicas.forEach(c => {
    const option = document.createElement('option');
    option.value = c;
    option.textContent = c;
    categoriaSelect.appendChild(option);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const categoria = categoriaSelect.value;
    const imagem_url = document.getElementById('imagem_url').value;

    const miri = {
      roteiro: +document.getElementById('miri_roteiro').value || null,
      desenvolvimento: +document.getElementById('miri_desenvolvimento').value || null,
      desempenho: +document.getElementById('miri_tecnica').value || null,
      impacto: +document.getElementById('miri_impacto').value || null,
      originalidade: +document.getElementById('miri_originalidade').value || null,
      comentario: document.getElementById('miri_comentario').value
    };

    const deudeu = {
      roteiro: +document.getElementById('deudeu_roteiro').value || null,
      desenvolvimento: +document.getElementById('deudeu_desenvolvimento').value || null,
      desempenho: +document.getElementById('deudeu_tecnica').value || null,
      impacto: +document.getElementById('deudeu_impacto').value || null,
      originalidade: +document.getElementById('deudeu_originalidade').value || null,
      comentario: document.getElementById('deudeu_comentario').value
    };

    await supabase.from('avaliacoes').insert([{ titulo, categoria, imagem_url, miri, deudeu }]);
    alert('Avaliação salva!');
    form.reset();
  });
});
