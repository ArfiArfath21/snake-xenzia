// Game variables
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const hideDiv = document.getElementById('hide-in-game');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const foodSound = document.getElementById('food-sound');

// Modal elements
const infoToggle = document.getElementById('info-toggle');
const instructionsModal = document.getElementById('instructions-modal');
const closeModal = document.querySelector('.close-modal');

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
    hideDiv.style.display = 'none';
    
    // Reinitialize joystick to make sure it's properly centered
    if (window.matchMedia('(max-width: 768px)').matches || 
        window.matchMedia('(pointer: coarse)').matches) {
        setTimeout(initJoystick, 100); // Short delay to ensure DOM is updated
    }
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
        // Play pop sound when food is eaten
        playFoodSound();

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

// Function to play the food sound
function playFoodSound() {
    // Reset the audio to start from the beginning
    foodSound.currentTime = 0;

    // Play the sound
    foodSound.play().catch(e => {
        // Handle any errors (like autoplay restrictions)
        console.log('Error playing sound:', e);
    });
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
    hideDiv.style.display = 'block';
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

// =============== Modal Controls ================
// Show instructions modal when info icon is clicked
infoToggle.addEventListener('click', function() {
    instructionsModal.style.display = 'block';
});

// Close modal when X is clicked
closeModal.addEventListener('click', function() {
    instructionsModal.style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    if (event.target === instructionsModal) {
        instructionsModal.style.display = 'none';
    }
});

// =============== Joystick Code ================
const joystickThumb = document.getElementById('joystick-thumb');
const joystickBase = document.getElementById('joystick-base');
const joystickContainer = document.getElementById('joystick-container');

// Joystick state variables
let joystickActive = false;
let joystickCenterX = 0;
let joystickCenterY = 0;
let joystickCurrentX = 0;
let joystickCurrentY = 0;
let lastJoystickDirection = '';
let joystickUpdateInterval;

// Initialize joystick positions
function initJoystick() {
    // Make sure the joystick container is visible for correct measurements
    const isMobile = window.matchMedia('(max-width: 768px)').matches || 
                    window.matchMedia('(pointer: coarse)').matches;
    
    if (isMobile) {
        joystickContainer.style.display = 'block';
    }
    
    // Get the position of the joystick base
    const baseRect = joystickBase.getBoundingClientRect();
    joystickCenterX = baseRect.left + baseRect.width / 2;
    joystickCenterY = baseRect.top + baseRect.height / 2;
    
    // Center the thumb initially
    joystickThumb.style.left = '50%';
    joystickThumb.style.top = '50%';
    
    // Reset current position to center
    joystickCurrentX = joystickCenterX;
    joystickCurrentY = joystickCenterY;
}

// Update the joystick thumb position
function updateJoystickThumbPosition(x, y) {
    const baseRect = joystickBase.getBoundingClientRect();
    const radius = baseRect.width / 2;
    
    // Calculate distance from center
    const deltaX = x - joystickCenterX;
    const deltaY = y - joystickCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If the thumb is dragged beyond the base radius, limit it to the edge
    if (distance > radius) {
        const angle = Math.atan2(deltaY, deltaX);
        x = joystickCenterX + Math.cos(angle) * radius;
        y = joystickCenterY + Math.sin(angle) * radius;
    }
    
    // Calculate position relative to base center
    const relativeX = ((x - joystickCenterX) / radius * 50) + 50;
    const relativeY = ((y - joystickCenterY) / radius * 50) + 50;
    
    // Apply position in percentage relative to the base center
    joystickThumb.style.left = `${relativeX}%`;
    joystickThumb.style.top = `${relativeY}%`;
    
    // Store current position
    joystickCurrentX = x;
    joystickCurrentY = y;
}

// Update game direction based on joystick position
function updateDirectionFromJoystick() {
    if (!joystickActive || !gameRunning) return;
    
    const deltaX = joystickCurrentX - joystickCenterX;
    const deltaY = joystickCurrentY - joystickCenterY;
    
    // Only change direction if joystick is moved significantly
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const threshold = 10; // Minimum distance to consider a direction change
    
    if (distance < threshold) return;
    
    // Determine the dominant axis
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal movement is dominant
        if (deltaX > 0 && direction !== 'left') {
            nextDirection = 'right';
        } else if (deltaX < 0 && direction !== 'right') {
            nextDirection = 'left';
        }
    } else {
        // Vertical movement is dominant
        if (deltaY > 0 && direction !== 'up') {
            nextDirection = 'down';
        } else if (deltaY < 0 && direction !== 'down') {
            nextDirection = 'up';
        }
    }
}

// Reset the joystick to center position
function resetJoystick() {
    joystickThumb.style.left = '50%';
    joystickThumb.style.top = '50%';
    joystickCurrentX = joystickCenterX;
    joystickCurrentY = joystickCenterY;
}

// Event listeners for joystick
joystickBase.addEventListener('touchstart', function(e) {
    joystickActive = true;
    updateJoystickThumbPosition(e.touches[0].clientX, e.touches[0].clientY);
    
    // Start updating direction at a regular interval
    if (!joystickUpdateInterval) {
        joystickUpdateInterval = setInterval(updateDirectionFromJoystick, 100);
    }
    
    e.preventDefault();
}, { passive: false });

joystickBase.addEventListener('touchmove', function(e) {
    if (joystickActive) {
        updateJoystickThumbPosition(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    }
}, { passive: false });

function endJoystickMovement() {
    joystickActive = false;
    
    // Reset thumb position to center
    resetJoystick();
    
    // Stop the direction update interval
    if (joystickUpdateInterval) {
        clearInterval(joystickUpdateInterval);
        joystickUpdateInterval = null;
    }
}

joystickBase.addEventListener('touchend', function(e) {
    endJoystickMovement();
    e.preventDefault();
}, { passive: false });

joystickBase.addEventListener('touchcancel', function(e) {
    endJoystickMovement();
    e.preventDefault();
}, { passive: false });

// Also add support for mouse control on desktop for testing
joystickBase.addEventListener('mousedown', function(e) {
    joystickActive = true;
    updateJoystickThumbPosition(e.clientX, e.clientY);
    
    // Start updating direction
    if (!joystickUpdateInterval) {
        joystickUpdateInterval = setInterval(updateDirectionFromJoystick, 100);
    }
});

document.addEventListener('mousemove', function(e) {
    if (joystickActive) {
        updateJoystickThumbPosition(e.clientX, e.clientY);
    }
});

document.addEventListener('mouseup', function() {
    if (joystickActive) {
        endJoystickMovement();
    }
});

// Initialize joystick on window load
window.addEventListener('load', function() {
    // Check if it's a mobile device
    if (window.matchMedia('(max-width: 768px)').matches || 
        window.matchMedia('(pointer: coarse)').matches) {
        // Wait a short moment for layout to complete
        setTimeout(initJoystick, 200);
    }
});

// Handle window resize to reposition joystick
window.addEventListener('resize', function() {
    if (window.matchMedia('(max-width: 768px)').matches || 
        window.matchMedia('(pointer: coarse)').matches) {
        initJoystick();
    }
});

// Start game on button click
startButton.addEventListener('click', initGame);

// Restart game
restartButton.addEventListener('click', initGame);

// Initial draw
drawGame();