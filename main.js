const cstSpace = 20;
const appWidth = 800;
const appHeight = 600;

var player;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var firingTimer = 0;
var stateText;
var coinArray = [];
var timeBuffArray = [];
var timeDebuffArray = [];

var counters = [];
var text = [];
var timerEvents = [];
var liveTimerEvents = {};

var buttonReset;
var buttonBall;

var scriptIterator = {
    ptrScript: 0, scripts: [],
    readNextScript: function() {
        this.ptrScript >= (this.scripts).length - 1 ? 
                this.ptrScript = 0 : this.ptrScript++;
        try {
            this.scripts[this.ptrScript]();
        } catch (err) {
            console.log(err);
            console.log(`this.script: ${this.scripts}, 
                        this.ptrScript: ${this.ptrScript},
                        (this.scripts).length: ${(this.scripts).length},
                        ${(this.ptrScript == (this.scripts).length)}`);
        }

    }
};

var debugString;
var debugText;
var debugLog;

/**
 * Main Entry
 * 
 */
var game = new Phaser.Game(800, 600, Phaser.AUTO);

game.state.add('state1', state.state1);
game.state.start('state1');


/**
 * Support Functions
 */

function roundStart() {

    //coins
    createCoins(10, {
        x: 80,
        y: 0
    });
    createCoins(5, {
        x: 200,
        y: 0
    });
}

/**
 * Create new Coin Chunk.
 * @param {Number} num - The number of coins.
 * @param {Object: {x: Number, y: number}} position 
 *      - The x, y position. e.g.: {x: 0, y: 0} is the upper left conner
 */
