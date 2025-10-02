let preguntesOriginals = [];
let respostesSeleccionades = [];
let tempsInici = null;
let interval = null;
let preguntaActual = 0;
const tempsTotal = 10 * 60 * 1000;

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
  if (restant <= 0) {
    clearInterval(interval);
    enviarRespostes();
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function mostrarPregunta(index) {
  const container = document.getElementById('preguntes');
  container.innerHTML = '';
  const pregunta = preguntesOriginals[index];

  const bloc = document.createElement('div');
  bloc.classList.add('card', 'mb-4', 'p-3', 'shadow-sm');
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
      interval = setInterval(actualitzarTemporitzador, 1000);
      actualitzarTemporitzador();

      document.getElementById('formulari').style.display = 'block';
      document.getElementById('comencar').style.display = 'none';
      document.getElementById('titol').style.display = 'none';
      mostrarPregunta(0);
    });
}

function enviarRespostes() {
  const dades = {};
  preguntesOriginals.forEach((pregunta, index) => {
    dades[pregunta.id] = respostesSeleccionades[index];
  });

  fetch('finalitza.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respostes: dades })
  })
    .then(res => res.json())
    .then(resultat => {
      const tempsFinal = Date.now();
      const tempsTrencat = tempsFinal - tempsInici;
      const segonsTrencats = Math.floor(tempsTrencat / 1000);
      const segonsRestants = Math.max(0, Math.floor((tempsTotal - tempsTrencat) / 1000));

      document.getElementById('resultat').innerHTML =
        `<div class="alert alert-success">
          <p>Has encertat <strong>${resultat.correctes}</strong> de <strong>${resultat.total}</strong> preguntes.</p>
          <p>Temps emprat: ${Math.floor(segonsTrencats / 60)} min ${segonsTrencats % 60} s</p>
          <p>Temps restant: ${Math.floor(segonsRestants / 60)} min ${segonsRestants % 60} s</p>
        </div>`;

      document.getElementById('formulari').style.display = 'none';
      document.getElementById('reiniciar').style.display = 'inline';
      clearInterval(interval);
    });
}

document.getElementById('comencar').addEventListener('click', iniciarJoc);

document.getElementById('anterior').addEventListener('click', () => {
  if (preguntaActual > 0) {
    preguntaActual--;
    mostrarPregunta(preguntaActual);
  }
});

document.getElementById('seguent').addEventListener('click', () => {
  if (preguntaActual < preguntesOriginals.length - 1) {
    preguntaActual++;
    mostrarPregunta(preguntaActual);
  }
});

document.getElementById('formulari').addEventListener('submit', (e) => {
  e.preventDefault();
  clearInterval(interval);
  enviarRespostes();
});

document.getElementById('reiniciar').addEventListener('click', () => {
  document.getElementById('comencar').style.display = 'inline';
  document.getElementById('reiniciar').style.display = 'none';
  document.getElementById('resultat').innerText = '';
  document.getElementById('resum').innerText = '';
  document.getElementById('temporitzador').innerText = 'Temps restant: 10:00';
  document.getElementById('preguntes').innerHTML = '';
  document.getElementById('formulari').style.display = 'none';
  document.getElementById('titol').style.display = 'block';
  preguntaActual = 0;
});
