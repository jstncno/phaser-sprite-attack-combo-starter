import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

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
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play('run', true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play('run', true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle', /* ignoreIfPlaying */ true);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
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
    // The player and its settings
    this.player = this.physics.add.sprite(100, 450, 'bladekeeper').setScale(2);
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
  }

  private setupCollisionEvents() {
    // Collide the player and the stars with the platforms
    this.physics.add.collider(this.player, this.platforms);
  }

  private setupControls() {
    //  Input Events
    this.cursors = this.input.keyboard.createCursorKeys();
  }
}
