import Phaser from 'phaser';
import { get } from 'svelte/store';

import * as GameState from 'src/game/state';

export default class MainScene extends Phaser.Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private attackKey?: Phaser.Input.Keyboard.Key;

  preload() {
    this.load.image('sky', '/assets/sky.png');
    this.load.spritesheet('warrior', '/assets/warrior_spritesheet.png', { frameWidth: 69, frameHeight: 44 });
  }

  create() {
    this.createLevel();
    this.createPlayer();
    this.setupCollisionEvents();
    this.setupControls();
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    const state = get(GameState.playerAnimationState);

    if (state.animation === 'attack') {
      this.player.setVelocityX(0);
      return;
    }

    if (this.cursors?.left.isDown) {
      this.player.setVelocityX(-300);
      this.player.anims.play('run', /* ignoreIfPlaying */ true);
      if (state.direction === 'right') this.player.flipX = true;
      GameState.playerAnimationState.set({...state, animation: 'run', direction: 'left'});
    } else if (this.cursors?.right.isDown) {
      this.player.setVelocityX(300);
      this.player.anims.play('run', /* ignoreIfPlaying */ true);
      if (state.direction === 'left') this.player.flipX = false;
      GameState.playerAnimationState.set({...state, animation: 'run', direction: 'right'});
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle', /* ignoreIfPlaying */ true);
      GameState.playerAnimationState.set({...state, animation: 'idle'});
    }

    if (this.cursors?.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-300);
    }
  }


  private createLevel() {
    this.createBackground();
    this.createPlatforms();
  }

  private createBackground() {
    // A simple background for our game
    this.add.image(400, 300, 'sky');
  }

  private createPlatforms() {
    //  The platforms group contains the ground and the 2 ledges we can jump on
    this.platforms = this.physics.add.staticGroup();
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);
    const x = Math.floor(width/2);
    const y = Math.floor(height);
    const ground = this.add.rectangle(x, y, width, height / 5, 0x3C3C3C);
    this.platforms.add(ground);
  }


  private createPlayer() {
    // The player and its settings
    this.player = this.physics.add.sprite(100, 450, 'warrior').setScale(2.5);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('warrior', {start: 0, end: 5}),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('warrior', {start: 6, end: 13}),
      frameRate: 20,
      repeat: -1,
    });
    const attackAnim = this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('warrior', {start: 14, end: 21}),
      duration: 300,
    });
    if (attackAnim) {
      attackAnim.addFrame([{key: 'warrior', frame: 0}]);
    }

    this.player.on('animationcomplete', (anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, sprite: Phaser.GameObjects.Sprite) => {
      const state = get(GameState.playerAnimationState);
      if (anim.key === 'attack') GameState.playerAnimationState.set({...state, animation: 'idle'});
    });
  }

  private setupCollisionEvents() {
    if (!this.player || !this.platforms) return;
    // Collide the player and the stars with the platforms
    this.physics.add.collider(this.player, this.platforms);
  }

  private setupControls() {
    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();

    this.attackKey = this.input.keyboard.addKey('SPACE');
    this.attackKey.on('down', () => {
      const state = get(GameState.playerAnimationState);
      this.player?.anims.play('attack', /* ignoreIfPlaying */ true);
      GameState.playerAnimationState.set({...state, animation: 'attack'});
    });
  }
}
