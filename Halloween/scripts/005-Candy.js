Entity.Candy = function (game, stage, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'candy');
    this.stage = stage;

    // Set the pivot point for this sprite to the center
    this.anchor.setTo(0.5, 0.5);

    // Enable physics on the missile
    //this.game.physics.enable(this, Phaser.Physics.ARCADE);

    this.timerInterval = 0;
    this.timer = 10;
    //this.timerText = this.game.add.bitmapText(x, y, 'mecha', '' + this.timer, 20);
    //this.timerText.visible = false;
};

// Missiles are a type of Phaser.Sprite
Entity.Candy.prototype = Object.create(Phaser.Sprite.prototype);
Entity.Candy.prototype.constructor = Entity.Candy;

Entity.Candy.prototype.update = function () {
    if (!this.alive) {
        return;
    }

    this.angle += 0.5;
    //this.timerText.x = this.x-10;
    //this.timerText.y = this.y-10;

    if (this.frame < 76) {
        if (this.timer > 0) {
            this.timerInterval += 0.1;
            if (this.timerInterval > 10) {
                this.timerInterval = 0;
                this.timer--;
                //this.timerText.setText('' + this.timer);
                //this.timerText.tint = Utils.GlobalSettings.getHexValue(Phaser.Color.HSVColorWheel()[this.timer * 23]);
            }
        }
        else {
            this.kill();
            //this.timerText.visible = false;
        }
    }
};

Entity.Candy.prototype.collect = function () {
    this.kill();
    //this.timerText.visible = false;
};

Entity.Candy.prototype.setup = function () {
    this.angle = this.game.rnd.integerInRange(0, 360);
    //this.timerText.x = this.x;
    //this.timerText.y = this.y;
    //this.timerText.visible = true;
    this.timerInterval = 0;
    this.timer = 10;
    //this.timerText.setText('' + this.timer);
    //this.timerText.tint = Utils.GlobalSettings.getHexValue(Phaser.Color.HSVColorWheel()[this.timer * 23]);
    this.frame = this.game.rnd.integerInRange(0, this.animations.frameTotal - 1);

    var backupFrame = this.game.rnd.integerInRange(0, this.animations.frameTotal - 5);

    if (this.frame === 76 && this.game.rnd.integerInRange(0, 2) !== 0) {
        this.frame = backupFrame;
    }
    else
        if (this.frame === 77 && this.game.rnd.integerInRange(0, 2) !== 0) {
            this.frame = backupFrame;
        }
        else
            if (this.frame === 78 && this.game.rnd.integerInRange(0, 1) !== 0) {
                this.frame = backupFrame;
            }
            else
                if (this.frame === 79 && this.game.rnd.integerInRange(0, 5) !== 0) {
                    this.frame = backupFrame;
                }

    this.scale.x = 0;
    this.scale.y = 0;
    var tween = this.game.add.tween(this.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
};