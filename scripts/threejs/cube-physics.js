// Import the Three.js library
import * as THREE from 'three';

// Step 1: Initialize the Three.js Scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const threeCanvas = document.querySelector("#threejs-canvas");
threeCanvas.appendChild( renderer.domElement );

// Step 2: Create the Board
var boardWidth = 10;
var boardHeight = 0.1;
var boardDepth = 10;
var boardGeometry = new THREE.PlaneGeometry(boardWidth, boardDepth);
var boardMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
var board = new THREE.Mesh(boardGeometry, boardMaterial);
board.rotation.x = -Math.PI / 2;
scene.add(board);

// Step 3: Create the Walls
var wallHeight = 2;
var wallThickness = 0.2;
var wallMaterial = new THREE.MeshBasicMaterial({ color: 0x778899 });

var wall1Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, boardDepth);
var wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
wall1.position.x = boardWidth / 2 + wallThickness / 2;
wall1.position.y = wallHeight / 2;
scene.add(wall1);

var wall2Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, boardDepth);
var wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
wall2.position.x = -boardWidth / 2 - wallThickness / 2;
wall2.position.y = wallHeight / 2;
scene.add(wall2);

var wall3Geometry = new THREE.BoxGeometry(boardWidth + 2 * wallThickness, wallHeight, wallThickness);
var wall3 = new THREE.Mesh(wall3Geometry, wallMaterial);
wall3.position.z = boardDepth / 2 + wallThickness / 2;
wall3.position.y = wallHeight / 2;
scene.add(wall3);

var wall4Geometry = new THREE.BoxGeometry(boardWidth + 2 * wallThickness, wallHeight, wallThickness);
var wall4 = new THREE.Mesh(wall4Geometry, wallMaterial);
wall4.position.z = -boardDepth / 2 - wallThickness / 2;
wall4.position.y = wallHeight / 2;
scene.add(wall4);

// Step 4: Create the Initial 3D Objects (All Cubes)
var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var cubeMaterialRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
var cube1 = new THREE.Mesh(cubeGeometry, cubeMaterialRed);
cube1.position.set(-2, 1, 2);
scene.add(cube1);

var cubeMaterialGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube2 = new THREE.Mesh(cubeGeometry, cubeMaterialGreen);
cube2.position.set(0, 1, -2);
scene.add(cube2);

var cubeMaterialBlue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
var cube3 = new THREE.Mesh(cubeGeometry, cubeMaterialBlue);
cube3.position.set(3, 1, 0);
scene.add(cube3);

var movableObjects = [cube1, cube2, cube3];
var selectedObject = null;

// Step 6: Set up Camera Position
camera.position.set(3, 8, 4);
camera.lookAt(0, 0, 0);

// Step 7: Implement Object Picking (Raycasting)
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(movableObjects);

  if (intersects.length > 0) {
    selectedObject = intersects[0].object;
    console.log('Selected:', selectedObject.uuid);
  } else {
    selectedObject = null;
    console.log('Deselected');
  }
}

window.addEventListener('click', onMouseClick, false);

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    selectedObject = null;
    console.log('Deselected via Escape');
  }
});

// Step 8: Implement Forward/Backward/Left/Right Movement
document.addEventListener('keydown', function(event) {
  if (selectedObject) {
    var moveSpeed = 0.1;
    if (event.key === 'w') {
      selectedObject.translateZ(-moveSpeed);
    } else if (event.key === 's') {
      selectedObject.translateZ(moveSpeed);
    } else if (event.key === 'a') {
      selectedObject.translateX(-moveSpeed);
    } else if (event.key === 'd') {
      selectedObject.translateX(moveSpeed);
    }
  }
});

// Step 9: Implement Rotation (Q, E)
document.addEventListener('keydown', function(event) {
  if (selectedObject) {
    var rotationSpeed = 0.05;
    if (event.key === 'q') {
      selectedObject.rotation.y += rotationSpeed;
    } else if (event.key === 'e') {
      selectedObject.rotation.y -= rotationSpeed;
    }
  }
});

// Step 10: Implement Up/Down Movement (+, -)
document.addEventListener('keydown', function(event) {
  if (selectedObject) {
    var moveSpeed = 0.1;
    if (event.key === '+') {
      selectedObject.position.y += moveSpeed;
    } else if (event.key === '-') {
      selectedObject.position.y -= moveSpeed;
    }
  }
});

// Step 11: Introduce Realistic Gravity (Constant Acceleration)
var gravityAcceleration = -0.01; // Adjust this value for stronger/weaker gravity

// Add a velocity property to each movable object
for (var i = 0; i < movableObjects.length; i++) {
  movableObjects[i].velocity = new THREE.Vector3(0, 0, 0); // Initialize velocity to zero
}

function applyGravity() {
  for (var i = 0; i < movableObjects.length; i++) {
    var object = movableObjects[i];
    if (object !== selectedObject) { // Only apply gravity to unselected objects
      object.velocity.y += gravityAcceleration;
      object.position.add(object.velocity);

      object.geometry.computeBoundingBox();
      var boundingBox = new THREE.Box3().copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld);
      var minY = boundingBox.min.y;
      var halfHeight = (boundingBox.max.y - minY) / 2;

      if (minY < boardHeight / 2) {
        object.position.y = boardHeight / 2 + halfHeight + 0.001;
        object.velocity.y = 0;
      }
    } else {
      object.velocity.set(0, 0, 0); // Reset velocity of selected object
    }
  }
}

