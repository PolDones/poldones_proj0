let preguntesOriginals = [];
let tempsInici = null;
let interval = null;
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

function actualitzarResum() {
  const resum = preguntesOriginals.map((_, index) => {
    const seleccionada = document.querySelector(`input[name="pregunta${index}"]:checked`);
    return `pregunta${index + 1}: ${seleccionada ? seleccionada.value : '-'}`;
  });
  document.getElementById('resum').innerText = resum.join('\n');
}

function iniciarJoc() {
  fetch('getPreguntes.php?n=10')
    .then(res => res.json())
    .then(preguntes => {
      preguntesOriginals = preguntes;
      const container = document.getElementById('preguntes');
      container.innerHTML = '';
      document.getElementById('resultat').innerText = '';
      document.getElementById('reiniciar').style.display = 'none';

      tempsInici = Date.now();
      interval = setInterval(actualitzarTemporitzador, 1000);
      actualitzarTemporitzador();

      preguntes.forEach((pregunta, index) => {
        const bloc = document.createElement('div');
        bloc.classList.add('card', 'mb-4', 'p-3', 'shadow-sm');
        bloc.innerHTML = `<p class="fw-bold">${index + 1}. ${pregunta.question}</p>`;

        if (pregunta.image) {
          bloc.innerHTML += `<img src="${pregunta.image}" alt="Imatge" class="img-fluid mb-2"><br>`;
        }

        const respostesBarrejades = [...pregunta.answers];
        shuffle(respostesBarrejades);

        respostesBarrejades.forEach((resposta, i) => {
          const id = `pregunta${index}_resposta${i}`;
          const valorOriginal = pregunta.answers.indexOf(resposta);
          bloc.innerHTML += `
            <div class="form-check">
              <input class="form-check-input" type="radio" name="pregunta${index}" value="${valorOriginal}" id="${id}">
              <label class="form-check-label" for="${id}">${resposta}</label>
            </div>
          `;
        });

        container.appendChild(bloc);
      });

      document.getElementById('formulari').style.display = 'block';
      document.getElementById('comencar').style.display = 'none';

      setTimeout(() => {
        document.querySelectorAll('input[type="radio"]').forEach(input => {
          input.addEventListener('change', actualitzarResum);
        });
        actualitzarResum();
      }, 100);
    });
}

function enviarRespostes() {
  const respostes = preguntesOriginals.map((_, index) => {
    const seleccionada = document.querySelector(`input[name="pregunta${index}"]:checked`);
    return seleccionada ? parseInt(seleccionada.value) : null;
  });

  const dades = {};
  preguntesOriginals.forEach((pregunta, index) => {
    dades[pregunta.id] = respostes[index];
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
        <p>✅ Has encertat <strong>${resultat.correctes}</strong> de <strong>${resultat.total}</strong> preguntes.</p>
        <p>⏱️ Temps emprat: ${Math.floor(segonsTrencats / 60)} min ${segonsTrencats % 60} s</p>
        <p>⌛ Temps restant: ${Math.floor(segonsRestants / 60)} min ${segonsRestants % 60} s</p>
      </div>`;

    document.getElementById('formulari').style.display = 'none';
    document.getElementById('reiniciar').style.display = 'inline';
    clearInterval(interval);
  });
}

document.getElementById('comencar').addEventListener('click', iniciarJoc);

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
});
