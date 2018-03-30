import './../scss/main.scss';
import './../index.html';
import 'three-extras/renderers/CanvasRenderer';
import 'three-extras/renderers/Projector';
import Sound from './Audio/Sound';

// load assets
function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('../assets/', true));


let container, stats;
let camera, scene, renderer, particles, particle, count = 0;
let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let sound;
let analyser, freqByteData;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

initSound()
  .then(initScene)
  .then(bindEvent)
  .then(animate);

function initScene() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 1000;

  scene = new THREE.Scene();

  particles = new Array();

  const PI2 = Math.PI * 2;
  const program = context => {
    context.beginPath();
    context.arc(0, 0, 10, 0, PI2, true);
    context.fill();
  };

  for (let i = 0; i < freqByteData.length; i++) {
    const material = new THREE.SpriteCanvasMaterial({
      color: Math.random() * 0x808008 + 0x808080,
      program: program,
    });

    particle = particles[i] = new THREE.Sprite(material);

    particle.position.x = Math.random() * 2000 - 1000;
    particle.position.y = Math.random() * 2000 - 1000;
    particle.position.z = Math.random() * 2000 - 1000;
    scene.add(particle);
  }

  renderer = new THREE.CanvasRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  return Promise.resolve();
}

function initSound() {
  return loadSound('/assets/music/example.mp3').then(buffer => {
    sound = new Sound(audioCtx, buffer);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(audioCtx.destination);

    freqByteData = new Uint8Array(analyser.frequencyBinCount);

    sound.setOutput(analyser);
    sound.play();
  });
}

function render() {
  count++;
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (- mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  updateFFT();

  let scaler;
  for (let i = 0; i < freqByteData.length; i ++) {
    particle = particles[i];
    scaler = freqByteData[i] / 20 + 1;
    particle.scale.x = particle.scale.y = scaler;
    if (count % 100 > 0) console.log('scaler', scaler);
  }

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function updateFFT() {
  analyser.getByteFrequencyData(freqByteData);
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
