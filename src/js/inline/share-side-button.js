(() => {
  'use strict';

  // sharing stuff
  const shareButton = document.querySelector(".share-button");
  const pageURL = document.querySelector("link[rel=canonical]");
  const pageTitle = document.title;

  // make it work
  if (navigator.share) {
    shareButton.classList.add('share-button-visible');

    shareButton.addEventListener('click', shareButtonStuff);
    function shareButtonStuff() {
      navigator.share({
        title: pageTitle,
        url: pageURL.href
      });      
    };
  };
})();