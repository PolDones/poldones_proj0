<?php
require 'connexio.php';

$id = $_GET['id'] ?? null;
if (!$id) {
  die("ID no especificat.");
}

// Obtenir la pregunta
$stmt = $pdo->prepare("SELECT * FROM preguntes WHERE id = ?");
$stmt->execute([$id]);
$pregunta = $stmt->fetch();

if (!$pregunta) {
  die("Pregunta no trobada.");
}

// Obtenir respostes
$respostes = $pdo->prepare("SELECT * FROM respostes WHERE pregunta_id = ?");
$respostes->execute([$id]);
$respostes = $respostes->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $text = trim($_POST['text'] ?? '');
  $image = trim($_POST['image'] ?? '');
  $respostesForm = $_POST['respostes'] ?? [];
  $correctaInput = $_POST['correcta'] ?? '';
  $correcta = is_numeric($correctaInput) ? intval($correctaInput) - 1 : -1;

  if ($text !== '' && count(array_filter($respostesForm)) === 4 && $correcta >= 0 && $correcta < 4) {
    $pdo->prepare("UPDATE preguntes SET text = ?, image_url = ? WHERE id = ?")
        ->execute([$text, $image, $id]);

    foreach ($respostesForm as $i => $r) {
      $pdo->prepare("UPDATE respostes SET text = ?, es_correcta = ? WHERE pregunta_id = ? AND id = ?")
          ->execute([trim($r), $i === $correcta ? 1 : 0, $id, $respostes[$i]['id']]);
    }

//    echo "<p style='color:green;'>✅ Pregunta actualitzada correctament.</p>";
//  } else {
//    echo "<p style='color:red;'>❌ Revisa els camps. Calen 4 respostes i un índex correcte (1–4).</p>";
  }
}
?>
<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <title>Editar Pregunta</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="admin-container">
    <h1>Editar Pregunta</h1>
    <form method="POST">
      <input name="text" value="<?= htmlspecialchars($pregunta['text']) ?>" placeholder="Pregunta">
      <input name="image" value="<?= htmlspecialchars($pregunta['image_url']) ?>" placeholder="URL imatge (opcional)">
      <?php foreach ($respostes as $i => $r): ?>
        <input name="respostes[]" value="<?= htmlspecialchars($r['text']) ?>" placeholder="Resposta <?= $i+1 ?>">
      <?php endforeach; ?>
      <input name="correcta" type="number" min="1" max="4" value="<?= array_search(1, array_column($respostes, 'es_correcta'))+1 ?>" placeholder="Índex correcte (1–4)">
      <button type="submit" class="btn btn-edit">💾 Guardar</button>
      <a href="admin.php" class="btn btn-add">⬅️ Tornar</a>
    </form>
  </div>
</body>
</html>
