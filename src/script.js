document.addEventListener('DOMContentLoaded', () => {

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

document.getElementById('comencar').addEventListener('click', iniciarJoc);

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
  if (restant > 0) {
    setTimeout(actualitzarTemporitzador, 1000);
  } else {
    document.getElementById('temporitzador').classList.add('final');
    enviarRespostes();
  }
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
  bloc.classList.add('bloc-pregunta');
  bloc.innerHTML = `<p><strong>${index + 1}. ${pregunta.question}</strong></p>`;
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
        <input class="form-check-input" type="radio" name="pregunta${index}" value="${valorOriginal}" id="${id}" ${checked}>
        <label class="form-check-label" for="${id}">${resposta}</label>
      </div>
    `;
  });
  container.appendChild(bloc);

  // Botó "Enrere"
  document.getElementById('anterior').disabled = index === 0;

  // Botó "Següent" → ara amb classe .ocult en lloc de display:none
  const seguentBtn = document.getElementById('seguent');
  if (index === preguntesOriginals.length - 1) {
    seguentBtn.classList.add('ocult');
  } else {
    seguentBtn.classList.remove('ocult');
  }

  // Botó "Enviar"
  document.getElementById('enviar').style.display =
    index === preguntesOriginals.length - 1 ? 'inline-block' : 'none';

  // Guardar resposta seleccionada
  setTimeout(() => {
    document.querySelectorAll(`input[name="pregunta${index}"]`).forEach(input => {
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
      if (!Array.isArray(preguntes) || preguntes.length === 0) {
        alert('No s’han pogut carregar les preguntes.');
        return;
      }

      preguntesOriginals = preguntes;
      respostesSeleccionades = Array(preguntes.length).fill(null);
      tempsInici = Date.now();
      temporitzadorTimeout = setTimeout(enviarRespostes, tempsTotal);
      actualitzarTemporitzador();

      const resultat = document.getElementById('resultat');
      if (resultat) resultat.innerText = '';

      const reiniciar = document.getElementById('reiniciar');
      if (reiniciar) reiniciar.style.display = 'inline';

      const barraSuperior = document.getElementById('barra-superior');
      if (barraSuperior) barraSuperior.style.display = 'flex';

      const progress = document.querySelector('.progress');
      if (progress) progress.style.display = 'block';

      const barraProgres = document.getElementById('barra-progres');
      if (barraProgres) {
        barraProgres.classList.remove('animada');
        void barraProgres.offsetWidth;
        barraProgres.classList.add('animada');
      }

      const formulari = document.getElementById('formulari');
      if (formulari) formulari.style.display = 'block';

      const formularInici = document.getElementById('formular-inici');
      if (formularInici) formularInici.style.display = 'none';

      const titol = document.getElementById('titol');
      if (titol) titol.style.display = 'none';

      const intro = document.getElementById('intro');
      if (intro) intro.style.display = 'none';

      mostrarPregunta(0);
    })
    .catch(err => {
      console.error('Error carregant preguntes:', err);
      alert('Error de connexió amb el servidor.');
    });
}

function enviarRespostes() {
  clearTimeout(temporitzadorTimeout);

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
      const resultatDiv = document.getElementById('resultat');
      resultatDiv.style.display = 'block';
      resultatDiv.innerHTML = `
        <div class="alert alert-success">
          <p>✅ Has encertat <strong>${resultat.correctes}</strong> de <strong>${resultat.total}</strong> preguntes.</p>
          <p>⏱️ Temps emprat: ${Math.floor(segonsTrencats / 60)} min ${segonsTrencats % 60} s</p>
        </div>
        <div id="ranking"></div>
        <button id="tornarInici" class="btn btn-primary">🔄 Torna a l’inici</button>
      `;

      document.getElementById('formulari').style.display = 'none';
      mostrarRanking();

      setTimeout(() => {
        document.getElementById('tornarInici').addEventListener('click', reiniciarJoc);
      }, 500);
    })
    .catch(err => {
      console.error('Error carregant estadístiques:', err);
      const resultatDiv = document.getElementById('resultat');
      resultatDiv.style.display = 'block';
      resultatDiv.innerHTML = `
        <div class="alert alert-danger">
          ❌ Error de connexió amb el servidor. Torna-ho a intentar més tard.
        </div>`;
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

      const rankingDiv = document.getElementById('ranking');
      rankingDiv.innerHTML = html;
    })
    .catch(err => {
      console.error('Error carregant el rànquing:', err);
    });
}





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

document.getElementById('enviar').addEventListener('click', () => {
  enviarRespostes();
});

document.getElementById('enviar').addEventListener('click', () => {
  enviarRespostes();
});


function reiniciarJoc() {
  // Oculta i neteja el resultat
  const resultatDiv = document.getElementById('resultat');
  resultatDiv.style.display = 'none';
  resultatDiv.innerHTML = '';

  // Mostra el formulari d'inici amb animació
  const formularInici = document.getElementById('formular-inici');
  formularInici.style.display = 'flex';
  formularInici.style.opacity = '0'; // reinicia animació
  formularInici.classList.remove('resultat-container'); // per si estava aplicada
  void formularInici.offsetWidth; // forçar reflow
  formularInici.classList.add('resultat-container'); // reaplica animació

  // Restaura visibilitat del títol i introducció
  document.getElementById('titol').style.display = 'block';
  document.getElementById('intro').style.display = 'block';

  // Restaura estat inicial
  document.getElementById('nom').value = '';
  document.getElementById('comencar').disabled = true;
  document.getElementById('comencar').style.display = 'inline';

  document.getElementById('preguntes').innerHTML = '';
  document.getElementById('temporitzador').innerText = 'Temps restant: 00:30';
  document.getElementById('barra-progres').style.width = '0%';
  document.getElementById('barra-progres').classList.remove('animada');
  document.getElementById('barra-superior').style.display = 'none';
  document.querySelector('.progress').style.display = 'none';
  document.getElementById('formulari').style.display = 'none';

  // Reset de variables globals
  preguntesOriginals = [];
  respostesSeleccionades = [];
  tempsInici = null;
  preguntaActual = 0;
  nomUsuari = '';
}



});
