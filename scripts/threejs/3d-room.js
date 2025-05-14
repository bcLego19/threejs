// Import the Three.js library
import * as THREE from 'three';

// 1. Initialize the Three.js Environment
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );

const threeCanvas = document.querySelector("#threejs-canvas");
threeCanvas.appendChild( renderer.domElement );

// 2. Create the Room
var roomWidth = 10;
var roomHeight = 5;
var roomDepth = 10;
var wallThickness = 0.1;

var floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

var backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
var wallMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
var backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
backWall.position.z = -roomDepth / 2;
backWall.position.y = roomHeight / 2;
scene.add(backWall);

var frontWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
var frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
frontWall.position.z = roomDepth / 2;
frontWall.position.y = roomHeight / 2;
scene.add(frontWall);

var leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
var leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -roomWidth / 2;
leftWall.position.y = roomHeight / 2;
scene.add(leftWall);

var rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
var rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
rightWall.rotation.y = -Math.PI / 2;
rightWall.position.x = roomWidth / 2;
rightWall.position.y = roomHeight / 2;
scene.add(rightWall);

// 7, 8, 9. Create Geometries and Materials for the Squares
var squareSize = 2;
var squareGeometry = new THREE.PlaneGeometry(squareSize, squareSize);

var forestGreenMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22, side: THREE.DoubleSide });
var pumpkinOrangeMaterial = new THREE.MeshBasicMaterial({ color: 0xFF8C00, side: THREE.DoubleSide });
var crimsonMaterial = new THREE.MeshBasicMaterial({ color: 0xDC143C, side: THREE.DoubleSide });
var purpleMaterial = new THREE.MeshBasicMaterial({ color: 0x800080, side: THREE.DoubleSide });

var greenSquare = new THREE.Mesh(squareGeometry, forestGreenMaterial);
var orangeSquare = new THREE.Mesh(squareGeometry, pumpkinOrangeMaterial);
var crimsonSquare = new THREE.Mesh(squareGeometry, crimsonMaterial);
var purpleSquare = new THREE.Mesh(squareGeometry, purpleMaterial);

// 10. Position the Colored Squares on the Walls
greenSquare.position.z = -roomDepth / 2 + 0.1;
greenSquare.position.y = roomHeight / 2;
greenSquare.position.x = -roomWidth / 4;
scene.add(greenSquare);

orangeSquare.position.z = roomDepth / 2 - 0.1;
orangeSquare.position.y = roomHeight / 2;
orangeSquare.position.x = roomWidth / 4;
scene.add(orangeSquare);

crimsonSquare.rotation.y = Math.PI / 2;
crimsonSquare.position.x = -roomWidth / 2 + 0.1;
crimsonSquare.position.y = roomHeight / 2;
crimsonSquare.position.z = roomDepth / 4;
scene.add(crimsonSquare);

purpleSquare.rotation.y = -Math.PI / 2;
purpleSquare.position.x = roomWidth / 2 - 0.1;
purpleSquare.position.y = roomHeight / 2;
purpleSquare.position.z = -roomDepth / 4;
scene.add(purpleSquare);

// 12. Position the Camera INSIDE the Room
camera.position.set(0, 2, 0);

// 13. Implement Player Movement AND Turning
var moveSpeed = 0.1;
var turnSpeed = 0.05;
var moveForward = false;
var moveBackward = false;
var turnLeft = false;
var turnRight = false;

document.addEventListener('keydown', function(event) {
    if (event.key === 'w') {
        moveForward = true;
    } else if (event.key === 's') {
        moveBackward = true;
    } else if (event.key === 'a') {
        turnLeft = true;
    } else if (event.key === 'd') {
        turnRight = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'w') {
        moveForward = false;
    } else if (event.key === 's') {
        moveBackward = false;
    } else if (event.key === 'a') {
        turnLeft = false;
    } else if (event.key === 'd') {
        turnRight = false;
    }
});

// 14. Game Loop (Animation Loop) with Collision Detection
function animate() {
    requestAnimationFrame(animate);

    // Handle turning
    if (turnLeft) {
        camera.rotation.y += turnSpeed;
    }
    if (turnRight) {
        camera.rotation.y -= turnSpeed;
    }

    // Calculate the intended new position
    var direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.normalize();
    var newPosition = new THREE.Vector3();
    newPosition.copy(camera.position);

    if (moveForward) {
        newPosition.add(direction.clone().multiplyScalar(moveSpeed));
    }
    if (moveBackward) {
        newPosition.sub(direction.clone().multiplyScalar(moveSpeed));
    }

    // --- COLLISION DETECTION ---
    var halfWidth = roomWidth / 2;
    var halfDepth = roomDepth / 2;

    // Check for collision with the walls (using room boundaries)
    if (newPosition.x > halfWidth) {
        newPosition.x = halfWidth;
    }
    if (newPosition.x < -halfWidth) {
        newPosition.x = -halfWidth;
    }
    if (newPosition.z > halfDepth) {
        newPosition.z = halfDepth;
    }
    if (newPosition.z < -halfDepth) {
        newPosition.z = -halfDepth;
    }

    // Update the camera's position only after collision checks
    camera.position.copy(newPosition);

    renderer.render(scene, camera);
}

animate();

// 15. Handle Window Resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);