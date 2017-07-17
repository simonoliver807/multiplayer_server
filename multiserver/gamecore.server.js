


  var game_core = function(game_instance, client, levels) {

    // this.x = 1;
    // this.y = 0;
    this.il = 0;

    this.game_id = game_instance.game_id;
    this.clients = {};
    this.clients['player1'] = client;

    // Full stack of the connected clients/players.
    this.player_manifest = {};
    this.player_client;

    // Set up some physics integration values
    this._pdt  = 0.0001;            //The physics update delta time
    this.pdtfps = [];
    this._pdte = new Date().getTime();   //The physics update last delta time
    // A local timer for precision on server and client
    this.local_time = 0.016;            //The local timer
    this._dt  = new Date().getTime();    //The local timer delta
    this._dte = new Date().getTime();    //The local timer last frame time

    this._sdt = new Date().getTime();
    this._sdte = new Date().getTime();

    this.server_time = 0;
    this.laststate = {};
    this.pldata = {};
    this.fsdata;
   
    this.player_manifest[ game_instance.player1 ] = { position: { x: 0, y: 0, z: 0 }, inputs: [], name: 'player1' };

    this.id1 = game_instance.player1;
    this.id2 = 0;
    this.currpos = [];

    this.packet;
    this.pl;


   
     // Start a fast paced timer for measuring time easier
     this.create_timer()
     // Start the game update timer
     setInterval(function() {
        this._pdt  = (new Date().getTime() - this._pdte) / 1000.0;
        this.pdtfps.push( this._pdt );
        this._pdte = new Date().getTime();
        this.update_player();
      }.bind(this), 16)
  }



  game_core.prototype.update_player = function() {

    for ( let id in this.player_manifest) {

      if( this.player_manifest[id].inputs.length ) { 

       
          this.player_manifest[id].position.x = this.player_manifest[id].inputs[0].pos[0]
          this.player_manifest[id].position.y = this.player_manifest[id].inputs[0].pos[1]
          this.player_manifest[id].position.z = this.player_manifest[id].inputs[0].pos[2];

      }
      // clear buffer
      this.player_manifest[id].inputs = [];

    }
  }


  game_core.prototype.server_update = function() {

    var t = new Date().getTime(); 
    this.dt = (t - this.lastframetime) / 1000.0 ;

    // Store the last frame time
    this.lastframetime = t

    // Update the state of our local clock to match the timer
    this.server_time = this.local_time


     var packet = this.server_prepare_update();
     this.server_transmit_update(packet);

  }

  

  game_core.prototype.server_prepare_update = function() {

    this.packet = {};

    this.pl = 0;
    //this.shouldEmit1 = this.shouldEmit2 = 2;


    for (var id in this.player_manifest) {

      this.pldata[id] = new Float32Array( 3 );


      try {

        this.pldata[id][0] = this.player_manifest[id].position.x;
        this.pldata[id][1] = this.player_manifest[id].position.y;
        this.pldata[id][2] = this.player_manifest[id].position.z;

      }
      catch (err) {
        console.log(err)
        debugger
      }

    }

    this.packet[this.id1] = {
      pldata: this.pldata[ this.id1 ].buffer,
      playerid: this.id1,
    }
    if ( this.id2 ) {
      this.packet[this.id2] = {
        pldata: this.pldata[ this.id2 ].buffer,
        playerid: this.id2,
      }
    }
    return this.packet
  }

  //

  game_core.prototype.server_transmit_update = function(packet) {

    var x = 0;
    var i = this.pdtfps.length;
    var fps = 0;
    while(i--) {
      fps += this.pdtfps[i];
    }
    // send the fps down to server because it should be running at 60fps like the client
    fps = fps/this.pdtfps.length;

    for ( let id in this.player_manifest) {
      this.last_state = {
        gid: this.game_id,
        vals: packet[id],
        t:    this.server_time,
        fps: fps
      }
      if( this.clients.player2 ) {
        if( id == this.clients.player1.id ){
          this.clients['player2'].emit('onserverupdate', this.last_state );
        }
        if( id == this.clients.player2.id ){
          this.clients['player1'].emit('onserverupdate', this.last_state ); 
        }
      }
      }
     this.pdtfps = [];

  }

  game_core.prototype.create_timer = function() {
    setInterval(function() {
      this._dt  = new Date().getTime() - this._dte
      this._dte = new Date().getTime()
      this.local_time += this._dt / 1000.0
    }.bind(this), 4)
  }


  game_core.prototype.player_connect = function( game, client ) {


      this.clients['player2'] = client;
      // add new player to storage.
      this.player_manifest[ game.player2 ] = { position: { x: 0, y: 0, z: 0 }, inputs: [], name: 'player2' };
      this.id2 = game.player2;

      // start the server creating and sending packets to both the clients
      setInterval( function() {
        this._sdt = (new Date().getTime() - this._sdte) / 1000.0;
        this._sdte = new Date().getTime(); 
        this.server_update();
      }.bind(this), 22)

      // this.pldata[game.player2] = new Float32Array( 8 );
  }


  game_core.prototype.player_disconnect = function( uuid ) {
    // someone quit the game, delete them from our list !
    delete this.player_manifest[uuid];
  }

  game_core.prototype.handle_server_input = function( input, ms1y, ms2y, drone, input_time, pl_uuid ) { 

    try {
      this.il = input.length;
      this.dronearr[pl_uuid] = [];
      // Store the input on the player instance for processing in the physics loop
      this.player_manifest[ pl_uuid ].inputs.push({ pos: [input[0],input[1],input[2]], time: input_time });

    }
    catch (err) {
      console.log(err);
    }
  }



module.exports = game_core









