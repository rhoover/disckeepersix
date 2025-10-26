	(() => {
    'use strict';

    let menuButton = document.querySelector('.menu-button');
    let menuText = document.querySelector('.menu-button-text');
    let menuButtonWrap = document.querySelector('.menu-toggle');

    let menuSVG = document.querySelector('.icon-menu-toggle');

    let navMenu = document.querySelector('.nav');

    menuButton.addEventListener('click', toggleMenuClasses);
    function toggleMenuClasses() {

      navMenu.classList.toggle('nav-open');

      menuButtonWrap.classList.toggle('opened');
      
      menuText.classList.toggle('menu-button-text-red');

      menuSVG.classList.toggle('icon-menu-toggle-red');

      if (menuText.innerHTML === 'Menu') {
        menuText.innerHTML = 'Close'
      } else {
        menuText.innerHTML = 'Menu'
      };      
    };

    navMenu.addEventListener('click', toggleCloseClasses)
    function toggleCloseClasses() {

      navMenu.classList.toggle('nav-open');
    
      menuButtonWrap.classList.toggle('opened');
      
      menuText.classList.toggle('menu-button-text-red');

      menuSVG.classList.toggle('icon-menu-toggle-red');
    
      if (menuText.innerHTML === 'Menu') {
        menuText.innerHTML = 'Close'
      } else {
        menuText.innerHTML = 'Menu'
      };
    };
  })();