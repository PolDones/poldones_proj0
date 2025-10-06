# Test Carnet B — Pol Donés

Aplicació web interactiva per a la pràctica de preguntes del carnet de conduir tipus B. Inclou temporitzador, puntuació automàtica, rànquing i panell d'administració per gestionar les preguntes.

## Funcionalitats

- Test de 10 preguntes aleatòries amb límit de temps
- Interfície responsive per a mòbil i escriptori
- Validació de respostes i càlcul de puntuació
- Rànquing dels millors resultats
- Panell d'administració amb funcionalitats d'afegir, editar i esborrar preguntes
- Estil coherent amb paleta turquesa i animacions suaus

## Estructura del projecte
├── index.php # Inici del test per a l'usuari <br>
├── script.js # Lògica del client (preguntes, temporitzador, enviament) <br>
├── styles.css # Estils globals i adaptatius <br>
├── getPreguntes.php # API per obtenir preguntes aleatòries <br>
├── finalitza.php # Registra resultats i mostra puntuació <br>
├── ranking.php # Retorna el rànquing en format JSON <br>
├── admin.php # Panell d'administració <br>
├── editar.php # Editar preguntes existents <br>
├── eliminar.php # Esborrar preguntes <br>
├── connexio.php # Connexió a la base de dades <br>
└── README.md # Documentació del projecte <br>


### Taula `preguntes`

| Columna     | Tipus         | Descripció                          |
|-------------|---------------|--------------------------------------|
| id          | INT, PK, AI   | Identificador únic de la pregunta   |
| text        | TEXT          | Enunciat de la pregunta             |
| image_url   | TEXT (opcional) | URL d’una imatge associada         |

### Taula `respostes`

| Columna     | Tipus         | Descripció                          |
|-------------|---------------|--------------------------------------|
| id          | INT, PK, AI   | Identificador únic de la resposta   |
| pregunta_id | INT, FK       | Referència a la pregunta (relació) |
| text        | TEXT          | Text de la resposta                 |
| es_correcta | BOOLEAN       | Indica si és la resposta correcta   |

**Relació:** `respostes.pregunta_id` → `preguntes.id`  
(Clau forana amb eliminació en cascada)

### Taula `resultats`

| Columna     | Tipus         | Descripció                          |
|-------------|---------------|--------------------------------------|
| id          | INT, PK, AI   | Identificador del resultat          |
| nom         | VARCHAR(100)  | Nom de l’usuari                     |
| puntuacio   | INT           | Nombre de respostes correctes       |
| temps       | INT           | Temps emprat en mil·lisegons        |
| data        | TIMESTAMP     | Data i hora de l’enviament          |




## Requisits

- PHP 7.4 o superior
- MySQL o MariaDB
- Servidor web (Apache, Nginx o similar)

## Instal·lació

1. Clonar el repositori:

   ```bash
   git clone https://github.com/autoescola-dones/test-carnet-b.git

2. Docker:
    
    aixecar el docker amb la versio que hi hagi instalada

3. sql

    Crear la base de dades:

    ```sql
    CREATE DATABASE test_autoescola;
    USE test_autoescola;

    CREATE TABLE preguntes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    image_url TEXT
    );

    CREATE TABLE respostes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pregunta_id INT NOT NULL,
    text TEXT NOT NULL,
    es_correcta BOOLEAN DEFAULT 0,
    FOREIGN KEY (pregunta_id) REFERENCES preguntes(id) ON DELETE CASCADE
    );

    CREATE TABLE resultats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    puntuacio INT,
    temps INT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

4. Configurar el fitxer connexio.php amb les credencials de la base de dades:

    ```php
    <?php
    $pdo = new PDO("mysql:host=localhost;dbname=test_autoescola;charset=utf8", "usuari", "contrasenya");
    ?>