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

    $missatge = "<p style='color:green;'>✅ Pregunta afegida correctament.</p>";
  } else {
    $missatge = "<p style='color:red;'>❌ Tots els camps són obligatoris excepte la URL d'imatge. L'índex correcte ha de ser un número entre 1 i 4.</p>";
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
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="admin-container">
    <h1>Administració de Preguntes</h1>

    <?php if (!empty($missatge)) echo $missatge; ?>

    <!-- Formulari afegir -->
    <form method="POST">
      <input name="text" placeholder="Pregunta">
      <input name="image" placeholder="URL imatge (opcional)">
      <input name="respostes[]" placeholder="Resposta 1">
      <input name="respostes[]" placeholder="Resposta 2">
      <input name="respostes[]" placeholder="Resposta 3">
      <input name="respostes[]" placeholder="Resposta 4">
      <input name="correcta" type="number" min="1" max="4" placeholder="Índex de la resposta correcta (1–4)">
      <button type="submit" class="btn btn-add">➕ Afegir</button>
    </form>

    <!-- Llistat de preguntes -->
    <table>
      <tr>
        <th>ID</th>
        <th>Pregunta</th>
        <th>Accions</th>
      </tr>
      <?php if ($preguntes): ?>
        <?php foreach ($preguntes as $p): ?>
          <tr>
            <td><?= $p['id'] ?></td>
            <td><?= htmlspecialchars($p['text']) ?></td>
            <td>
              <a href="editar.php?id=<?= $p['id'] ?>" class="btn btn-edit">✏️ Editar</a>
              <a href="eliminar.php?id=<?= $p['id'] ?>" class="btn btn-delete"
                 onclick="return confirm('❗ Segur que vols esborrar aquesta pregunta? Aquesta acció no es pot desfer.')">🗑️ Esborrar</a>
            </td>
          </tr>
        <?php endforeach ?>
      <?php else: ?>
        <tr><td colspan="3">No hi ha preguntes registrades.</td></tr>
      <?php endif; ?>
    </table>
  </div>
</body>
</html>
