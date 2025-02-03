let cols = 4;
let rows = 4;
let gridWidth = 600;
let gridHeight = 600;
let w, h;
let gridOffsetX, gridOffsetY;

let soundMap = {};
let animationFrames = {};
let isPlaying = {};
let frameIndex = {};
let frameTimer = {};
let frameDuration = 2;

let mosaicSquaresA = [];
let mosaicSquaresD = [];

const fixedW = 50;
const fixedH = 50;

let soundFiles = [
  "Go.wav", "Atmo_Shot_1.wav", "Atmo_Shot_2.wav", "Fizz.wav",
  "DeDen.wav", "Finger_Snap.wav", "Foley_Glass_1.wav", "Foley_Glass_2.wav",
  "Foley_Switch.wav", "Foley_Sword.wav", "HNS_Kick.wav", "HNS_Snare.wav",
  "Laser_Shot.wav", "Toms_1.wav", "Toms_2.wav", "Toms_3.wav"
];

let snakeA, snakeD, fencePlayer, explosionPlayer;

function preload() {
  w = gridWidth / cols;
  h = gridHeight / rows;

  for (let i = 0; i < soundFiles.length; i++) {
    let x = i % cols;
    let y = Math.floor(i / cols);
    let key = `${x},${y}`;
    soundMap[key] = new SimplePlayer(`audio/${soundFiles[i]}`);
    soundMap[key].toDestination();
    isPlaying[key] = false;
    frameIndex[key] = 0;
    frameTimer[key] = 0;
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let key = `${i},${j}`;
      animationFrames[key] = [];
      for (let k = 0; k < 4; k++) {
        animationFrames[key].push(loadImage(`visuals/${j}${i}_000${k}.png`));
      }
    }
  }
  
  snakeA = new SimplePlayer('audio/8bit_1.wav');
  snakeA.toDestination();
  
  snakeD = new SimplePlayer('audio/8bit_2.wav');
  snakeD.toDestination();
  
  fencePlayer = new SimplePlayer('audio/Downlift.wav');
  fencePlayer.toDestination();
  
  explosionPlayer = new SimplePlayer('audio/Woo.wav');
  explosionPlayer.toDestination();
}

function setup() {
  createCanvas(1080, 1080);
  gridOffsetX = (width - gridWidth) / 2;
  gridOffsetY = (height - gridHeight) / 2;
}

function draw() {
  background(255);
  
  let progA = snakeA.progress();
  if (progA > 0) {
    push();
    fill(255, 0, 0);
    noStroke();
    let targetCountA = floor(map(progA, 0, 1, 0, 100));
    updateMosaic(mosaicSquaresA, targetCountA, fixedW, fixedH);
    drawMosaic(mosaicSquaresA);
    pop();
  }
  
  let progD = snakeD.progress();
  if (progD > 0) {
    push();
    fill(0, 0, 255);
    noStroke();
    let targetCountD = floor(map(progD, 0, 1, 0, 100));
    updateMosaic(mosaicSquaresD, targetCountD, fixedW, fixedH);
    drawMosaic(mosaicSquaresD);
    pop();
  }
  

  let progF = fencePlayer.progress() * 2;
  if (progF > 0 && progF < 2) {
    let postX1 = width * 0.3;
    let postX2 = width * 0.4;
    let postX3 = width * 0.5;
    let postX4 = width * 0.6;
    let postX5 = width * 0.7;
    let fenceBottom = progF * height;
    stroke(100);
    strokeCap(SQUARE);
    strokeWeight(50);
    line(postX1, 0, postX1, fenceBottom + 100);
    line(postX2, 0, postX2, fenceBottom + 150);
    line(postX3, 0, postX3, fenceBottom + 200);
    line(postX4, 0, postX4, fenceBottom + 150);
    line(postX5, 0, postX5, fenceBottom + 100);
  }
  
  let progE = explosionPlayer.progress();
  if (progE > 0 && progE < 1) {
    let explosionSize = map(progE, 0, 1, 0, 2000);
    stroke(0, 0, 0);
    strokeWeight(10);
    noFill()
    drawStar(random(0, width), random(0, height), explosionSize / 2, explosionSize, 5);
    strokeWeight(25);
    drawStar(width / 4, height / 4, explosionSize / 2, explosionSize, 8);
    strokeWeight(15);
    drawStar(width * 3 / 4, height * 3 / 4, explosionSize / 2, explosionSize, 8);
  }

  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = gridOffsetX + i * w;
      let y = gridOffsetY + j * h;
      let key = `${i},${j}`;
      
      stroke(200);
      strokeWeight(5);
      noFill();
      rect(x, y, w, h);
      
      if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        fill(200, 200, 200, 150);
        rect(x, y, w, h);
        if (!isPlaying[key]) {
          soundMap[key].start();
          isPlaying[key] = true;
          frameIndex[key] = 0;
          frameTimer[key] = 0;
        }
      } else {
        isPlaying[key] = false;
      }

      if (isPlaying[key] && frameIndex[key] < animationFrames[key].length) {
        image(animationFrames[key][frameIndex[key]], x, y, w, h);
        frameTimer[key]++;
        if (frameTimer[key] >= frameDuration) {
          frameTimer[key] = 0;
          frameIndex[key]++;
          if (frameIndex[key] >= animationFrames[key].length) {
            isPlaying[key] = false;
          }
        }
      }
    }
  }
}

function keyTyped() {
  let k = key.toLowerCase();
  if (k === 'a') {
    mosaicSquaresA = [];
    snakeA.start();
  } else if (k === 'd') {
    mosaicSquaresD = [];
    snakeD.start();
  } else if (k === 's') {
    fencePlayer.start();
  } else if (k === 'w') {
    explosionPlayer.start();
  }
}

function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

class SimplePlayer extends Tone.Player {
  constructor(...args) {
    super(...args);
    this._playbackRate = 1;
  }
  
  start(...args) {
    this.startTime = args[0] || Tone.now();
    super.start(...args);
  }
  
  get duration() {
    return this._buffer ? this._buffer.duration : 0;
  }
  
  currentTime() {
    return Tone.now() - this.startTime;
  }
  
  progress() {
    if (this.state === "started") {
      return this.currentTime() / this.duration;
    } else {
      return 0;
    }
  }
  
  set playbackRate(rate) {
    if (rate !== 1)
      throw new Error("Setting playbackRate to a value other than 1 is disabled in SimplePlayer.");
    this._playbackRate = 1;
  }
  
  get playbackRate() {
    return this._playbackRate;
  }
}

function updateMosaic(mosaicArray, targetCount, fixedW, fixedH) {
  while (mosaicArray.length < targetCount) {
    mosaicArray.push({
      x: random(0, width),
      y: random(0, height),
      w: fixedW,
      h: fixedH
    });
  }
}

function drawMosaic(mosaicArray) {
  for (let square of mosaicArray) {
    rect(square.x, square.y, square.w, square.h);
  }
}