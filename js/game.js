var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('bullet', 'assets/bullets/bullet278.png');
    game.load.image('ship', 'assets/spaceships/destroyer.png');
    game.load.image('background', 'assets/starstars.jpg');
    game.load.image('asteroid1', 'assets/asteroid1.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
}

var ship;
var weapon;
var cursors;
var fireButton;
var s;
var explosions;
var firingTimer = 0;
var asteroid;

function create() {
    s = game.add.tileSprite(0, 0, game.width, game.height, 'background');

    //  Creates 30 bullets, using the 'bullet' graphic
    weapon = game.add.weapon(30, 'bullet');

    weapon.bullets.forEach(function (bullet) {
        bullet.scale.setTo(.5,.5);
    }, this);

    //  The bullet will be automatically killed when it leaves the world bounds
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

    //  The speed at which the bullet is fired
    weapon.bulletSpeed = 600;

    //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    weapon.fireRate = 100;

    weapon.bulletAngleOffset = 90;

    ship = this.add.sprite(game.width / 2, game.height - 50, 'ship');
    ship.angle = -90;
    ship.scale.setTo(.3, .3);

    ship.anchor.set(0.5);

    game.physics.arcade.enable(ship);

    ship.body.drag.set(70);
    ship.body.maxVelocity.set(200);

    //  Tell the Weapon to track the 'player' Sprite
    //  With no offsets from the position
    //  But the 'true' argument tells the weapon to track sprite rotation
    weapon.trackSprite(ship, 0, 0, true);
    weapon.fireAngle = -90;

    cursors = this.input.keyboard.createCursorKeys();

    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

     // The asteroids
    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;
    asteroids.createMultiple(30, 'asteroid1');
    asteroids.setAll('anchor.x', 0.5);
    asteroids.setAll('anchor.y', 1);
    asteroids.setAll('outOfBoundsKill', true);
    asteroids.setAll('checkWorldBounds', true);

    // An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(100, 'kaboom');

}

var acceleration = 0;
function update() {
    if (cursors.up.isDown)
    {
        game.physics.arcade.accelerationFromRotation(ship.rotation, 300, ship.body.acceleration);
    }
    else
    {
        ship.body.acceleration.set(0);
    }

    if (cursors.left.isDown)
    {
        ship.body.angularVelocity = -300;
    }
    else if (cursors.right.isDown)
    {
        ship.body.angularVelocity = 300;
    }
    else
    {
        ship.body.angularVelocity = 0;
    }

    if (fireButton.isDown)
    {
        weapon.fire();
    }
    if (game.time.now > firingTimer)
    {
        asteroidShooter();
    }


    game.world.wrap(ship, 16);

    // run collision
    game.physics.arcade.overlap(asteroids, ship, asteroidHitsShip, null, this);


}

function asteroidShooter () {

    //  Grab the first bullet we can from the pool
    asteroid = asteroids.getFirstExists(false);

    if (asteroid)
    {   
        asteroid.reset(game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0, game.height));

        game.physics.arcade.moveToObject(asteroid,ship,120);
        firingTimer = game.time.now + 2000;
    }

}

function asteroidHitsShip (ship,asteroid) {

    // create an explosion
    var explosion = explosions.getFirstExists(false);
    explosion.animations.add('kaboom');
    explosion.reset(ship.body.x, ship.body.y);
    explosion.play('kaboom', 30, false, true);

    asteroid.kill();
}

function render() {

    // weapon.debug();

}