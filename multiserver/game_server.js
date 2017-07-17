module.exports = exports = game_server;

// Import shared game library code.
var game_core = require('./gamecore.server.js')



function game_server ( levels ) {

    this.games = {};
    this.buff = 0;
    this.abuff = 0;
    this.pldata = 0;
    this.input_commands = 0;
    this.input_time = 0;
    this.gid = 0;
    this.pl_uuid = 0;

    this.droneCount = 0;
    this.tmpDronearr = [];
    this.droneExplnum = 0;

    // setInterval(function() {
    //   this._dt  = new Date().getTime() - this._dte
    //   this._dte = new Date().getTime()
    //   this.local_time += game_server._dt / 1000.0
    // }, 4)

  }

  game_server.prototype.setgd = function( data ) {


    this.buff = data[0];
    this.abuff = this.b.buffer.slice( this.b.byteOffset, this.b.byteOffset + this.b.byteLength );
    this.pldata = new Float32Array( this.abuff );
    
    this.input_commands = [];

    this.pl_uuid = data[1];
    this.gid = data[2];
    this.input_time = data[3];


    try {
      this.games[ this.gid ].handle_server_input( this.input_commands, this.plData, this.input_time, this.pl_uuid );
    }
    catch (err) {
      debugger
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







