var Entity = {};

Entity.Missile = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'rocket');

    // Set the pivot point for this sprite to the center
    this.anchor.setTo(0.5, 0.5);

    // Enable physics on the missile
    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    // Define constants that affect motion
    this.SPEED = this.game.rnd.integerInRange(100, 500);//250; // missile speed pixels/second
    this.TURN_RATE = this.SPEED / 50; //5; // turn rate in degrees/frame
    this.WOBBLE_LIMIT = 15; // degrees
    this.WOBBLE_SPEED = 250; // milliseconds
    this.SMOKE_LIFETIME = 1000; // milliseconds
    this.PREVSPEED = this.SPEED;

    if (Utils.GlobalSettings.isMobile) {
        this.SMOKE_LIFETIME = 500; // milliseconds
    }

    this.AVOID_DISTANCE = 30; // pixels

    // Create a variable called wobble that tweens back and forth between
    // -this.WOBBLE_LIMIT and +this.WOBBLE_LIMIT forever
    this.wobble = this.WOBBLE_LIMIT;
    this.game.add.tween(this)
        .to(
            { wobble: -this.WOBBLE_LIMIT },
            this.WOBBLE_SPEED, Phaser.Easing.Sinusoidal.InOut, true, 0,
            Number.POSITIVE_INFINITY, true
        );

    // Add a smoke emitter with 100 particles positioned relative to the
    // bottom center of this missile
    if (Utils.GlobalSettings.isMobile) {
        this.smokeEmitter = this.game.add.emitter(0, 0, 10);
    }
    else {
        this.smokeEmitter = this.game.add.emitter(0, 0, 20);
    }

    // Set motion parameters for the emitted particles
    this.smokeEmitter.gravity = 0;
    this.smokeEmitter.setXSpeed(0, 0);
    this.smokeEmitter.setYSpeed(-80, -50); // make smoke drift upwards

    // Make particles fade out after 1000ms
    this.smokeEmitter.setAlpha(1, 0, this.SMOKE_LIFETIME,
        Phaser.Easing.Linear.InOut);

    this.smokeEmitter.setScale(1, 0, 1, 0, this.SMOKE_LIFETIME,
        Phaser.Easing.Linear.InOut);

    //setScale(minX, maxX, minY, maxY, rate, ease, yoyo)

    // Create the actual particles
    this.smokeEmitter.makeParticles('smoke');

    // Start emitting smoke particles one at a time (explode=false) with a
    // lifespan of this.SMOKE_LIFETIME at 50ms intervals
    this.smokeEmitter.start(false, this.SMOKE_LIFETIME, 50);
};

// Missiles are a type of Phaser.Sprite
Entity.Missile.prototype = Object.create(Phaser.Sprite.prototype);
Entity.Missile.prototype.constructor = Entity.Missile;

Entity.Missile.prototype.setStage = function (stage) {
    this.stage = stage;
};

Entity.Missile.prototype.doSloMo = function () {
    this.PREVSPEED = this.SPEED;
    this.SPEED = 50;
};

Entity.Missile.prototype.endSloMo = function () {
    this.SPEED = this.PREVSPEED;
};

Entity.Missile.prototype.update = function () {
    // If this missile is dead, don't do any of these calculations
    // Also, turn off the smoke emitter
    if (!this.alive) {
        this.smokeEmitter.on = false;
        return;
    } else {
        this.smokeEmitter.on = true;
    }

    if (this.stage.pause) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.smokeEmitter.on = false;
        return;
    }

    // Position the smoke emitter at the center of the missile
    this.smokeEmitter.x = this.x;
    this.smokeEmitter.y = this.y;

    // Calculate the angle from the missile to the mouse cursor game.input.x
    // and game.input.y are the mouse position; substitute with whatever
    // target coordinates you need.
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.game.input.activePointer.x, this.game.input.activePointer.y
    );

    // Add our "wobble" factor to the targetAngle to make the missile wobble
    // Remember that this.wobble is tweening (above)
    targetAngle += this.game.math.degToRad(this.wobble);


    // Make each missile steer away from other missiles.
    // Each missile knows the group that it belongs to (missileGroup).
    // It can calculate its distance from all other missiles in the group and
    // steer away from any that are too close. This avoidance behavior prevents
    // all of the missiles from bunching up too tightly and following the
    // same track.
    var avoidAngle = 0;
    this.parent.forEachAlive(function (m) {
        // Don't calculate anything if the other missile is me
        if (this == m) return;

        // Already found an avoidAngle so skip the rest
        if (avoidAngle !== 0) return;

        // Calculate the distance between me and the other missile
        var distance = this.game.math.distance(this.x, this.y, m.x, m.y);

        // If the missile is too close...
        if (distance < this.AVOID_DISTANCE) {
            // Chose an avoidance angle of 90 or -90 (in radians)
            avoidAngle = Math.PI / 2; // zig
            if (this.game.math.chanceRoll(50)) avoidAngle *= -1; // zag
        }
    }, this);

    // Add the avoidance angle to steer clear of other missiles
    targetAngle += avoidAngle;

    // Gradually (this.TURN_RATE) aim the missile towards the target angle
    if (this.rotation !== targetAngle) {
        // Calculate difference between the current angle and targetAngle
        var delta = targetAngle - this.rotation;

        // Keep it in range from -180 to 180 to make the most efficient turns.
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        if (delta > 0) {
            // Turn clockwise
            this.angle += this.TURN_RATE;
        } else {
            // Turn counter-clockwise
            this.angle -= this.TURN_RATE;
        }

        // Just set angle to target angle if they are close
        if (Math.abs(delta) < this.game.math.degToRad(this.TURN_RATE)) {
            this.rotation = targetAngle;
        }
    }

    // Calculate velocity vector based on this.rotation and this.SPEED
    this.body.velocity.x = Math.cos(this.rotation) * this.SPEED;
    this.body.velocity.y = Math.sin(this.rotation) * this.SPEED;
};