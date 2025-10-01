<?php
require 'connexio.php';

// Afegir nova pregunta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $text = $_POST['text'];
  $image = $_POST['image'];
  $respostes = $_POST['respostes'];
  $correcta = intval($_POST['correcta']);

  $pdo->prepare("INSERT INTO preguntes (text, image_url) VALUES (?, ?)")->execute([$text, $image]);
  $pregunta_id = $pdo->lastInsertId();

  foreach ($respostes as $i => $r) {
    $pdo->prepare("INSERT INTO respostes (pregunta_id, text, es_correcta) VALUES (?, ?, ?)")
        ->execute([$pregunta_id, $r, $i == $correcta ? 1 : 0]);
  }
}

// Mostrar preguntes
$preguntes = $pdo->query("SELECT * FROM preguntes")->fetchAll();
?>
<h2>Administració</h2>
<form method="POST">
  <input name="text" placeholder="Pregunta"><br>
  <input name="image" placeholder="URL imatge (opcional)"><br>
  <input name="respostes[]" placeholder="Resposta 1"><br>
  <input name="respostes[]" placeholder="Resposta 2"><br>
  <input name="respostes[]" placeholder="Resposta 3"><br>
  <input name="respostes[]" placeholder="Resposta 4"><br>
  <input name="correcta" type="number" min="0" max="3" placeholder="Índex correcta"><br>
  <button type="submit">Afegir</button>
</form>

<ul>
<?php foreach ($preguntes as $p): ?>
  <li>
    <?= $p['text'] ?>  
    <a href="editar.php?id=<?= $p['id'] ?>">✏️</a>
    <a href="eliminar.php?id=<?= $p['id'] ?>">🗑️</a>
  </li>
<?php endforeach ?>
