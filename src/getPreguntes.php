<?php
// Aquesta API retorna preguntes aleatòries sense la resposta correcta

header('Content-Type: application/json');

// Nombre de preguntes demanades
$num = isset($_GET['num']) ? intval($_GET['num']) : 10;

// Llegim el fitxer JSON
$json = file_get_contents("Quiz.json");
$data = json_decode($json, true);
$preguntes = $data['questions'];

// Seleccionem preguntes aleatòries
$seleccionades = array_rand($preguntes, $num);
$resultat = [];

foreach ($seleccionades as $i) {
    $p = $preguntes[$i];
    unset($p['correctIndex']); // Eliminem la resposta correcta
    $resultat[] = $p;
}

// Enviem les preguntes com a JSON
echo json_encode($resultat);