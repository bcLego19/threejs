// scripts/general/hamburger-script.js

// Define the initialization function for the hamburger menu
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('hamburger-menu');

    if (hamburger && menu) {
        // Only add event listener if elements are found
        hamburger.addEventListener('click', () => {
            // Toggle the display style of the menu
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        });
        // Ensure the menu is initially hidden (if not already handled by CSS)
        menu.style.display = 'none';
    } else {
        console.warn('Hamburger menu elements (#hamburger or #hamburger-menu) not found. Skipping initialization.');
    }
}

// If this script is loaded as a regular script (not a module),
// you can make the function globally available:
window.initHamburgerMenu = initHamburgerMenu;

// If this script is loaded as a module (e.g., <script type="module">),
// you would export it like this:
// export { initHamburgerMenu };

// For pages that load the menu directly in HTML, you might still want
// to call it on DOMContentLoaded, but for dynamic loading, we'll call it explicitly.
// document.addEventListener('DOMContentLoaded', initHamburgerMenu); // Remove or comment out if only dynamic loading
