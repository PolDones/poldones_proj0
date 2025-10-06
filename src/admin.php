<?php
require 'connexio.php';

// Afegir nova pregunta
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $text = trim($_POST['text'] ?? '');
  $image = trim($_POST['image'] ?? '');
  $respostes = $_POST['respostes'] ?? [];
  $correctaInput = $_POST['correcta'] ?? '';

  // Ajustem l'índex (usuari entra 1–4, internament és 0–3)
  $correcta = is_numeric($correctaInput) ? intval($correctaInput) - 1 : -1;

  // Validació
  $respostesCompletes = array_filter($respostes, fn($r) => trim($r) !== '');
  $indexValid = is_numeric($correctaInput) && $correcta >= 0 && $correcta < 4;

  if ($text !== '' && count($respostesCompletes) === 4 && $indexValid) {
    $pdo->prepare("INSERT INTO preguntes (text, image_url) VALUES (?, ?)")->execute([$text, $image]);
    $pregunta_id = $pdo->lastInsertId();

    foreach ($respostes as $i => $r) {
      $pdo->prepare("INSERT INTO respostes (pregunta_id, text, es_correcta) VALUES (?, ?, ?)")
          ->execute([$pregunta_id, trim($r), $i === $correcta ? 1 : 0]);
    }

    echo "<p style='color:green;'>✅ Pregunta afegida correctament.</p>";
  } else {
    echo "<p style='color:red;'>❌ Tots els camps són obligatoris excepte la URL d'imatge. L'índex correcte ha de ser un número entre 1 i 4.</p>";
  }
}

// Mostrar preguntes
$preguntes = $pdo->query("SELECT * FROM preguntes")->fetchAll();
?>

<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <title>Administració de preguntes</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; max-width: 600px; margin: auto; }
    input { margin-bottom: 0.5rem; width: 100%; padding: 0.4rem; }
    button { margin-top: 1rem; padding: 0.5rem 1rem; }
    ul { margin-top: 2rem; padding-left: 1rem; }
    li { margin-bottom: 0.5rem; }
    a { margin-left: 0.5rem; text-decoration: none; }
  </style>
</head>
<body>
  <h2>Administració</h2>

  <form method="POST">
    <input name="text" placeholder="Pregunta"><br>
    <input name="image" placeholder="URL imatge (opcional)"><br>
    <input name="respostes[]" placeholder="Resposta 1"><br>
    <input name="respostes[]" placeholder="Resposta 2"><br>
    <input name="respostes[]" placeholder="Resposta 3"><br>
    <input name="respostes[]" placeholder="Resposta 4"><br>
    <input name="correcta" type="number" min="1" max="4" placeholder="Índex de la resposta correcta (1–4)"><br>
    <button type="submit">Afegir</button>
  </form>

  <ul>
    <?php foreach ($preguntes as $p): ?>
      <li>
        <?= htmlspecialchars($p['text']) ?>
        <a href="editar.php?id=<?= $p['id'] ?>">✏️</a>
        <a href="eliminar.php?id=<?= $p['id'] ?>" onclick="return confirm('❗ Segur que vols esborrar aquesta pregunta? Aquesta acció no es pot desfer.')">🗑️</a>
      </li>
    <?php endforeach ?>
  </ul>
</body>
</html>
