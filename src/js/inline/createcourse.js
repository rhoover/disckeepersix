(() => {
  'use strict';

// grab the DOM elements
let createCourseForm = document.querySelector('.form');
let formResponseSection = document.querySelector('.form-response');
let existsDialog = document.querySelector('.exists');
let existsText = document.querySelector('.exists-text');
let existsDialogButton = document.querySelector('.exists-button');

let successDialog = document.querySelector('.success');
let successText = document.querySelector('.success-text');
let successDialogButton = document.querySelector('.success-button');

// initialize
let courseObject = {};
let holesArray = [];
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

let createNewCourse = {

  init() {

    localforage.getItem('discIDB')
      .then((idbData) => {
        courseObject = {
          'belongsTo' : idbData._id
        };
        createNewCourse.existingCourses(courseObject);
      });
    }, // end init

  existingCourses(courseObject) {

    fetch(`${baseURL}/api/existingcourses?ownerID=${courseObject.belongsTo}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        createNewCourse.actualCreation(courseObject, data);
      });
  }, // end existingCourses

  actualCreation(courseObject, data) {

    formResponseSection.addEventListener('click', (event) => {
      event.preventDefault();
  
      // which button did we click?
      let whichButton = event.target.getAttribute('value');
  
      // first build  the course object
      courseObject.courseName = createCourseForm.querySelector('#coursename').value;
  
      let holeNumbers = createCourseForm.querySelector('input[name="holeradio"]:checked').value;
      let holesLengthNumber = parseInt(holeNumbers, 10);
      courseObject.courseLength = holesLengthNumber;
  
      courseObject.roundsScored = 0;
      courseObject.courseCreated = new Date().toLocaleDateString('en-US');
  
      // then build the courseHoles array, i.e. each hole
      holesArray.length = courseObject.courseLength;
      for (let i = 0; i < holesArray.length; i++) {
        holesArray[i] = {
          holeNumber: 1 + i,
          holePar: 3,
          holeThrows: 0,
          holeOverUnder: 0,
          roundOverUnder: 0,
          roundThrows: 0
        };
      };
      courseObject.courseHoles = holesArray;

      createNewCourse.checkDuplicate(courseObject, data, whichButton);
    }); // end eventListener
  }, // end actualCreation

  checkDuplicate(courseObject, data, whichButton) {
    let flag = false;

    // data is an array, loop through it looking for a match
    // if match is found, bail to exists dialog
    for (let i = 0; i < data.length; i++) {
      if ( Object.keys(data[i]).find(key => data[i][key] == courseObject.courseName)) {
        flag = true;
        createNewCourse.alreadyExists(data[i]);
      };
    };

    // if not a duplicate
    if (flag == false) {
      // decide what to do with the course object
      // depending on which button we clicked
      switch (whichButton) {
        case 'samepar':
          createNewCourse.newCourseStorage(courseObject);
        break;
        case 'differentpar':
          createNewCourse.goToAdjustPars(courseObject);
        break;
      
        default:
        break;
      };        
    };
  }, // end checkDuplicate

  alreadyExists(data) {
    existsText.innerHTML = `${data.courseName} already exists!`;
    existsDialog.showModal();
    existsDialogButton.addEventListener('click', () => {
      existsDialog.close();
      createCourseForm.reset();
    });
  }, // end alreadyExists

  newCourseStorage(courseObject) {
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
  }, // end newCourseStorage

  newCourseSuccess(courseObject) {
    successText.innerHTML = `${courseObject.courseName} has been created!`;
    successDialog.showModal();
    successDialogButton.addEventListener('click', () => {
      successDialog.close();
      createCourseForm.reset();
    });
  },

  goToAdjustPars(courseObject) {
    // temporarily store here so next page can grab it
    let newCourseJSON = JSON.stringify(courseObject);
    sessionStorage.setItem("course", newCourseJSON);
    setTimeout(() => {
      window.location.href = '/adjustpars.html';
    }, 500);
  } // end goToAdjustPars
}; // end createNewCourse

createNewCourse.init();
})();