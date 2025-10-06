<?php
require 'connexio.php';

$id = $_GET['id'] ?? null;

// Validació: comprova que hi ha un ID vàlid
if (!$id || !is_numeric($id)) {
  die('❌ ID no especificat o invàlid.');
}

// Esborra primer les respostes associades
$pdo->prepare("DELETE FROM respostes WHERE pregunta_id = ?")->execute([$id]);

// Esborra la pregunta
$pdo->prepare("DELETE FROM preguntes WHERE id = ?")->execute([$id]);

// Redirigeix a la pàgina d'administració
header('Location: admin.php');
exit;
