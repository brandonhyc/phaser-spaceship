state.state2 = function() {};
state.state2.prototype = {
    preload: function () {
        console.log("loading: STATE2 ");
        
    },
    create: function () {
        game.stage.backgroundColor = '#111111';
    },
    updated: function() {}
}
