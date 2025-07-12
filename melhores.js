import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://ojxgshhyzvczdxcpenxj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qeGdzaGh5enZjemR4Y3BlbnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDEyODEsImV4cCI6MjA2NzgxNzI4MX0.QoGWkfmu3TbgfbrT_gDOKNy6n8YxARFhy4NxrbsYtXY'
)

document.addEventListener('DOMContentLoaded', async () => {
  const conteudo = document.getElementById('conteudo');
  const tabs = document.querySelectorAll('.tab');

  const medalhas = ["🥇", "🥈", "🥉"];
  const demaisEmoji = "🏅";

  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      const categoria = tab.dataset.categoria;
      conteudo.innerHTML = '<p>Carregando...</p>';

      const { data } = await supabase.from('avaliacoes').select('*');

      let filtradas = data;
      if (categoria !== 'Geral') {
        filtradas = data.filter(av => av.categoria === categoria);
      }

      filtradas.forEach(av => {
        const m = av.miri;
        const d = av.deudeu;

        const medias = [m, d].map(av => {
          const notas = [av.roteiro, av.desenvolvimento, av.desempenho, av.impacto, av.originalidade];
          const soma = notas.reduce((a, b) => a + (b || 0), 0);
          return soma / notas.filter(n => n != null).length;
        });

        av.mediaGeral = (medias[0] + medias[1]) / 2;
      });

      const top10 = filtradas
        .filter(av => !isNaN(av.mediaGeral))
        .sort((a, b) => b.mediaGeral - a.mediaGeral)
        .slice(0, 10);

      conteudo.innerHTML = top10.map((av, i) => {
        const pos = i + 1;
        const emoji = i < 3 ? medalhas[i] : demaisEmoji;

        return `
          <div class="top-card">
            <div class="top-header">
              <span class="top-pos">TOP ${pos} ${emoji}</span>
              <span class="top-nota">Média: ${av.mediaGeral.toFixed(2)}</span>
            </div>
            <h3 class="top-titulo">${av.titulo} <span class="categoria">(${av.categoria})</span></h3>
            <img src="${av.imagem_url}" class="imagem-obra"/>
            <div class="comentarios">
              <p><span class="miri-bg">Comentário Miri:</span> ${av.miri.comentario}</p>
              <p><span class="deudeu-bg">Comentário Deudeu:</span> ${av.deudeu.comentario}</p>
            </div>
          </div>
        `;
      }).join('');
    });
  });

  tabs[0].click();
});
