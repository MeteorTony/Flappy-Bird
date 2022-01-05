import {frames} from "./main.js";

export const canvas = document.getElementById("bird");
export const context = canvas.getContext("2d");

const DEGREE = Math.PI / 180; // radian (for rotation)

// load image
const sprite = new Image();
sprite.src = "image/sprite.png";

// load sounds
const scoreSound = new Audio();
scoreSound.src = "audio/audio_sfx_point.wav";

const flapSound = new Audio();
flapSound.src = "audio/audio_sfx_flap.wav";

const hitSound = new Audio();
hitSound.src = "audio/audio_sfx_hit.wav";

const swooshingSound = new Audio();
swooshingSound.src = "audio/audio_sfx_swooshing.wav";

const dieSound = new Audio();
dieSound.src = "audio/audio_sfx_die.wav";

// game state
const state = {
  current: 0,
  getReady: 0,
  playing: 1,
  gameOver: 2,
};

// start button position
const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
};

// game controller using game state
canvas.addEventListener("click", e => {
  switch (state.current) {
    case state.getReady:
      state.current = state.playing;
      swooshingSound.play();
      break;
    case state.playing:
      if (bird.y - bird.radius <= 0) return;
      bird.flap();
      flapSound.play();
      break;
    case state.gameOver:
      let rect = canvas.getBoundingClientRect();
      let clickX = e.clientX - rect.left; // prevent scrollding down position change
      let clickY = e.clientY - rect.top;

      // check if start button is clicked
      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        pipes.reset();
        bird.speedReset();
        score.reset();
        state.current = state.getReady;
      }
      break;
  }
});

// background image(i.e. buildings & cloud)
export const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  x: 0,
  y: canvas.height - 226,

  draw: function () {
    context.drawImage(
      sprite,
      this.sX, // following 4: x, y, width, height of source
      this.sY,
      this.w,
      this.h,
      this.x, // following 4: x, y, width, height of destination
      this.y,
      this.w,
      this.h
    );
    context.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    ); // fit image horizontally
  },
};

// foreground image (i.e. yellow ground)
export const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: canvas.height - 112,

  dx: 2, // game moving speed(to left)

  draw: function () {
    context.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    context.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },

  update: function () {
    if (state.current == state.playing) {
      this.x = (this.x - this.dx) % (this.w / 2); // keep moving fg to left (this.x = -2, -4, -6 ..., -110, 0 ...)
    }
  },
};

export const bird = {
  // flapping animation
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 }, // repeat on purpose -> can go top-down to do animation effect
  ],
  x: 50,
  y: 150, // y: center of bird image
  w: 34,
  h: 26,

  radius: 12,

  frame: 0,

  gravity: 0.25,
  jump: 4.6,
  speed: 0,
  rotation: 0,

  draw: function () {
    let bird = this.animation[this.frame];

    context.save(); // save old state of canvas
    context.translate(this.x, this.y); // tranlate origin (top left corner) to center of bird for rotation
    context.rotate(this.rotation);
    context.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2, // originally this.x - this.w / 2, but now origin is translated to this.x
      -this.h / 2, // same apply to this.y
      this.w,
      this.h
    );

    context.restore(); // get back to old state
  },

  flap: function () {
    this.speed = -this.jump;
  },

  update: function () {
    this.period = state.current == state.getReady ? 10 : 5; // slower animation if haven't start the game
    this.frame += frames % this.period == 0 ? 1 : 0; // for each period -> increment frame by 1
    this.frame = this.frame % this.animation.length; // range of frame: 0 - 3

    if (state.current == state.getReady) {
      this.y = 150; // reset position to default position
      this.rotation = 0 * DEGREE;
    } else {
      // falling
      this.speed += this.gravity;
      this.y += this.speed;

      // collision detection
      if (this.y + this.h / 2 >= canvas.height - fg.h) {
        // check if lower part of bird touches ground (fg)
        this.y = canvas.height - fg.h - this.h / 2;
        if (state.current == state.playing) {
          state.current = state.gameOver;
          dieSound.play();
        }
      }

      // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE; // falling -> rotate clockwise
        this.frame = 1; // stop flapping
      } else {
        this.rotation = -25 * DEGREE; // flapping -> rotate anti-clockwise
      }
    }
  },
  speedReset: function () {
    this.speed = 0;
  },
};

// get ready message
export const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: canvas.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    if (state.current == state.getReady) {
      context.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

// game over message
export const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: canvas.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    if (state.current == state.gameOver) {
      context.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

// pipes images
const pipes = {
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },

  w: 53,
  h: 400,
  gap: 85,
  maxYPos: -150,
  dx: 2,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      // top pipe
      context.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );

      // bottom pipe
      context.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  },

  update: function () {
    console.log(state.current);
    if (state.current !== state.playing) return;
    console.log(frames);
    if (frames % 100 == 0) {
      console.log("hi")
      // every 100 frames
      this.position.push({
        x: canvas.width,
        y: this.maxYPos * (Math.random() + 1), // range: -150 - -300
      });
      console.log(this.position);
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let bottomPipeYPos = p.y + this.h + this.gap;

      // collision detection
      // top pipe
      if (
        bird.x + bird.radius > p.x && // if any part of bird is in(touches) pipe
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.gameOver;
        hitSound.play();
      }
      // bottom pipe
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.gameOver;
        hitSound.play();
      }

      p.x -= this.dx; // move pipes leftwards

      // delete from array if pipes go beyond canvas
      if (p.x + this.w <= 0) {
        this.position.shift();

        // update score
        score.value += 1;
        scoreSound.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
      }
    }
  },

  reset: function () {
    this.position = [];
  },
};

const score = {
  best: parseInt(localStorage.getItem("best")) || 0,
  value: 0,

  draw: function () {
    context.fillStyle = "#FFF";
    context.strokeStyle = "#000";

    if (state.current == state.playing) {
      // only show current score
      context.lineWidth = 2;
      context.font = "35px Teko";
      context.fillText(this.value, canvas.width / 2, 50);
      context.strokeText(this.value, canvas.width / 2, 50); // outline
    } else if (state.current == state.gameOver) {
      // show current score + best score
      // SCORE VALUE
      context.font = "25px Teko";
      context.fillText(this.value, 225, 186);
      context.strokeText(this.value, 225, 186);
      // BEST SCORE
      context.fillText(this.best, 225, 228);
      context.strokeText(this.best, 225, 228);
    }
  },

  reset: function () {
    this.value = 0;
  },
};

export function update() {
  bird.update();
  fg.update();
  pipes.update();
}

export function draw() {
  context.fillStyle = "#70c5ce"; // sky color
  context.fillRect(0, 0, canvas.width, canvas.height);

  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}
