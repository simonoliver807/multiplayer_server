// content of index.js
const http = require('http') 
const express = require('express')

const app = express();
const server = http.createServer( app )
const io = require( 'socket.io' )( server )
const uuidv1 = require('uuid/v1')
const game_server = require('./multiserver/game_server')
const gameserver = new game_server();


// change to live
const reload = require('reload')

app.set('port', process.env.PORT || 9001)
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')
app.use(express.static( __dirname + '/app'));

app.get('/', function (req, res) {

	res.render( 'index', { title: 'node multiplayer server'} );

})
// the first player to join will be assigned host
app.locals.host = 1;
let numberOfGame = 0;
let gameData = {};
io.on('connection', (client) => {
	
	if ( app.locals.host ) {
		gameData = { game_id: uuidv1()  ,player1: client.id, player2: 'player2' };
		// send the game id to the client
		client.emit('gamestart', { game_id: gameData.game_id, host: 1, player_id: client.id });
		gameserver.join_game( gameData, client );
		numberOfGame += 1;
	}
	if ( !app.locals.host ) {
		gameData.player2 = client.id;
		// send the game id to the client
		client.emit('gamestart', { game_id: gameData.game_id, host: 0, player_id: client.id });
		gameserver.join_game( gameData, client );
	}
	app.locals.host ? app.locals.host = 0 : app.locals.host = 1 ;

	// handle the game data sent by client
	client.on('setGameData', function ( data ) {
    	try {
    		gameserver.setGameData( data );
    	}
    	catch (err) {
    		console.log( err )
    	}
    });
})


reload(server, app)

server.listen( app.get( 'port' ), (err) => {  
  console.log( 'server is listening ' + app.get( 'port' ) )
})