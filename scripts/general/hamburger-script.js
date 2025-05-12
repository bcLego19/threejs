const hamburgerMenuButton = document.querySelector("#hamburger");
const hamburgerMenu = document.querySelector("#hamburger-menu");
const menuItems = document.querySelectorAll(".menu-item");

let hamburgerToggle = false;

hamburgerMenuButton.addEventListener('click', function() {
  hamburgerToggle = !hamburgerToggle;
  hamburgerSwitch(hamburgerMenu, hamburgerToggle);
});

hamburgerMenu.addEventListener("mouseleave", () => {
  closeMenuOnLeave();
});

function closeMenuOnLeave() {
  setTimeout(function() {
    if(hamburgerToggle) hamburgerToggle = false;
  hamburgerSwitch(hamburgerMenu, hamburgerToggle);
  }, 2000);
}

function hamburgerSwitch(menu, toggle) {
  if(toggle) {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

menuItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    hamburgerToggle = !hamburgerToggle;

 hamburgerSwitch(hamburgerMenu, hamburgerToggle);
    
  });
});