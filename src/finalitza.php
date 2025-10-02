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

$respostes = $input['respostes'];
$correctes = 0;
$total = count($respostes);

// Recorrem cada pregunta
foreach ($respostes as $pregunta_id => $resposta_index) {
  // Obtenim totes les respostes d'aquesta pregunta ordenades
  $stmt = $pdo->prepare("SELECT es_correcta FROM respostes WHERE pregunta_id = ? ORDER BY id");
  $stmt->execute([$pregunta_id]);
  $opcions = $stmt->fetchAll(PDO::FETCH_COLUMN);

  // Comprovem si la resposta seleccionada és correcta
  if (isset($opcions[$resposta_index]) && $opcions[$resposta_index] == 1) {
    $correctes++;
  }
}

// Retornem el resultat
echo json_encode([
  'correctes' => $correctes,
  'total' => $total
]);
