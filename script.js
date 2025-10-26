// Dino Sura - simple endless runner
// Place script.js in same folder as index.html and style.css
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const overlay = document.getElementById('overlay');
  const ovScore = document.getElementById('ov-score');
  const ovBest = document.getElementById('ov-best');
  const restartBtn = document.getElementById('restart');
  const muteBtn = document.getElementById('mute');

  // ASSETS (use local files in assets/ or CDN links)
  const ASSETS = {
    dino: 'assets/sura-run.png',       // sprite strip or single frame
    ground: 'assets/ground.png',
    cactus: 'assets/cactus.png',
    bg: 'assets/palm.png',
    jumpSfx: null,
    hitSfx: null
  };

  // Game sizing
  const W = canvas.width = 900;
  const H = canvas.height = 300;

  // Player
  const player = {
    x: 60,
    y: H - 70,
    w: 48,
    h: 48,
    dy: 0,
    gravity: 0.6,
    jumpPower: -11,
    grounded: true,
    sprite: new Image()
  };
  player.sprite.src = ASSETS.dino;

  // Obstacles
  const obstacles = [];
  let spawnTimer = 0;
  let spawnInterval = 90; // frames
  let speed = 5; // base scroll speed
  let speedIncreaseEvery = 600; // frames
  let frameCount = 0;

  // Score and state
  let score = 0;
  let best = Number(localStorage.getItem('dino_sura_best') || 0);
  let running = true;
  let muted = false;

  function resetGame() {
    obstacles.length = 0;
    player.y = H - 70;
    player.dy = 0;
    player.grounded = true;
    spawnTimer = 0;
    score = 0;
    speed = 5;
    frameCount = 0;
    running = true;
    overlay.classList.add('hidden');
    requestAnimationFrame(loop);
  }

  function spawn() {
    // random size cactus/rock
    const h = 30 + Math.round(Math.random()*30);
    obstacles.push({
      x: W + 30,
      y: H - 50 - (h-30),
      w: 28 + Math.round(Math.random()*20),
      h: h,
      passed: false
    });
  }

  function update() {
    frameCount++;
    // difficulty ramp
    if(frameCount % speedIncreaseEvery === 0) speed += 0.5;

    // spawn control
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
      spawn();
      spawnTimer = 0;
      // slightly vary spawn interval
      spawnInterval = 80 + Math.floor(Math.random()*50);
    }

    // apply physics
    player.dy += player.gravity;
    player.y += player.dy;
    if (player.y + player.h >= H - 20) {
      player.y = H - 20 - player.h;
      player.dy = 0;
      player.grounded = true;
    } else {
      player.grounded = false;
    }

    // move obstacles
    for (let i = obstacles.length-1; i >= 0; i--) {
      const ob = obstacles[i];
      ob.x -= speed;
      // scoring
      if (!ob.passed && ob.x + ob.w < player.x) {
        score++;
        ob.passed = true;
      }
      // remove offscreen
      if (ob.x + ob.w < -50) obstacles.splice(i,1);
      // collision
      if (rectIntersect(player, ob)) {
        running = false;
        gameOver();
      }
    }
  }

  function draw() {
    // clear
    ctx.clearRect(0,0,W,H);

    // background: simple green hills & palms
    ctx.fillStyle = '#c7f9cc';
    ctx.fillRect(0,0,W,H);
    // ground
    ctx.fillStyle = '#6aa84f';
    ctx.fillRect(0,H-20,W,20);

    // draw obstacles
    ctx.fillStyle = '#4b5320';
    for (const ob of obstacles) {
      // simple cactus drawing
      ctx.fillStyle = '#2f6f2f';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      ctx.fillStyle = '#1e4d1e';
      ctx.fillRect(ob.x+2, ob.y + ob.h - 6, ob.w-4, 4);
    }

    // draw player (if sprite loaded use it, else rectangle)
    if (player.sprite.complete && player.sprite.naturalWidth) {
      ctx.drawImage(player.sprite, player.x, player.y, player.w, player.h);
    } else {
      ctx.fillStyle = '#ff8a00';
      ctx.fillRect(player.x, player.y, player.w, player.h);
    }

    // HUD
    scoreEl.textContent = score;
  }

  function loop() {
    if (!running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function rectIntersect(a,b){
    return !( a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h );
  }

  function jump(){
    if (!running) return;
    if (player.grounded) {
      player.dy = player.jumpPower;
      player.grounded = false;
    }
  }

  function gameOver(){
    overlay.classList.remove('hidden');
    document.getElementById('ov-score').textContent = score;
    best = Math.max(best, score);
    localStorage.setItem('dino_sura_best', best);
    document.getElementById('ov-best').textContent = best;
    // stop running flag
    running = false;
  }

  // Input
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (!running) resetGame(); else jump();
      e.preventDefault();
    }
  });
  canvas.addEventListener('click', () => {
    if (!running) resetGame(); else jump();
  });

  // Buttons
  restartBtn.addEventListener('click', resetGame);
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // start
  resetGame();
})();