function createCoins(num, position) {

    const coins = game.add.group();

    coinArray.push(coins);

    coins.enableBody = true;
    coins.physicsBodyType = Phaser.Physics.ARCADE;
    for (var i = 0; i < num; i++) {
        var coin = coins.create(
            position.x + i * 20,
            position.y + cstSpace, 'coin', 0);
        coin.body.setCircle(5);
        coin.body.velocity.y = 200;
    }

    // Add animation and play
    coins.callAll(
        'animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5], 10, true);
    coins.callAll('animations.play', 'animations', 'spin');

    return coins;

}

/**
 * Create new time item.
 * @param {Object: {x: Number, y: number}} position 
 *      - The x, y position. e.g.: {x: 0, y: 0} is the upper left conner
 * 
 */
function createTimeBuff(position) {

    const item = game.add.sprite(position.x, position.y, 'timeBuff');
    timeBuffArray.push(item);
    game.physics.enable(item, Phaser.Physics.ARCADE);
    item.body.setCircle(5);
    item.body.velocity.y = 200;
    console.log(item)
    return item;
}

/**
 * Create new time item.
 * @param {Number} time - time to be modified.
 * @param {Object: {x: Number, y: number}} position 
 *      - The x, y position. e.g.: {x: 0, y: 0} is the upper left conner
 * 
 */
function createTimeDebuff(position) {

    const item = game.add.sprite(position.x, position.y, 'timeDebuff');
    timeDebuffArray.push(item);
    game.physics.enable(item, Phaser.Physics.ARCADE);
    item.body.setCircle(5);
    item.body.velocity.y = 200;
    return item;
}

function itemCleaner() {

    // clean coins
    for (var index in coinArray) {
        // traversal coin for COLLECT, DESTROY
        var coins = coinArray[index];
        var flag = false;
        game.physics.arcade.overlap(
            player, coins,
            coinHitsPlayer,
            () => { coins.children.length ? null : flag = true }, this);

        coins.forEach((coin) => {
            if (coin.y < 0 || coin.y > game.world.height) {
                coin.destroy();
                flag = true;
            }
        });
        if (flag == true) {
            coinArray.splice(index, 1);
            console.log("remove coins");
        }
    }

    // clean time items 
    for (var index in timeBuffArray) {
        // traversal coin for COLLECT, DESTROY
        var item = timeBuffArray[index];
        var flag = false;
        game.physics.arcade.overlap(
            player, item, 
            timeBuffHitsPlayer,
            () => { flag = true }, this);

        if (item.y < 0 || item.y > game.world.height) {
            item.destroy();
            flag = true;   
        }

        flag ? timeBuffArray.splice(index, 1) : null;
    }

    for (var index in timeDebuffArray) {
        // traversal coin for COLLECT, DESTROY
        var item = timeDebuffArray[index];
        var flag = false;
        game.physics.arcade.overlap(
            player, item,
            timeDebuffHitsPlayer,
            () => {
                flag = true
            }, this);

        if (item.y < 0 || item.y > game.world.height) {
            item.destroy();
            flag = true;
        }

        flag ? timeDebuffArray.splice(index, 1) : null;
    }

    function timeDebuffHitsPlayer(player, item) {
        item.kill();
        liveTimerEvents.liveTime > 5000 ?
            liveTimerEvents.liveTime -= 5000 : liveTimerEvents.liveTime = 100;
    }

    function timeBuffHitsPlayer(player, item) {
        item.kill();
        liveTimerEvents.liveTime < 25000 ? 
            liveTimerEvents.liveTime += 5000 : liveTimerEvents.liveTime = 30000;
    }

    function coinHitsPlayer(player, coin) {
        coin.kill();
        //  Increase the score
        score += 20;
        scoreText.text = scoreString + score;
    }
}


function restart(button, pointer, isOver) {

    //  In this example if the Pointer is no longer over the Button, then we'll treat it
    //  as if the user cancelled the operation and didn't want to press the Button after all
    game.state.start('state1');
    debugLog = "just press on Reset".toUpperCase();
}

/**
 * Change game state
 * @param {Number} i - Event Object.
 * @param {Number} stateNum - e.g.: 1, 2, 3, ...
 */
function changeState(i, stateNum) {
    game.state.start('state' + stateNum);
}

/**
 * Call this function in each state 
 *  to load all global key event listeners.   
 */
function loadEventListeners() {
    addKeyCallback(Phaser.Keyboard.ONE, changeState, 1);
}

function addKeyCallback(key, fn, args) {
    game.input.keyboard.addKey(key).onDown.add(fn, null, null, args);
}

/**
 * Call this function to load counter
 */
function loadCounters() {
    
    // set up timer for reading the script
    game.time.events.repeat(1000, 30, (() => {
        scriptIterator.readNextScript();
    }), this);

    createTimer(0, 1000, true);
    createLiveTimer();
} 

function createLiveTimer() {
    liveTimerEvents.liveTime = 30000;
    liveTimerText = game.add.text(game.world.centerX + 150, 120, 'Live still: 0.0', {
        font: "32px Arial",
        fill: "#ffffff",
        align: "center"
    });
    
    liveTimerEvents.liveClockTimer = 
        game.time.events.loop(100, (() => {
            liveTimerEvents.liveTime ? liveTimerEvents.liveTime -= 100 : null;
            liveTimerText.setText("Live still: " + liveTimeInFormat());
        }), this);

    function liveTimeInFormat(){ return (liveTimerEvents.liveTime / 1000).toFixed(1) };
}

/**
 * create a local new timer, /ms
 * @param {Number} time - init time
 * @param {Number} stateNum - tick speed, e.g.: 1000 -> 1s
 * @param {boolean} putOnScreen - Yes to put tracking text on screen
 */
function createTimer(time, speed, putOnScreen) {

    let i = counters.length;
    counters.push(time);
    timerEvents.push(game.time.events.loop(
        speed, updateCounter, this, i));

    if (putOnScreen) {
        text[i] = game.add.text(game.world.centerX + 150, 80 + (40 * i),
            'Counter ' + i + ' = 0', {
                font: "32px Arial",
                fill: "#ffffff",
                align: "center"
            });
    }
}

function updateCounter(idx) {

    counters[idx]++;
    text[idx].setText('Counter ' + idx + ' = ' + counters[idx]);
}

function controllerFunc() {
    if (player.alive) {
        // check for movement keys
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown && player.x > cstSpace) {
            player.body.velocity.x = -200;
        } else if (cursors.right.isDown &&
            player.x < game.world.width - cstSpace) {
            player.body.velocity.x = 200;
        }
        if (player.x < cstSpace){
            player.x = cstSpace;
        } else if (player.x > game.world.width - cstSpace) {
            player.x = game.world.width - cstSpace;
        } else if (buttonBall.x < 260) { // origin: 260 320 385 450 510
            buttonBall.x = 259;
            player.body.velocity.x = -400;
        } else if (buttonBall.x >= 260 && buttonBall.x < 320) {
            buttonBall.x = 319;
            player.body.velocity.x = -200;
        } else if (buttonBall.x >= 320 && buttonBall.x < 450) {
            buttonBall.x = 385;
        } else if (buttonBall.x >= 450 && buttonBall.x < 510) {
            buttonBall.x = 450;
            player.body.velocity.x = 200;
        } else { 
            buttonBall.x = 510;
            player.body.velocity.x = 400;
        }


    }
}