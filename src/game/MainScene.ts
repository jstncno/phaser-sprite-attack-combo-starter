import Phaser from 'phaser';
import { get, writable } from 'svelte/store';

import machine, { Event, StateName } from './state-machines/PlayerAnimationStateMachine';

export default class MainScene extends Phaser.Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private position = writable({x: 100, y: 450});

  preload() {
    this.load.image('sky', '/assets/sky.png');
    this.load.spritesheet('bladekeeper', '/assets/metal_bladekeeper_spritesheet.png', { frameWidth: 64, frameHeight: 64 });
  }

  create() {
    this.createLevel();
    this.createPlayer();
    this.setupCollisionEvents();
    this.setupControls();
  }

  update(time: number, delta: number) {

    const state = get(machine.currentState);
    console.log(StateName[state.name]);

    switch (state.name) {
      case StateName.LEFT:
      case StateName.RIGHT:
        this.runRunState();
        break;
      // case StateName.ATTACK_1_ANTICIPATION:
      //   break;
      case StateName.JUMPING:
        this.runJumpingState();
        if (this.player.body.touching.down) {
          this.player.setVelocityY(-330);
        } else {
          const {y} = get(this.position);
          if (y < this.player.body.y) {
            machine.triggerEvent(Event.FALL);
          }
        }
        break;
      case StateName.LANDING:
        this.runLandingState();
        if (this.player.body.touching.down) {
          machine.triggerEvent(Event.LAND);
        }
        break;
      case StateName.IDLE:
      default:
        this.runIdleState();
        break;
    }
    this.position.set({x: this.player.body.x, y: this.player.body.y});
    this.checkInput();
  }


  private createLevel() {
    this.createBackground();
    this.createPlatforms();
    this.setupControls();
  }

  private createBackground() {
    //  A simple background for our game
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
    const {x, y} = get(this.position);
    // The player and its settings
    this.player = this.physics.add.sprite(x, y, 'bladekeeper').setScale(2);
    // Player physics properties. Give the little guy a slight bounce.
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Our player animations, turning, walking left and walking right.
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 8, end: 15 }),
      frameRate: 15,
      repeat: -1,
    });
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 17, end: 21 }),
      frameRate: 10,
    });
    this.anims.create({
      key: 'fall',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 22, end: 25 }),
      frameRate: 10,
      repeat: -1,
    });


    this.player.on('animationcomplete', (anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, sprite: Phaser.GameObjects.Sprite) => {
      // switch (anim.key) {}
      console.log(anim);
    });
  }

  private setupCollisionEvents() {
    // Collide the player and the stars with the platforms
    this.physics.add.collider(this.player, this.platforms);
  }

  private setupControls() {
    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.left.addListener('up', () => machine.triggerEvent(Event.LEFT_UP));
    this.cursors.right.addListener('up', () => machine.triggerEvent(Event.RIGHT_UP));
    this.cursors.up.addListener('down', () => machine.triggerEvent(Event.JUMP));
    this.cursors.space.addListener('down', () => machine.triggerEvent(Event.ATTACK));
  }

  private checkInput() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.flipX = true;
      machine.triggerEvent(Event.LEFT);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.flipX = false;
      machine.triggerEvent(Event.RIGHT);
    }
  }


  /*****************/
  /* State Methods */
  /*****************/

  private runIdleState() {
    this.player.anims.play('idle', /* ignoreIfPlaying */ true);
    this.player.setVelocityX(0);
  }

  private runRunState() {
    this.player.anims.play('run', /* ignoreIfPlaying */ true);
  }

  private runJumpingState() {
    this.player.anims.play('jump', /* ignoreIfPlaying */ true);
  }

  private runLandingState() {
    this.player.anims.play('fall', /* ignoreIfPlaying */ true);
  }
}
