
var gamecore = function gamecore () {

    // public
    this.player1;
    this.serverfps;

    // private
    var client_smooth = 8;
    var client_time = 0;
    var destpos = 0;
    var game_id = 0;
    var host = 0;
    var next_point = 0;
    var player2 = 0;
    var point = 0;
    var player_id = 0;
    var pldata = 0;
    var previous = 0;
    var other_past_pos = new THREE.Vector3();
    var other_target_pos = new THREE.Vector3();
    var server_time = 0;
    var serverfps = 0;
    var target = 0;
    var socket = 0;

    // Array of inputs from the server
    var server_updates = [];
    var net_offset = 0.1;
    // allocate x, y and z positons to the buffer size.
    var buffer_size = 3;      

    return {

    	start: function (  ) {

    		socket = io('http://localhost:9001');
        // received from sever when starting the new game
        socket.on('gamestart', this.ongamestart.bind( this ) );
        // Each time the server updates this event fires
        socket.on('onserverupdate', this.client_onserverupdate_received.bind( this ) );

        // initialise public variables
        this.player1 = 0;
    			
    	},
      ongamestart: function ( data ) {

        // store player game data for future server submissions
        player_id = data.player_id;
        game_id = data.game_id;
        if(data.host){
          host = 1;
          this.player1 = y_sphere;
          player2 = g_sphere;
        }
        else { 
          this.player1 = g_sphere;
          player2 = y_sphere;
        }

      },
      client_onserverupdate_received: function ( data ) {

        data.vals.pldata = new Float32Array( data.vals.pldata );
        server_time = data.t;
        serverfps = Math.floor(1 / data.fps); 
        this.serverfps = serverfps;
        // offset the client time according to the server time 
        client_time = server_time - net_offset;
        // keep the inputs at array length 60
        server_updates.push( data );
        if ( server_updates.length >= ( 60 )) {
          server_updates.splice(0, 1);
        }
      },
      client_handle_input: function( ply1pos ) {

        pldata = new Float32Array( 3 );
        pldata[0]  = ply1pos.x;
        pldata[1]  = ply1pos.y;
        pldata[2]  = ply1pos.z;
        var dataarr = [ pldata.buffer, player_id, game_id ];
        socket.emit( 'setGameData', dataarr );

      },
      client_process_net_updates: function() {
        // No updates...
        if (! server_updates.length) { return; }


        // Find the position in the timeline of updates we stored.
          // this.current_time = this.client_time
          // , this.plyudcount = this.server_updates.length - 1
          // , this.udtarget = null
          // , this.udprevious = null


        for ( var i = 0; i < server_updates.length; i++ ) {
          //

          point = server_updates[i];
          next_point = server_updates[i + 1];

          // Compare our point in time with the server times we have
          if ( client_time > point.t && client_time < next_point.t ) {
            target = next_point
            previous = point
            break
          }
        }
        // With no target we store the last known server position and move to that instead
        if (! target) {
          target = server_updates[0]
          previous = server_updates[0]
        }

        // create a time percentage to use for linear interpolation (lerp)
        target_time = target.t
        var difference = target_time - client_time;
        var max_difference = ( target.t - previous.t);
        var time_point = (difference / max_difference);


        // set player 2 positions from target and previous vectors
        other_target_pos.set( target.vals.pldata[0],  target.vals.pldata[1],  target.vals.pldata[2] );
        other_past_pos.set( previous.vals.pldata[0], previous.vals.pldata[1], previous.vals.pldata[2] ); 

        // now lerp between the target and previous positions based on the time percentage
        destpos  = this.v_lerp( other_past_pos, other_target_pos, time_point );

        if ( client_smooth ) {
          //apply smoothing from current pos to the new destination pos
          var tempPosition = this.v_lerp( player2.position, destpos, pdt * client_smooth);
          player2.position.set( tempPosition.x, tempPosition.y, tempPosition.z );
        }
        else {
           player2.position.set ( destpos.x, destpos.y, destpos.z );
        }

      },
    	v_lerp: function ( v, tv, t ) {
			return { x:this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t), z:this.lerp(v.z, tv.z, t) } 
		  },
      lerp: function(p, n, t) { 
        var _t = Number(t); 
        _t = (Math.max(0, Math.min(1, _t))); 
        return (p * (1 - _t) + n * _t);
      }

    }
}
