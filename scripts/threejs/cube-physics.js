// Import the Three.js library
import * as THREE from 'three';

// Get a reference to the HTML container for the Three.js canvas
const threeCanvasContainer = document.querySelector("#threejs-canvas");

// 1. Initialize the Scene
const scene = new THREE.Scene();

// --- Dragging Functionality ---
// These variables should be declared at the top scope or right before their usage
// to ensure they are properly initialized for the event listeners.
// Moved these declarations here for clarity and correct scoping.
let isDragging = false;
let previousMousePosition = new THREE.Vector2();

// 2. Initialize the Camera
// Get the dimensions of the container for initial camera aspect
const containerWidth = threeCanvasContainer.clientWidth;
const containerHeight = threeCanvasContainer.clientHeight;
var camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize( containerWidth, containerHeight );

const threeCanvas = document.querySelector("#threejs-canvas");

threeCanvas.appendChild( renderer.domElement );

// Step 3: Create the Board
var boardWidth = 10;
var boardHeight = 0.1;
var boardDepth = 10;
var boardGeometry = new THREE.PlaneGeometry(boardWidth, boardDepth);
var boardMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
var board = new THREE.Mesh(boardGeometry, boardMaterial);
board.rotation.x = -Math.PI / 2;
scene.add(board);

// Step 4: Create the Walls
var wallHeight = 2;
var wallThickness = 0.2;
var wallMaterial = new THREE.MeshBasicMaterial({ color: 0x778899 });

// Wall 1: Positive X
const wall1Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, boardDepth);
const wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
wall1.position.x = boardWidth / 2 + wallThickness / 2;
wall1.position.y = wallHeight / 2;
scene.add(wall1);

// Wall 2: Negative X
const wall2Geometry = new THREE.BoxGeometry(wallThickness, wallHeight, boardDepth);
const wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
wall2.position.x = -boardWidth / 2 - wallThickness / 2;
wall2.position.y = wallHeight / 2;
scene.add(wall2);

// Wall 3: Positive Z
const wall3Geometry = new THREE.BoxGeometry(boardWidth + 2 * wallThickness, wallHeight, wallThickness);
const wall3 = new THREE.Mesh(wall3Geometry, wallMaterial);
wall3.position.z = boardDepth / 2 + wallThickness / 2;
wall3.position.y = wallHeight / 2;
scene.add(wall3);

// Wall 4: Negative Z
const wall4Geometry = new THREE.BoxGeometry(boardWidth + 2 * wallThickness, wallHeight, wallThickness);
const wall4 = new THREE.Mesh(wall4Geometry, wallMaterial);
wall4.position.z = -boardDepth / 2 - wallThickness / 2;
wall4.position.y = wallHeight / 2;
scene.add(wall4);

// Step 5: Create the Initial 3D Objects (All Cubes)
const cubeSize = 1; // Define a consistent cube size
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

const cubeMaterialRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube1 = new THREE.Mesh(cubeGeometry, cubeMaterialRed);
cube1.position.set(-2, cubeSize / 2, 2); // Position cubes on top of the board
scene.add(cube1);

const cubeMaterialGreen = new THREE.MeshBasicMaterial({ color: 0x009f00 });
const cube2 = new THREE.Mesh(cubeGeometry, cubeMaterialGreen);
cube2.position.set(0, cubeSize / 2, -2);
scene.add(cube2);

const cubeMaterialBlue = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cube3 = new THREE.Mesh(cubeGeometry, cubeMaterialBlue);
cube3.position.set(3, cubeSize / 2, 0);
scene.add(cube3);

const movableObjects = [cube1, cube2, cube3];
let selectedObject = null;
let edgesMesh = null; // Variable to hold the edges highlight mesh

// Step 6: Set up Camera Position
camera.position.set(3, 8, 4);
camera.lookAt(0, 0, 0);

// Step 7: Implement Object Picking (Raycasting)
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseClick(event) {
    // Calculate mouse position relative to the canvas element
    const canvasBounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = - ((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(movableObjects);

    // If an object is intersected AND it's not the currently selected one
    if (intersects.length > 0 && intersects[0].object !== selectedObject) {
        // Deselect previous object if any
        if (selectedObject) {
            if (edgesMesh) {
                selectedObject.remove(edgesMesh); // Remove the old highlight
                edgesMesh.geometry.dispose();
                edgesMesh.material.dispose();
                edgesMesh = null;
            }
        }

        selectedObject = intersects[0].object;

        // Highlight the selected object's edges
        const edges = new THREE.EdgesGeometry(selectedObject.geometry);
        edgesMesh = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 4 })); // Bright yellow edges
        selectedObject.add(edgesMesh); // Add edges as a child of the object so they move/rotate together

        console.log('Selected:', selectedObject.uuid);
    } else if (intersects.length === 0 && selectedObject) {
        // Clicked on empty space AND an object was selected, so deselect
        if (edgesMesh) {
            selectedObject.remove(edgesMesh); // Remove the highlight
            edgesMesh.geometry.dispose();
            edgesMesh.material.dispose();
            edgesMesh = null;
        }
        selectedObject = null;
        console.log('Deselected');
    }
    // If clicked on the already selected object, do nothing.
    // If clicked on empty space and nothing was selected, do nothing.
}

