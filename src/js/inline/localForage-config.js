(() => {
  'use strict';

  localforage.config({
    name: 'discscoring',
    storeName: 'discIDB',
    description: 'IndexedDB Storage of DiscScoring Primary Log-In'
  });

})();