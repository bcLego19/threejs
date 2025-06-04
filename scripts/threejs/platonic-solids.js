// Import the Three.js library
import * as THREE from 'three';

// Get a reference to the HTML container for the Three.js canvas
const threeCanvasContainer = document.querySelector("#threejs-canvas");

// 1. Initialize the Scene
const scene = new THREE.Scene();

// 2. Initialize the Camera
// Get the dimensions of the container for initial camera aspect
const containerWidth = threeCanvasContainer.clientWidth;
const containerHeight = threeCanvasContainer.clientHeight;
const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
camera.position.z = 10;
const initialCameraPosition = new THREE.Vector3().copy(camera.position);

// 3. Initialize the Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true }); // Added antialiasing for smoother edges
renderer.setSize(containerWidth, containerHeight); // Set renderer size to container's dimensions
renderer.setPixelRatio(window.devicePixelRatio); // Handle high-DPI screens
threeCanvasContainer.appendChild(renderer.domElement); // Append the renderer's canvas to the container

// --- Grid Setup ---
const gridRows = 2;
const gridCols = 3;
const gridSpacing = 3;
const gridPositions = [];
const startX = -(gridCols - 1) * gridSpacing / 2;
const startY = (gridRows - 1) * gridSpacing / 2;

for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridCols; j++) {
        if(i + j >= 5) break; // Adjusted to ensure all 5 platonic solids are rendered if needed, was 3
        const x = startX + j * gridSpacing;
        const y = startY - i * gridSpacing;
        const z = 0;
        gridPositions.push(new THREE.Vector3(x, y, z));
    }
}

// --- Platonic Solids Setup ---
const tetrahedronGeometry = new THREE.TetrahedronGeometry(1); // Added radius for consistent sizing
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const octahedronGeometry = new THREE.OctahedronGeometry(1);
const dodecahedronGeometry = new THREE.DodecahedronGeometry(1);
const icosahedronGeometry = new THREE.IcosahedronGeometry(1);

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
    // Calculate mouse position relative to the canvas element
    const canvasBounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    mouse.y = - ((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

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
    // Removed default camera lerp as it can interfere with zoom animations
    // and might cause subtle drift if not carefully managed.
    // The camera should only move when explicitly zooming in/out.

    renderer.render(scene, camera);
}

// Start the animation loop
animate();

// --- Handling Window Resize ---
function onWindowResize() {
    // Get the updated dimensions of the container
    const newContainerWidth = threeCanvasContainer.clientWidth;
    const newContainerHeight = threeCanvasContainer.clientHeight;

    camera.aspect = newContainerWidth / newContainerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newContainerWidth, newContainerHeight);
}

window.addEventListener('resize', onWindowResize, false);
