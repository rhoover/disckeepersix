(() => {
  'use strict';

  // get DOM elements
  // error modal
  let noCoursesModal = document.querySelector('.modal-nocourse');

  // where to create lists
  let insertCoursesHere = document.querySelector('.modal-courses-list');
  let insertPlayersHere = document.querySelector('.modal-players-list');

  // courses modal
  let coursesModal = document.querySelector('.modal-courses');
  let coursesFooter = document.querySelector('.modal-courses-footer');

  // players modal
  let playersModal = document.querySelector('.modal-players');
  let playersFooter = document.querySelector('.modal-players-footer');

  // success modal
  let successDialog = document.querySelector('.modal-success');

  //main display buttons
  let chooseCourseButton = document.querySelector('[rh-button="courses"]');
  let morePlayersButton = document.querySelector('[rh-button="players"]');
  let submitButton = document.querySelector('[goscore]');

  // main display boxes
  let courseDisplaySlot = document.querySelector('.selections-course');
  let playerDisplaySlot = document.querySelector('.selections-players');

  // where to insert error message
  let errorMessage = document.querySelector('.selections-course-error');

  // initialize
  let availablePlayers;
  let availableCourses;
  let chosenPlayers = [];
  let primaryPlayerObject;
  let baseURL;

  // development vs production URL
  switch (window.location.hostname) {
    case 'localhost':
      baseURL = 'http://localhost:3000'
    break;
    case 'discscoring.com':
      baseURL = 'https://discscoring.com:3000'
    break;
    default:
    break;
  };

  let roundSetup = {

    init() {
 
      localforage.getItem('discIDB')
        .then((idbData) => {
          primaryPlayerObject = idbData;
          // primaryPlayerObject["belongsTo"] = idbData._id;

          // inject owner name into DOM
          let playersDisplay = document.querySelector('.selections-players');
          playersDisplay.innerText = primaryPlayerObject.nameFirst;

          roundSetup.getPlayers(primaryPlayerObject);
        });

      // interactive buttons, wow!
      chooseCourseButton.addEventListener('click', () => {
        coursesModal.showModal();
      });
      morePlayersButton.addEventListener('click', (event) => {
        playersModal.showModal();
      });
    }, // end init

    getPlayers(primaryPlayer) {

      fetch(`${baseURL}/api/existingplayers?ownerID=${primaryPlayer._id}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          availablePlayers = data;
          roundSetup.getCourses(availablePlayers, primaryPlayer);
        });
    }, // end getPlayers

    getCourses(availablePlayers, primaryPlayer) {
      fetch(`${baseURL}/api/existingcourses?ownerID=${primaryPlayer._id}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          availableCourses = data;
          roundSetup.assembleData(availableCourses, availablePlayers, primaryPlayer);
        });
    }, // end getCourses

    assembleData(availableCourses, availablePlayers, primaryPlayer) {
      roundSetup.buildCoursesModal(availableCourses);
      roundSetup.buildPlayersModal(availablePlayers, primaryPlayer);
    }, // end assembleData

    buildCoursesModal(availableCourses) {

      availableCourses.forEach(function(course) {
        insertCoursesHere.innerHTML += `
          <label class="modal-courses-item">
            ${course.courseName}
            <input type="radio" name="course" value="${course._id}" />
          </label>
        `;
      }); // end for loop

      // send it along
      roundSetup.manageCoursesModal(availableCourses);
    }, //end buildCoursesModal

    buildPlayersModal(availablePlayers, primaryPlayer) {

      // build the list
      availablePlayers.forEach((player) => {
        insertPlayersHere.innerHTML += `
          <label class="modal-players-item">
            ${player.nameFirst} ${player.nameLast}
            <input type="checkbox" name="player" value="${player._id}"/>
          </label>
        `;
      });

      // add primary player to chosenPlayers array
      chosenPlayers.push(primaryPlayer);
      // just in case no further players are chosen
      localStorage.setItem('chosenPlayers', JSON.stringify(chosenPlayers));

      // send it along
      roundSetup.managePlayersModal(availablePlayers);
    }, // end buildPlayersModal

    manageCoursesModal(availableCourses) {

      coursesFooter.addEventListener('click', (event) => {

        // form data collection
        let formCourseData = new FormData(insertCoursesHere);
        let formCourseID = formCourseData.get('course');
        let chosenCourseObject = availableCourses.find(x => x._id === formCourseID);

        // which "button" was clicked
        let action = event.target.getAttribute('action');
        switch (action) {
          case 'close':
            coursesModal.close();
          break;
          case 'save':

            // add some meta info of the round to course object
            let newRoundID = Math.random().toString(36).substring(2,11);
            newRoundID.toString();
            chosenCourseObject.roundID = newRoundID;
            chosenCourseObject.roundDate = new Date().toLocaleDateString('en-US');

            // then save to localstorage
            localStorage.setItem('chosenCourse', JSON.stringify(chosenCourseObject));

            // then add to main screen
            courseDisplaySlot.innerHTML = `${chosenCourseObject.courseName}`;
            // then remove error message if it's visible
            let errorShow = document.querySelector('.selections-course-error');
            errorShow.classList.remove('selections-course-error-show');

            // then close modal
            coursesModal.close();
          break;
        
          default:
            break;
        };
      }); // end eventListener()
    }, // end manageCoursesModal

    managePlayersModal(availablePlayers) {
      
      //  the main event, clicking on the modal footer
      playersFooter.addEventListener('click', (event) => {

        // grabbing all the playerCheckboxes
        // bc they were created post-load
        let playerCheckboxes = document.querySelectorAll("input[type='checkbox']");

        // which "button" was clicked
        let action = event.target.closest('svg').getAttribute('action');

        switch (action) {
          case 'close':
            playersModal.close();
          break;
          // the big kahuna
          case 'save':

            // find the players from the checked boxes nodeList
              for (let i = 0; i < playerCheckboxes.length; i++) {

                // test state of playerCheckboxes
                if (playerCheckboxes[i].checked == true) {

                  // create the data
                  let checkedPlayerID = playerCheckboxes[i].value;
                  let checkedPlayerObject = availablePlayers.find(x => x._id === checkedPlayerID);
    
                  // push checked player into the array
                  chosenPlayers.push(checkedPlayerObject);
                } else { // find the players from the un-checked boxes

                  // create the data
                  let unCheckedPlayerID = playerCheckboxes[i].value;
                  let unCheckedPlayerObject = availablePlayers.find(x => x.playerID === unCheckedPlayerID);
                  
                  // remove un-checked player from array
                  chosenPlayers.forEach((item, index) => {
                    if (item.playerID == unCheckedPlayerID) {
                      chosenPlayers.splice(index, 1);
                    };
                  });
                }; // end if-else
              }; // end for...

            // just in case there's any duplication due to monkey running
            chosenPlayers = chosenPlayers.filter((obj, index) => {
              return index === chosenPlayers.findIndex(o => obj._id === o._id)
            });
           
            // clearing display slot for re-populating
            playerDisplaySlot.innerText = ''
            // update players display slot on page with accurate list of players
            chosenPlayers.forEach((item) => {
                playerDisplaySlot.innerText += ` ${item.nameFirst }`;
            });

            // then save to localStorage
            localStorage.setItem('chosenPlayers', JSON.stringify(chosenPlayers));
            // then close modal
            playersModal.close();
          break; // end big kahuna
          default:
          break;
        };
      }); // end addEventListener
    }, //end managePlayersModal
  }; // end roundSetup

  roundSetup.init();

  function finalData() {

    submitButton.addEventListener('click', (event) => {
      let players = JSON.parse(localStorage.getItem('chosenPlayers'));
      let course = JSON.parse(localStorage.getItem('chosenCourse'));

      for (let i = 0; i < players.length; i++) {
        // add course meta for round saves
        players[i].courseName = course.courseName;
        players[i].courseID = course._id;
        // add course holes for scorekeeping purposes
        players[i].courseHoles = course.courseHoles;
      }; // end for loop

      // re-save players new data
      localStorage.setItem('chosenPlayers', JSON.stringify(players));

      // off to the show
        setTimeout(() => {
          window.location.href = '/roundscoring.html';
        }, 500);
    }); // end submitButton
  }; //end finalData
  
  finalData();
})();