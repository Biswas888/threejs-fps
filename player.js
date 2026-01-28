import * as THREE from 'three';

export let velocity = new THREE.Vector3();
let bobTime = 0;

export function updatePlayer(delta, controls, move) {
  // Prevent update if pointer not locked or move state undefined
  if (!controls.isLocked || !move) return;

  const speed = 5;
  const direction = new THREE.Vector3();

  // Movement vectors
  const frontVector = new THREE.Vector3(0, 0, Number(move.backward) - Number(move.forward));
  const sideVector = new THREE.Vector3(Number(move.right) - Number(move.left), 0, 0);
  direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed * delta);

  // Update velocity
  velocity.add(direction);

  // Move camera via controls
  controls.moveRight(direction.x);
  controls.moveForward(direction.z);

  // Bobbing effect
  if ((velocity.x !== 0 || velocity.z !== 0) && controls.object) {
    bobTime += delta * 10;
    controls.object.position.y = 1.6 + Math.sin(bobTime) * 0.02;
  } else if (controls.object) {
    bobTime = 0;
    controls.object.position.y = 1.6;
  }

  // Friction
  velocity.multiplyScalar(0.9);
}



