(() => {
  'use strict';

  localforage.config({
    name: 'disckeeper',
    storeName: 'discIDB',
    description: 'IndexedDB Storage of Disckeeper Primary Log-In'
  });

})();