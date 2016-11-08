Screen.IntroScreen = function (game) {
    this.game = game;
};

Screen.IntroScreen.prototype = {

    create: function () {
        this.setup();
    },

    setup: function () {
        this.game.stage.backgroundColor = 0xffffff;

        this.comic1 = this.game.add.image(-500, 10, 'comic1');
        this.comic2 = this.game.add.image(Utils.GlobalSettings.width + 500, 10, 'comic2');
        this.comic3 = this.game.add.image(10, Utils.GlobalSettings.height + 500, 'comic3');
        this.comic4 = this.game.add.image(-500, 530, 'comic4');
        this.comic5 = this.game.add.image(Utils.GlobalSettings.width + 500, 530, 'comic5');
        this.comic6 = this.game.add.image(10, Utils.GlobalSettings.height + 500, 'comic6');

        var tween1 = this.game.add.tween(this.comic1).to({ x: 10 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 1000);
        var tween2 = this.game.add.tween(this.comic2).to({ x: Utils.GlobalSettings.width - 208 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 3000);
        var tween3 = this.game.add.tween(this.comic3).to({ y: 270 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 5000);
        var tween4 = this.game.add.tween(this.comic4).to({ x: 10 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 7000);
        var tween5 = this.game.add.tween(this.comic5).to({ x: Utils.GlobalSettings.width - 208 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 9000);
        var tween6 = this.game.add.tween(this.comic6).to({ y: 790 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 11000);

        this.startTimer = false;
        this.timer = 0;

        tween6.onComplete.addOnce(this.stripDone, this);
        
        this.game.add.sprite(0, 0, '');

        this.game.input.onDown.addOnce(this.next, this);
    },

    stripDone: function () {
        this.startTimer = true;
        this.timer = 0;
    },

    next: function() {
        this.game.state.start('gamescreen', Phaser.Plugin.StateTransition.Out.SlideTop, Phaser.Plugin.StateTransition.In.SlideTop);
    },
    

    update: function () {
        if (this.startTimer) {
            this.timer++;
            if (this.timer > 1000) {
                this.timer = 0;
                this.startTimer = false;
                this.next();
            }
        }
    },

    shutdown: function () {
        if (this.comic1) {
            this.comic1.destroy();
            this.comic1 = null;
        }

        if (this.comic2) {
            this.comic2.destroy();
            this.comic2 = null;
        }

        if (this.comic3) {
            this.comic3.destroy();
            this.comic3 = null;
        }

        if (this.comic4) {
            this.comic4.destroy();
            this.comic4 = null;
        }

        if (this.comic5) {
            this.comic5.destroy();
            this.comic5 = null;
        }

        if (this.comic6) {
            this.comic6.destroy();
            this.comic6 = null;
        }

        Utils.GlobalSettings.fromScreen = 'introscreen';
                
        console.log('destroy introscreen');
    }
};