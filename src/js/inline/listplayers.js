(() => {
  'use strict';

  // grab DOM elements
  let primaryName = document.querySelector('.item-primary-name');
  let regularSection = document.querySelector('.items');
  let successModal = document.querySelector('.success');
  let successModalText = document.querySelector('.success-text');
  let successModalButton = document.querySelector('.success-button');

  // initialize
  let primaryPlayerObject = {};
  let baseURL;

  // development vs production URL
  switch (window.location.hostname) {
    case 'localhost':
      baseURL = 'http://localhost:3000'
    break;
    case 'disckeeper.io':
      baseURL = 'https://disckeeper.io:3000'
    break;
    default:
    break;
  };

  let listPlayers = {

    init() {
      localforage.getItem('discIDB')
        .then((idbData) => {
          primaryPlayerObject = idbData;
          primaryPlayerObject["belongsTo"] = idbData._id;

          // inject owner name into DOM
          primaryName.innerText = `${primaryPlayerObject.nameFirst} ${primaryPlayerObject.nameLast}`;

          listPlayers.getPlayers(primaryPlayerObject);
        });
    }, // end init

    getPlayers(primaryPlayerObject) {

      fetch(`${baseURL}/api/existingplayers?ownerID=${primaryPlayerObject.belongsTo}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          listPlayers.buildDOM (primaryPlayerObject, data);
        });

    }, // end getPlayers

    buildDOM(primaryPlayerObject, players) {

      players.forEach(player => {
        regularSection.innerHTML += `
        <player-card class="item" playerID="${player._id}">
          <p class="item-name">${player.nameFirst} ${player.nameLast}</p>
          <svg xmlns="http://www.w3.org/2000/svg" class="delete-me" viewbox="0 0 875 1000" width="27" height="50" >
            <path d="M0 281.296v-68.355q1.953-37.107 29.295-62.496t64.449-25.389h93.744V93.808q0-39.06 27.342-66.402T281.232.064h312.48q39.06 0 66.402 27.342t27.342 66.402v31.248H781.2q37.107 0 64.449 25.389t29.295 62.496v68.355q0 25.389-18.553 43.943t-43.943 18.553v531.216q0 52.731-36.13 88.862T687.456 1000H187.488q-52.731 0-88.862-36.13t-36.13-88.862V343.792q-25.389 0-43.943-18.553T0 281.296zm62.496 0h749.952V218.8q0-13.671-8.789-22.46t-22.46-8.789H93.743q-13.671 0-22.46 8.789t-8.789 22.46v62.496zm62.496 593.712q0 25.389 18.553 43.943t43.943 18.553h499.968q25.389 0 43.943-18.553t18.553-43.943V343.792h-624.96v531.216zm62.496-31.248V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76zm31.248-718.704H624.96V93.808q0-13.671-8.789-22.46t-22.46-8.789h-312.48q-13.671 0-22.46 8.789t-8.789 22.46v31.248zM374.976 843.76V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76zm156.24 0V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76z"/>
          </svg>
          <p class="item-delete">Delete Player</p>        
        </player-card>
        `;
      }); // end loop

      listPlayers.clickTrashCan(players);
    }, // end buildDOM
    
    clickTrashCan(players) {

      customElements.define('player-card', class extends HTMLElement {
        constructor() {
          super();
        }; // end constructor()

        handleEvent(event) {
          this[`on${event.type}`](event);
        }; // end handleEvent()

        connectedCallback() {
          this.addEventListener('click', this);
        };

        // this is the on${event.type} registered above
        onclick(event) {
          // initialize
          let playerToDeleteID = event.target.closest('player-card').getAttribute('playerid');
          let playerCard = event.target.closest('player-card');

          // remove
          playerCard.classList.add('item-remove');
          setTimeout(() => {
            playerCard.remove();
          }, 1000);

          // find player in array and send along
          let chosenPlayer = players.find(x => x._id == playerToDeleteID);
          chosenPlayer.dkID = chosenPlayer._id;
          listPlayers.deletePlayer(chosenPlayer);
        }; //end onclick()
      }); // end customElements
    }, // end clickTrashCan()

    deletePlayer(chosenPlayer) {
      console.log(chosenPlayer);

      fetch(`${baseURL}/api/deleteplayer?playerID=${chosenPlayer.dkID}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        listPlayers.successModal(chosenPlayer);
      });
    }, // end deletePlayer

    successModal(chosenPlayer) {

      successModalText.innerText = `${chosenPlayer.nameFirst} ${chosenPlayer.nameLast} has been deleted.`;
      successModal.showModal();

      successModalButton.addEventListener('click', (event) => {
        successModal.close();
      });
    }, // end successModal()
  }; // end listPlayers
listPlayers.init();
})();