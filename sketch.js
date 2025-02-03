let cols = 4;
let rows = 4;
let w, h;

let soundMap = {};
let animationFrames = {};
let isPlaying = {};
let frameIndex = {};
let frameTimer = {};
let frameDuration = 2;

let soundFiles = [
  "Go.wav", "Atmo_Shot_1.wav", "Atmo_Shot_2.wav", "Fizz.wav", "DeDen.wav", "Finger_Snap.wav", "Foley_Glass_1.wav", "Foley_Glass_2.wav", "Foley_Switch.wav", "Foley_Sword.wav", "HNS_Kick.wav", "HNS_Snare.wav", "Laser_Shot.wav", "Toms_1.wav", "Toms_2.wav", "Toms_3.wav"
];

function preload() {
  w = 400 / cols;
  h = 400 / rows;

  for (let i = 0; i < soundFiles.length; i++) {
    let x = i % cols;
    let y = Math.floor(i / cols);
    let key = `${x},${y}`;
    soundMap[key] = loadSound(`audio/${soundFiles[i]}`);
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
}

function setup() {
  createCanvas(1080, 1440);
}

function draw() {
  background(255);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * w;
      let y = j * h;
      let key = `${i},${j}`;

      stroke(200);
      strokeWeight(5);
      noFill();
      rect(x, y, w, h);

      if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        //fill(200, 100, 100, 150);
        rect(x, y, w, h);

        if (!isPlaying[key]) {
          soundMap[key].play();
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
