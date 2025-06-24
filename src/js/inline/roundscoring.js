(() => {
  'use strict';
    
  // get DOM elements:
  // querySelector all the things
  let courseName = document.querySelector('[courseName]');
  let holeNumber = document.querySelector('[holenumber]');
  let holePar = document.querySelector('[parnumber]');
  let submitThrowsButton = document.querySelector('[submit]');

  // seed confirm
  let activePlayerName = document.querySelectorAll('[playerConfirmname]');

  // seed players scores
  let scoringSection = document.querySelector('.players');
  let throwsBox = document.querySelector('[throws]');

  // modal
  let scoringModal = document.querySelector('dialog');
  let modalHeader = document.querySelector('.modal-header');
  let modalDate = document.querySelector('.modal-date');
  let modalRoundData = document.querySelector('.modal-round');
  let closeButton = document.querySelector('.modal-footer-close-icon');
  let saveButton = document.querySelector('.modal-footer-save-icon');

  // initialize
  let activePlayer, nextHoleIndex, roundScore, roundScoreDisplay;
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

  // finishing up
  let whereInPlayerList;
  let savedRound = {};

  let roundScoring = {

    init() {

      let players = JSON.parse(localStorage.getItem('chosenPlayers'));
      let course = JSON.parse(localStorage.getItem('chosenCourse'));
    
      //send down course and players data
      roundScoring.seedMetaSection(course);
      roundScoring.seedConfirmSection(players);
      roundScoring.seedPlayerScoresSection(players);
      roundScoring.scoringSection(course, players);
    }, //end init

    seedMetaSection(course) {
      courseName.innerText = course.courseName;
      holeNumber.innerText = course.courseHoles[0].holeNumber;
      holePar.innerText = course.courseHoles[0].holePar;
    }, // end seedMetaSection()

    seedConfirmSection(players) {
      activePlayerName.forEach((player, index) => {
        activePlayerName[index].innerHTML = players[0].nameFirst;
      });
    }, // end seedConfirmSection()

    seedPlayerScoresSection(players) {
      players.forEach((player) => {
        scoringSection.innerHTML += `
        <div class="players-player">
          <p class="players-name" player-name">${player.nameFirst}</p>
          <p class="players-text-upper">Score:</p>
          <p class="players-text-lower">Throws:</p>
          <p class="players-score" player-score></p>
          <p class="players-throws" player-throws></p>
        </div>
        `;
      });
    }, // end seedPlayerScoresSection()

    scoringSection(course, players) {

      // these two DOM elements have to be here as they are generated, not inherent to the page
      let playerScoreCurrent = document.querySelectorAll('[player-score]');
      let playerThrowsCurrent = document.querySelectorAll('[player-throws]');

      // indices for moving through players and holes 
      let activePlayerIndex = 0;
      let roundIndex = 0;

      // number pad web component
      customElements.define('num-pad', class extends HTMLElement {
        constructor() {
          super();
          this.addEventListener('click', this);
        };

        handleEvent(event) {
          this[`on${event.type}`](event);
        };

        onclick(event) {

          if (event.target.hasAttribute('step')) { // clicked a number

            // put number clicked into throwsbox
            let numberClicked = event.target.getAttribute('step');

            // let numberClickedUI = this.querySelector(`p[step="${numberClicked}"]`);

            // a ternery in case there's a double digit throw for the hole:
            // is there stuff in target element ? if yes, concatenate new click : if no just drop click into target element
            throwsBox.innerText ? throwsBox.innerText += numberClicked : throwsBox.innerText = numberClicked;
            
          } else { // otherwise clicked clear button

            // clear throwsbox element
            throwsBox.innerText = '';
            
          }
        }; // end onclick()
      }); // end customElements.define()

      // and by submit we mean update the js objects
      submitThrowsButton.addEventListener('click', event => {
        
        if (throwsBox.innerText) {

          // deep copy necessary
          activePlayer = JSON.parse(JSON.stringify(players[activePlayerIndex]));

          // this is it!! calling the function just below
          scorekeeping(parseInt(throwsBox.innerText, 10), activePlayer);
        };
      }); // end submitThrowsButton()

      // the big kahuna, scorekeeping():
      // across **possible** multiple players and **certainly** multiple holes
      // TODO would be moving stuff to localStorage for perhaps some persistence
      // in case one round on the same course goes over several days
      // as things stand, the logic is pretty fucking mind-bending imho
      function scorekeeping(incomingThrows, activePlayer) {
        // the parameters come from clicking the submit button above

        // grand switch: is it the last hole or not
        switch (true) {
          // if it's not the last hole
          case roundIndex < course.courseHoles.length -1:
            
            // js object activity
            // then update activePlayer object with new scoring data
            activePlayer.courseHoles[roundIndex].holeThrows = incomingThrows;
            // add hole throws to round throws
            activePlayer.courseHoles[roundIndex].roundThrows += incomingThrows;
            activePlayer.courseHoles[roundIndex].holeOverUnder = (incomingThrows - activePlayer.courseHoles[roundIndex].holePar);
            // add hole over-under to round over-under
            activePlayer.courseHoles[roundIndex].roundOverUnder += activePlayer.courseHoles[roundIndex].holeOverUnder;

            // DOM activity
            // first decide how to display the round score, over or under
            roundScoreDisplay = activePlayer.courseHoles[roundIndex].roundOverUnder
            let howToDisplayRoundScore = (roundScoreDisplay) => {
              switch (true) {
                case roundScoreDisplay == 0:
                  return roundScoreDisplay;
                break;
                case roundScoreDisplay > 0:
                  return '+' + roundScoreDisplay;
                  
                break;
                case roundScoreDisplay < 0:
                  return roundScoreDisplay;
                break;
              
                default:
                  break;
              }; // end switch
            }; // end howToDisplayRoundScore()

            // then write new score to displayed overUnderRound
            playerScoreCurrent[activePlayerIndex].innerText = `${howToDisplayRoundScore(roundScoreDisplay)}`;
            // then write throwsRound to displayed throws
            playerThrowsCurrent[activePlayerIndex].innerText = activePlayer.courseHoles[roundIndex].roundThrows;

            // then UI goodness: different colors for different scores
            roundScore = activePlayer.courseHoles[roundIndex].roundOverUnder;

            // over, under or par switch
            switch (true) {
              // over par
              case roundScore > 0:
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-under');
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-par');

                playerScoreCurrent[activePlayerIndex].classList.add('players-score-over');
              break;

              // par
              case roundScore == 0:
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-over');
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-under');

                playerScoreCurrent[activePlayerIndex].classList.add('players-score-par');
              break;

              // under par
              case roundScore < 0:
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-over');
                playerScoreCurrent[activePlayerIndex].classList.remove('players-score-par');
                
                playerScoreCurrent[activePlayerIndex].classList.add('players-score-under');
              break;

              default:
              break;
            }; // end switch - roundscore: over, under or par

            // then seed next hole for active player
            nextHoleIndex = roundIndex + 1;
            activePlayer.courseHoles[nextHoleIndex].roundThrows = activePlayer.courseHoles[roundIndex].roundThrows;
            activePlayer.courseHoles[nextHoleIndex].roundOverUnder = activePlayer.courseHoles[roundIndex].roundOverUnder;

            // then deep copy of original chosenPlayers array necessary after modifying referenced activePlayer object
            players[activePlayerIndex] = JSON.parse(JSON.stringify(activePlayer));
            
            // then bump to next player if exists to become activePlayer
            whereInPlayerList = activePlayerIndex < players.length - 1;

            // switch to determine where in player list
            switch (whereInPlayerList) {
              // if true, it is not the last player in the list
              case true:
                activePlayerIndex++;
                activePlayer = players[activePlayerIndex];
                
                // update UI confirm area player
                activePlayerName.forEach(function(name) {
                  name.innerText = players[activePlayerIndex].nameFirst;
                });
              break;

              // it is either the last player in the list or a single player
              case false:          
                activePlayerIndex = 0;
                roundIndex++;
    
                // update UI confirm area player
                activePlayerName.forEach(function(name) {
                  name.innerText = players[activePlayerIndex].nameFirst;
                });
    
                // update displayed hole meta info at the top of the screen
                holeNumber.innerText = course.courseHoles[roundIndex].holeNumber;
                holePar.innerText = course.courseHoles[roundIndex].holePar;
              break;
              default:
              break;
            }; // end switch - whereInPlayerListh
          break; // end if it's not the last hole

          // then it is the last hole
          case roundIndex == course.courseHoles.length -1:

          // js object activity
          // then update activePlayer object with new scoring data
          activePlayer.courseHoles[roundIndex].holeThrows = incomingThrows;
          // add hole throws to round throws
          activePlayer.courseHoles[roundIndex].roundThrows += incomingThrows;
          activePlayer.courseHoles[roundIndex].holeOverUnder = (incomingThrows - activePlayer.courseHoles[roundIndex].holePar);
          // add hole over-under to round over-under
          activePlayer.courseHoles[roundIndex].roundOverUnder += activePlayer.courseHoles[roundIndex].holeOverUnder;

          // as there is no next hole...
          // ie no DOM activity, no ui goodness, no seeding next hole
          // then deep copy of original chosenPlayers array necessary after modifying referenced activePlayer object
          players[activePlayerIndex] = JSON.parse(JSON.stringify(activePlayer));

          // then bump to next player if exists to become activePlayer
          whereInPlayerList = activePlayerIndex < players.length - 1;
          switch (whereInPlayerList) {
            // if true, it is not the last player in the list
            case true:
              activePlayerIndex++;
              activePlayer = players[activePlayerIndex];
              
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerText = players[activePlayerIndex].nameFirst;
              });
            break;

            // it is either the last player in the list or a single player on last hole
            case false:          
              activePlayerIndex = 0;
  
              // update UI confirm area player
              activePlayerName.forEach(function(name) {
                name.innerText = players[activePlayerIndex].nameFirst;
              });
  
              // update displayed hole meta info at the top of the screen
              holeNumber.innerText = course.courseHoles[roundIndex].holeNumber;
              holePar.innerText = course.courseHoles[roundIndex].holePar;

              // finishing up
              // then seed the finishing modal
              roundScoring.seedFinishedModal(course, players, roundIndex);
            break;
            default:
            break;
          }; // end switch
          break;
        
          default:
          break; // end then it is the last hole
        }; // end grand switch: last hole or not
        
        // start all over again
        throwsBox.innerText = "";
      };

    }, // end scoringSection
    
    seedFinishedModal(course, players, roundIndex) {

      // seed dialog header
      modalHeader.innerText = `Finished Round: ${course.courseName}`;
      modalDate.innerText = `${course.roundDate}`;

      players.forEach((player) => {
        player.finalScore = player.courseHoles[roundIndex].roundOverUnder;
        player.finalThrows = player.courseHoles[roundIndex].roundThrows;

        modalRoundData.innerHTML += `
        <div class="modal-player">
          <p class="modal-player-name">${player.nameFirst}:</p>
          <p class="modal-player-upper">Score:</p>
          <p class="modal-player-score">${player.finalScore}</p>
          <p class="modal-player-lower">Throws:</p>
          <p class="modal-player-throws">${player.finalThrows}</p>
        </div>
        `;
      });

      roundScoring.manageFinishedModal(course, players);

    }, // end seedFinishedModal

    manageFinishedModal(course, players) {

      let primaryPlayer = players.find((player) => player.primary === true);

      savedRound = {
        belongsTo: primaryPlayer._id,
        playerNameFirst: primaryPlayer.nameFirst,
        playerNameLast: primaryPlayer.nameLast,
        holes: primaryPlayer.courseHoles,
        finalScore: primaryPlayer.finalScore,
        finalThrows: primaryPlayer.finalThrows,
        courseID: course._id,
        courseName: course.courseName,
        courseLength: course.courseLength,
        roundID: course.roundID,
        roundDate: new Date().toLocaleDateString('en-US'),
      };

      // bump value in original object by 1
      course.roundsScored++;

      // create for primary player
      let coursePlayed = {
        courseName: course.courseName,
        courseID: course._id
      };

      // push into primary player if necessary
      if (primaryPlayer.coursesPlayed.length == 0) {

        primaryPlayer.coursePlayed = coursePlayed;
        
      } else {

        let isCourseThere = coursesPlayed.find((courseTest) => courseTest.courseID == course._id);

        if (isCourseThere) {
          return
        } else {
          primaryPlayer.coursePlayed = coursePlayed;
        };
      };

      scoringModal.showModal();

      // footer events
      function clearLocalStorage() {
        localStorage.removeItem('chosenPlayers');
        localStorage.removeItem('chosenCourse');
      };

      saveButton.addEventListener('click', (event) => {
        if (event.target.closest('.modal-footer-save-icon')) {
          scoringModal.close();
          roundScoring.storage(savedRound, course, primaryPlayer);
          // // off to home page
          setTimeout(() => {
            clearLocalStorage();
            window.location.href = '/';
          }, 1000);
        };
      });

      closeButton.addEventListener('click', (event) => {
        if (event.target.closest('.modal-footer-close-icon')) {
          scoringModal.close();
          // // off to home page
          setTimeout(() => {
            clearLocalStorage();
            window.location.href = '/';
          }, 1000);
        };
      });
    }, // end manageFinishedModal

    storage(savedRound, course, primaryPlayer) {

      fetch(`${baseURL}/api/createround`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(savedRound)
      });

      fetch(`${baseURL}/api/updatecourse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(course)
      });

      fetch(`${baseURL}/api/updateprimary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(primaryPlayer)
      });
    } // end storage
  }; // end roundScoring

  roundScoring.init();
})();