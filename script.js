const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let dino = { x: 50, y: 200, width: 50, height: 50, dy: 0, gravity: 0.5, jumpPower: -10, grounded: true };
let obstacles = [];
let frame = 0;
let gameOver = false;
let score = 0;

function drawDino() {
  ctx.fillStyle = "#00b300";
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function drawObstacle(obs) {
  ctx.fillStyle = "#444";
  ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
}

function drawScore() {
  ctx.fillStyle = "#222";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 650, 30);
}

function update() {
  if (gameOver) return;

  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#666";
  ctx.fillRect(0, 250, canvas.width, 50);

  // Jump Physics
  dino.y += dino.dy;
  dino.dy += dino.gravity;

  if (dino.y > 200) {
    dino.y = 200;
    dino.dy = 0;
    dino.grounded = true;
  }

  // Spawn obstacles
  if (frame % 90 === 0) {
    obstacles.push({ x: canvas.width, y: 220, width: 30, height: 30 });
  }

  // Move & draw obstacles
  obstacles.forEach((obs, index) => {
    obs.x -= 5;
    drawObstacle(obs);

    // Collision check
    if (
      dino.x < obs.x + obs.width &&
      dino.x + dino.width > obs.x &&
      dino.y + dino.height > obs.y
    ) {
      gameOver = true;
    }

    // Remove off-screen
    if (obs.x + obs.width < 0) obstacles.splice(index, 1);
  });

  drawDino();
  drawScore();

  // Increase score
  if (frame % 5 === 0) score++;

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "30px Arial";
    ctx.fillText("Game Over!", 320, 150);
    ctx.font = "20px Arial";
    ctx.fillText("Press SPACE or Click to Restart", 270, 180);
  } else {
    requestAnimationFrame(update);
  }
}

function jump() {
  if (dino.grounded && !gameOver) {
    dino.dy = dino.jumpPower;
    dino.grounded = false;
  } else if (gameOver) {
    resetGame();
  }
}

function resetGame() {
  obstacles = [];
  frame = 0;
  gameOver = false;
  score = 0;
  dino.y = 200;
  update();
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});
canvas.addEventListener("click", jump);

update();
