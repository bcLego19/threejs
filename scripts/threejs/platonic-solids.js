// Import the Three.js library
import * as THREE from 'three';

// 1. Initialize the Scene
const scene = new THREE.Scene();

// 2. Initialize the Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;
const initialCameraPosition = new THREE.Vector3().copy(camera.position);

// 3. Initialize the Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );

const threeCanvas = document.querySelector("#threejs-canvas");
threeCanvas.appendChild( renderer.domElement );

// --- Grid Setup ---
const gridRows = 2;
const gridCols = 3;
const gridSpacing = 3;
const gridPositions = [];
const startX = -(gridCols - 1) * gridSpacing / 2;
const startY = (gridRows - 1) * gridSpacing / 2;

for (let i = 0; i < gridRows; i++) {
  for (let j = 0; j < gridCols; j++) {
    if(i + j >= 3) break; // exit if render all shapes
    const x = startX + j * gridSpacing;
    const y = startY - i * gridSpacing;
    const z = 0;
    gridPositions.push(new THREE.Vector3(x, y, z));
  }
}

// --- Platonic Solids Setup ---
const tetrahedronGeometry = new THREE.TetrahedronGeometry();
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const octahedronGeometry = new THREE.OctahedronGeometry();
const dodecahedronGeometry = new THREE.DodecahedronGeometry();
const icosahedronGeometry = new THREE.IcosahedronGeometry();

const geometries = [
  tetrahedronGeometry,
  cubeGeometry,
  octahedronGeometry,
  dodecahedronGeometry,
  icosahedronGeometry,
];

const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const platonicSolids = [];

for (let i = 0; i < gridPositions.length; i++) {
  const geometryIndex = i % geometries.length;
  const mesh = new THREE.Mesh(geometries[geometryIndex], material);
  mesh.position.copy(gridPositions[i]);
  scene.add(mesh);
  platonicSolids.push(mesh);
}

// --- Interaction Variables ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let focusedObject = null;
const zoomDistance = 2;
let isZoomingIn = false;
let isZoomingOut = false;
let zoomStartTime = 0;
const zoomDuration = 500;

// --- Dragging Variables ---
let isDragging = false;
let previousMousePosition = new THREE.Vector2();

// --- "Go Back" Button ---
const goBackButton = document.getElementById('goBackButton');
goBackButton.addEventListener('click', onGoBackButtonClick, false);

function onGoBackButtonClick() {
  if (focusedObject && !isZoomingOut) {
    isZoomingOut = true;
    isZoomingIn = false;
    zoomStartTime = performance.now();
    const zoomOutDuration = 500;
    const targetPosition = new THREE.Vector3().copy(initialCameraPosition);

    function zoomOutAnimation() {
      const currentTime = performance.now();
      const elapsedTime = currentTime - zoomStartTime;
      const t = Math.min(1, elapsedTime / zoomOutDuration);
      camera.position.lerp(targetPosition, t);

      if (t < 1) {
        requestAnimationFrame(zoomOutAnimation);
      } else {
        isZoomingOut = false;
        focusedObject = null;
        goBackButton.style.display = 'none';
      }
    }
    zoomOutAnimation();
  }
}

// Function to handle mouse click events
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(platonicSolids);

  if (intersects.length > 0 && !isZoomingIn && !isZoomingOut) {
    focusedObject = intersects[0].object;
    console.log('Focused on:', focusedObject);

    // Calculate the target camera position
    const targetPosition = new THREE.Vector3().copy(focusedObject.position);
    targetPosition.z += zoomDistance;

    isZoomingIn = true;
    isZoomingOut = false;
    zoomStartTime = performance.now();
    goBackButton.style.display = 'block'; // Show the "Go Back" button
  }
}

renderer.domElement.addEventListener('click', onMouseClick, false);

// --- Dragging Functionality ---
function onMouseDown(event) {
  if (focusedObject) { // Allow dragging if there's a focused object
    isDragging = true;
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  }
}

function onMouseMove(event) {
  if (!isDragging || !focusedObject) return; // Only drag if dragging and a focused object exists

  const deltaX = event.clientX - previousMousePosition.x;
  const deltaY = event.clientY - previousMousePosition.y;

  // Adjust rotation speed as needed
  focusedObject.rotation.y += deltaX * 0.01;
  focusedObject.rotation.x += deltaY * 0.01;

  previousMousePosition.x = event.clientX;
  previousMousePosition.y = event.clientY;
}

function onMouseUp() {
  isDragging = false;
}

renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);

  if (focusedObject && !isDragging) {
    focusedObject.rotation.y += 0.02;
  } else if (!focusedObject) {
    for (let i = 0; i < platonicSolids.length; i++) {
      platonicSolids[i].rotation.y += 0.01;
    }
  }

  // Handle zoom in animation
  if (isZoomingIn && focusedObject) {
    const currentTime = performance.now();
    const elapsedTime = currentTime - zoomStartTime;
    const t = Math.min(1, elapsedTime / zoomDuration);

    const targetPosition = new THREE.Vector3().copy(focusedObject.position);
    targetPosition.z += zoomDistance;
    camera.position.lerp(targetPosition, t);
  }
  // Handle zoom out animation
  else if (isZoomingOut) {
    const currentTime = performance.now();
    const elapsedTime = currentTime - zoomStartTime;
    const t = Math.min(1, elapsedTime / zoomDuration);
    camera.position.lerp(initialCameraPosition, t);
  }
  // Default camera movement when no zoom is active
  else if (!isZoomingIn && !isZoomingOut) {
    camera.position.lerp(initialCameraPosition, 0.05);
  }

  renderer.render(scene, camera);
}

animate();

// --- Handling Window Resize ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);