	(() => {
    'use strict';

    let menuButton = document.querySelector('.menu-button');
    let menuText = document.querySelector('.menu-button-text');
    let menuButtonWrap = document.querySelector('.menu-toggle');

    let menuSVG = document.querySelector('.icon-menu-toggle');

    let navMenu = document.querySelector('.nav');
    let navClose = document.querySelector('.nav-close');
    
    // let accordianMenu = document.querySelector('.nav-item-content');
    // let accordianIcon = document.querySelector('.nav-item-icon');

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
    
    navClose.addEventListener('click', toggleCloseClasses)
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