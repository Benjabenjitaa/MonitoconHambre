const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let snake;
let fruits = [];
let numFruits = 1;
const gridSize = 40; // Tamaño de la cuadrícula
const canvasWidth = 800; // Ancho del canvas
const canvasHeight = 600; // Altura del canvas
let gameInterval;
let isGameActive = false; // Estado del juego
let speed = 150; // Velocidad inicial
let score = 0; // Puntuación del jugador
let playerName = ''; // Nombre del jugador
let scoreRecords = []; // Registro de puntuaciones

// Lista de frutas
const fruitImages = [
    'apple.png',
    'pear.png',
    'banana.png',
];

class Snake {
    constructor() {
        this.body = [{ x: 320, y: 200 }, { x: 280, y: 200 }]; // Posición inicial
        this.direction = { x: 0, y: 0 }; // Inicia quieta
        this.image = new Image();
        this.image.src = 'snake.png';
        this.headImage = new Image();
        this.headImage.src = 'snake_head.png';
    }

    update() {
        // Solo actualiza si hay dirección
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            const head = { x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y };
            this.body.unshift(head);
            
            if (!this.eating) {
                this.body.pop();
            } else {
                this.eating = false;
            }

            this.checkCollision(head);
        }
    }

    checkCollision(head) {
        if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight) {
            alert("¡Perdiste! Chocaste con un borde.");
            clearInterval(gameInterval);
            recordScore();
            resetGame();
        }

        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                alert("¡Perdiste! Chocaste con tu cuerpo.");
                clearInterval(gameInterval);
                recordScore();
                resetGame();
            }
        }
    }

    changeDirection(x, y) {
        // Evita que la serpiente se mueva en dirección opuesta
        if (x !== -this.direction.x || y !== -this.direction.y) {
            this.direction = { x, y };
        }
    }

    draw() {
        ctx.drawImage(this.headImage, this.body[0].x, this.body[0].y, gridSize, gridSize);
        this.body.slice(1).forEach(segment => {
            ctx.drawImage(this.image, segment.x, segment.y, gridSize, gridSize);
        });
    }

    eat() {
        this.eating = true;
        this.body.push({}); // Crecer la serpiente
        score += 1; // Aumentar la puntuación al comer
        displayScore(); // Mostrar la puntuación actual
        animateScore(); // Animación de +1
    }
}

class Fruit {
    constructor() {
        this.image = new Image();
        this.image.src = this.randomFruit();
        this.position = this.generatePosition();
    }

    randomFruit() {
        const randomFruit = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        return randomFruit;
    }

    generatePosition() {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize,
            };
        } while (snake.body.some(segment => segment.x === position.x && segment.y === position.y));
        return position;
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, gridSize, gridSize);
    }
}

function initGame() {
    snake = new Snake();
    fruits = [];
    for (let i = 0; i < numFruits; i++) {
        fruits.push(new Fruit());
    }
    document.addEventListener('keydown', handleKeydown);
    canvas.style.display = 'block';
    document.getElementById('menu').style.display = 'none';
    document.getElementById('scoreDisplay').style.display = 'block'; // Mostrar puntaje
    
    isGameActive = true;
    score = 0; // Reinicia la puntuación
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
}

function handleKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            snake.changeDirection(0, -gridSize);
            break;
        case 'ArrowDown':
        case 's':
            snake.changeDirection(0, gridSize);
            break;
        case 'ArrowLeft':
        case 'a':
            snake.changeDirection(-gridSize, 0);
            break;
        case 'ArrowRight':
        case 'd':
            snake.changeDirection(gridSize, 0);
            break;
    }
}

function checkCollision(fruit) {
    const head = snake.body[0];
    return head.x === fruit.position.x && head.y === fruit.position.y;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    snake.update();
    snake.draw();

    fruits.forEach((fruit, index) => {
        fruit.draw();
        if (checkCollision(fruit)) {
            snake.eat();
            fruits.splice(index, 1);
            fruits.push(new Fruit());

            // Aumentar la velocidad al comer
            speed = Math.max(50, speed - 10); // Asegura que la velocidad no sea menor a 50 ms
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, speed);
        }
    });
}

function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

function resetGame() {
    speed = 150; // Restablecer la velocidad al inicio
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('scoreDisplay').style.display = 'none'; // Ocultar puntaje
    canvas.style.display = 'none';
    isGameActive = false;
}

function recordScore() {
    if (playerName) {
        const existingRecord = scoreRecords.find(record => record.name === playerName);
        if (existingRecord) {
            if (score > existingRecord.score) {
                existingRecord.score = score; // Actualiza si es un nuevo récord
            }
        } else {
            scoreRecords.push({ name: playerName, score }); // Agrega nuevo récord
        }
        updateScoreTable();
    }
}

function updateScoreTable() {
    scoreRecords.sort((a, b) => b.score - a.score); // Ordenar de mayor a menor
    const scoreBody = document.getElementById('scoreBody');
    scoreBody.innerHTML = ''; // Limpiar tabla existente

    scoreRecords.forEach(record => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        const scoreCell = document.createElement('td');
        nameCell.textContent = record.name;
        scoreCell.textContent = record.score;
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        scoreBody.appendChild(row);
    });
}

function displayScore() {
    document.getElementById('scoreDisplay').textContent = `Puntos: ${score}`;
}

function animateScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.classList.add('animate');
    setTimeout(() => {
        scoreDisplay.classList.remove('animate');
    }, 1000);
}

// Evento para iniciar el juego
document.getElementById('startGame').addEventListener('click', () => {
    playerName = document.getElementById('playerName').value.trim();
    if (playerName) {
        numFruits = parseInt(document.getElementById('numFruits').value);
        initGame();
    } else {
        alert("Por favor, ingresa tu nombre.");
    }
});
