(() => {
  'use strict';

// grab DOM elements
let holesContainer = document.querySelector('.items');
let submitButton = document.querySelector('.submit');
let successDialog = document.querySelector('.success');

  // initialize
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

  let adjustPars = {

    init() {

      //get course object
      async function getCourseObject() {
        let storedCourse = await sessionStorage.getItem('course');
        let newCourse = JSON.parse(storedCourse);
        return newCourse;
      };
      // send it along
      getCourseObject().then(newCourse => {
        adjustPars.buildDOMList(newCourse);
      });
    },

    buildDOMList(courseObject) {

      // for the header
      document.querySelector('.name').innerText = `${courseObject.courseName}`;

      // create to webcomponents for each hole
      courseObject.courseHoles.forEach((hole,index) => {

        holesContainer.innerHTML += `
        <hole-card class="item">
          <p class="item-hole" index="${index}">Hole: ${hole.holeNumber}</p>
          <p class="item-par">Par: <span par="par">${hole.holePar}</span></p>
          <p class="item-advice">Adjust Par:</p>
          <button class="item-increase" action="increasePar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 217.9L383 345c9.4 9.4 24.6 9.4 33.9 0 9.4-9.4 9.3-24.6 0-34L273 167c-9.1-9.1-23.7-9.3-33.1-.7L95 310.9c-4.7 4.7-7 10.9-7 17s2.3 12.3 7 17c9.4 9.4 24.6 9.4 33.9 0l127.1-127z"/></svg>
          </button>
          <button class="item-decrease" action="decreasePar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z"/></svg>
          </button>
        </hole-card>
        ` // end template literal
      });

      // send it along
      adjustPars.dataBinding(courseObject)
    }, // end buildDOMList

    dataBinding(courseObject) {
      
      customElements.define('hole-card', class extends HTMLElement {
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
          let whichButton = event.target.closest('button').getAttribute('action');

          let parDisplay = this.querySelector('[par]');
          let holeIndex = this.querySelector('.item-hole').getAttribute('index');

          let newUpPar, newDownPar;

          switch (whichButton) {
            case 'increasePar':
              parDisplay.innerText++;
              newUpPar = parseFloat(parDisplay.innerText);
              updateCourseObject(holeIndex, newUpPar);
            break;
            case 'decreasePar':
              parDisplay.innerText--;
              newDownPar = parseFloat(parDisplay.innerText);
              updateCourseObject(holeIndex, newDownPar);
            break;
          
            default:
              break;
          }; // end switch()

          // update courseObject
          function updateCourseObject(holeIndex, newPar) {
            courseObject.courseHoles[holeIndex]['holePar'] = newPar;
          };
        }; // end onclick()
      }); // end customElements

      submitButton.addEventListener('click', () => {
        adjustPars.storage(courseObject);
      });
    }, // end dataBinding()

    storage(courseObject) {

      // UI happiness
      successDialog.showModal();

      // clean out, no longer needed
      sessionStorage.removeItem('course');

      fetch(`${baseURL}/api/createcourse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(courseObject)
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.status = 200) {
        console.log(courseObject);
        createNewCourse.newCourseSuccess(courseObject)
        };
      });

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } // end storage
  }; // end adjustPars
  adjustPars.init();
})();