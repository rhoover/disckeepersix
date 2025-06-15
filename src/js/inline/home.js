(() => {
  'use strict';
  
  // grab DOM elements
  let creds = document.querySelector('.creds');
  let signUpModal = document.querySelector('[data-modal="signup"]');
  let loginModal = document.querySelector('[data-modal="login"]');
  let loginSubmit = document.querySelector('[data-button="login-submit"]');
  let signupSubmit = document.querySelector('[data-button="signup-submit"]');
  let passwordToggle = document.querySelectorAll('.password-show');
  let frontLinks = document.querySelectorAll('.links');
  let logOutNav = document.querySelector('#nav-logout');

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

  // already logged in?
  localforage.getItem('discIDB')
  .then((idbData) => {
    if (idbData) {
      creds.innerHTML = `<p class="creds-signedup">You're already logged in ${idbData.nameFirst}, go have a great round!</p>`;
      frontLinks.forEach(link => {
        link.classList.add('links-active');
      });
    } else {
      return;
    }
  });

  // which top button did you click
  creds.addEventListener('click', (event) => {
    let buttonTarget = event.target.closest('.creds-button');
    let whichButton = buttonTarget.getAttribute('data-button');
    
    switch (whichButton) {
      case 'signup':
        // obvs
        signUpModal.showModal();
        // send to appropriate modal to be handled
        handleOpenModal(document.querySelector('[open]'));
      break;
      case 'login':
        // obvs
        loginModal.showModal();
        // send to appropriate modal to be handled
        handleOpenModal(document.querySelector('[open]'))
      break;
        default:
      break;
    };
  });

  // which dialog modal are you using
  let handleOpenModal = (openModal) => {
      switch (openModal.getAttribute('data-modal')) {
        case "signup":
          let signupForm = openModal.querySelector('.modal-form');
          signupPrimary(signupForm, openModal);
        break;
        case "login":
          let loginForm = openModal.querySelector('.modal-form');
          loginPrimary(loginForm, openModal);
        break;
        default:
        break;
      }
  };

  // password show/hide toggle
  // forEach because it's on two modal dialogs
  passwordToggle.forEach(eye => {
    eye.addEventListener('click', (event) => {
      // clicking on svg bubbles up to parent, i.e. label
      let parentLabel = event.target.closest('label');  
      // password input element
      let siblingInput = parentLabel.querySelector('[required]');
      // toggle
      if (siblingInput.type == "password") {
        siblingInput.type = "text";
      } else {
        siblingInput.type = "password";
      };
    });
  });

  // all signup-dialog steps in one function
  let signupPrimary = (form, openModal) => {

    signupSubmit.addEventListener('click', (event) => {
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

      // collect from form
      let signupNameFirst = form.querySelector('#signup-name-first').value;
      let signupNameLast = form.querySelector('#signup-name-last').value;
      let signupemail = form.querySelector('#signup-email').value;
      let signuppassword = form.querySelector('#signup-password').value;

      let success = openModal.querySelector('[data-success="signup"]');

      let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
      if (!emailRegex.test(signupemail)) {
        success.innerHTML = '<p class="failure" data-success="signup">INVALID EMAIL ADDRESS. Please fix to continue.</p>'
      };

      // create player object
      let playerObject = {
        nameFirst: signupNameFirst,
        nameLast: signupNameLast,
        dateCreated: new Date().toLocaleDateString('en-US'),
        email: signupemail,
        password: signuppassword,
        primary: true,
        coursesPlayed: []
      };

      fetch(`${baseURL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          },
          body: JSON.stringify(playerObject)
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        // already signed up
        if (data.status != 201) {
          setTimeout(() => {
            alert(`Hey ${playerObject.nameFirst}, looks like you've already signed up! So log-in instead.`);
            form.reset();
            openModal.close();
          },350);
          // signing up and locally storing object/mongodb "document"
        } else {
          setTimeout(() => {
            form.reset();
            openModal.close();
            success.innerHTML = '<p data-success="signup">Please KNOW, this info is NOT being Shared With ANY Third Party!</p>';
            creds.innerHTML = `<p class="creds-signedup">Success ${playerObject.nameFirst}! You're Logged In now too. First create a course, then go have A Great Round!</p>`;
          },350);
          localforage.setItem('discIDB', data.owner);
        };

      }); // end fetch.then

      frontLinks.forEach(link => {
        link.classList.add('links-active');
      });
    }); // end addEventListener
  }; // end signupPrimary

  // all login-dialog steps in one function
  let loginPrimary = (form, openModal) => {
    loginSubmit.addEventListener('click', (event) => {
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

      // collect from form
      let loginemail = form.querySelector('#login-email').value;
      let loginpassword = form.querySelector('#login-password').value;

      let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
      if (!emailRegex.test(loginemail)) {
        success.innerHTML = '<p class="failure" data-success="signup">INVALID EMAIL ADDRESS. Please fix to continue.</p>'
      };

      let loginObject = {
        email: loginemail,
        password: loginpassword
      };

      fetch(`${baseURL}/api/loggedin?email=${loginObject.email}&password=${loginObject.password}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (data.status == 200) {
            setTimeout(() => {
              form.reset();
              openModal.close();
              creds.innerHTML = `<p class="creds-signedup">Success ${data.user.nameFirst}! You're logged back in. Go have A Great Round!</p>`;
            },350);
            localforage.setItem('discIDB', data.user);          
          } else {
            alert("Your password doesn't match, please try again");
            let passwordInputElement = document.querySelector('#login-password');
            passwordInputElement.value = "";
          }
        });
    }); // end eventListener
  }; // end loginPrimary

  logOutNav.addEventListener('click', () => {
    localforage.removeitem('discIDB')
    .then(() => {
      location.reload();
    });
  });
})();