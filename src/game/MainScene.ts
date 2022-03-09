import Phaser from 'phaser';
import { get, writable } from 'svelte/store';

import machine, { Event, StateName } from './state-machines/PlayerAnimationStateMachine';

export default class MainScene extends Phaser.Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private position = writable({x: 400, y: 350});
  private attackButtonPressed = false;

  preload() {
    this.load.image('sky', '/assets/sky.png');
    this.load.spritesheet('bladekeeper', '/assets/metal_bladekeeper_spritesheet.png', { frameWidth: 256, frameHeight: 128 });
  }

  create() {
    this.createLevel();
    this.createPlayer();
    this.setupCollisionEvents();
    this.setupControls();
  }

  update(time: number, delta: number) {

    const state = get(machine.currentState);

    switch (state.name) {
      case StateName.LEFT:
      case StateName.RIGHT:
        this.runRunState();
        break;
      case StateName.JUMPING:
        this.runJumpingState();
        break;
      case StateName.LANDING:
        this.runLandingState();
        break;
      case StateName.ATTACK_1_ANTICIPATION:
        this.player.anims.play('attack_1_anticipation', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_1_CONTACT:
        this.player.anims.play('attack_1_contact', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_1_RECOVERY:
        this.player.anims.play('attack_1_recovery', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_2_ANTICIPATION:
        this.player.anims.play('attack_2_anticipation', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_2_CONTACT:
        this.player.anims.play('attack_2_contact', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_2_RECOVERY:
        this.player.anims.play('attack_2_recovery', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_3_ANTICIPATION:
        this.player.anims.play('attack_3_anticipation', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_3_CONTACT:
        this.player.anims.play('attack_3_contact', /* ignoreIfPlaying */ true);
        break;
      case StateName.ATTACK_3_RECOVERY:
        this.player.anims.play('attack_3_recovery', /* ignoreIfPlaying */ true);
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
    this.player.setBounce(0.2).setCollideWorldBounds(true)//.setSize(64, 64);
    this.player.setSize(64, 64).setOffset(96, 64);
    this.createPlayerAnimations();
  }

  private createPlayerAnimations() {
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
      repeat: -1,
    });
    this.anims.create({
      key: 'fall',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 22, end: 25 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'attack_1_anticipation',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 71, end: 71 }),
      duration: 50,
    });
    this.anims.create({
      key: 'attack_1_contact',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 72, end: 73 }),
      duration: 250,
    });
    this.anims.create({
      key: 'attack_1_recovery',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 74, end: 74 }),
      duration: 125,
    });

    this.anims.create({
      key: 'attack_2_anticipation',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 73, end: 74 }),
      // frames: this.anims.generateFrameNumbers('bladekeeper', { start: 77, end: 97 }),
      duration: 70,
    });
    this.anims.create({
      key: 'attack_2_contact',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 75, end: 80 }),
      duration: 400,
    });
    this.anims.create({
      key: 'attack_2_recovery',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 81, end: 82 }),
      duration: 150,
    });

    this.anims.create({
      key: 'attack_3_anticipation',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 81, end: 82 }),
      duration: 100,
    });
    this.anims.create({
      key: 'attack_3_contact',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 83, end: 96 }),
      duration: 1200,
    });
    this.anims.create({
      key: 'attack_3_recovery',
      frames: this.anims.generateFrameNumbers('bladekeeper', { start: 96, end: 98 }),
      duration: 200,
    });


    this.player.on('animationcomplete', (anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame, sprite: Phaser.GameObjects.Sprite) => {
      // console.log(anim.key)
      switch (anim.key) {
        case 'attack_1_anticipation':
          machine.setState(StateName.ATTACK_1_CONTACT);
          break;
        case 'attack_1_contact':
          if (this.attackButtonPressed) machine.setState(StateName.ATTACK_2_ANTICIPATION);
          else machine.setState(StateName.ATTACK_1_RECOVERY);
          break;
        case 'attack_1_recovery':
          machine.setState(StateName.IDLE);
          break;
        case 'attack_2_anticipation':
          machine.setState(StateName.ATTACK_2_CONTACT);
          break;
        case 'attack_2_contact':
          if (this.attackButtonPressed) machine.setState(StateName.ATTACK_3_ANTICIPATION);
          else machine.setState(StateName.ATTACK_2_RECOVERY);
          break;
        case 'attack_2_recovery':
          machine.setState(StateName.IDLE);
          break;
        case 'attack_3_anticipation':
          machine.setState(StateName.ATTACK_3_CONTACT);
          break;
        case 'attack_3_contact':
          machine.setState(StateName.ATTACK_3_RECOVERY);
          break;
        case 'attack_3_recovery':
          machine.setState(StateName.IDLE);
          break;
        default:
          break;
        }
      this.attackButtonPressed = false;
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
    this.cursors.space.addListener('down', () => {
      machine.triggerEvent(Event.ATTACK);
      this.attackButtonPressed = true;
    });
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
    if (this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    } else if (this.player.body.velocity.y > 0) {
      machine.triggerEvent(Event.FALL);
    }
  }

  private runLandingState() {
    this.player.anims.play('fall', /* ignoreIfPlaying */ true);
    if (this.player.body.touching.down) {
      machine.triggerEvent(Event.LAND);
    }
  }
}
