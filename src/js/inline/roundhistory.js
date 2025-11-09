(() => {
  'use strict';

  // DOM Elements
  let chooseSection = document.querySelector('.choose');
  let roundsSection = document.querySelector('.rounds');
  let roundsWarning = document.querySelector('.roundhistory');
  let statsEncourage = document.querySelector('.stats');
  let roundsSectionDialogs = document.querySelectorAll('.course');
  let primaryPlayerObject;

  // round-detail dialog
  let roundModal = document.querySelector('.round-modal');
  let roundModalHeader = document.querySelector('.round-modal-header');
  let closeButton = document.querySelector('.round-modal-close');
  let holesSection = document.querySelector('.round-modal-holes');

  //initialize
  let roundsData = [];
  let dedupeMe;
  let dateOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

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

  let roundHistory = {

    init() {
      
      localforage.getItem('discIDB')
        .then((idbData) => {
          primaryPlayerObject = idbData;
          primaryPlayerObject["belongsTo"] = idbData._id;

          roundHistory.getRounds(primaryPlayerObject);
        });
    }, // end init

    getRounds(primary) {

      fetch(`${baseURL}/api/existingrounds?ownerID=${primary.belongsTo}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (data.length == 0) {

            statsEncourage.remove();
            roundsSection.remove();
            chooseSection.remove();

            roundsWarning.innerHTML += `
              <p class="warning">You don't have any rounds saved yet,</p>
              <a href="/roundsetup.html" class="warning-link">Go ahead and start one!  ➤</a>
            `;
            
          } else {
          roundHistory.massageRoundsData(data);
          };
        });
    }, // end getRounds

    massageRoundsData(roundsData) {

      //sort by date
      roundsData.sort((a,b) => {
        return new Date(b.roundDate) - new Date(a.roundDate);
      });

      // dedupe so only one courseName appearance in choose section
      if (roundsData.length > 1) {
        dedupeMe = roundsData.filter((obj, index) => {
          return index === roundsData.findIndex(o => obj.courseName === o.courseName)
        });
        roundHistory.buildChooseCourseSection(dedupeMe);
        roundHistory.buildRoundsList(roundsData, dedupeMe);
      } else {
        roundHistory.buildChooseCourseSection(roundsData);
        roundHistory.buildRoundsList(roundsData, dedupeMe);
    };

    }, // end massageRoundsData

    buildChooseCourseSection(incomingData) {

      chooseSection.innerHTML = ``;

      incomingData.forEach((course) => {
        chooseSection.innerHTML += `
        <button class="button" course="${course.courseID}">${course.courseName}</button>
        `;
      }); // end forEach()
      // roundHistory.manageRoundsList(roundsData);
    }, // end buildChooseCourseSection

    manageChooseCourseSectionButtons() {

      customElements.define('choose-section', class extends HTMLElement {
        constructor() {
          super();
        };
      
        handleEvent(event) {
          this[`on${event.type}`](event);
        };
      
        connectedCallback() {
          this.addEventListener('click', this);
        };
      
        onclick(event) {
          let courseChoiceClicked = event.target.getAttribute('course');

          // show the appropriate dialog
          roundsSectionDialogs.forEach((round) => {
            if (courseChoiceClicked == round.getAttribute('courseid')) {
              round.showModal();
            };
          });
        }; // end onclick()
      }); // end customElements.define()
    }, // end manageChooseCourseSectionButtons()

    // buildRoundsList(roundsData, dedupedData) {
    buildRoundsList(roundsData, dedupedData) {

      // first create each dialog in the section, depending on the data source
      if (dedupedData) { // more than one round
        createDOM(dedupedData);
      } else { // only one round
        createDOM(roundsData);
      };
      function createDOM(incomingRoundsData) {
        incomingRoundsData.forEach((course) => {
          roundsSection.innerHTML += `
          <course-component>
            <dialog class="course" courseid="${course.courseID}" coursename="${course.courseName}">
            </dialog>
          </course-component>
          `;
        });        
      };

      // then capture each dialog element in the section
      roundsSectionDialogs = document.querySelectorAll('.course');

      // then populate each dialog element for each course
      roundsSectionDialogs.forEach((course) => {
        roundsData.forEach((round) => {

          if (round.courseID === course.getAttribute('courseid')) {
            
            let dateReadable = new Date(round.roundDate).toLocaleDateString("en-US", dateOptions);

            course.innerHTML += `
            <div class="round" roundid="${round._id}">
              <div class="round-header">
                <p class="round-header-name">${round.courseName}</p>
                <p class=round-header-date> ${dateReadable}</p>
              </div>
              <p class="round-score"><span>Scored ${round.finalScore}</span><br /><span>from</span><br /><span> ${round.finalThrows} Throws</span></p>
              <button class="round-arrow" roundid="${round._id}">Details  ➤</button>
            </div>
          `;
          }; // end if
        }); // end roundsData forEach()
        course.innerHTML += `<button class="close">Close</button>`;
      }); // end courseTragets forEach()

      roundHistory.manageRoundsList(roundsData);

    }, // buildRoundsList

    manageRoundsList(roundsData) {

      customElements.define('course-component', class extends HTMLElement {
        // 'course-component' is each dialog for a particular course, containing it's multiple rounds to choose from and click "details"
        constructor() {
          super();
        };
      
        handleEvent(event) {
          this[`on${event.type}`](event);
        };
      
        connectedCallback() {
          this.addEventListener('click', this);
        };
      
        onclick(event) {

          let openCourseDialog = document.querySelector('[open].course');

          // close button closes dialog
          if (event.target.closest = '.close') {
            openCourseDialog.close();
          };

          // which button in the list of rounds was clicked
          let detailsClicked = event.target.getAttribute('roundid');

          // search the roundsData for the matching round
          roundsData.forEach((round) => {
            if (detailsClicked == round._id) {
              // send the data along
              roundHistory.roundDetail(round);
              // and close the dialog
              openCourseDialog.close();
            };
          }); // end forEach()
        }; // end onclick()
      }); // end customElements.define()
    }, // end manageRoundsList()

    roundDetail(round) {

      let holesArray = round.holes;
      let dateReadable = new Date(round.roundDate).toLocaleDateString("en-US", dateOptions);

      // build DOM inside modal from data
      roundModalHeader.innerHTML = `<p>${round.courseName}</p> <p>${dateReadable}</p>`;

      holesArray.forEach((hole) => {
        holesSection.innerHTML += `
        <div class="round-modal-hole">
          <div class="round-modal-hole-header">
            <p>Hole ${hole.holeNumber}</p>
            <p>Par: ${hole.holePar}</p>
          </div>
          <div class="round-modal-hole-holedata">
            <p>Hole:</p>
            <p>Throws:  ${hole.holeThrows}</p>
            <p>Score:   ${hole.holeOverUnder == 0
            ? `Par`
            : `${hole.holeOverUnder}`
            }</p>
          </div>
          <div class="round-modal-hole-rounddata">
            <p>Round So Far:</p>
            <p>Throws:  ${hole.roundThrows}</p>
            <p>Score:   ${hole.roundOverUnder == 0
            ? `Par`
            : `${hole.roundOverUnder}`
            }
            </p>
          </div>
        </div>
      `;
      }); // end forEach()

      // show it now that it's been populated
      roundModal.showModal();

      // close button inside round modal
      closeButton.addEventListener('click', () => {
        roundModal.close();
        // clear out the section in case they want to look at another round of the same course
        holesSection.innerHTML = ``;
      });

    }, // end roundDetail()
  };

  roundHistory.init();
  roundHistory.manageChooseCourseSectionButtons();
})();