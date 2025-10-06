<?php
require 'connexio.php';

$id = $_GET['id'] ?? null;
if (!$id) die('ID no especificat.');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $text = trim($_POST['text'] ?? '');
  $image = trim($_POST['image'] ?? '');
  $respostes = $_POST['respostes'] ?? [];
  $correcta = isset($_POST['correcta']) ? intval($_POST['correcta']) - 1 : -1;

  $respostesCompletes = array_filter($respostes, fn($r) => trim($r) !== '');
  $indexValid = is_numeric($_POST['correcta']) && $correcta >= 0 && $correcta < 4;

  if ($text !== '' && count($respostesCompletes) === 4 && $indexValid) {
    $pdo->prepare("UPDATE preguntes SET text = ?, image_url = ? WHERE id = ?")->execute([$text, $image, $id]);
    $pdo->prepare("DELETE FROM respostes WHERE pregunta_id = ?")->execute([$id]);

    foreach ($respostes as $i => $r) {
      $pdo->prepare("INSERT INTO respostes (pregunta_id, text, es_correcta) VALUES (?, ?, ?)")
          ->execute([$id, trim($r), $i === $correcta ? 1 : 0]);
    }

    echo "<p style='color:green;'>✅ Pregunta actualitzada.</p>";
  } else {
    echo "<p style='color:red;'>❌ Tots els camps són obligatoris excepte la URL d'imatge. Índex correcte entre 1 i 4.</p>";
  }
}

// Carregar pregunta i respostes
$pregunta = $pdo->prepare("SELECT * FROM preguntes WHERE id = ?");
$pregunta->execute([$id]);
$p = $pregunta->fetch();

$respostes = $pdo->prepare("SELECT * FROM respostes WHERE pregunta_id = ?");
$respostes->execute([$id]);
$r = $respostes->fetchAll();
?>

<h2>Editar pregunta</h2>
<form method="POST">
  <input name="text" value="<?= htmlspecialchars($p['text']) ?>" placeholder="Pregunta"><br>
  <input name="image" value="<?= htmlspecialchars($p['image_url']) ?>" placeholder="URL imatge (opcional)"><br>
  <?php foreach ($r as $i => $resposta): ?>
    <input name="respostes[]" value="<?= htmlspecialchars($resposta['text']) ?>" placeholder="Resposta <?= $i + 1 ?>"><br>
  <?php endforeach ?>
  <?php
    $indexCorrecte = array_search(1, array_column($r, 'es_correcta'));
  ?>
  <input name="correcta" type="number" min="1" max="4" value="<?= $indexCorrecte + 1 ?>" placeholder="Índex correcta (1–4)"><br>
  <button type="submit">Desar canvis</button>
</form>
<a href="admin.php">⬅️ Tornar</a>
