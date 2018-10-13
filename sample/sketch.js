let mouse;
let stati;
let rope;

function setup() {
  createCanvas(400, 400);

  mouse = new Genius.GObject({
    x: 23,
    y: 70,
    rx: 5,
    ry: 15,
    vx: 3,
    vy: 0,
    shape: 'rect',
    strict: true,
    gravity: true,
    rotation: PI / 2,
    vrotation: 3,
    color: [Math.random() * 255, Math.random() * 255, Math.random() * 255],
  });

  // stati = new Genius.GObject({
  //   x: 200,
  //   y: 200,
  //   rx: 20,
  //   ry: 10,
  // });
  //
  // rope = new Genius.Joint(stati, mouse, {
  //   rotation: -TAU,
  //   rotate: 0.01,
  //   distance: 120,
  //   velocity: 0.01,
  // });

  // noLoop();
}


function draw() {
  background(211);


  // mouse.ax += random(-10, 10);
  // mouse.ay += random(-10, 10);


  mouse.show();
  // stati.show();
  // rope.show();
  //
  // // stati.loop();
  // rope.loop();
  mouse.loop();

  if(frameCount === 550) {
    noLoop();
  }
}
