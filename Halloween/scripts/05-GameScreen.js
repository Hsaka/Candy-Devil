Screen.GameScreen = function (game) {
    this.game = game;
};

Screen.GameScreen.prototype = {
    create: function () {
        Utils.GlobalSettings.save();
        this.screenShake = this.game.plugins.add(Phaser.Plugin.ScreenShake);
        this.setup();
        this.game.add.sprite(0, 0, '');
    },    

    setup: function () {
        this.clickSnd = this.game.add.audio('click');
        this.explosionSnd = this.game.add.audio('explosion');
        this.lifeSnd = this.game.add.audio('life');
        this.invincibleSnd = this.game.add.audio('invincible');
        this.invincibleDoneSnd = this.game.add.audio('wrong');
        this.deadSnd = this.game.add.audio('dead');
        this.eatSnd = this.game.add.audio('drip');

        //this.game.stage.backgroundColor = 0x4488cc;
        this.bg = this.game.add.image(0, 0, 'bg');

        this.MAX_MISSILES = 20;
        this.MAX_CANDY = 10;

        this.MAX_LEVEL_CANDY = 1;
        this.MAX_LEVEL_MISSILES = 2;

        this.scoreText = this.game.add.bitmapText(20, 10, 'fader', '0', 72);
        this.score = 0;
        this.scoreBuffer = 0;
        this.actualScore = 0;

        this.lifeSprite = this.game.add.sprite(20, 80, 'player');
        this.lifeSprite.scale.set(0.5);

        this.life = 3;
        this.lifeText = this.game.add.bitmapText(70, 85, 'arial', 'x'+this.life, 30);

        this.invincible = false;
        this.invincibilityTimer = 0;
        this.gameOver = false;
        this.pause = false;
        this.pauseTimer = 0;
        this.slomo = false;
        this.slomoTimer = 0;
        this.ghost = false;
        this.ghostTimer = 0;

        this.candyGroup = this.game.add.group();
        var i = 0;
        for (i = 0; i < this.MAX_CANDY; i++) {
            var candy = this.candyGroup.add(new Entity.Candy(this.game, this));
            candy.kill();
        }

        // Create a group to hold the missile
        this.missileGroup = this.game.add.group();
        for (i = 0; i < this.MAX_MISSILES; i++) {
            var missile = this.missileGroup.add(new Entity.Missile(this.game));
            missile.setStage(this);
            missile.kill();            
        }

        this.player = this.game.add.sprite(0, 0, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('idle', [0, 1], 10, true);
        this.player.animations.play('idle');

        // Create a group for explosions
        this.explosionGroup = this.game.add.group();

        for (i = 0; i < this.MAX_MISSILES; i++) {
            var explosion = this.game.add.sprite(0, 0, 'explosion');
            explosion.anchor.setTo(0.5, 0.5);

            // Add an animation for the explosion that kills the sprite when the
            // animation is complete
            var animation = explosion.animations.add('boom', [0, 1, 2, 3], 60, false);
            animation.killOnComplete = true;

            // Add the explosion sprite to the group
            this.explosionGroup.add(explosion);
            explosion.kill();
        }

        this.collectGroup = this.game.add.group();

        for (i = 0; i < this.MAX_CANDY; i++) {
            var collect = this.game.add.sprite(0, 0, 'collect');
            collect.anchor.setTo(0.5, 0.5);

            // Add an animation for the explosion that kills the sprite when the
            // animation is complete
            var animation = collect.animations.add('boom', [0, 1, 2, 3, 4], 30, false);
            animation.killOnComplete = true;

            // Add the explosion sprite to the group
            this.collectGroup.add(collect);
            collect.kill();
        }

        this.gameoverImg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2, 'gameover');
        this.gameoverImg.anchor.set(0.5, 0.5);
        this.gameoverImg.visible = false;

        this.invincibleImg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2, 'invincibleimg');
        this.invincibleImg.anchor.set(0.5, 0.5);
        this.invincibleImg.visible = false;

        this.lifeupImg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2, 'lifeupimg');
        this.lifeupImg.anchor.set(0.5, 0.5);
        this.lifeupImg.visible = false;

        this.slomoImg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2, 'slomoimg');
        this.slomoImg.anchor.set(0.5, 0.5);
        this.slomoImg.visible = false;

        this.ghostImg = this.game.add.image(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2, 'ghostimg');
        this.ghostImg.anchor.set(0.5, 0.5);
        this.ghostImg.visible = false;

        this.restartButton = this.game.add.button(Utils.GlobalSettings.width / 2, Utils.GlobalSettings.height / 2 + 100, 'restart', null, this, 1, 0, 1);
        this.restartButton.anchor.setTo(0.5);
        this.restartButton.visible = false;
        this.restartButton.events.onInputDown.addOnce(this.restartClick.bind(this));

        // Simulate a pointer click/tap input at the center of the stage
        // when the example begins running.
        this.game.input.activePointer.x = Utils.GlobalSettings.width / 2;
        this.game.input.activePointer.y = Utils.GlobalSettings.height / 2 - 100;

        this.player.x = this.game.input.activePointer.x;
        this.player.y = this.game.input.activePointer.y;

        this.getCandy();
        
        this.soundButton = null;
        if (!Utils.GlobalSettings.muted) {
            this.soundButton = this.game.add.button(Utils.GlobalSettings.width - 120, 5, 'systembuttons', null, this, 7, 6, 7);
        }
        else {
            this.soundButton = this.game.add.button(Utils.GlobalSettings.width - 120, 5, 'systembuttons', null, this, 9, 8, 9);
        }
        this.soundButton.width = 50;
        this.soundButton.height = 50;
        this.soundButton.events.onInputDown.addOnce(this.soundClick.bind(this));
        this.stopMusicOnLoad = false;

        this.exitButton = this.game.add.button(Utils.GlobalSettings.width - 60, 5, 'systembuttons', null, this, 5, 4, 5);
        this.exitButton.width = 50;
        this.exitButton.height = 50;
        this.exitButton.events.onInputDown.addOnce(this.exitClick.bind(this));

        this.pauseButton = this.game.add.button(Utils.GlobalSettings.width - 180, 5, 'systembuttons', null, this, 1, 0, 1);
        this.pauseButton.width = 50;
        this.pauseButton.height = 50;
        this.pauseButton.events.onInputDown.addOnce(this.pauseClick.bind(this));

        this.pauseKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.pauseKey.onDown.addOnce(this.pauseClick.bind(this), this);

        this.game.input.onDown.addOnce(this.unpause, this);
        this.pauseText = this.game.add.bitmapText(0, Utils.GlobalSettings.height / 2 - 50, 'mecha', "             - game paused -\nTap or Spacebar to unpause", 20);
        this.pauseText.updateTransform();
        this.pauseText.position.x = Utils.GlobalSettings.width / 2 - this.pauseText.textWidth / 2;
        this.pauseText.visible = false;

        if (!Utils.GlobalSettings.isMobile) {
            this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
        }

        if (navigator.isCocoonJS) {
            this.exitHandler = this.exitClick.bind(this);
            document.addEventListener("backbutton", this.exitHandler, false);
        }

        this.firstTime = Utils.GlobalSettings.firstTime;
        if (this.firstTime) {
            this.tutorialText = this.game.add.bitmapText(0, Utils.GlobalSettings.height / 2 - 300, 'mecha', "", 20);
            Utils.GlobalSettings.firstTime = false;
            Utils.GlobalSettings.save();

            this.tutorialText.setText("Collect candy. Avoid Missiles. Survive!");
            this.tutorialText.updateTransform();
            this.tutorialText.position.x = Utils.GlobalSettings.width / 2 - this.tutorialText.textWidth / 2;
            this.tutorialText.alpha = 0;
            var tween = this.game.add.tween(this.tutorialText).to({ alpha: 1, y: Utils.GlobalSettings.height / 2 - 200 }, 5000, Phaser.Easing.Linear.Out)
                                                            .to({ alpha: 0 }, 5000, Phaser.Easing.Linear.Out);
            tween.start();
        }

        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN,
            Phaser.Keyboard.SPACEBAR
        ]);
    },

    unpause: function() {
        if (this.game.paused) {
            this.game.paused = false;
            this.pauseText.visible = false;
            this.pauseButton.setFrames(0, 0, 0);
        }

        this.game.input.onDown.removeAll();
        this.game.input.onDown.addOnce(this.unpause, this);
    },

    increaseScore: function () {
        this.score += 10;
        if (this.score > this.actualScore) {
            this.score = this.actualScore;
        }
        this.scoreText.setText('' + this.score);
    },

    launchMissile: function(x, y) {
        // // Get the first dead missile from the missileGroup
        var missile = this.missileGroup.getFirstDead();
        if (missile) {
            missile.SPEED = this.game.rnd.integerInRange(100, 500);//250; // missile speed pixels/second
            missile.TURN_RATE = missile.SPEED / 50; //5; // turn rate in degrees/frame

            // Revive the missile (set it's alive property to true)
            // You can also define a onRevived event handler in your explosion objects
            // to do stuff when they are revived.
            missile.revive();

            

            // Move the missile to the given coordinates
            missile.x = x;
            missile.y = y;
        }
        
        return missile;
    },

    getCandy: function () {
        var candy = this.candyGroup.getFirstDead();
        if (candy) {
            candy.revive();

            // Move the explosion to the given coordinates
            candy.x = this.game.rnd.integerInRange(64, Utils.GlobalSettings.width - 128);
            candy.y = this.game.rnd.integerInRange(64, Utils.GlobalSettings.height - 128);

            candy.setup();
        }

        // Return the explosion itself in case we want to do anything else with it
        return candy;
    },

    getExplosion: function(x, y) {
        // Get the first dead explosion from the explosionGroup
        var explosion = this.explosionGroup.getFirstDead();

        // If there aren't any available, create a new one
        if (explosion) {

            // Revive the explosion (set it's alive property to true)
            // You can also define a onRevived event handler in your explosion objects
            // to do stuff when they are revived.
            explosion.revive();

            // Move the explosion to the given coordinates
            explosion.x = x;
            explosion.y = y;

            // Set rotation of the explosion at random for a little variety
            explosion.angle = this.game.rnd.integerInRange(0, 360);
            explosion.tint = 0xff0000;
            // Play the animation
            explosion.animations.play('boom');
            if (!Utils.GlobalSettings.muted) {
                this.explosionSnd.play();
            }
        }

        // Return the explosion itself in case we want to do anything else with it
        return explosion;
    },

    doGameOver: function() {
        this.gameOver = true;
        Utils.GlobalSettings.timesPlayed++;

        this.missileGroup.forEachAlive(function (m) {
            m.kill();
            this.getExplosion(m.x, m.y);
        }, this);

        this.candyGroup.forEachAlive(function (c) {
            c.collect();
            this.getCollect(c.x, c.y);
        }, this);

        this.player.animations.stop();

        if (this.screenShake) {
            this.screenShake.shake(30);
        }
        var tween2 = this.game.add.tween(this.player).to({ y: Utils.GlobalSettings.height + 500, rotation: Math.PI * 10 }, 3000, Phaser.Easing.Sinusoidal.Out, true);

        this.gameoverImg.visible = true;
        this.gameoverImg.alpha = 0;
        var tween1 = this.game.add.tween(this.gameoverImg).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.Out, true);


        this.restartButton.visible = true;
        this.restartButton.scale.setTo(0);

        var restartTween = this.game.add.tween(this.restartButton.scale).to({ x: 1, y: 1 }, 1000, Phaser.Easing.Back.Out, true, 1000);
        var restartSpinTween = this.game.add.tween(this.restartButton).to({ angle: 360 }, 5000, Phaser.Easing.Linear.Out, true);
        restartSpinTween.loop();

        if (!Utils.GlobalSettings.muted) {
            this.deadSnd.play();
        }

        this.submitScore();
    },

    restartClick: function () {
        this.restartButton.events.onInputDown.removeAll();
        this.restartButton.events.onInputDown.addOnce(this.restartClick.bind(this));

        this.game.state.start('gamescreen');
    },

    getCollect: function (x, y) {
        // Get the first dead explosion from the explosionGroup
        var collect = this.collectGroup.getFirstDead();

        // If there aren't any available, create a new one
        if (collect) {

            // Revive the explosion (set it's alive property to true)
            // You can also define a onRevived event handler in your explosion objects
            // to do stuff when they are revived.
            collect.revive();

            // Move the explosion to the given coordinates
            collect.x = x;
            collect.y = y;

            // Set rotation of the explosion at random for a little variety
            collect.angle = this.game.rnd.integerInRange(0, 360);

            // Play the animation
            collect.animations.play('boom');
            if (!Utils.GlobalSettings.muted) {
                this.eatSnd.play();
            }
        }

        // Return the explosion itself in case we want to do anything else with it
        return collect;
    },
    
    submitScore: function () {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "http://www.gamepyong.com/firewords/php/firewords.php", true);
        var parameters = "action=score&nickname=" + Utils.GlobalSettings.lastNickname + "&score=" + this.actualScore;

        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var msg = xmlHttp.responseText;
                console.log('score submit');
            }
        }.bind(this);

        xmlHttp.ontimeout = function () {
        }.bind(this);

        xmlHttp.send(parameters);
    },
        
    exitClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
        }
        
        this.exitButton.events.onInputDown.removeAll();
        this.soundButton.events.onInputDown.removeAll();
        this.pauseButton.events.onInputDown.removeAll();
        this.exitButton.visible = false;
        this.soundButton.visible = false;

        this.game.state.start('mainmenu', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);

        return false;
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

    pauseClick: function () {
        if (!Utils.GlobalSettings.muted) {
            this.clickSnd.play();
        }

        this.pauseGame();

        this.pauseKey.onDown.removeAll();
        this.pauseKey.onDown.addOnce(this.pauseClick.bind(this), this);

        this.pauseButton.events.onInputDown.removeAll();
        this.pauseButton.events.onInputDown.addOnce(this.pauseClick.bind(this));
    },

    pauseGame: function() {
        if (!this.game.paused) {
            this.game.paused = true;
            this.pauseText.visible = true;
            this.pauseButton.setFrames(1, 1, 1);
        }
        else {
            this.unpause();
        }
    },

    handleLevel: function() {
        if (this.actualScore < 2000) {
            this.MAX_LEVEL_CANDY = 2;
            this.MAX_LEVEL_MISSILES = 2;
        }
        else
            if (this.actualScore < 5000) {
                this.MAX_LEVEL_CANDY = 3;
                this.MAX_LEVEL_MISSILES = 2;
            }
            else
                if (this.actualScore < 8000) {
                    this.MAX_LEVEL_CANDY = 3;
                    this.MAX_LEVEL_MISSILES = 3;
                }
                else
                    if (this.actualScore < 10000) {
                        this.MAX_LEVEL_CANDY = 4;
                        this.MAX_LEVEL_MISSILES = 3;
                    }
                    else
                        if (this.actualScore < 13000) {
                            this.MAX_LEVEL_CANDY = 4;
                            this.MAX_LEVEL_MISSILES = 4;
                        }
                        else
                            if (this.actualScore < 16000) {
                                this.MAX_LEVEL_CANDY = 5;
                                this.MAX_LEVEL_MISSILES = 4;
                            }
                            else
                                if (this.actualScore < 20000) {
                                    this.MAX_LEVEL_CANDY = 5;
                                    this.MAX_LEVEL_MISSILES = 5;
                                }
                                else
                                    if (this.actualScore < 24000) {
                                        this.MAX_LEVEL_CANDY = 5;
                                        this.MAX_LEVEL_MISSILES = 6;
                                    }
                                    else
                                        if (this.actualScore < 26000) {
                                            this.MAX_LEVEL_CANDY = 6;
                                            this.MAX_LEVEL_MISSILES = 6;
                                        }
                                        else
                                            if (this.actualScore < 30000) {
                                                this.MAX_LEVEL_CANDY = 7;
                                                this.MAX_LEVEL_MISSILES = 7;
                                            }
                                            else
                                                if (this.actualScore < 35000) {
                                                    this.MAX_LEVEL_CANDY = 7;
                                                    this.MAX_LEVEL_MISSILES = 8;
                                                }
                                                else
                                                    if (this.actualScore < 40000) {
                                                        this.MAX_LEVEL_CANDY = 8;
                                                        this.MAX_LEVEL_MISSILES = 9;
                                                    }
                                                    else
                                                        if (this.actualScore < 45000) {
                                                            this.MAX_LEVEL_CANDY = 9;
                                                            this.MAX_LEVEL_MISSILES = 10;
                                                        }
                                                        else
                                                            if (this.actualScore < 50000) {
                                                                this.MAX_LEVEL_CANDY = 10;
                                                                this.MAX_LEVEL_MISSILES = 11;
                                                            }
                                                            else
                                                                if (this.actualScore < 55000) {
                                                                    this.MAX_LEVEL_CANDY = 10;
                                                                    this.MAX_LEVEL_MISSILES = 12;
                                                                }
                                                                else
                                                                    if (this.actualScore < 60000) {
                                                                        this.MAX_LEVEL_CANDY = 10;
                                                                        this.MAX_LEVEL_MISSILES = 13;
                                                                    }
                                                                    else
                                                                        if (this.actualScore < 65000) {
                                                                            this.MAX_LEVEL_CANDY = 10;
                                                                            this.MAX_LEVEL_MISSILES = 14;
                                                                        }
                                                                        else
                                                                            if (this.actualScore < 70000) {
                                                                                this.MAX_LEVEL_CANDY = 10;
                                                                                this.MAX_LEVEL_MISSILES = 15;
                                                                            }
                                                                            else
                                                                                if (this.actualScore < 75000) {
                                                                                    this.MAX_LEVEL_CANDY = 10;
                                                                                    this.MAX_LEVEL_MISSILES = 16;
                                                                                }
                                                                                else
                                                                                    if (this.actualScore < 80000) {
                                                                                        this.MAX_LEVEL_CANDY = 10;
                                                                                        this.MAX_LEVEL_MISSILES = 17;
                                                                                    }
                                                                                    else
                                                                                        if (this.actualScore < 85000) {
                                                                                            this.MAX_LEVEL_CANDY = 10;
                                                                                            this.MAX_LEVEL_MISSILES = 18;
                                                                                        }
                                                                                        else
                                                                                            if (this.actualScore < 90000) {
                                                                                                this.MAX_LEVEL_CANDY = 10;
                                                                                                this.MAX_LEVEL_MISSILES = 19;
                                                                                            }
                                                                                            else {
                                                                                                this.MAX_LEVEL_CANDY = 10;
                                                                                                this.MAX_LEVEL_MISSILES = 20;
                                                                                            }
    },
        
    update: function () {
        //if (Utils.GlobalSettings.muted && !this.stopMusicOnLoad && this.game.cache.isSoundDecoded('bgm1')) {
        //    this.stopMusicOnLoad = true;
        //    Utils.BackgroundMusic.bgm1.pause();
        //}    

        if (this.gameOver) {
            return;
        }

        // If there are fewer than MAX_MISSILES, launch a new one
        if (this.missileGroup.countLiving() < this.MAX_LEVEL_MISSILES) {
            // Set the launch point to a random location below the bottom edge
            // of the stage
            this.launchMissile(this.game.rnd.integerInRange(50, Utils.GlobalSettings.width - 50),
                Utils.GlobalSettings.height + 50);
        }

        if (this.candyGroup.countLiving() < this.MAX_LEVEL_CANDY) {
            this.getCandy();
        }

        // If any missile is within a certain distance of the mouse pointer, blow it up
        this.missileGroup.forEachAlive(function (m) {
            if (!this.ghost) {
                var distance = this.game.math.distance(m.x, m.y,
                    this.game.input.activePointer.x, this.game.input.activePointer.y);
                if (distance < 50) {
                    m.kill();
                    if (this.screenShake) {
                        this.screenShake.shake(10);
                    }
                    this.getExplosion(m.x, m.y);
                    if (!this.invincible) {
                        this.life--;
                        this.lifeText.setText('x' + this.life);

                        if (this.life <= 0) {
                            this.doGameOver();
                        }
                    }
                    else {
                        this.actualScore += 200;
                        this.scoreBuffer = this.actualScore;
                        this.handleLevel();
                    }
                }
            }
        }, this);

        this.candyGroup.forEachAlive(function (c) {
            var distance = this.game.math.distance(c.x, c.y,
                this.game.input.activePointer.x, this.game.input.activePointer.y);
            if (distance < 50) {

                if (c.frame === 76) {
                    this.ghost = true;
                    this.ghostTimer = 0;
                    if (!Utils.GlobalSettings.muted) {
                        this.lifeSnd.play();
                    }

                    this.ghostImg.visible = true;
                    this.ghostImg.alpha = 1;
                    this.ghostImg.scale.set(0);
                    var tween0 = this.game.add.tween(this.ghostImg.scale).to({ x: 3, y: 3 }, 3000, Phaser.Easing.Linear.Out, true);
                    var tween1 = this.game.add.tween(this.ghostImg).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.Out, true);
                    this.pause = true;
                    this.pauseTimer = 0;
                }
                else
                if (c.frame === 77) {
                    if (!this.slomo) {
                        this.missileGroup.forEachAlive(function (m) {
                            m.doSloMo();
                        }, this);
                    }

                    this.slomo = true;
                    this.slomoTimer = 0;
                    if (!Utils.GlobalSettings.muted) {
                        this.lifeSnd.play();
                    }

                    this.slomoImg.visible = true;
                    this.slomoImg.alpha = 1;
                    this.slomoImg.scale.set(0);
                    var tween0 = this.game.add.tween(this.slomoImg.scale).to({ x: 3, y: 3 }, 3000, Phaser.Easing.Linear.Out, true);
                    var tween1 = this.game.add.tween(this.slomoImg).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.Out, true);
                    this.pause = true;
                    this.pauseTimer = 0;
                }
                else
                if (c.frame === 78) {
                    this.invincible = true;
                    this.invincibilityTimer = 0;
                    if (!Utils.GlobalSettings.muted) {
                        this.invincibleSnd.play();
                    }

                    this.invincibleImg.visible = true;
                    this.invincibleImg.alpha = 1;
                    this.invincibleImg.scale.set(0);
                    var tween0 = this.game.add.tween(this.invincibleImg.scale).to({ x: 3, y: 3 }, 3000, Phaser.Easing.Linear.Out, true);
                    var tween1 = this.game.add.tween(this.invincibleImg).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.Out, true);
                    this.pause = true;
                    this.pauseTimer = 0;
                }
                else
                    if (c.frame === 79) {
                        this.life++;
                        this.lifeText.setText('x' + this.life);
                        if (!Utils.GlobalSettings.muted) {
                            this.lifeSnd.play();
                        }

                        this.lifeupImg.visible = true;
                        this.lifeupImg.alpha = 1;
                        this.lifeupImg.scale.set(0);
                        var tween0 = this.game.add.tween(this.lifeupImg.scale).to({ x: 3, y: 3 }, 3000, Phaser.Easing.Linear.Out, true);
                        var tween1 = this.game.add.tween(this.lifeupImg).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.Out, true);
                        this.pause = true;
                        this.pauseTimer = 0;
                    }

                c.collect();
                this.getCollect(c.x, c.y);
                this.actualScore += 100;
                this.scoreBuffer = this.actualScore;
                this.handleLevel();
            }
        }, this);

        var prevX = this.player.x;

        this.player.x = this.game.input.activePointer.x;
        this.player.y = this.game.input.activePointer.y;

        //if (!this.game.input.activePointer.withinGame && !this.game.paused) {
        //    this.pauseGame();
        //}

        if (this.player.x > prevX) {
            this.player.scale.x = -1;
        }
        if (this.player.x < prevX) {
            this.player.scale.x = 1;
        }
        else {
            this.player.scale.x = this.player.scale.x;
        }

        if (this.scoreBuffer > 0) {
            this.increaseScore();
            this.scoreBuffer -= 10;
            if (this.scoreBuffer < 0) {
                this.scoreBuffer = 0;
            }
        }

        if (this.invincible) {
            this.player.tint = 0xff0000;
            this.lifeSprite.tint = 0xff0000;
            this.invincibilityTimer++;
            if (this.invincibilityTimer % 10 === 0) {
                this.player.tint = 0x00ff00;
                this.lifeSprite.tint = 0x00ff00;
            }

            if (this.invincibilityTimer > 450 && this.invincibilityTimer % 5 === 0) {
                this.player.tint = 0xffffff;
                this.lifeSprite.tint = 0xffffff;
            }

            if (this.invincibilityTimer > 500) {
                this.invincibilityTimer = 0;
                this.invincible = false;
                this.player.tint = 0xffffff;
                this.lifeSprite.tint = 0xffffff;
                if (!Utils.GlobalSettings.muted) {
                    this.invincibleDoneSnd.play();
                }
            }
        }

        if (this.slomo) {
            this.slomoTimer++;

            if (this.slomoTimer > 500) {
                this.slomoTimer = 0;
                this.slomo = false;
                if (!Utils.GlobalSettings.muted) {
                    this.invincibleDoneSnd.play();
                }
                this.missileGroup.forEachAlive(function (m) {
                    m.endSloMo();
                }, this);
            }
        }

        if (this.ghost) {

            this.player.tint = 0x0000ff;
            this.lifeSprite.tint = 0x0000ff;
            this.ghostTimer++;
            if (this.ghostTimer % 10 === 0) {
                this.player.tint = 0xff00ff;
                this.lifeSprite.tint = 0xff00ff;
            }

            if (this.ghostTimer > 450 && this.ghostTimer % 5 === 0) {
                this.player.tint = 0xffffff;
                this.lifeSprite.tint = 0xffffff;
            }

            if (this.ghostTimer > 500) {
                this.ghostTimer = 0;
                this.ghost = false;
                this.player.tint = 0xffffff;
                this.lifeSprite.tint = 0xffffff;
                if (!Utils.GlobalSettings.muted) {
                    this.invincibleDoneSnd.play();
                }
            }
        }

        if (this.pause) {
            this.pauseTimer++;
            if (this.pauseTimer > 100) {
                this.pause = false;
                this.pauseTimer = 0;
            }
        }
    },

    //render: function () {
    //    this.game.debug.body(this.player);
    //    for (var i = 0; i < 10; i++) {
    //        this.game.debug.body(this.letterPool.getAt(i));
    //    }

    //    for (var i = 0; i < 10; i++) {
    //        this.game.debug.body(this.pickupPool.getAt(i));
    //    }
    //},

    shutdown: function () {
        Utils.GlobalSettings.save();

        if (navigator.isCocoonJS) {
            document.removeEventListener("backbutton", this.exitHandler, false);

            if (Utils.adManager.banner) {
                Utils.adManager.banner.hide();
            }
        }

        if (this.clickSnd) {
            this.clickSnd.stop();
            this.clickSnd.destroy();
            this.clickSnd = null;
        }
        
        if (this.soundButton) {
            this.soundButton.destroy();
            this.soundButton = null;
        }

        if (this.exitButton) {
            this.exitButton.destroy();
            this.exitButton = null;
        }

        if (this.screenShake) {
            this.screenShake.destroy();
            this.screenShake = null;
        }

        if (this.explosionSnd) {
            this.explosionSnd.stop();
            this.explosionSnd.destroy();
            this.explosionSnd = null;
        }

        if (this.invincibleDoneSnd) {
            this.invincibleDoneSnd.stop();
            this.invincibleDoneSnd.destroy();
            this.invincibleDoneSnd = null;
        }

        if (this.lifeSnd) {
            this.lifeSnd.stop();
            this.lifeSnd.destroy();
            this.lifeSnd = null;
        }

        if (this.invincibleSnd) {
            this.invincibleSnd.stop();
            this.invincibleSnd.destroy();
            this.invincibleSnd = null;
        }

        if (this.deadSnd) {
            this.deadSnd.stop();
            this.deadSnd.destroy();
            this.deadSnd = null;
        }

        if (this.eatSnd) {
            this.eatSnd.stop();
            this.eatSnd.destroy();
            this.eatSnd = null;
        }

        if (this.bg) {
            this.bg.destroy();
            this.bg = null;
        }

        if (this.scoreText) {
            this.scoreText.destroy();
            this.scoreText = null;
        }

        if (this.lifeSprite) {
            this.lifeSprite.destroy();
            this.lifeSprite = null;
        }

        if (this.lifeText) {
            this.lifeText.destroy();
            this.lifeText = null;
        }

        if (this.candyGroup) {
            this.candyGroup.destroy();
            this.candyGroup = null;
        }

        if (this.missileGroup) {
            this.missileGroup.destroy();
            this.missileGroup = null;
        }

        if (this.player) {
            this.player.destroy();
            this.player = null;
        }

        if (this.explosionGroup) {
            this.explosionGroup.destroy();
            this.explosionGroup = null;
        }

        if (this.collectGroup) {
            this.collectGroup.destroy();
            this.collectGroup = null;
        }

        if (this.gameoverImg) {
            this.gameoverImg.destroy();
            this.gameoverImg = null;
        }

        if (this.invincibleImg) {
            this.invincibleImg.destroy();
            this.invincibleImg = null;
        }

        if (this.lifeupImg) {
            this.lifeupImg.destroy();
            this.lifeupImg = null;
        }

        if (this.slomoImg) {
            this.slomoImg.destroy();
            this.slomoImg = null;
        }

        if (this.ghostImg) {
            this.ghostImg.destroy();
            this.ghostImg = null;
        }

        if (this.restartButton) {
            this.restartButton.destroy();
            this.restartButton = null;
        }

        if (this.tutorialText) {
            this.tutorialText.destroy();
            this.tutorialText = null;
        }

        if (this.pauseButton) {
            this.pauseButton.destroy();
            this.pauseButton = null;
        }
        
        this.pauseKey = null;

        if (this.pauseText) {
            this.pauseText.destroy();
            this.pauseText = null;
        }
                
        Utils.GlobalSettings.fromScreen = 'gamescreen';
                
        console.log('destroy gamescreen');
    }
};