// Attach event listener to the renderer's DOM element for accurate clicks
renderer.domElement.addEventListener('click', onMouseClick, false);

// --- Key Input Tracking ---
const pressedKeys = {}; // Object to store currently pressed keys

// Step 8: Implement Forward/Backward/Left/Right Movement (relative to camera direction)
document.addEventListener('keydown', function(event) {
    pressedKeys[event.key.toLowerCase()] = true; // Store key as pressed
});

document.addEventListener('keyup', function(event) {
    pressedKeys[event.key.toLowerCase()] = false; // Mark key as released

    // Handle Escape key on keyup to deselect
    if (event.key === 'Escape') {
        if (selectedObject) {
            if (edgesMesh) {
                selectedObject.remove(edgesMesh); // Remove the highlight
                edgesMesh.geometry.dispose();
                edgesMesh.material.dispose();
                edgesMesh = null;
            }
            selectedObject = null;
            console.log('Deselected via Escape');
        }
    }
});

// Step 11: Introduce Realistic Gravity (Constant Acceleration)
const gravityAcceleration = -0.005; // Adjusted for a slightly faster fall
const friction = 0.95; // Basic friction for stopping movement

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

    // Apply object movement based on pressed keys
    if (selectedObject) {
        const moveSpeed = 0.1;
        const rotationSpeed = 0.05;
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Ignore vertical component for horizontal movement
        cameraDirection.normalize();

        // Corrected calculation for rightDirection: cross (forward, up)
        const rightDirection = new THREE.Vector3().crossVectors(cameraDirection, camera.up).normalize();

        if (pressedKeys['w']) {
            selectedObject.position.addScaledVector(cameraDirection, moveSpeed);
        }
        if (pressedKeys['s']) {
            selectedObject.position.addScaledVector(cameraDirection, -moveSpeed);
        }
        if (pressedKeys['a']) { // 'a' moves left
            selectedObject.position.addScaledVector(rightDirection, -moveSpeed);
        }
        if (pressedKeys['d']) { // 'd' moves right
            selectedObject.position.addScaledVector(rightDirection, moveSpeed);
        }
        if (pressedKeys['q']) {
            selectedObject.rotation.y += rotationSpeed;
        }
        if (pressedKeys['e']) {
            selectedObject.rotation.y -= rotationSpeed;
        }
        if (pressedKeys['='] || pressedKeys['+']) {
            selectedObject.position.y += moveSpeed;
        }
        if (pressedKeys['-'] || pressedKeys['_']) {
            selectedObject.position.y -= moveSpeed;
        }
    }


    // Update physics only if not dragging a selected object
    if (!isDragging) {
        applyGravity();
        checkWallCollisions();
        checkObjectCollisions();
    } else if (selectedObject) {
        // If selected object is being dragged, ensure other objects still apply gravity
        for (const object of movableObjects) {
            if (object !== selectedObject) {
                // Apply gravity to unselected objects
                object.velocity.y += gravityAcceleration;
                object.position.add(object.velocity);
                // Basic floor collision for non-selected objects
                const halfHeight = cubeSize / 2;
                if (object.position.y - halfHeight < board.position.y + boardHeight / 2) {
                    object.position.y = board.position.y + boardHeight / 2 + halfHeight;
                    object.velocity.y = 0;
                    object.velocity.x *= friction;
                    object.velocity.z *= friction;
                }
            }
        }
        checkWallCollisions(); // Check all wall collisions
        checkObjectCollisions(); // Check all object collisions
    }

    renderer.render(scene, camera);
}

animate();

function onWindowResize() {
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerWidth, containerHeight);
}

window.addEventListener('resize', onWindowResize, false);

renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
renderer.domElement.addEventListener('mouseleave', onMouseUp, false); // Important: stop dragging if mouse leaves canvas

function onMouseDown(event) {
    if (selectedObject) { // Allow dragging if there's a selected object
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
}

function onMouseMove(event) {
    if (!isDragging || !selectedObject) return; // Only drag if dragging and a selected object exists

    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;

    // For rotation based on mouse drag (common for orbit controls):
    selectedObject.rotation.y += deltaX * 0.01;
    selectedObject.rotation.x += deltaY * 0.01;

    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

function onMouseUp() {
    isDragging = false;
}
