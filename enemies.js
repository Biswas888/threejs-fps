import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { camera } from './main.js';

export let enemies = [];
export let enemyModel = null;
export let mixers = []; 

// Load enemy model once
const loader = new GLTFLoader();
loader.load(
  './enemies.glb',
  (gltf) => {
    enemyModel = gltf.scene;
    enemyModel.traverse((child) => {
      if (child.isMesh) child.castShadow = true;
    });
    enemyModel.animations = gltf.animations;
    console.log('Enemy model loaded with animations');
  },
  undefined,
  (err) => console.error('Error loading enemy model:', err)
);

// Spawn enemies
export function spawnEnemies(scene, count = 5) {
  if (!enemyModel) return;

  for (let i = 0; i < count; i++) {
    const enemy = enemyModel.clone();
    enemy.scale.set(0.5, 0.5, 0.5); 

    // Place enemy on floor
    const box = new THREE.Box3().setFromObject(enemy);
    const height = box.max.y - box.min.y;
    enemy.position.set(Math.random() * 20 - 10, height / 2, Math.random() * -20);

    enemy.userData.health = 100;

    scene.add(enemy);
    enemies.push(enemy);

    // Setup animation mixer
    if (enemyModel.animations && enemyModel.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(enemy);
      const action = mixer.clipAction(enemyModel.animations[0]);
      action.play();
      mixers.push(mixer);
    } else {
      mixers.push(null);
    }
  }
}

// Update enemies each frame
export function updateEnemies(delta) {
  enemies.forEach((enemy, i) => {
    // Move toward player
    const dir = new THREE.Vector3().subVectors(camera.position, enemy.position);
    dir.y = 0;
    if (dir.length() > 1) {
      dir.normalize();
      enemy.position.add(dir.multiplyScalar(delta * 1.5));
    }

    enemy.lookAt(camera.position.x, enemy.position.y, camera.position.z);

    // Update animation
    if (mixers[i]) mixers[i].update(delta);
  });
}



