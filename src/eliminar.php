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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Esborrar respostes i pregunta
  $pdo->prepare("DELETE FROM respostes WHERE pregunta_id = ?")->execute([$id]);
  $pdo->prepare("DELETE FROM preguntes WHERE id = ?")->execute([$id]);
  echo "<p style='color:green;'>✅ Pregunta esborrada correctament.</p>";
  echo "<p><a href='admin.php' class='btn btn-add'>⬅️ Tornar a Admin</a></p>";
  exit;
}
?>
<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <title>Esborrar Pregunta</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="admin-container">
    <h1>Esborrar Pregunta</h1>
    <p>Estàs segur que vols esborrar aquesta pregunta?</p>
    <blockquote><?= htmlspecialchars($pregunta['text']) ?></blockquote>
    <form method="POST">
      <button type="submit" class="btn btn-delete">🗑️ Confirmar Esborrat</button>
      <a href="admin.php" class="btn btn-add">❌ Cancel·lar</a>
    </form>
  </div>
</body>
</html>
