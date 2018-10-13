let drawingFunctions = {};

(function init() {
  let temp = setup;

  setup = function() {
    drawingFunctions.pop = pop;
    drawingFunctions.push = push;
    drawingFunctions.fill = fill;
    drawingFunctions.line = line;
    drawingFunctions.rect = rect;
    drawingFunctions.stroke = stroke;
    drawingFunctions.rotate = rotate;
    drawingFunctions.ellipse = ellipse;
    drawingFunctions.translate = translate;

    Object.defineProperty(_renderer, '_rectMode', {
      configurable: true,
      value: RADIUS
    })

    Object.defineProperty(_renderer, '_ellipseMode', {
      configurable: true,
      value: RADIUS
    })

    let temp2 = createCanvas;

    createCanvas = function(w, h) {
      Genius.constants.GameWidth = w;
      Genius.constants.GameHeight = h;
      temp2.apply(null, arguments);
    }

    console.clear();

    temp();

    setup = temp;
  }
})();



const Genius = {

  constants: {
    GameWidth: 600,
    GameHeight: 600,
    ObjectDefaultSize: 15,
    defaultShape: 'rect',
    gravity: 0.0,
    strict: true,
    checkCollision: false
  },

  GObject: class {

    constructor(config = {}) {

      if(typeof config !== 'object') {
        config = {};
      }

      this.x = typeof config.x === 'number' ? config.x : Math.random() * Genius.constants.GameWidth;
      this.y = typeof config.y === 'number' ? config.y : Math.random() * Genius.constants.GameHeight;

      this.vx = typeof config.vx === 'number' ? config.vx : 0;
      this.vy = typeof config.vy === 'number' ? config.vy : 0;

      this.ax = 0;
      this.ay = 0;

      this.rx = typeof config.rx === 'number' ? config.rx : Genius.constants.ObjectDefaultSize;
      this.ry = typeof config.ry === 'number' ? config.ry :
        (typeof config.rx === 'number' ? config.rx : Genius.constants.ObjectDefaultSize);

      this.rotation = typeof config.rotation === 'number' ? config.rotation : 0;
      this.vrotation = typeof config.vrotation === 'number' ? config.vrotation : 0;

      this.shape = typeof config.shape === 'string' ? config.shape : Genius.constants.defaultShape;

      this.enabled = true;
      this.gravity = typeof config.gravity === 'boolean' ?
        config.gravity : Genius.constants.gravity;

      this.constrain = typeof config.constrain === 'boolean' ?
        config.constrain : true;

      this.color = typeof config.color === 'object' ?
        config.color : [Math.random() * 255, Math.random() * 255, Math.random() * 255];

      config.strict = typeof config.strict === 'boolean' ? config.strict : Genius.constants.strict;

      if(this.shape !== 'rect' && this.shape !== 'ellipse') {
        throw new Error('Unknown shape: ' + shape);
      }

      if(config.strict) {
        delete config.x;
        delete config.y;

        delete config.vx;
        delete config.vy;

        delete config.rotation;
        delete config.vrotation;

        delete config.rx;
        delete config.ry;

        delete config.shape;

        delete config.strict;
        delete config.gravity;
        delete config.constrain;
        delete config.color;

        let param = Object.keys(config);

        if(param.length !== 0) {
          console.warn('Unknown parameters: ' + param.join(', '));
        }
      }

    }

    distance(ob) {
      return Math.sqrt((this.x - ob.x) ** 2 + (this.y - ob.y) ** 2);
    }

    collision(ob) {

      if(!(ob instanceof Genius.GObject)) {
        throw new Error(ob + ' is not a GObject');
      }

      if(this.shape === 'rect') {
        if(ob.shape === 'rect') {
          // rect & rect
          let fx = this.x - this.rx,
            fy = this.y - this.ry,
            fw = this.rx * 2,
            fh = this.ry * 2;

          let sx = ob.x - ob.rx,
            sy = ob.y - ob.ry,
            sw = ob.rx * 2,
            sh = ob.ry * 2;

          return fx <= sx + sw && fx + fw >= sx && fy <= sy + sh && fh + fy >= sy;
        } else
        if(ob.shape === 'ellipse') {
          // rect & ellipse
          let distance = {};

          distance.x = Math.abs(ob.x - this.x);
          distance.y = Math.abs(ob.y - this.y);

          if(distance.x > (this.rx + ob.rx)) {
            return false;
          }
          if(distance.y > (this.ry + ob.ry)) {
            return false;
          }

          if(distance.x <= (this.rx)) {
            return true;
          }
          if(distance.y <= (this.ry)) {
            return true;
          }

          let cornerDistance_sq = (distance.x - this.rx) ** 2 + (distance.y - this.ry) ** 2;

          return(cornerDistance_sq <= (ob.r ** 2));
        }

      } else

      if(this.shape === 'ellipse') {
        if(ob.shape === 'rect') {
          // ellipse & rect
          let distance = {};

          distance.x = Math.abs(ob.x - this.x);
          distance.y = Math.abs(ob.y - this.y);

          if(distance.x > (this.rx + ob.rx)) {
            return false;
          }
          if(distance.y > (this.ry + ob.ry)) {
            return false;
          }

          if(distance.x <= (ob.rx)) {
            return true;
          }
          if(distance.y <= (ob.ry)) {
            return true;
          }

          let cornerDistance_sq = (distance.x - ob.rx) ** 2 + (distance.y - ob.ry) ** 2;

          return(cornerDistance_sq <= (this.rx ** 2));
        } else
        if(ob.shape === 'ellipse') {
          // ellipse & ellipse
          // TODO:
        }
      }

    }

    show() {
      drawingFunctions.push();
      drawingFunctions.translate(this.x, this.y);
      drawingFunctions.rotate(this.rotation);
      drawingFunctions.fill.apply(null, this.color);

      drawingFunctions[this.shape](0, 0, this.rx, this.ry);

      drawingFunctions.pop();
    }


    loop() {
      this.x += this.vx;
      this.y += this.vy;

      this.vx = this.vy = 0;

      this.vx += this.ax;
      this.vy += this.ay;

      this.ax = 0;
      this.ay = 0;


      if(this.constrain) {
        this.x = Math.max(Math.min(this.x, Genius.constants.GameWidth), 0);
        this.y = Math.max(Math.min(this.y, Genius.constants.GameHeight), 0);
      }
    }

  },




  Joint: class {

    constructor(from, to, options = {}) {

      options = options || {};

      if(from instanceof Genius.GObject) {
        this.from = from;
      } else if (typeof from === 'object' && Object.keys(from).every(k => ['x', 'y'].includes(k))) {
        this.from = from;
      } else {
        throw new Error('from argument must be an GObject or specify x and y.');
      }

      if(to instanceof Genius.GObject) {
        this.to = to;
      } else {
        throw new Error('to argument must be an GObject.');
      }

      this.angle = Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x);
      this.pixels = this.to.distance(this.from);

      this.ddistance = typeof options.distance === 'number' ? options.distance : this.pixels;
      this.drotation = typeof options.rotation === 'number' ? options.rotation : this.angle;

      this.distance = typeof options.velocity === 'number' ? options.velocity : 0;
      this.rotate = typeof options.rotate === 'number' ? options.rotate : 0;
    }


    show() {
      drawingFunctions.push();
      drawingFunctions.fill(0);
      drawingFunctions.line(this.from.x, this.from.y, this.to.x, this.to.y);
      drawingFunctions.pop();
    }


    loop() {
      this.pixels += (this.ddistance - this.pixels) * this.distance;
      this.angle  += (this.drotation - this.angle)  * this.rotate;

      let dx = (this.to.x - Math.cos(this.angle) * this.pixels + this.from.x) * 1;
      let dy = (this.to.y - Math.sin(this.angle) * this.pixels + this.from.y) * 1;

      this.to.ax = isFinite(dx) ? dx : 0;
      this.to.ay = isFinite(dy) ? dy : 0;
    }

  }

};
