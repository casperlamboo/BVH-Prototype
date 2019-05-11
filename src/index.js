import jss from 'jss';
import preset from 'jss-preset-default';
import normalize from 'normalize-jss';
import bvhFileURL from 'data/skeleton_Take_005.bvh';
import parser from 'src/parser.pegjs'
import * as vector3 from 'src/vector3.js';
import * as matrix4 from 'src/matrix4.js';

// set some default css
jss.setup(preset());
jss.createStyleSheet(normalize).attach();
jss.createStyleSheet({
  '@global': {
    '*': { margin: 0, padding: 0 },
    'body, html': { height: '100%' },
    '#app': { height: '100%' },
    body: { overflow: 'auto' },
    html: { overflow: 'hidden' }
  }
}).attach();

// create canvas and add it to the DOM
const CANVAS = document.createElement('canvas');
const CONTEXT = CANVAS.getContext('2d');
document.getElementById('app').appendChild(CANVAS);

const resizeCanvas = () => {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
};
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// object containing all drawable objects
// each drawable object is a callback with canvas, context and time parameters
const SCENE = [];

// initilize drawloop
(function draw() {
  const t = performance.now();

  // clear screen
  CONTEXT.fillStyle = '#222222';
  CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

  // draw eacht element in scene
  for (const drawCallback of SCENE) {
    drawCallback(CANVAS, CONTEXT, t);
  }

  window.requestAnimationFrame(draw);
}());

// some constants needed for parsing
const CHANNEL_IDS = {
  "Xposition": 1 << 0,
  "Yposition": 1 << 1,
  "Zposition": 1 << 2,
  "Zrotation": 1 << 3,
  "Xrotation": 1 << 4,
  "Yrotation": 1 << 5,
};
const ROOT_ID  = 1 << 0;
const JOINT_ID = 1 << 1;

fetch(bvhFileURL).then(result => result.text()).then(data => {
  // parse using PEGJS, see src/parser.pegjs
  const { hierachy, motion } = parser.parse(data, { CHANNEL_IDS, ROOT_ID, JOINT_ID });

  // add draw callback to scene containing all draw information
  SCENE.push((canvas, context, t) => {
    const speed = 1;
    const frame = Math.floor((t * motion.frameTime * speed) % motion.frames);
    const pose = motion.keyFrames[frame];

    const m = matrix4.multiply(
      matrix4.screen(canvas.width, canvas.height),
      matrix4.multiply(
        matrix4.perspective(Math.PI / 2, canvas.width / canvas.height, 0.1, 1000),
        matrix4.multiply(
          matrix4.translate({ x: 0, y: -100, z: 400 }),
          matrix4.rotationY(t * 0.0001)
        )
      )
    );

    context.fillStyle = '#dddddd';
    context.strokeStyle = '#dddddd';

    let poseIndex = 0;
    const queue = [{ joint: hierachy, parent: m }];

    while (queue.length !== 0) {
      const { parent, joint } = queue.shift();

      // construct local matrix
      let localMatrix = matrix4.identity;

      const translateX = joint.channels.channels & CHANNEL_IDS["Xposition"] ? pose[poseIndex ++] : 0;
      const translateY = joint.channels.channels & CHANNEL_IDS["Yposition"] ? pose[poseIndex ++] : 0;
      const translateZ = joint.channels.channels & CHANNEL_IDS["Zposition"] ? pose[poseIndex ++] : 0;

      if (joint.channels.channels & CHANNEL_IDS["Zrotation"]) {
        localMatrix = matrix4.multiply(localMatrix, matrix4.rotationZ(pose[poseIndex ++] * Math.PI / 180));
      }
      if (joint.channels.channels & CHANNEL_IDS["Xrotation"]) {
        localMatrix = matrix4.multiply(localMatrix, matrix4.rotationX(pose[poseIndex ++] * Math.PI / 180));
      }
      if (joint.channels.channels & CHANNEL_IDS["Yrotation"]) {
        localMatrix = matrix4.multiply(localMatrix, matrix4.rotationY(pose[poseIndex ++] * Math.PI / 180));
      }

      localMatrix = matrix4.multiply(matrix4.translate(vector3.add(joint.offset, {
        x: translateX,
        y: translateY,
        z: translateZ
      })), localMatrix);
      localMatrix = matrix4.multiply(parent, localMatrix);

      const { x, y } = vector3.applyMatrix4({ x: 0, y: 0, z: 0 }, localMatrix);
      context.fillRect(x, y, 3, 3);
      // context.fillText(joint.name, x, y);

      const { x: px, y: py } = vector3.applyMatrix4({ x: 0, y: 0, z: 0 }, parent);
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(px, py);
      context.stroke();

      if (joint.joints) {
        for (let i = 0; i < joint.joints.length; i ++) {
          // splice into i to maintain DFS
          queue.splice(i, 0, { parent: localMatrix, joint: joint.joints[i] });
        }
      } else if (joint.endSite) {
        // ...
      }
    }
  });
});
