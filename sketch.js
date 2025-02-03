let sound;
let frames = [];
let isPlaying = false;
let showGif = false;
let frameIndex = 0;
let frameTimer = 0;
let frameDuration = 3; // 控制动画速度

let cols = 4;
let rows = 4;
let w, h;

function preload() {
  sound = loadSound("audio/Atmo_Shot_1.wav");

  // 预加载 4 帧 PNG
  for (let i = 0; i < 4; i++) {
    frames.push(loadImage(`visuals/11_000${i}.png`));
  }
}

function setup() {
  createCanvas(400, 400);
  w = width / cols; // 计算单个 block 宽度
  h = height / rows; // 计算单个 block 高度
}

function draw() {
  background(220);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * w;
      let y = j * h;

      stroke(0);
      noFill();
      rect(x, y, w, h);

      if (i === 1 && j === 1 && mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
        fill(200, 100, 100, 150);
        rect(x, y, w, h);

        if (!isPlaying) {
          sound.play();
          isPlaying = true;
          showGif = true;
          frameIndex = 0;
          frameTimer = 0;
        }
      }
    }
  }

  if (showGif) {
    let gifX = w * 1;
    let gifY = h * 1;

    image(frames[frameIndex], gifX, gifY, w, h);

    frameTimer++;
    if (frameTimer >= frameDuration) {
      frameTimer = 0;
      frameIndex++;

      if (frameIndex >= frames.length) {
        showGif = false;
      }
    }
  }

  // 监听鼠标是否离开整个 canvas
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    isPlaying = false;
  }
}
