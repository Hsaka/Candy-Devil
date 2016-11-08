Screen.Preloader = function (game) {
    this.game = game;
};

Screen.Preloader.prototype = {

    loaded: false,
    ready: false,

    preload: function () {
        this.loaderEmpty = this.game.add.sprite(0, 0, 'loaderEmpty');
        this.loaderEmpty.x = Utils.GlobalSettings.width / 2 - this.loaderEmpty.width / 2;
        this.loaderEmpty.y = Utils.GlobalSettings.height -150;
        this.loaderFull = this.game.add.sprite(0, 0, 'loaderFull');
        this.loaderFull.x = Utils.GlobalSettings.width / 2 - this.loaderFull.width / 2;
        this.loaderFull.y = Utils.GlobalSettings.height - 150;

        this.game.load.image('backing', 'assets/backing.png');
        this.game.load.image('bg', 'assets/bg.jpg');
        this.game.load.image('panel', 'assets/panel.png');
        this.game.load.image('rocket', 'assets/rocket.png');
        this.game.load.image('smoke', 'assets/smoke.png');
        this.game.load.image('gameover', 'assets/gameover.png');
        this.game.load.image('title', 'assets/title.png');
        this.game.load.image('invincibleimg', 'assets/invincible.png');
        this.game.load.image('lifeupimg', 'assets/lifeup.png');
        this.game.load.image('slomoimg', 'assets/slowmo.png');
        this.game.load.image('ghostimg', 'assets/ghost.png');
        this.game.load.image('comic1', 'assets/1.jpg');
        this.game.load.image('comic2', 'assets/2.jpg');
        this.game.load.image('comic3', 'assets/3.jpg');
        this.game.load.image('comic4', 'assets/4.jpg');
        this.game.load.image('comic5', 'assets/5.jpg');
        this.game.load.image('comic6', 'assets/6.jpg');

        this.game.load.spritesheet('collect', 'assets/explosionred01.png', 82, 82);
        this.game.load.spritesheet('explosion', 'assets/explosion.png', 128, 128);
        this.game.load.spritesheet('candy', 'assets/candy.png', 64, 64);
        this.game.load.spritesheet('player', 'assets/player.png', 100, 64);
        this.game.load.spritesheet('systembuttons', 'assets/systembuttons.png', 80, 84);
        this.game.load.spritesheet('letters', 'assets/letters.png', 64, 64);
        this.game.load.spritesheet('restart', 'assets/restart.png', 80, 80);
        this.game.load.spritesheet('play', 'assets/play.png', 80, 80);
        this.game.load.spritesheet('circle', 'assets/circle.png', 80, 80);
        this.game.load.spritesheet('circle2', 'assets/circle2.png', 60, 60);
        this.game.load.spritesheet('levelbuttonprops', 'assets/levelbuttonprops.png', 32, 25);

        this.game.load.atlas('atlas', 'assets/spritesheet.png', 'assets/sprites.json');
        
        this.game.load.audio('gp', ['assets/audio/gp.ogg']);
        this.game.load.audio('click', ['assets/audio/click.ogg']);
        this.game.load.audio('drip', ['assets/audio/drip.ogg']);
        this.game.load.audio('invincible', ['assets/audio/correct.ogg']);
        this.game.load.audio('wrong', ['assets/audio/wrong.ogg']);
        this.game.load.audio('coin', ['assets/audio/coin.ogg']);
        this.game.load.audio('flip2', ['assets/audio/bookFlip3.ogg']);
        this.game.load.audio('flip1', ['assets/audio/bookFlip2.ogg']);
        this.game.load.audio('explosion', ['assets/audio/explosion.ogg']);
        this.game.load.audio('dead', ['assets/audio/enemydead.ogg']);
        this.game.load.audio('life', ['assets/audio/buff.ogg']);
        this.game.load.audio('bgm', ['assets/audio/bgm.ogg']);
        

        this.game.load.bitmapFont('mecha', 'assets/fonts/mecha_0.png', 'assets/fonts/mecha' + (navigator.isCocoonJS ? '.json' : '.xml'));
        this.game.load.bitmapFont('arial', 'assets/fonts/arial_0.png', 'assets/fonts/arial' + (navigator.isCocoonJS ? '.json' : '.xml'));
        this.game.load.bitmapFont('fader', 'assets/fonts/fader_0.png', 'assets/fonts/fader' + (navigator.isCocoonJS ? '.json' : '.xml'));

        this.game.load.text('text', 'assets/text.json');

        this.game.load.onFileComplete.add(this.fileLoaded, this);
        
        this.game.load.setPreloadSprite(this.loaderFull);

        this.game.add.sprite(0, 0, '');
    },

    fileLoaded: function (progress, cacheID, success, filesLoaded, totalFiles) {
        if (filesLoaded === totalFiles && !this.loaded) {
            this.loaded = true;
        }
    },

    update: function () {
        if (!this.ready && this.loaded /*&& this.cache.isSoundDecoded('bgm1')*/) {
            this.ready = true;

            Utils.GlobalSettings.text = JSON.parse(this.game.cache.getText('text'));            
            Utils.BackgroundMusic.load(this.game);

            this.game.state.start('splashscreen', Phaser.Plugin.StateTransition.Out.SlideRight, Phaser.Plugin.StateTransition.In.SlideRight);
        }
    },

    shutdown: function () {
        if (this.loaderEmpty) {
            this.loaderEmpty.destroy();
            this.loaderEmpty = null;
        }

        if (this.loaderFull) {
            this.loaderFull.destroy();
            this.loaderFull = null;
        }
    }
};