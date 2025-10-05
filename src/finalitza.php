<?php
require 'connexio.php';

// Llegim el cos JSON
$input = json_decode(file_get_contents("php://input"), true);

// Validem que hi ha respostes
if (!isset($input['respostes']) || !is_array($input['respostes'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Dades incorrectes']);
  exit;
}

// Validem que hi ha nom i temps
if (!isset($input['nom']) || !isset($input['temps'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Falten el nom o el temps']);
  exit;
}

$nom = trim($input['nom']);
$temps = intval($input['temps']);
$respostes = $input['respostes'];
$correctes = 0;
$total = count($respostes);

// Recorrem cada pregunta
foreach ($respostes as $pregunta_id => $resposta_index) {
  $stmt = $pdo->prepare("SELECT es_correcta FROM respostes WHERE pregunta_id = ? ORDER BY id");
  $stmt->execute([$pregunta_id]);
  $opcions = $stmt->fetchAll(PDO::FETCH_COLUMN);

  if (isset($opcions[$resposta_index]) && $opcions[$resposta_index] == 1) {
    $correctes++;
  }
}

// Desa el resultat a la base de dades
$stmt = $pdo->prepare("INSERT INTO resultats (nom, puntuacio, temps) VALUES (?, ?, ?)");
$stmt->execute([$nom, $correctes, $temps]);

// Retornem el resultat
echo json_encode([
  'correctes' => $correctes,
  'total' => $total
]);
