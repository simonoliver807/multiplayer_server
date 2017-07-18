var renderer;
var scene;
var camera;
var clientfps = [];
var y_sphere;
var g_sphere;
var forward;
var backward;
var lastframetime = 0;
var left;
var right;
var up;
var down;
var host;
var gamecore = new gamecore();

// event listeners to control spheres
window.addEventListener( 'keydown', handleKeyDown, false );
window.addEventListener( 'keyup', handleKeyUp, false );

// sphere controls
function handleKeyDown( event ) {

    event.preventDefault();
    if ( event.keyCode === 38 ){
        forward = 1;
    }
     if ( event.keyCode === 40 ){
        backward = 1;
    }
    if ( event.keyCode === 37 ){
        left = 1;
    }
    if ( event.keyCode === 39 ){
        right = 1;
    }
    if ( event.keyCode === 87 ){
        up = 1;
    }
    if ( event.keyCode === 83 ){
        down = 1;
    }

}
function handleKeyUp( event ) {

    event.preventDefault();
    if ( event.keyCode === 38 ){
        forward = 0;
    }
     if ( event.keyCode === 40 ){
        backward = 0;
    }
    if ( event.keyCode === 37 ){
        left = 0;
    }
    if ( event.keyCode === 39 ){
        right = 0;
    }
    if ( event.keyCode === 87 ){
        up = 0;
    }
    if ( event.keyCode === 83 ){
        down = 0;
    }

}


// set up all the three.js stuff camera, lights, shapes, plane 
function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1, 1000);
    camera.position.x = 15;
    camera.position.y = 260;
    camera.position.z = 13;
    camera.lookAt(scene.position);
}

function createLight() {
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 0, 1, 0 );
    directionalLight.shadow.camera.near = 20;
    directionalLight.shadow.camera.far = 10;
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

function createSphere( color ) {
    var sphereGeometry = new THREE.SphereGeometry(  2, 32, 32 ); //height width depth
    var sphereMaterial = new THREE.MeshLambertMaterial({
        color: color
    });
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    scene.add(sphere);
    return sphere;
}

function createPlane() {
    var planeGeometry = new THREE.PlaneGeometry(40, 40);
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: "blue"
    });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.y = -5;
    scene.add(plane);
}

function init() {

    // start the multiplayer server
    gamecore.start();
    scene = new THREE.Scene();
    
    createRenderer();
    createCamera();
    createLight();

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    y_sphere = createSphere( 'yellow' );
    y_sphere.position.set( 10, 0, 10 );
    g_sphere = createSphere( 'green' );
    g_sphere.position.set( -10, 0, -10 );

    createPlane();
    document.body.appendChild(renderer.domElement);
    render();
}

function render() {

    // update player positions when the data streams have started
    if ( gamecore.player1 ) {
        if ( forward ) {
            gamecore.player1.position.z += 0.5;
        }
        if ( backward ) {
            gamecore.player1.position.z -= 0.5;
        }
        if ( left ) {
            gamecore.player1.position.x -= 0.5;
        }
        if ( right ) {
            gamecore.player1.position.x += 0.5;
        }
        if ( down ) {
            gamecore.player1.position.y -= 0.5;
        }
        if ( up ) {
            gamecore.player1.position.y += 0.5;
        }

        // Set player 2 position from the server update.   
        gamecore.client_process_net_updates()
        // Now send out player 1 position to the server
        gamecore.client_handle_input( gamecore.player1.position );
    }
      // create a physics delta time and from that a client fps
      var t = new Date().getTime();
      pdt = lastframetime ? ((t - lastframetime) / 1000.0) : 0.016;
      lastframetime = t;
      clientfps.push( pdt );
      if ( clientfps.length > 100 ) {
        var avg_fps = clientfps.reduce( (a, b) => a + b, 0 )/100;
        avg_fps = 1 / avg_fps;
        document.getElementById('clientfps').innerHTML = 'client fps: ' + Math.round( avg_fps );
        document.getElementById('serverfps').innerHTML = 'server fps: ' + Math.round( gamecore.serverfps );
        clientfps = [];
      }

    // And render
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

init();