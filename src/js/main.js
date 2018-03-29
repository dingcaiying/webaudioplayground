import './../scss/main.scss';
import './../index.html';
import 'three-extras/renderers/CanvasRenderer';
import 'three-extras/renderers/Projector';
import Sound from './Audio/Sound';

// load assets
function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('../assets/', true));


let container, stats;
let camera, scene, renderer, group, particle;
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let sound;
let analyser, freqByteData;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

init();
bindEvent();
// animate();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 1000;

  scene = new THREE.Scene();

  const PI2 = Math.PI * 2;
  const program = context => {
    context.beginPath();
    context.arc(0, 0, 0.5, 0, PI2, true);
    context.fill();
  };

  group = new THREE.Group();
  scene.add(group);

  for (let i = 0; i < 100; i++) {
    const material = new THREE.SpriteCanvasMaterial({
      color: Math.random() * 0x808008 + 0x808080,
      program: program,
    });

    particle = new THREE.Sprite(material);
    particle.position.x = Math.random() * 2000 - 1000;
    particle.position.y = Math.random() * 2000 - 1000;
    particle.position.z = Math.random() * 2000 - 1000;
    particle.scale.x = particle.scale.y = Math.random() * 20 + 10;
    group.add(particle);
  }

  renderer = new THREE.CanvasRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  loadSound('/assets/music/example.mp3').then(buffer => {
    sound = new Sound(audioCtx, buffer);
    analyser = audioCtx.createAnalyser();
    sound.connectToNode(analyser);

    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.4;
    analyser.connect(audioCtx.destination);


    freqByteData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqByteData);
    console.log('freqByteData', freqByteData);

  });
}

function loadSound(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('get', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      audioCtx.decodeAudioData(request.response, buffer => {
        // received buffer
        resolve(buffer);
      }, error => {
        reject('get audio source error: ', error);
      });
    };
    request.send();
  });
}

function updateFFT() {}

function render() {
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (- mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  // group.rotation.x += 0.01;
  // group.rotation.y += 0.02;

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function bindEvent() {
  document.getElementById('btn_start').addEventListener('click', () => {
    if (sound) {
      console.log('has sound and play');
      sound.play();
    }
  });
  document.getElementById('btn_stop').addEventListener('click', () => {
    if (sound) {
      console.log('has sound and stop');
      sound.stop();
    }
  });
}
