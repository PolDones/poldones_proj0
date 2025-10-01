<?php
// Aquesta API rep les respostes de l'usuari i calcula quantes són correctes

header('Content-Type: application/json');

// Llegim les respostes enviades pel frontend
$input = json_decode(file_get_contents("php://input"), true);
$respostesUsuari = $input['respostes'] ?? [];

// Llegim el fitxer JSON original
$json = file_get_contents("Quiz.json");
$data = json_decode($json, true);
$preguntes = $data['questions'];

$total = count($respostesUsuari);
$correctes = 0;

// Comprovem cada resposta
foreach ($respostesUsuari as $i => $resposta) {
    if (!isset($preguntes[$i])) continue;
    if ($preguntes[$i]['correctIndex'] == $resposta) {
        $correctes++;
    }
}

// Enviem el resultat com a JSON
echo json_encode([
    'total' => $total,
    'correctes' => $correctes
]);
