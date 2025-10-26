(() => {
  'use strict';

  // grab DOM elements
  let decisionModal = document.querySelector('.modal');
  let insertCourseName = document.querySelector('.modal-warning-name');
  let insertNumberOfRounds = document.querySelector('.modal-warning-number');
  let coursesList = document.querySelector('.items');
  let coursesListTemp = document.querySelector('.items-placeholder');
  let successfulDeletion = document.querySelector('.modal-success');
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
    case 'discscoring.com':
      baseURL = 'https://discscoring.com:3000'
    break;
    default:
    break;
  };

  let listCourses = {

    init() {
      localforage.getItem('discIDB')
        .then((idbData) => {
          primaryPlayerObject = idbData;
          primaryPlayerObject["belongsTo"] = idbData._id;

          listCourses.getCourses(primaryPlayerObject);
        });
    }, // end init

    getCourses(primaryPlayerObject) {

      fetch(`${baseURL}/api/existingcourses?ownerID=${primaryPlayerObject.belongsTo}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          listCourses.buildDOM (data);
        });
    }, //end getCourses

    buildDOM(courses) {
      coursesListTemp.remove();
      courses.forEach((course) => {
        coursesList.innerHTML += `
        <course-card class="item" courseid="${course._id}">
          <p class="item-name">${course.courseName}</p>
          <svg xmlns="http://www.w3.org/2000/svg" class="item-trashcan" viewbox="0 0 875 1000" width="27" height="50">
            <path d="M0 281.296v-68.355q1.953-37.107 29.295-62.496t64.449-25.389h93.744V93.808q0-39.06 27.342-66.402T281.232.064h312.48q39.06 0 66.402 27.342t27.342 66.402v31.248H781.2q37.107 0 64.449 25.389t29.295 62.496v68.355q0 25.389-18.553 43.943t-43.943 18.553v531.216q0 52.731-36.13 88.862T687.456 1000H187.488q-52.731 0-88.862-36.13t-36.13-88.862V343.792q-25.389 0-43.943-18.553T0 281.296zm62.496 0h749.952V218.8q0-13.671-8.789-22.46t-22.46-8.789H93.743q-13.671 0-22.46 8.789t-8.789 22.46v62.496zm62.496 593.712q0 25.389 18.553 43.943t43.943 18.553h499.968q25.389 0 43.943-18.553t18.553-43.943V343.792h-624.96v531.216zm62.496-31.248V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76zm31.248-718.704H624.96V93.808q0-13.671-8.789-22.46t-22.46-8.789h-312.48q-13.671 0-22.46 8.789t-8.789 22.46v31.248zM374.976 843.76V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76zm156.24 0V437.536q0-13.671 8.789-22.46t22.46-8.789h62.496q13.671 0 22.46 8.789t8.789 22.46V843.76q0 13.671-8.789 22.46t-22.46 8.789h-62.496q-13.671 0-22.46-8.789t-8.789-22.46zm31.248 0h62.496V437.536h-62.496V843.76z"/>
          </svg>
          <p class="item-delete">Delete Course</p>
          <p class="item-scored">Completed Rounds Scored:  ${course.roundsScored}</p>
        </course-card>        
        ` // end template literal
      }); // end forEach()

      listCourses.clickTrashCan(courses);
    }, // end buildDOM

    clickTrashCan(courses) {

      customElements.define('course-card', class extends HTMLElement {
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
          let courseToDeleteID = event.target.closest('course-card').getAttribute('courseid');
          let courseCard = event.target.closest('course-card');

          // find course in array and add key dkID
          let chosenCourse = courses.find(x => x._id == courseToDeleteID);
          chosenCourse.dkID = chosenCourse._id;

          let scored = chosenCourse.roundsScored;

          // testing to find number of rounds scored for the clicked course
          // if zero, no need to ask a question in a modal
          switch (scored) {
            case 0:
              // first some UI goodness
              courseCard.classList.add('item-remove');
              //remove course from DOM
              setTimeout(() => {
                courseCard.remove();
              }, 1000);
              // go delete from db
              listCourses.deleteCourse(chosenCourse);
            break;
            // doesn't match the case above, i.e it's not zero, so go to the modal to ask
            // if you really want to delete it
            default: 
              listCourses.chooseInModal(chosenCourse, courseCard);
            break;
          }; // end switch
        }; //end onclick()
      }); // end customElements
    }, // end clickTrashCan

    chooseInModal(chosenCourse, courseCard) {

      // populate the warning at the top of the modal
      insertCourseName.innerText = chosenCourse.courseName;
      insertNumberOfRounds.innerText = chosenCourse.roundsScored;

      decisionModal.showModal();

      decisionModal.addEventListener('click', (event) => {
        let decision = event.target.closest('.modal-choices').getAttribute('options');

        // which button was clicked?
        switch (decision) {
          case 'yes':
            // first some UI goodness
            courseCard.classList.add('item-remove');
            //remove course from DOM
            setTimeout(() => {
              successfulDeletion.innerText = `${chosenCourse.courseName} has been deleted!`;
              courseCard.remove();
            }, 500);
            setTimeout(() => {
              decisionModal.close();
            }, 2000);
            //send to be deleted from db
            listCourses.deleteCourse(chosenCourse);
          break;
          case 'no':
            decisionModal.close();
          break;
          default:
          break;
        };
      });
    }, //end chooseInModal

    deleteCourse(chosenCourse) {
      console.log(chosenCourse);

      fetch(`${baseURL}/api/deletecourse?courseID=${chosenCourse.dkID}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log(data);
        listCourses.successModal(chosenCourse);
      });

    }, // end deleteCourse

    successModal(chosenCourse) {
      
      successModalText.innerText = `${chosenCourse.courseName} has been deleted.`;
      successModal.showModal();

      successModalButton.addEventListener('click', (event) => {
        successModal.close();
      });
    }, // end successModal()
  }; // end listCourses
listCourses.init();
})();