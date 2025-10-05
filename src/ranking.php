<?php
require 'connexio.php';

$stmt = $pdo->query("SELECT nom, puntuacio, temps FROM resultats ORDER BY puntuacio DESC, temps ASC LIMIT 10");
$ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($ranking);
?>
