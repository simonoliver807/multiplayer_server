var renderer;
var scene;
var camera;
var y_sphere;
var g_sphere;
var player1 = 0;
var forward;
var backward;
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
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(10, 20, 20);
    spotLight.shadow.camera.near = 20;
    spotLight.shadow.camera.far = 10;
    spotLight.castShadow = true;
    scene.add(spotLight);
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

//init() gets executed once
function init() {

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
    // start the multiplayer server
    gamecore.start();

    document.body.appendChild(renderer.domElement);
    //render() gets called at end of init
    //as it looped forever
    render();
}

// render loop to update three.js
function render() {


    if ( forward ) {
        y_sphere.position.z += 0.5;
    }
    if ( backward ) {
        y_sphere.position.z -= 0.5;
    }
    if ( left ) {
        y_sphere.position.x -= 0.5;
    }
    if ( right ) {
        y_sphere.position.x += 0.5;
    }
    if ( down ) {
        y_sphere.position.y -= 0.5;
    }
    if ( up ) {
        y_sphere.position.y += 0.5;
    }

    // Set player 2 position from the server update. Everything should all be running at 60fps but depending on latency it may not be      
    gamecore.client_process_net_updates()
    // Now send out player 1 position to the server
    gamecore.client_handle_input( player1 );
    // And render
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

init();