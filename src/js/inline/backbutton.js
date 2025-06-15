(() => {
  'use strict';

  var backButton = document.querySelector('.back-button');

  backButton.onclick = function () {
    history.back();
  };

})();