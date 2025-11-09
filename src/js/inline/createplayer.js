(() => {
  'use strict';

  // initialize
  let playerObject = {};
  let form = document.querySelector('.form');
  let baseURL;

  // development vs production URL
  switch (window.location.hostname) {
    case 'localhost':
      baseURL = 'http://localhost:3030'
    break;
    case 'discscoring.com':
      baseURL = 'https://discscoring.com:3030'
    break;
    default:
    break;
  };

  // grab the DOM elements
  let createPlayerForm = document.querySelector('.form');
  let submitButton = document.querySelector('.form-submit');

  let successDialog = document.querySelector('.success');
  let existsDialog = document.querySelector('.exists');

  let existsButton = document.querySelector('.exists-button');
  let successButton = document.querySelector('.success-button');

  // on to the show
  let createNewPlayer = {

    init() {
      localforage.getItem('discIDB')
        .then((idbData) => {
          playerObject = {
            "belongsTo" : idbData._id
          };
          createNewPlayer.existingPlayers(playerObject);
        });
    }, // end init

    existingPlayers(playerObject) {

      fetch(`${baseURL}/api/existingplayers?ownerID=${playerObject.belongsTo}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          createNewPlayer.actualCreation(playerObject, data);
        });
    }, // end existingPlayers

    actualCreation(playerObject, data) {

      submitButton.addEventListener('click', (event) => {
        event.preventDefault();

        // testing all fields filled in
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
    
        requiredFields.forEach(field => {
          if (!field.value) {
            isValid = false;
            // Optionally, add a visual cue for the user
            field.style.border = '1px solid red';
          } else {
            field.style.border = '1px solid transparent';
          };
        });
        if (!isValid) {
          event.preventDefault(); // Prevent form submission
          alert('Please fill in all required fields.');
          return;
        };

        //collect from form
        let newPlayerNameFirst = form.querySelector('#playerNameFirst').value;
        let newPlayerNameLast = form.querySelector('#playerNameLast').value;

        // add to player object
        playerObject.nameFirst = newPlayerNameFirst;
        playerObject.nameLast = newPlayerNameLast;
        playerObject.dateCreated = new Date().toLocaleDateString('en-US');

        form.reset();

        createNewPlayer.checkDuplicate(playerObject, data);

      }); // end eventListener

    }, // end actualCreation

    checkDuplicate(playerObject, data) {
      let flag = false;
      // data is an array, loop through it looking for a match
      // if match is found, bail to exists dialog
      for (let i = 0; i < data.length; i++) {
        if (Object.keys(data[i]).find(key => data[i][key] == playerObject.nameFirst) && Object.keys(data[i]).find(key => data[i][key] == playerObject.nameLast)) {
          flag = true;
          createNewPlayer.dialogBehavior(existsDialog, playerObject);
        };
      };
      if (flag == false) {
        createNewPlayer.storage(playerObject);
        createNewPlayer.dialogBehavior(successDialog, playerObject);
      }

    },

    dialogBehavior(whichDialog, playerObject) {

      whichDialog.querySelector('.name').innerText = `${playerObject.nameFirst} ${playerObject.nameLast}`;        
      
      whichDialog.showModal();

      successButton.addEventListener('click', () => {
        // then clear out modal
        createPlayerForm.reset();
        whichDialog.close();
        location.reload();
      });

      existsButton.addEventListener('click', () => {
        // then clear out modal
        createPlayerForm.reset();
        whichDialog.close();
        location.reload();
      });
    },

    storage (playerObject) {

      fetch(`${baseURL}/api/createplayer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(playerObject)
      });

    }
  }; // end createNewPlayer

  createNewPlayer.init();
})();