module.exports = exports = game_server;

// Import shared game library code.
var game_core = require('./gamecore.server.js')



function game_server ( levels ) {

    this.games = {};
    this.buff = 0;
    this.abuff = 0;
    this.pldata = 0;
    this.game_id = 0;
    this.pl_uuid = 0;

  }

  game_server.prototype.setGameData = function( data ) {


    this.buff = data[0];
    this.abuff = this.buff.buffer.slice( this.buff.byteOffset, this.buff.byteOffset + this.buff.byteLength );
    this.pldata = new Float32Array( this.abuff );

    this.pl_uuid = data[1];
    this.game_id = data[2];


    try {
      this.games[ this.game_id ].handle_server_input( this.pldata, this.pl_uuid );
    }
    catch (err) {
      console.log( err );
    }
  }


  game_server.prototype.join_game = function( gameData, client ) {

    if ( gameData.player2 != 'player2' ) {        
      this.games[ gameData.game_id ].player_connect(gameData, client)
    } 
    else {
        // create game
        console.log( 'Game start: '+ gameData.game_id );
        var gamecore = new game_core(gameData, client );
        this.games[ gameData.game_id ] = gamecore;
        this.games[ gameData.game_id ].server = client;
    }
  }







