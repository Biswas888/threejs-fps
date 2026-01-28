import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GameEngine } from './gameEngine.js'; 

// Scene & Camera
export const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 5);
export { camera };

// Game Variables
const GAME_DURATION = 60; // seconds
let gameEngine = null;

// Renderer 
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0); // transparent
document.body.appendChild(renderer.domElement);


// Floor & Lighting 
const floorGeo = new THREE.PlaneGeometry(100, 100);
const floorMat = new THREE.MeshStandardMaterial({
  color: 0xC0C0C0,
  roughness: 0.9,
  metalness: 0.9,
});


const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Controls & Movement 
const controls = new PointerLockControls(camera, renderer.domElement);
const move = { forward: false, backward: false, left: false, right: false };

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') move.forward = true;
  if (e.code === 'KeyS') move.backward = true;
  if (e.code === 'KeyA') move.left = true;
  if (e.code === 'KeyD') move.right = true;
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') move.forward = false;
  if (e.code === 'KeyS') move.backward = false;
  if (e.code === 'KeyA') move.left = false;
  if (e.code === 'KeyD') move.right = false;
});

// ----- Load Rifle -----
export let rifle;
const loader = new GLTFLoader();
loader.load(
  './rifle.glb',
  (gltf) => {
    rifle = gltf.scene;
    rifle.scale.set(0.5, 0.5, 0.5);
    rifle.position.set(0.3, -0.2, -0.5);

    // --- Add muzzle point ---
    rifle.muzzle = new THREE.Object3D();
    rifle.muzzle.position.set(0, 0, -1); 
    rifle.add(rifle.muzzle);

    camera.add(rifle);
  },
  undefined,
  (err) => console.error('Error loading rifle:', err)
);


// Game Over Screen 
const gameOverScreen = document.createElement('div');
Object.assign(gameOverScreen.style, {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  background: 'rgba(102, 126, 81, 0.8)',
  color: 'white',
  display: 'none',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '2em',
  zIndex: '10',
});
document.body.appendChild(gameOverScreen);

const gameOverText = document.createElement('div');
gameOverScreen.appendChild(gameOverText);

const playAgainButton = document.createElement('button');
playAgainButton.textContent = 'Play Again';
Object.assign(playAgainButton.style, { marginTop: '20px', padding: '10px 20px', fontSize: '1em' });
playAgainButton.addEventListener('click', () => location.reload());
gameOverScreen.appendChild(playAgainButton);

// Pause Message
const pauseMessage = document.createElement('div');
Object.assign(pauseMessage.style, {
  position: 'absolute',
  top: '10%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  fontSize: '2em',
  display: 'none',
  zIndex: '10',
});
pauseMessage.textContent = 'PAUSED, Press O to Resume';
document.body.appendChild(pauseMessage);

// Start Game
document.getElementById('startButton').addEventListener('click', () => {
  controls.lock();
  document.getElementById('startButton').style.display = 'none';

  gameEngine = new GameEngine(
    scene,
    camera,
    controls,
    move,
    rifle,
    GAME_DURATION,
    (score) => {
      gameOverText.innerHTML = `⏰ Time's Up!<br>Your Score: ${score}`;
      gameOverScreen.style.display = 'flex';
    }
  );

  gameEngine.start();
});

// ----- Shooting -----
document.addEventListener('mousedown', (e) => {
  if (e.target.id === 'startButton') return;
  if (gameEngine) gameEngine.shoot();
});

//  Pause/Resume / Restart
document.addEventListener('keydown', (e) => {
  if (!gameEngine) return;

  // Toggle pause/resume with P
  if (e.code === 'KeyP') {
    gameEngine.togglePause();
    pauseMessage.style.display = gameEngine.paused ? 'block' : 'none';
    if (!gameEngine.paused) controls.lock();
    else controls.unlock();
  }

  // Resume specifically with O
  if (e.code === 'KeyO' && gameEngine.paused) {
    gameEngine.togglePause(); // resume
    pauseMessage.style.display = 'none';
    controls.lock();
  }

  // Restart game
  if (e.code === 'KeyR') {
    location.reload();
  }
});

//  Resize Handler 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  if (gameEngine) gameEngine.update();
  renderer.render(scene, camera);
}
animate();
