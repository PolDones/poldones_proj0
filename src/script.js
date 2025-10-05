let preguntesOriginals = [];
let respostesSeleccionades = [];
let tempsInici = null;
let preguntaActual = 0;
const tempsTotal = 30 * 1000;
let temporitzadorTimeout = null;
let nomUsuari = '';

// Activar botó "Comença" només si hi ha nom
document.getElementById('nom').addEventListener('input', (e) => {
  nomUsuari = e.target.value.trim();
  document.getElementById('comencar').disabled = nomUsuari === '';
});

function formatTemps(ms) {
  const s = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function actualitzarTemporitzador() {
  const ara = Date.now();
  const restant = Math.max(0, tempsTotal - (ara - tempsInici));
  document.getElementById('temporitzador').innerText = `Temps restant: ${formatTemps(restant)}`;
  if (restant > 0) setTimeout(actualitzarTemporitzador, 1000);
}

function actualitzarIndicador() {
  const total = preguntesOriginals.length;
  document.getElementById('indicador').innerText = `Pregunta ${preguntaActual + 1}/${total}`;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function mostrarPregunta(index) {
  preguntaActual = index;
  actualitzarIndicador();
  const container = document.getElementById('preguntes');
  container.innerHTML = '';
  const pregunta = preguntesOriginals[index];
  const bloc = document.createElement('div');
  bloc.classList.add('bloc-pregunta', 'card', 'mb-4', 'p-3', 'shadow-sm');
  bloc.innerHTML = `<p class="fw-bold">${index + 1}. ${pregunta.question}</p>`;
  if (pregunta.image) {
    bloc.innerHTML += `<img src="${pregunta.image}" alt="Imatge" class="imatge-pregunta"><br>`;
  }
  const respostesBarrejades = [...pregunta.answers];
  shuffle(respostesBarrejades);
  respostesBarrejades.forEach((resposta, i) => {
    const id = `pregunta${index}_resposta${i}`;
    const valorOriginal = pregunta.answers.indexOf(resposta);
    const checked = respostesSeleccionades[index] === valorOriginal ? 'checked' : '';
    bloc.innerHTML += `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="pregunta" value="${valorOriginal}" id="${id}" ${checked}>
        <label class="form-check-label" for="${id}">${resposta}</label>
      </div>
    `;
  });
  container.appendChild(bloc);
  document.getElementById('anterior').disabled = index === 0;
  document.getElementById('seguent').style.display = index === preguntesOriginals.length - 1 ? 'none' : 'inline-block';
  document.getElementById('enviar').style.display = index === preguntesOriginals.length - 1 ? 'inline-block' : 'none';
  setTimeout(() => {
    document.querySelectorAll('input[name="pregunta"]').forEach(input => {
      input.addEventListener('change', () => {
        respostesSeleccionades[index] = parseInt(input.value);
      });
    });
  }, 100);
}

function iniciarJoc() {
  fetch('getPreguntes.php?n=10')
    .then(res => res.json())
    .then(preguntes => {
      preguntesOriginals = preguntes;
      respostesSeleccionades = Array(preguntes.length).fill(null);
      document.getElementById('resultat').innerText = '';
      document.getElementById('reiniciar').style.display = 'none';
      tempsInici = Date.now();
      temporitzadorTimeout = setTimeout(enviarRespostes, tempsTotal);
      actualitzarTemporitzador();
      document.getElementById('barra-superior').style.display = 'flex';
      document.querySelector('.progress').style.display = 'block';
      document.getElementById('barra-progres').classList.remove('animada');
      void document.getElementById('barra-progres').offsetWidth;
      document.getElementById('barra-progres').classList.add('animada');
      document.getElementById('formulari').style.display = 'block';
      document.getElementById('comencar').style.display = 'none';
      document.getElementById('titol').style.display = 'none';
      document.getElementById('intro').style.display = 'none';
      mostrarPregunta(0);
    });
}

function enviarRespostes() {
  clearTimeout(temporitzadorTimeout);
  document.getElementById('barra-superior').style.display = 'none';
  document.querySelector('.progress').style.display = 'none';
  document.getElementById('barra-progres').classList.remove('animada');
  const dades = {};
  preguntesOriginals.forEach((pregunta, index) => {
    dades[pregunta.id] = respostesSeleccionades[index];
  });
  fetch('finalitza.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nom: nomUsuari,
      respostes: dades,
      temps: Date.now() - tempsInici
    })
  })
    .then(res => res.json())
    .then(resultat => {
      const segonsTrencats = Math.floor((Date.now() - tempsInici) / 1000);
      document.getElementById('resultat').innerHTML =
        `<div class="alert alert-success">
          <p>✅ Has encertat <strong>${resultat.correctes}</strong> de <strong>${resultat.total}</strong> preguntes.</p>
          <p>⏱️ Temps emprat: ${Math.floor(segonsTrencats / 60)} min ${segonsTrencats % 60} s</p>
        </div>`;
      document.getElementById('formulari').style.display = 'none';
      document.getElementById('reiniciar').style.display = 'inline';
      mostrarRanking();
    });
}

function mostrarRanking() {
  fetch('ranking.php')
    .then(res => res.json())
    .then(ranking => {
      if (!Array.isArray(ranking) || ranking.length === 0) return;

      let html = '<h2>🏆 Rànquing dels 10 millors</h2><ol>';
      ranking.forEach(r => {
        const segons = Math.floor(r.temps / 1000);
        html += `<li><strong>${r.nom}</strong> — ${r.puntuacio} punts — ${segons}s</li>`;
      });
      html += '</ol>';
      document.getElementById('resultat').innerHTML += html;
    })
    .catch(err => {
      console.error('Error carregant el rànquing:', err);
    });
}

document.getElementById('comencar').addEventListener('click', iniciarJoc);

document.getElementById('anterior').addEventListener('click', () => {
  if (preguntaActual > 0) {
    mostrarPregunta(preguntaActual - 1);
  }
});

document.getElementById('seguent').addEventListener('click', () => {
  if (preguntaActual < preguntesOriginals.length - 1) {
    mostrarPregunta(preguntaActual + 1);
  }
});

document.getElementById('formulari').addEventListener('submit', (e) => {
  e.preventDefault();
  enviarRespostes();
});

document.getElementById('reiniciar').addEventListener('click', () => {
  clearTimeout(temporitzadorTimeout);
  document.getElementById('comencar').style.display = 'inline';
  document.getElementById('titol').style.display = 'block';
  document.getElementById('intro').style.display = 'block';
  document.getElementById('reiniciar').style.display = 'none';
  document.getElementById('resultat').innerText = '';
  document.getElementById('resum').innerText = '';
  document.getElementById('temporitzador').innerText = 'Temps restant: 00:30';
  document.getElementById('barra-progres').style.width = '0%';
  document.getElementById('barra-progres').classList.remove('animada');
  document.getElementById('preguntes').innerHTML = '';
  document.getElementById('formulari').style.display = 'none';
  document.getElementById('barra-superior').style.display = 'none';
  document.querySelector('.progress').style.display = 'none';
  preguntaActual = 0;
});
