<?php
require 'connexio.php';

$n = isset($_GET['n']) ? intval($_GET['n']) : 10;
$n = max(1, min($n, 100));

$stmt = $pdo->query("SELECT * FROM preguntes ORDER BY RAND() LIMIT $n");
$preguntes = $stmt->fetchAll();

$resultat = [];

foreach ($preguntes as $p) {
  $respostes = $pdo->prepare("SELECT text FROM respostes WHERE pregunta_id = ?");
  $respostes->execute([$p['id']]);
  $opcions = $respostes->fetchAll(PDO::FETCH_COLUMN);

  $resultat[] = [
    'id' => $p['id'],
    'question' => $p['text'],
    'image' => $p['image_url'],
    'answers' => $opcions
  ];
}

echo json_encode($resultat);
