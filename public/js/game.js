var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });
var socket = io();

function preload() {

    game.load.image('bullet', 'assets/bullets/bullet278.png');
    game.load.image('ship', 'assets/spaceships/destroyer.png');
    game.load.image('background', 'assets/starstars.jpg');
    game.load.image('asteroid1', 'assets/asteroid1.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
}


var cursors;
var fireButton;
var s;
var explosions;
var firingTimer = 0;
var asteroid;

function create() {
    socket.emit("screen_connected");

    s = game.add.tileSprite(0, 0, game.width, game.height, 'background');

    cursors = this.input.keyboard.createCursorKeys();

    fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    socket.on('gamepadConnected', function (id) {
        console.log('Connected ' + id);
        addShip(id);
    });

    socket.on('gamepadDisconnected', function (id) {
        console.log('Connected ' + id);
        ships[id].kill();
        weapons[id].destroy();
        delete ships[id];
        delete weapons[id];
    });

    socket.on('padEvent', function (data) {
        handlePadEvent(data);
    });

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

var ships = {};
var weapons = {};
function addShip(id) {

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

    sprite = game.add.sprite(game.width / 2, game.height - 50, 'ship');
    sprite.angle = -90;
    sprite.scale.setTo(.3, .3);

    sprite.anchor.set(0.5);

    game.physics.arcade.enable(sprite);

    sprite.body.drag.set(70);
    sprite.body.maxVelocity.set(200);

    //  Tell the Weapon to track the 'player' Sprite
    //  With no offsets from the position
    //  But the 'true' argument tells the weapon to track sprite rotation
    weapon.trackSprite(sprite, 0, 0, true);
    weapon.fireAngle = -90;

    ships[id] = sprite;
    weapons[id] = weapon;
}


function handlePadEvent(data) {
    if (data['code'] == 0x130) {
        console.log('Fire!');
        weapons[data['id']].fire()
    }
}

var acceleration = 0;
function update() {
    // if (cursors.up.isDown)
    // {
    //     game.physics.arcade.accelerationFromRotation(sprite.rotation, 300, sprite.body.acceleration);
    // }
    // else
    // {
    //     sprite.body.acceleration.set(0);
    // }
    //
    // if (cursors.left.isDown)
    // {
    //     sprite.body.angularVelocity = -300;
    // }
    // else if (cursors.right.isDown)
    // {
    //     sprite.body.angularVelocity = 300;
    // }
    // else
    // {
    //     sprite.body.angularVelocity = 0;
    // }
    //
    // if (fireButton.isDown)
    // {
    //     weapon.fire();
    // }
    //
    // game.world.wrap(sprite, 16);

    if (game.time.now > firingTimer) {
        asteroidShooter();
    }


    // run collision
    for (var id in ships) {
        game.world.wrap(ships[id], 16);

        game.physics.arcade.overlap(asteroids, ships[id], asteroidHitsShip, null, this);
    }

}

function asteroidShooter () {

    //  Grab the first bullet we can from the pool
    asteroid = asteroids.getFirstExists(false);

    if (asteroid)
    {
        asteroid.reset(game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0, game.height));

        game.physics.arcade.moveToXY(asteroid, game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0, game.height));
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