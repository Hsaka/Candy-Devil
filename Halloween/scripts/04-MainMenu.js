Screen.MainMenu = function (game) {
    this.game = game;
};

Screen.MainMenu.prototype = {

    create: function () {
        this.setup();
    },

    setup: function () {
        
        Utils.GlobalSettings.load();

        this.colors = Phaser.Color.HSVColorWheel();

        this.clickSnd = this.game.add.audio('click');
        this.dripSnd = this.game.add.audio('drip');
          
        this.bg = this.game.add.image(0, 0, 'bg');
        this.bg.alpha = 0.8;

        var i;
        var spr;
        this.candyPool = this.game.add.group();
        for (i = 0; i < 20; i++) {
            spr = this.candyPool.create(this.game.rnd.integerInRange(-100, Utils.GlobalSettings.width + 100), this.game.rnd.integerInRange(-50, Utils.GlobalSettings.height - 100), 'candy');
            spr.frame = this.game.rnd.integerInRange(0, 79);
            spr.alpha = this.game.rnd.realInRange(0.1, 0.3);
            spr._xspeed = this.game.rnd.realInRange(-0.3, 0.3);
            spr._yspeed = this.game.rnd.realInRange(1.2, 1.4);
            spr._curYSpeed = 0;
            spr.scale.set(this.game.rnd.realInRange(0.3, 0.6));
            spr.anchor.setTo(0.5);
        }

        Utils.BackgroundMusic.bgm1.restart('', 0, 0.3, true);

        this.title = this.game.add.image(Utils.GlobalSettings.width / 2, -500, 'title');
        this.title.anchor.setTo(0.5);
        var titletween = this.game.add.tween(this.title).to({ y: 100 }, 1000, Phaser.Easing.Bounce.Out, true);
                
        this.playButton = this.game.add.button(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height - 200, 'play', null, this, 1, 0, 1);
        this.playButton.anchor.setTo(0.5);
        this.playButton.alpha = 0;
        this.playButton.events.onInputDown.addOnce(this.playClick.bind(this));
        var tween = this.game.add.tween(this.playButton).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, true, 0);
        
        this.credits = [
            "Code - Hsaka",
            "Made with - Phaser [phaser.io]",
            "Music - Snabisch"
        ];

        this.creditIndex = 0;

        this.creditText = this.game.add.bitmapText(0, 0, 'mecha', this.credits[this.creditIndex], 40);
        this.creditText.x = Utils.GlobalSettings.width + 1000;
        this.creditText.y = Utils.GlobalSettings.height - 100;
        this.creditTween = this.game.add.tween(this.creditText).to({ x: 0 }, 2000, Phaser.Easing.Sinusoidal.Out)
        .to({ y: Utils.GlobalSettings.height - 70 }, 1000, Phaser.Easing.Sinusoidal.In)
        .to({ y: Utils.GlobalSettings.height + 100 }, 500, Phaser.Easing.Back.In);
        this.creditTween.onComplete.add(this.creditDone.bind(this));
        this.creditTween.start();

        this.setupLeaderboard();

        if (!navigator.isCocoonJS) {
            this.nameForm = new UI.SubmitNameForm(this.game, this);
        }

        this.soundButton = null;
        if (!Utils.GlobalSettings.muted) {
            this.soundButton = this.game.add.button(Utils.GlobalSettings.width - 60, 5, 'systembuttons', null, this, 7, 6, 7);
        }
        else {
            this.soundButton = this.game.add.button(Utils.GlobalSettings.width - 60, 5, 'systembuttons', null, this, 9, 8, 9);
        }
        this.soundButton.width = 50;
        this.soundButton.height = 50;
        this.soundButton.events.onInputDown.addOnce(this.soundClick.bind(this));

        this.stopMusicOnLoad = false;

        this.game.add.sprite(0, 0, '');
    },
    
    setupLeaderboard: function () {
        this.leaderboardGroup = this.game.add.group();

        this.backing = this.game.add.image(Utils.GlobalSettings.width / 2 - 170, Utils.GlobalSettings.height - 610, 'backing');
        this.backing.alpha = 0.6;
        this.backing.width = 340;
        this.backing.height = 310;
        this.leaderboardGroup.add(this.backing);        

        this.leaderboardLabel = this.game.add.bitmapText(Utils.GlobalSettings.width / 2 - 100, Utils.GlobalSettings.height - 700, 'mecha', 'Highscores', 40);
        this.leaderboardLabel.updateTransform();
        this.leaderboardLabel.position.x = Utils.GlobalSettings.width / 2 - this.leaderboardLabel.textWidth / 2;
        this.leaderboardGroup.add(this.leaderboardLabel);

        this.nameLabel = this.game.add.bitmapText(Utils.GlobalSettings.width / 2 - 110, Utils.GlobalSettings.height - 640, 'mecha', 'Name', 34);
        this.scoreLabel = this.game.add.bitmapText(Utils.GlobalSettings.width / 2 + 50, Utils.GlobalSettings.height - 640, 'mecha', 'Score', 34);
        this.leaderboardGroup.add(this.nameLabel);
        this.leaderboardGroup.add(this.scoreLabel);

        this.updateButton = this.game.add.button(Utils.GlobalSettings.width - 160, Utils.GlobalSettings.height - 660, 'systembuttons', this.updateClick, this, 19, 18, 19);
        this.updateButton.scale.setTo(0.6);
        this.leaderboardGroup.add(this.updateButton);
        this.updateTween = this.game.add.tween(this.updateButton).to({ alpha: 1 }, 5000, Phaser.Easing.Sinusoidal.Out, false);
        
        this.names = [];
        this.scores = [];

        for (var i = 0; i < 10; i++) {
            this.names.push(this.game.add.bitmapText(Utils.GlobalSettings.width / 2 - 100, Utils.GlobalSettings.height - 600 + (i * 30), 'mecha', '', 24));
            this.scores.push(this.game.add.bitmapText(Utils.GlobalSettings.width / 2 + 60, Utils.GlobalSettings.height - 600 + (i * 30), 'mecha', '', 24));

            this.leaderboardGroup.add(this.names[i]);
            this.leaderboardGroup.add(this.scores[i]);
        }

        this.leaderboardGroup.visible = true;
        this.leaderboardGroup.alpha = 0;
        var tween = this.game.add.tween(this.leaderboardGroup).to({ alpha: 1 }, 1000, Phaser.Easing.Sinusoidal.Out, true, 0);

        this.updateLeaderboard();
    },

    updateClick: function () {
        if (this.updateButton.alpha === 1) {
            if (!Utils.GlobalSettings.muted) {
                this.clickSnd.play();
            }
            this.updateButton.alpha = 0;
            this.updateTween.start();
            this.updateLeaderboard();
        }
    },

    updateLeaderboard: function () {

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "http://www.gamepyong.com/firewords/php/firewords.php", true);
        var parameters = "action=gethighscores";

        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var msg = xmlHttp.responseText;
                if (msg && msg.length > 0 && this.names && this.scores && this.names.length === 10 && this.scores.length === 10) {
                    var data = msg.split('#');
                    if (data && data.length > 0) {
                        var part = null;

                        for (var i = 0; i < data.length; i++) {
                            part = data[i].split(',');
                            if (part && part.length === 2) {
                                if (part[0] === Utils.GlobalSettings.lastNickname) {
                                    this.names[i].tint = 0xFFFFFF;
                                    this.scores[i].tint = 0xFFFFFF;
                                }
                                else {
                                    this.names[i].tint = Utils.GlobalSettings.getHexValue(this.colors[i * 23]);
                                    this.scores[i].tint = Utils.GlobalSettings.getHexValue(this.colors[i * 23]);                                    
                                }
                                this.names[i].setText((i + 1) + '.  ' + part[0]);
                                this.scores[i].setText('' + part[1]);
                            }
                        }
                    }
                }
            }
        }.bind(this);

        xmlHttp.ontimeout = function () {
        }.bind(this);

        xmlHttp.send(parameters);
    },
    
    playClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
        }

        this.playButton.events.onInputDown.removeAll();
        this.playButton.events.onInputDown.addOnce(this.playClick.bind(this));

        Utils.GlobalSettings.mode = 0;

        if (Utils.GlobalSettings.lastNickname.trim().length === 0) {
            if (navigator.isCocoonJS) {
                Cocoon.Dialog.prompt({
                    title: "Firewords",
                    message: "Enter your nickname:",
                    text: "",
                    type: Cocoon.Dialog.keyboardType.TEXT,
                    cancelText: "Cancel",
                    confirmText: "Ok"
                },
            {
                success: this.confirmDialog.bind(this),
                cancel: function () {
                    this.playButton.visible = true;
                    this.leaderboardGroup.visible = true;
                }.bind(this)
            });
            }
            else {
                this.nameForm.init();
            }
        }
        else {
            this.game.state.start('gamescreen', Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);
        }

        this.playButton.visible = false;
        this.leaderboardGroup.visible = false;
    },
            
    confirmDialog: function (text) {
        if (text && text.length > 0) {
            text = "" + text;
            Utils.GlobalSettings.lastNickname = text;
            this.game.state.start('introscreen', Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);
        }
        else {
            this.playButton.visible = true;
            this.leaderboardGroup.visible = true;
        }
    },
            
    soundClick: function () {
        Utils.GlobalSettings.muted = !Utils.GlobalSettings.muted;
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
            this.soundButton.setFrames(7, 6, 7);
            Utils.BackgroundMusic.bgm1.restart('', 0, 0.3, true);
        }
        else {
            this.soundButton.setFrames(9, 8, 9);
            Utils.BackgroundMusic.bgm1.pause();
        }

        this.soundButton.events.onInputDown.removeAll();
        this.soundButton.events.onInputDown.addOnce(this.soundClick.bind(this));
    },

    creditDone: function () {
        if (this.credits) {
            this.creditIndex++;
            if (this.creditIndex >= this.credits.length)
                this.creditIndex = 0;

            this.creditText.setText(this.credits[this.creditIndex]);
            this.creditText.x = Utils.GlobalSettings.width + 1000;
            this.creditText.y = Utils.GlobalSettings.height - 100;
        }

        this.creditTween.start();
    },

    updateCandy: function (candy) {
        if (candy) {
            if (candy.y >= 0 && (!candy.inWorld || candy.y > Utils.GlobalSettings.height + 200)) {
                candy.x = this.game.rnd.integerInRange(-100, Utils.GlobalSettings.width - 100);
                candy.y = this.game.rnd.integerInRange(-candy.height - 100, -candy.height - 200);
                candy.frame = this.game.rnd.integerInRange(0, 51);
                candy.alpha = this.game.rnd.realInRange(0.1, 0.3);
                candy._xspeed = this.game.rnd.realInRange(-0.3, 0.3);
                candy._yspeed = this.game.rnd.realInRange(1.2, 1.4);
                candy.scale.set(this.game.rnd.realInRange(0.3, 0.6));
            }
            else {
                candy.x += candy._xspeed;
                if (candy.alpha > 0) {
                    candy.alpha -= 0.0002;
                }

                candy.angle++;
                if (candy.angle > 360) {
                    candy.angle = 0;
                }

                if (candy._curYSpeed < candy._yspeed) {
                    candy._curYSpeed += 0.01;
                }
                else {
                    candy._curYSpeed = candy._yspeed;
                }
                candy.y += candy._curYSpeed;
            }
        }
    },

    update: function () {
        
        if (Utils.GlobalSettings.muted && !this.stopMusicOnLoad && this.game.cache.isSoundDecoded('bgm')) {
            this.stopMusicOnLoad = true;
            Utils.BackgroundMusic.bgm1.pause();
        }

        this.candyPool.forEachAlive(this.updateCandy, this);
    },

    shutdown: function () {
        this.credits = null;
        this.colors = null;

        if (this.creditText) {
            this.creditText.destroy();
            this.creditText = null;
        }

        if (this.creditTween) {
            this.creditTween.onComplete.removeAll();
            this.creditTween.stop();
            this.creditTween = null;
        }

        if (this.clickSnd) {
            this.clickSnd.stop();
            this.clickSnd.destroy();
            this.clickSnd = null;
        }

        if (this.dripSnd) {
            this.dripSnd.stop();
            this.dripSnd.destroy();
            this.dripSnd = null;
        }
                
        if (this.soundButton) {
            this.soundButton.destroy();
            this.soundButton = null;
        }

        if (this.bg) {
            this.bg.destroy();
            this.bg = null;
        }

        if (this.candyPool) {
            this.candyPool.destroy();
            this.candyPool = null;
        }

        if (this.title) {
            this.title.destroy();
            this.title = null;
        }

        if (this.playButton) {
            this.playButton.destroy();
            this.playButton = null;
        }

        if (this.leaderboardGroup) {
            this.leaderboardGroup.destroy();
            this.leaderboardGroup = null;
        }

        if (this.backing) {
            this.backing.destroy();
            this.backing = null;
        }

        if (this.leaderboardLabel) {
            this.leaderboardLabel.destroy();
            this.leaderboardLabel = null;
        }

        if (this.nameLabel) {
            this.nameLabel.destroy();
            this.nameLabel = null;
        }

        if (this.scoreLabel) {
            this.scoreLabel.destroy();
            this.scoreLabel = null;
        }

        if (this.updateButton) {
            this.updateButton.destroy();
            this.updateButton = null;
        }

        if (this.updateTween) {
            this.updateTween.stop();
            this.updateTween = null;
        }

        if (this.names && this.scores) {
            for (var i = 0; i < this.names.length; i++) {
                this.names[i].destroy();
                this.scores[i].destroy();
            }
            this.names = null;
            this.scores = null;
        }

        if (this.equipButton) {
            this.equipButton.destroy();
            this.equipButton = null;
        }

        if (this.equipLabel) {
            this.equipLabel.destroy();
            this.equipLabel = null;
        }

        Utils.GlobalSettings.fromScreen = 'mainmenu';
                
        console.log('destroy mainmenu');
    }
};