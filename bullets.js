import * as THREE from 'three';
import { scene, camera } from './main.js';
import { enemies, spawnEnemies } from './enemies.js';

export let bullets = [];

export function shootBullet() {
  const bulletGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);

  const offset = new THREE.Vector3(0, -0.1, -0.5).applyQuaternion(camera.quaternion);
  bullet.position.copy(camera.position).add(offset);

  bullet.velocity = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(camera.quaternion)
    .multiplyScalar(50);

  // Bullet trail
  const trailMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const points = [new THREE.Vector3(), bullet.position.clone()];
  const trail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), trailMat);
  bullet.trail = trail;

  scene.add(trail);
  scene.add(bullet);
  bullets.push(bullet);
}

export function updateBullets(delta) {
  const toRemove = [];

  bullets.forEach((b, i) => {
    b.position.add(b.velocity.clone().multiplyScalar(delta));

    if (b.trail) {
      b.trail.geometry.setFromPoints([
        b.position.clone(),
        b.position.clone().sub(b.velocity.clone().multiplyScalar(0.1)),
      ]);
    }

    // Collision
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const enemy = enemies[ei];

      if (b.position.distanceTo(enemy.position) < 0.7) {
        // Remove enemy & bullet
        scene.remove(enemy);
        enemies.splice(ei, 1);

        scene.remove(b);
        if (b.trail) scene.remove(b.trail);
        toRemove.push(i);

        //  Notify GameEngine
        if (window.GAME_ENGINE) window.GAME_ENGINE.addScore();

        // respawn
        spawnEnemies(scene, 1);
        break;
      }
    }

    if (b.position.length() > 100) {
      scene.remove(b);
      if (b.trail) scene.remove(b.trail);
      toRemove.push(i);
    }
  });

  toRemove.sort((a, b) => b - a).forEach(idx => bullets.splice(idx, 1));
}
