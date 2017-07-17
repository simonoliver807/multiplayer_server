
var gamecore = function gamecore () {


    var player_id = 0;
    var game_id = 0;
    var host = 0;
    var player2 = 0;
    var server_time = 0;
    var serverfps = 0;
    var client_time = 0;
    var socket = 0;

    // this.ghostpos = new OIMO.Vec3();
    var destpos  = new THREE.Vector3();

    this.old_state = new THREE.Vector3();
    this.cur_state = new THREE.Vector3();
    this.state_time = new Date().getTime()

    // Array of inputs from the server
    var inputs = []
    var server_updates = [];
    var playerData = 0;
    var net_offset = 0.1;
    // allocate x, y and z to the buffer size.
    var buffer_size = 3;      

    return {

    	start: function (  ) {

    		socket = io('http://localhost:9001');
        // received from sever when starting the new game
        socket.on('gamestart', this.ongamestart() );
        // Each time the server updates this event fires
        socket.on('onserverupdate', this.client_onserverupdate_received() );
        

    			
    	},
      ongamestart: function ( data ) {

        // store player game data for future server submissions
        player_id = data.player_id;
        game_id = data.game_id;
        if(data.host){
          host = 1;
          player2 = g_sphere;
        }
        else { 
          player2 = y_sphere
        }

      },
      client_onserverupdate_received: function ( data ) {

        server_time = data.t;
        serverfps = Math.floor(1 / data.fps); 
        // offset the client time according to the server time 
        client_time = this.server_time - this.net_offset;
        // keep the inputs at array length 60
        server_updates.push( data );
        if ( server_updates.length >= (60 * this.buffer_size)) {
          server_updates.splice(0, 1);
        }
      },
      client_handle_input: function() {

        var a = 0;

      },
      client_process_net_updates: function() {
        // No updates...
        if (! server_updates.length) return


        // Find the position in the timeline of updates we stored.
          // this.current_time = this.client_time
          // , this.plyudcount = this.server_updates.length - 1
          // , this.udtarget = null
          // , this.udprevious = null


        for (var i=0; i< server_updates.length ; i++) {
          //

          this.point = server_updates[i]
          this.next_point = server_updates[i + 1]

          // Compare our point in time with the server times we have
          if (this.client_time > this.point.t && this.current_time < this.next_point.t ) {
            this.udtarget = this.next_point
            this.udprevious = this.point
            break
          }
        }
      },

      // With no target we store the last known
      // server position and move to that instead
      // if (! this.udtarget) {
      //   this.udtarget = this.server_updates[0]
      //   this.udprevious = this.server_updates[0]
      // }

      // // Now that we have a target and a previous destination,
      // // We can interpolate between them based on 'how far in between' we are.
      // // This is simple percentage maths, value/target = [0,1] range of numbers.
      // // lerp requires the 0,1 value to lerp to? thats the one.

      // if (this.udtarget && this.udprevious) {

      //   this.target_time = this.udtarget.t

      //   var difference = this.target_time - this.current_time;
      //   var max_difference = (this.udtarget.t - this.udprevious.t);
      //   var time_point = (difference / max_difference);

      //   // Because we use the same target and previous in extreme cases
      //   // It is possible to get incorrect values due to division by 0 difference
      //   // and such. This is a safe guard and should probably not be here. lol.
      //   // if (isNaN(time_point)) time_point = 0
      //   // if (time_point == -Infinity) time_point = 0
      //   // if (time_point == Infinity) time_point = 0


      //   // go update the drones and the ms
      //   this.updatedrones( this.udtarget.vals.pldata, this.udprevious, this.udtarget.t );
      //   this.updatems( this.udtarget );


      //   if ( this.udtarget.vals.playerid != this.player_self.id) {
      //     var id = this.udtarget.vals.playerid;


      //     // The other players positions in this timeline, behind us and in front of us
      //     var other_target_pos = (this.udtarget.vals) ? this.tvec3.set(this.udtarget.vals.pldata[0], this.udtarget.vals.pldata[1], this.udtarget.vals.pldata[2]) : new OIMO.Vec3();
      //     var other_past_pos = (this.udprevious.vals) ? this.pvec3.set(this.udprevious.vals.pldata[0], this.udprevious.vals.pldata[1],this.udprevious.vals.pldata[2] ) : other_target_pos;  //set to target if this guy is new

      //     this.ply2mesh.userData.tquat.set( this.udtarget.vals.pldata[3], this.udtarget.vals.pldata[4], this.udtarget.vals.pldata[5], this.udtarget.vals.pldata[6] );
      //     this.ply2mesh.userData.pquat.set( this.udprevious.vals.pldata[3], this.udprevious.vals.pldata[4], this.udprevious.vals.pldata[5], this.udprevious.vals.pldata[6] );  //set to target if this guy is new
      //     if( this.udtarget.vals.pldata[7] ){ this.ply2mesh.children[5].material.visible = true; }
      //     else { this.ply2mesh.children[5].material.visible = false; }

      //     //this.ply2mesh.userData.multiq.slerp( this.tquat, time_point );
      //     //this.ply2mesh.quaternion.slerp( this.tquat, time_point );

      //     if (this.player_set[id]) {
      //       // update the dest block, this is a simple lerp
      //       // to the target from the previous point in the server_updates buffer
      //       this.player_set[id].destpos  = this.v_lerp(other_past_pos, other_target_pos, time_point);
      //       // do the same for the quaternion
      //       this.ply2mesh.userData.tquat.slerp( this.ply2mesh.userData.pquat, time_point);
      //       this.ply2mesh.quaternion.set( this.ply2mesh.userData.tquat.x, this.ply2mesh.userData.tquat.y, this.ply2mesh.userData.tquat.z, this.ply2mesh.userData.tquat.w );

            
      //       //apply smoothing from current pos to the new destination pos
      //       if (this.client_smooth) {
      //       this.player_set[id].pos = this.v_lerp(this.player_set[id].pos, this.player_set[id].destpos, this.pdt * this.client_smooth);
      //        // this.player_set[id].pos = this.v_lerp(this.player_set[id].pos, this.player_set[id].destpos,  this.pdt );
      //         var subvec = new OIMO.Vec3();
      //         subvec.sub( this.ply2.body.position , this.player_set[id].pos );
      //         if ( (subvec.x > 0.01 || subvec.x < -0.01) || ( subvec.y >  0.01 || subvec.y < -0.01 ) || ( subvec.z >  0.01 || subvec.z < -0.01) ) {
      //           this.ply2.body.position.set( this.player_set[id].pos.x, this.player_set[id].pos.y, this.player_set[id].pos.z );
      //           this.ply2.body.sleepPosition.set( this.player_set[id].pos.x, this.player_set[id].pos.y, this.player_set[id].pos.z );
      //           this.ply2mesh.position.set( this.player_set[id].pos.x * 100, this.player_set[id].pos.y * 100, this.player_set[id].pos.z * 100 ); 
      //         }
      //         else { this.player_set[id].pos.x = this.ply2.body.position.x;
      //                this.player_set[id].pos.y = this.ply2.body.position.y;
      //                this.player_set[id].pos.z = this.ply2.body.position.z; 
      //              }
      //       }
      //       else {
      //         this.ply2.body.position.set( this.player_set[id].destpos.x, this.player_set[id].destpos.y, this.player_set[id].destpos.z );
      //       }
      //     }
      //   }
    	v_lerp: function ( v, tv, t ) {
			return { x:this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t), z:this.lerp(v.z, tv.z, t) } 
		  }

    }
}
