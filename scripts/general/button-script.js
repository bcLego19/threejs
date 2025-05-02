// Select all button elements with the class 'hover-border'
var buttons = document.querySelectorAll('.hover-border');

// Iterate over each button in the NodeList
for (var i = 0; i < buttons.length; i++) {
  var button = buttons[i];

  // Add an event listener for the 'mouseover' event
  button.addEventListener('mouseover', function() {
    // When the mouse enters the button, add the 'border-active' class
    // 'this' keyword here refers to the specific button that the event occurred on
    this.classList.add('border-active');
  });

  // Add an event listener for the 'mouseout' event
  button.addEventListener('mouseout', function() {
    // When the mouse leaves the button, remove the 'border-active' class
    // Again, 'this' refers to the specific button
    this.classList.remove('border-active');
  });
}

// That's the JavaScript part for triggering the CSS animation.
// The next step is to define the CSS for the '.hover-border' class
// and the '.hover-border.border-active' class in your CSS stylesheet.