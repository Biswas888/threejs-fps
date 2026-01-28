import { spawnEnemies, updateEnemies, enemyModel } from './enemies.js';
import { shootBullet, updateBullets } from './bullets.js';
import { updatePlayer } from './player.js';

export class GameEngine {
  constructor(scene, camera, controls, move, rifle, duration = 60, onGameOver) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.move = move;
    this.rifle = rifle;
    this.duration = duration;
    this.onGameOver = onGameOver;

    this.startTime = 0;
    this.elapsedTime = 0;
    this.gameStarted = false;
    this.paused = false;
    this.pauseStart = 0;
    this.accumulatedPause = 0;

    this.score = 0;

    // Expose globally so bullets.js can update score
    window.GAME_ENGINE = this;
  }

  start() {
    if (!enemyModel) {
      alert('Enemy model is still loading.');
      return;
    }

    spawnEnemies(this.scene, 10);
    this.startTime = performance.now();
    this.gameStarted = true;
  }

  shoot() {
    if (this.gameStarted && !this.paused && this.rifle) {
      shootBullet(this.rifle);
    }
  }

  addScore() {
    this.score++;

    const scoreboard = document.getElementById('scoreboard');
    if (scoreboard) scoreboard.textContent = `Score: ${this.score}`;
  }

  togglePause() {
    if (!this.gameStarted) return;

    if (!this.paused) {
      this.paused = true;
      this.pauseStart = performance.now();
    } else {
      this.paused = false;
      this.accumulatedPause += performance.now() - this.pauseStart;
    }
  }

  update() {
    if (!this.gameStarted || this.paused) return;

    const now = performance.now();
    this.elapsedTime = (now - this.startTime - this.accumulatedPause) / 1000;
    const remaining = this.duration - this.elapsedTime;

    // Timer
    const timerElement = document.getElementById('timer');
    if (timerElement) timerElement.textContent = `Time: ${Math.max(remaining, 0).toFixed(1)}s`;

    // Updates
    updatePlayer(1/60, this.controls, this.move);
    updateEnemies(1/60);
    updateBullets(1/60);

    if (remaining <= 0) {
      this.gameStarted = false;
      this.controls.unlock();
      if (this.onGameOver) this.onGameOver(this.score);
    }
  }

  stop() {
    this.gameStarted = false;
    this.paused = false;
    this.pauseStart = 0;
    this.accumulatedPause = 0;
  }
}

