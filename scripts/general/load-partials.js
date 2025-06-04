// scripts/general/load-partials.js

document.addEventListener('DOMContentLoaded', async () => {
    const navigationPlaceholder = document.getElementById('navigation-menu-placeholder');

    if (navigationPlaceholder) {
        try {
            const response = await fetch('../partials/navigation-menu.html'); // Adjust path if your partials folder is elsewhere
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const htmlContent = await response.text();
            navigationPlaceholder.innerHTML = htmlContent;

            // After content is loaded, ensure the hamburger script can initialize
            // If hamburger-script.js is a module, it might need to expose an init function
            // or you might need to re-run its logic here.
            // For simple scripts, ensuring this script runs before it is often enough.
            // If your hamburger-script.js uses DOMContentLoaded, it will likely run
            // after this script if this script is placed earlier in the HTML.
            // If it's a module, it's safer to have an explicit init.
            // For now, assuming it's a simple script that will find elements once loaded.

        } catch (error) {
            console.error('Error loading navigation menu partial:', error);
        }
    }
});