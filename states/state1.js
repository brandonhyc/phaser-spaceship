var state = {};
state.state1 = function() {};
state.state1.prototype = {

    preload: function() {

        console.log("*************************" +
                 '\n' +   "loading: STATE1 " + '\n' + 
                    "*************************");
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

        loadEventListeners();

        game.stage.backgroundColor = '#6688ee';
        game.load.image('bullet', 'assets/images/bullet.png');
        game.load.image('timeBuff', 'assets/images/orb-green.png');
        game.load.image('timeDebuff', 'assets/images/orb-red.png');
        game.load.image('ship', 'assets/images/player.png');
        game.load.image('starfield', 'assets/images/starfield.png');
        game.load.image('background', 'assets/images/background2.png');
        game.load.image('controlBar', 'assets/images/dude.png');
        game.load.image('controlBall', 'assets/images/ball-tlb.png');
        game.load.spritesheet('coin', 'assets/images/coin.png', 32, 32);    
        game.load.spritesheet('button', 'assets/images/button_sprite_sheet.png', 193, 71);
        
    },


    create: function() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //  The scrolling starfield background

        starfield = game.add.tileSprite(0, 0, 800, 600, 'background');

        // buttons
        buttonRestart = game.add.button(game.world.centerX - 95, 50, 'button', restart, this, 2, 1, 0);
        buttonBar = game.add.sprite(255, 500, 'controlBar');
        buttonBall = game.add.sprite(380, 500, 'controlBall');
        buttonBall.inputEnabled = true;
        buttonBall.input.enableDrag();
        buttonBall.input.allowVerticalDrag = false;
        

        //  The hero!
        player = game.add.sprite(400, 450, 'ship');
        player.anchor.setTo(0.5, 0.5);
        player.scale.setTo(2.5, 2.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);

        debugString = 'debug: ';
        debugText = game.add.text(10, 50, debugString + debugLog, {
            font: '34px Arial',
            fill: '#fff'
        });


        //  The score
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

        //  Text
        stateText = game.add.text(game.world.centerX,game.world.centerY, ' ', { font: '84px Arial', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;

        //  And some controls to play the game with
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        
        let newScript = [
                    // 0~9s
            (() => { createCoins(5, {x: 20,y: 0}); 
                     }), 
                    // 10~19s
            (() => { createCoins(15, {x: 500,y: 0}); 
                     createTimeDebuff({x: 500, y: 250});}), 
                    // 20~29s
            (() => { createCoins(25, {x: 200,y: 0}); 
                     createTimeBuff({x: 540, y: 250});}), 
            (() => { createCoins(35, {x: 300,y: 0}); }), // 30~39s
            (() => { createCoins(5, {x: 120,y: 0}); }), // 40~49s
            (() => { createCoins(5, {x: 220,y: 0}); }), // 50~59s
            (() => { createCoins(5, {x: 320,y: 0}); }), // 60~69s
            (() => { createCoins(5, {x: 420,y: 0}); }), // 70~79s
            (() => { createCoins(5, {x: 520,y: 0}); }), // 80~89s
            (() => { createCoins(5, {x: 220,y: 0}); }), // 90~99s
        ];

        scriptIterator.scripts = newScript;

        loadCounters();
    },


    update: function() {

        //  Scroll the background
        // starfield.tilePosition.y += 2;
        liveTimerEvents.liveTime <= 0 ? player.kill() : null; 
        
        controllerFunc();
        itemCleaner();

    },

    render: function() {
        game.debug.text('debug: '+ debugLog, 280, 480);
    }

}

