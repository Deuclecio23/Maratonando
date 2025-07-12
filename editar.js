// editar.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://ojxgshhyzvczdxcpenxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeGdzaGh5enZjemR4Y3BlbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDEyODEsImV4cCI6MjA2NzgxNzI4MX0.QoGWkfmu3TbgfbrT_gDOKNy6n8YxARFhy4NxrbsYtXY'
);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const form = document.getElementById('editar-form');

async function carregarAvaliacao() {
  const { data, error } = await supabase.from('avaliacoes').select('*').eq('id', id).single();

  if (error || !data) {
    alert('Erro ao carregar avaliação.');
    return;
  }

  document.getElementById('titulo').value = data.titulo;
  document.getElementById('categoria').value = data.categoria;
  document.getElementById('imagem_url').value = data.imagem_url;

  const miri = data.miri || {};
  document.getElementById('miri_roteiro').value = miri.roteiro || '';
  document.getElementById('miri_desenvolvimento').value = miri.desenvolvimento || '';
  document.getElementById('miri_tecnica').value = miri.tecnica || '';
  document.getElementById('miri_impacto').value = miri.impacto || '';
  document.getElementById('miri_originalidade').value = miri.originalidade || '';
  document.getElementById('miri_comentario').value = miri.comentario || '';

  const deudeu = data.deudeu || {};
  document.getElementById('deudeu_roteiro').value = deudeu.roteiro || '';
  document.getElementById('deudeu_desenvolvimento').value = deudeu.desenvolvimento || '';
  document.getElementById('deudeu_tecnica').value = deudeu.tecnica || '';
  document.getElementById('deudeu_impacto').value = deudeu.impacto || '';
  document.getElementById('deudeu_originalidade').value = deudeu.originalidade || '';
  document.getElementById('deudeu_comentario').value = deudeu.comentario || '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const atualizada = {
    titulo: document.getElementById('titulo').value,
    categoria: document.getElementById('categoria').value,
    imagem_url: document.getElementById('imagem_url').value,
    miri: {
      roteiro: parseFloat(document.getElementById('miri_roteiro').value),
      desenvolvimento: parseFloat(document.getElementById('miri_desenvolvimento').value),
      tecnica: parseFloat(document.getElementById('miri_tecnica').value),
      impacto: parseFloat(document.getElementById('miri_impacto').value),
      originalidade: parseFloat(document.getElementById('miri_originalidade').value),
      comentario: document.getElementById('miri_comentario').value
    },
    deudeu: {
      roteiro: parseFloat(document.getElementById('deudeu_roteiro').value),
      desenvolvimento: parseFloat(document.getElementById('deudeu_desenvolvimento').value),
      tecnica: parseFloat(document.getElementById('deudeu_tecnica').value),
      impacto: parseFloat(document.getElementById('deudeu_impacto').value),
      originalidade: parseFloat(document.getElementById('deudeu_originalidade').value),
      comentario: document.getElementById('deudeu_comentario').value
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
