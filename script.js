
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let paddle;
let ball;
let bricks;
let score = 0;
let lives = 3;
let gameOver = false;
let levelComplete = false;
let particles = [];
let hue = 0;
let level = 1;

// Paddle properties
const initialPaddleWidth = 150;
const paddleHeight = 20;
const paddleSpeed = 10;

// Ball properties
const ballRadius = 10;
let ballSpeedX = 3;
let ballSpeedY = -3;

// Brick properties
const brickRowCount = 6;
const brickColumnCount = 10;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 3;
const brickOffsetTop = 50;
const brickOffsetLeft = 15;

function init() {
    level = 1;
    score = 0;
    lives = 3;
    gameOver = false;
    levelComplete = false;
    setupLevel();
}

function setupLevel() {
    levelComplete = false;
    let paddleWidth = initialPaddleWidth - (level - 1) * 20;
    if (paddleWidth < 40) paddleWidth = 40; // Minimum paddle width

    paddle = {
        x: (canvas.width - paddleWidth) / 2,
        y: canvas.height - paddleHeight - 20,
        width: paddleWidth,
        height: paddleHeight,
        speed: 0
    };

    ball = {
        x: canvas.width / 2,
        y: canvas.height - 50,
        radius: ballRadius,
        dx: ballSpeedX + (level - 1) * 0.5, // Increase ball speed with level
        dy: ballSpeedY - (level - 1) * 0.5,
    };

    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r] = { x: brickX, y: brickY, status: 1, color: `hsl(${(r * 60 + level * 20) % 360}, 100%, 50%)` };
        }
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#00ffde';
    ctx.shadowColor = '#00ffde';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brick = bricks[c][r];
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brickWidth, brickHeight);
                ctx.fillStyle = brick.color;
                ctx.shadowColor = brick.color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.closePath();
                ctx.shadowBlur = 0;
            }
        }
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: Math.random() * 3 + 1,
            color: color
        });
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.95;
        if (p.size < 0.5) {
            particles.splice(i, 1);
        }
    }
}

function movePaddle() {
    paddle.x += paddle.speed;
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    if (ball.y + ball.radius > paddle.y && ball.y + ball.radius < paddle.y + paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
        let deltaX = ball.x - (paddle.x + paddle.width / 2);
        ball.dx = deltaX * 0.2;
    }

    if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameOver = true;
        } else {
            ball.x = canvas.width / 2;
            ball.y = paddle.y - ballRadius;
            ball.dx = ballSpeedX + (level - 1) * 0.5;
            ball.dy = -(ballSpeedY - (level - 1) * 0.5);
            paddle.x = (canvas.width - paddle.width) / 2;
        }
    }
}

function collisionDetection() {
    let bricksLeft = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                bricksLeft++;
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    createParticles(ball.x, ball.y, b.color);
                }
            }
        }
    }
    if (bricksLeft === 1) { // Last brick is broken
        levelComplete = true;
    }
}

function drawScore() {
    ctx.font = '24px Orbitron';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 30);
}

function drawLives() {
    ctx.font = '24px Orbitron';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.fillText('Lives: ' + lives, canvas.width - 10, 30);
}

function drawLevel() {
    ctx.font = '24px Orbitron';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Level: ' + level, canvas.width / 2, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '50px Orbitron';
    ctx.fillStyle = '#ff0055';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 20;
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
    ctx.shadowBlur = 0;
    ctx.font = '20px Orbitron';
    ctx.fillStyle = 'white';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 50);
}

function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '50px Orbitron';
    ctx.fillStyle = '#00ffde';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ffde';
    ctx.shadowBlur = 20;
    ctx.fillText(`LEVEL ${level} COMPLETE`, canvas.width / 2, canvas.height / 2 - 50);
    ctx.shadowBlur = 0;
    ctx.font = '20px Orbitron';
    ctx.fillStyle = 'white';
    ctx.fillText('Press Enter to Start Next Level', canvas.width / 2, canvas.height / 2 + 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hue++;

    if (gameOver) {
        drawGameOver();
        return;
    }
    if (levelComplete) {
        drawLevelComplete();
        return;
    }

    drawBricks();
    drawPaddle();
    drawBall();
    drawParticles();
    drawScore();
    drawLives();
    drawLevel();
}

function update() {
    if (gameOver || levelComplete) return;
    movePaddle();
    moveBall();
    collisionDetection();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        paddle.speed = paddleSpeed;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        paddle.speed = -paddleSpeed;
    } else if (e.key === 'Enter') {
        if (gameOver) {
            init();
        } else if (levelComplete) {
            level++;
            setupLevel();
        }
    }
}

function keyUpHandler(e) {
    if (
        e.key === 'Right' ||
        e.key === 'ArrowRight' ||
        e.key === 'Left' ||
        e.key === 'ArrowLeft' ||
        e.key.toLowerCase() === 'd' ||
        e.key.toLowerCase() === 'a'
    ) {
        paddle.speed = 0;
    }
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

init();
gameLoop();
