let preguntesOriginals = [];

// Funció per barrejar un array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Actualitza el resum de respostes seleccionades
function actualitzarResum() {
  const resum = preguntesOriginals.map((_, index) => {
    const seleccionada = document.querySelector(`input[name="pregunta${index}"]:checked`);
    return `pregunta${index + 1}: ${seleccionada ? seleccionada.value : '-'}`;
  });
  document.getElementById('resum').innerText = resum.join('\n');
}

// Funció per començar el joc
function iniciarJoc() {
  fetch('getPreguntes.php?num=10')
    .then(res => res.json())
    .then(preguntes => {
      preguntesOriginals = preguntes;
      const container = document.getElementById('preguntes');
      container.innerHTML = '';
      document.getElementById('resum').innerText = '';
      document.getElementById('resultat').innerText = '';
      document.getElementById('reiniciar').style.display = 'none';

      preguntes.forEach((pregunta, index) => {
        const bloc = document.createElement('div');
        bloc.innerHTML = `<p><strong>${index + 1}. ${pregunta.question}</strong></p>`;

        if (pregunta.image) {
          bloc.innerHTML += `<img src="${pregunta.image}" alt="Imatge" style="max-width:300px;"><br>`;
        }

        const respostesBarrejades = [...pregunta.answers];
        shuffle(respostesBarrejades);

        respostesBarrejades.forEach((resposta, i) => {
          const id = `pregunta${index}_resposta${i}`;
          const valorOriginal = pregunta.answers.indexOf(resposta);
          bloc.innerHTML += `
            <input type="radio" name="pregunta${index}" value="${valorOriginal}" id="${id}" required>
            <label for="${id}">${resposta}</label><br>
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

// Quan es fa clic a "Començar joc"
document.getElementById('comencar').addEventListener('click', iniciarJoc);

// Quan s'envia el formulari
document.getElementById('formulari').addEventListener('submit', (e) => {
  e.preventDefault();

  const respostes = preguntesOriginals.map((_, index) => {
    const seleccionada = document.querySelector(`input[name="pregunta${index}"]:checked`);
    return seleccionada ? parseInt(seleccionada.value) : null;
  });

  fetch('finalitza.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respostes })
  })
  .then(res => res.json())
  .then(resultat => {
    document.getElementById('resultat').innerHTML =
      `<p>Has encertat ${resultat.correctes} de ${resultat.total} preguntes.</p>`;
    document.getElementById('formulari').style.display = 'none';
    document.getElementById('reiniciar').style.display = 'inline';
  });
});

// Quan es fa clic a "Tornar a començar"
document.getElementById('reiniciar').addEventListener('click', () => {
  document.getElementById('comencar').style.display = 'inline';
  document.getElementById('reiniciar').style.display = 'none';
  document.getElementById('resultat').innerText = '';
  document.getElementById('resum').innerText = '';
});
