(() => {
  'use strict';

  let logOutNav = document.querySelector('#nav-logout');

  logOutNav.addEventListener('click', () => {
    localforage.removeItem('discIDB');
    window.location.href = '/';
  });

})();