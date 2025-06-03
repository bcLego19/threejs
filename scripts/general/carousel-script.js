document.addEventListener('DOMContentLoaded', () => {
    // 1. Get all carousel items and controls
    const carouselItems = Array.from(document.querySelectorAll('.carousel-items'));
    const leftButton = document.querySelector('.left-button');
    const rightButton = document.querySelector('.right-button');

    let currentIndex = 0; // Keep track of the currently displayed item's index

    // Function to update the display of carousel items
    function updateCarouselDisplay() {
        carouselItems.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('active');
                item.classList.remove('inactive');
            } else {
                item.classList.add('inactive');
                item.classList.remove('active');
            }
        });
    }

    // 2. Initialize: Display the first carousel item
    updateCarouselDisplay(); // Call it once to set the initial state

    // 3. and 4. Handle clicks on carousel controls
    leftButton.addEventListener('click', () => {
        currentIndex--; // Decrement the index

        // If at the beginning, loop to the last item
        if (currentIndex < 0) {
            currentIndex = carouselItems.length - 1;
        }
        updateCarouselDisplay();
    });

    rightButton.addEventListener('click', () => {
        currentIndex++; // Increment the index

        // If at the end, loop to the first item
        if (currentIndex >= carouselItems.length) {
            currentIndex = 0;
        }
        updateCarouselDisplay();
    });
});