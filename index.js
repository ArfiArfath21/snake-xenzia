// Game variables
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameRunning = false;
let gameSpeed = 120; // milliseconds - better starting speed
let gameLoop;

// Initialize game
function initGame() {
    // Reset game state
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    updateScore();

    // Generate initial food
    generateFood();

    // Hide game over screen
    gameOverElement.style.display = 'none';

    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, gameSpeed);
    gameRunning = true;

    // Hide start button
    startButton.style.display = 'none';
}

// Generate food at random position
function generateFood() {
    // Generate random position
    let foodX, foodY;
    let validPosition = false;

    while (!validPosition) {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);

        // Check if position is not occupied by snake
        validPosition = true;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                validPosition = false;
                break;
            }
        }
    }

    food = {x: foodX, y: foodY};
}

// Update game state
function updateGame() {
    // Move snake
    moveSnake();

    // Check collisions
    if (checkCollisions()) {
        gameOver();
        return;
    }

    // Check if food is eaten
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // Grow snake (don't remove tail)
        generateFood();
        score += 10;
        updateScore();

        // Very gradual speed increase with every food item
        if (gameSpeed > 60) {
            // Decrease by smaller amounts for a smoother progression
            gameSpeed -= 1;
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    } else {
        // Remove tail
        snake.pop();
    }

    // Draw game
    drawGame();
}

// Move snake based on direction
function moveSnake() {
    // Update direction
    direction = nextDirection;

    // Calculate new head position
    const head = {x: snake[0].x, y: snake[0].y};

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Handle wall teleportation
    if (head.x < 0) {
        head.x = tileCount - 1; // Teleport to right edge
    } else if (head.x >= tileCount) {
        head.x = 0; // Teleport to left edge
    }

    if (head.y < 0) {
        head.y = tileCount - 1; // Teleport to bottom edge
    } else if (head.y >= tileCount) {
        head.y = 0; // Teleport to top edge
    }

    // Add new head
    snake.unshift(head);
}

// Check for collisions with walls or self
function checkCollisions() {
    const head = snake[0];

    // Check wall collisions
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // Check self collisions (start from index 1 to ignore head)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        // Head is a different color
        if (i === 0) {
            ctx.fillStyle = '#2e8b57'; // Sea green for head
        } else {
            ctx.fillStyle = '#3cb371'; // Medium sea green for body
        }

        ctx.fillRect(
            snake[i].x * gridSize,
            snake[i].y * gridSize,
            gridSize,
            gridSize
        );

        // Draw border around segment
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(
            snake[i].x * gridSize,
            snake[i].y * gridSize,
            gridSize,
            gridSize
        );
    }

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Update score display
function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

// Game over
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    startButton.style.display = 'block';
}

// Handle keyboard input
document.addEventListener('keydown', function(event) {
    if (!gameRunning) return;

    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }

    // Prevent arrow keys from scrolling the page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
});

// Handle swipe controls for mobile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Setup touch event listeners
const gameContainer = document.getElementById('game-container');

gameContainer.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    e.preventDefault(); // Prevent default behavior like scrolling
}, { passive: false });

gameContainer.addEventListener('touchend', function(e) {
    if (!gameRunning) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    handleSwipe();
    e.preventDefault(); // Prevent default behavior
}, { passive: false });

function handleSwipe() {
    // Calculate horizontal and vertical distance
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine if the swipe was primarily horizontal or vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 30 && direction !== 'left') {
            nextDirection = 'right';
        } else if (deltaX < -30 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // Vertical swipe
        if (deltaY > 30 && direction !== 'up') {
            nextDirection = 'down';
        } else if (deltaY < -30 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
}

// Also add support for swipe detection on desktop for testing
gameContainer.addEventListener('mousedown', function(e) {
    touchStartX = e.clientX;
    touchStartY = e.clientY;
});

gameContainer.addEventListener('mouseup', function(e) {
    if (!gameRunning) return;

    touchEndX = e.clientX;
    touchEndY = e.clientY;

    // Calculate distance to determine if it's a click or drag
    const distance = Math.sqrt(
        Math.pow(touchEndX - touchStartX, 2) +
        Math.pow(touchEndY - touchStartY, 2)
    );

    // Only process as swipe if distance is significant
    if (distance > 20) {
        handleSwipe();
    }
});

// Start game on button click
startButton.addEventListener('click', initGame);

// Restart game
restartButton.addEventListener('click', initGame);

// Initial draw
drawGame();