// Step 12: Basic Collision Detection with Walls (Bounding Boxes)
function checkWallCollisions() {
  for (var i = 0; i < movableObjects.length; i++) {
    var object = movableObjects[i];

    object.geometry.computeBoundingBox();
    var boundingBox = new THREE.Box3().copy(object.geometry.boundingBox).applyMatrix4(object.matrixWorld);

    var minX = boundingBox.min.x;
    var maxX = boundingBox.max.x;
    var minY = boundingBox.min.y;
    var maxY = boundingBox.max.y;
    var minZ = boundingBox.min.z;
    var maxZ = boundingBox.max.z;

    var halfWidth = (maxX - minX) / 2;
    var halfHeight = (maxY - minY) / 2;
    var halfDepth = (maxZ - minZ) / 2;

    // Wall 1: Positive X
    var wall1MinX = wall1.position.x - wallThickness / 2;
    if (maxX > wall1MinX) {
      object.position.x = wall1MinX - halfWidth - 0.001;
      object.velocity.x = 0; // Stop movement in X direction
    }

    // Wall 2: Negative X
    var wall2MaxX = wall2.position.x + wallThickness / 2;
    if (minX < wall2MaxX) {
      object.position.x = wall2MaxX + halfWidth + 0.001;
      object.velocity.x = 0; // Stop movement in X direction
    }

    // Wall 3: Positive Z
    var wall3MinZ = wall3.position.z - wallThickness / 2;
    if (maxZ > wall3MinZ) {
      object.position.z = wall3MinZ - halfDepth - 0.001;
      object.velocity.z = 0; // Stop movement in Z direction
    }

    // Wall 4: Negative Z
    var wall4MaxZ = wall4.position.z + wallThickness / 2;
    if (minZ < wall4MaxZ) {
      object.position.z = wall4MaxZ + halfDepth + 0.001;
      object.velocity.z = 0; // Stop movement in Z direction
    }

    // Basic floor collision (velocity already handled in applyGravity)
  }
}

// Step 13: Basic Object-to-Object Collision Detection (Bounding Boxes for Cubes)
function checkObjectCollisions() {
  for (var i = 0; i < movableObjects.length; i++) {
    for (var j = i + 1; j < movableObjects.length; j++) {
      var object1 = movableObjects[i];
      var object2 = movableObjects[j];

      object1.geometry.computeBoundingBox();
      var box1 = new THREE.Box3().copy(object1.geometry.boundingBox).applyMatrix4(object1.matrixWorld);

      object2.geometry.computeBoundingBox();
      var box2 = new THREE.Box3().copy(object2.geometry.boundingBox).applyMatrix4(object2.matrixWorld);

      if (box1.intersectsBox(box2)) {
        var overlapX = Math.min(box1.max.x, box2.max.x) - Math.max(box1.min.x, box2.min.x);
        var overlapY = Math.min(box1.max.y, box2.max.y) - Math.max(box1.min.y, box2.min.y);
        var overlapZ = Math.min(box1.max.z, box2.max.z) - Math.max(box1.min.z, box2.min.z);

        var center1 = box1.getCenter(new THREE.Vector3());
        var center2 = box2.getCenter(new THREE.Vector3());
        var separationFactor = 0.5;
        var epsilon = 0.001;

        if (overlapX > epsilon && overlapX < overlapY && overlapX < overlapZ) {
          var pushX = overlapX * separationFactor;
          if (center1.x < center2.x) {
            object1.position.x -= pushX;
            object2.position.x += pushX;
          } else {
            object1.position.x += pushX;
            object2.position.x -= pushX;
          }
          object1.velocity.x = 0;
          object2.velocity.x = 0;
        } else if (overlapY > epsilon && overlapY < overlapX && overlapY < overlapZ) {
          var pushY = overlapY * separationFactor;
          if (center1.y < center2.y) {
            // If object1 is below object2, push object2 up
            if (object1 === selectedObject && object1.position.y < object2.position.y) {
              object2.position.y += pushY;
            } else if (object2 === selectedObject && object2.position.y < object1.position.y) {
              object1.position.y += pushY;
            } else {
              object1.position.y -= pushY * 0.5;
              object2.position.y += pushY * 0.5;
            }
            object1.velocity.y = 0;
            object2.velocity.y = 0;
          } else if (center1.y > center2.y) {
            // If object2 is below object1, push object1 up
            if (object2 === selectedObject && object2.position.y < object1.position.y) {
              object1.position.y += pushY;
            } else if (object1 === selectedObject && object1.position.y < object2.position.y) {
              object2.position.y += pushY;
            } else {
              object1.position.y += pushY * 0.5;
              object2.position.y -= pushY * 0.5;
            }
            object1.velocity.y = 0;
            object2.velocity.y = 0;
          }
        } else if (overlapZ > epsilon && overlapZ < overlapX && overlapZ < overlapY) {
          var pushZ = overlapZ * separationFactor;
          if (center1.z < center2.z) {
            object1.position.z -= pushZ;
            object2.position.z += pushZ;
          } else {
            object1.position.z += pushZ;
            object2.position.z -= pushZ;
          }
          object1.velocity.z = 0;
          object2.velocity.z = 0;
        }
      }
    }
  }
}

// Step 14 & 15: Animation Loop and Resizing
function animate() {
  requestAnimationFrame(animate);

  applyGravity();
  checkWallCollisions();
  checkObjectCollisions();

  renderer.render(scene, camera);
}

animate();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);