let started = false;

let palettes = [
  ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'],
  ['#0a0908', '#22333b', '#eae0d5', '#c6ac8f', '#5e503f'],
  ['#668586', '#82aeb1', '#93c6d6', '#a7acd9', '#9e8fb2'],
  ['#541388', '#d90368', '#f1e9da', '#2e294e', '#ffd400']
];
let currentPaletteIndex = 0;

let paletteSwitchSounds = [];

let globalAnalyzer;

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
let frameDuration = 3;

let mosaicSquaresA = [];
let mosaicSquaresD = [];

const fixedW = 10;
const fixedH = 10;

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

  paletteSwitchSounds[0] = new SimplePlayer('audio/Fancy_Perc.wav');
  paletteSwitchSounds[0].toDestination();
  
  paletteSwitchSounds[1] = new SimplePlayer('audio/Foley_Wooden.wav');
  paletteSwitchSounds[1].toDestination();
  
  paletteSwitchSounds[2] = new SimplePlayer('audio/Hollow_Impact.wav');
  paletteSwitchSounds[2].toDestination();
  
  paletteSwitchSounds[3] = new SimplePlayer('audio/Synth_Up.wav');
  paletteSwitchSounds[3].toDestination();
  
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
  createCanvas(windowWidth, windowHeight);
  gridOffsetX = (width - gridWidth) / 2;
  gridOffsetY = (height - gridHeight) / 2;
  globalAnalyzer = new Tone.Waveform(32);
  Tone.Destination.connect(globalAnalyzer);

  const overlay = document.getElementById("overlay");
  const startButton = document.getElementById("startButton");

  startButton.addEventListener("click", function() {
    Tone.start();
    started = true;
    overlay.style.display = "none";
  });
}

function draw() {
  background(palettes[currentPaletteIndex][0]);
  if (!started) return;

  let waveform = globalAnalyzer.getValue();

  let sum = 0;
  for (let i = 0; i < waveform.length; i++) {
    sum += abs(waveform[i]);
  }
  let avgAmp = sum / waveform.length;
  
  if (avgAmp > 0.05) {
    fill((palettes[currentPaletteIndex][4]));
    noStroke();
    let scaleFactor = 250;
    
    beginShape();
    vertex(0, height);
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length - 1, 0, width);
      let y = height - waveform[i] * scaleFactor;
      vertex(x, y);
    }
    vertex(width, height);
    endShape(CLOSE);

    beginShape();
    vertex(0, 0);
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length - 1, 0, width);
      let y = 0 - waveform[i] * scaleFactor;
      vertex(x, y);
    }
    vertex(width, 0);
    endShape(CLOSE);
  }
  
  let progA = snakeA.progress();
  if (progA > 0) {
    push();
    
    noStroke();
    let targetCountA = floor(map(progA, 0, 1, 0, 500));
    updateMosaic(mosaicSquaresA, targetCountA, fixedW, fixedH);
    drawMosaic(mosaicSquaresA);
    pop();
  }
  
  let progD = snakeD.progress();
  if (progD > 0) {
    push();
    noStroke();
    let targetCountD = floor(map(progD, 0, 1, 0, 500));
    updateMosaic(mosaicSquaresD, targetCountD, fixedW, fixedH);
    drawMosaic(mosaicSquaresD);
    pop();
  }
  

  // let progF = fencePlayer.progress();
  // if (progF > 0 && progF < 1) {
  //   let postX1 = width * 0.3;
  //   let postX2 = width * 0.4;
  //   let postX3 = width * 0.5;
  //   let postX4 = width * 0.6;
  //   let postX5 = width * 0.7;
  //   let fenceBottom = progF * height;
  //   strokeCap(SQUARE);
  //   strokeWeight(50);
  //   line(postX1, 200, postX1, fenceBottom);
  //   line(postX2, 200, postX2, fenceBottom);
  //   line(postX3, 200, postX3, fenceBottom);
  //   line(postX4, 200, postX4, fenceBottom);
  //   line(postX5, 200, postX5, fenceBottom);
  // }

  let progF = constrain(fencePlayer.progress() * 2, 0, 1);

  if (progF > 0.2 && progF <= 0.7) {
    let postX = [0.3, 0.4, 0.5, 0.6, 0.7].map(x => width * x);

    let fenceTop = 200;
    let fenceBottom = map(progF, 0.2, 0.7, fenceTop, height - 200);

    strokeCap(SQUARE);
    let weight = width / 15;
    strokeWeight(weight);
    stroke(color(palettes[currentPaletteIndex][3]));
    for (let x of postX) {
      line(x, fenceTop, x, fenceBottom);
    }
  }
  
  let progE = explosionPlayer.progress();
  if (progE > 0 && progE < 1) {
    let explosionSize = map(progE, 0, 1, 0, 2000);
    let index = floor(random(0, palettes[currentPaletteIndex].length));
    let randomStroke = palettes[currentPaletteIndex][index];
    stroke(0);
    strokeWeight(10);
    noFill()
    drawStar(random(0, width), random(0, height), explosionSize / 2, explosionSize, 5);
    stroke(randomStroke);
    strokeWeight(25);
    drawStar(width / 4, height / 4, explosionSize / 2, explosionSize, 8);
    stroke(randomStroke);
    strokeWeight(15);
    drawStar(width * 3 / 4, height * 3 / 4, explosionSize / 2, explosionSize, 8);
  }

  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = gridOffsetX + i * w;
      let y = gridOffsetY + j * h;
      let key = `${i},${j}`;
      
      stroke(palettes[currentPaletteIndex][1]);
      strokeWeight(5);
      noFill();
      rect(x, y, w, h);
      
      if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        fill(palettes[currentPaletteIndex][2]);
        rect(x, y, w, h);
        if (!isPlaying[key]) {
          soundMap[key].start();
          isPlaying[key] = true;
          frameIndex[key] = 0;
          frameTimer[key] = 0;
        }
      // } else {
      //   isPlaying[key] = false;
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
  } else if (key === ' ') {
    currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
    paletteSwitchSounds[currentPaletteIndex].start();
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

function updateMosaic(mosaicArray, targetCount, fixedW, fixedH) {
  while (mosaicArray.length < targetCount) {
    let index = floor(random(0, palettes[currentPaletteIndex].length));
    let mosaicColor = palettes[currentPaletteIndex][index];
    mosaicArray.push({
      x: random(0, width),
      y: random(0, height),
      w: fixedW,
      h: fixedH,
      col: mosaicColor
    });
  }
}

function drawMosaic(mosaicArray) {
  for (let square of mosaicArray) {
    fill(square.col);
    rect(square.x, square.y, square.w, square.h);
  }
}

// The GOATED class!!

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