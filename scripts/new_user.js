//DOM Objects
const firstNameInputDOM = document.getElementById("InputFirstName");
const lastNameInputDOM = document.getElementById("InputLastName");
const emailInputDOM = document.getElementById("InputEmail");
const usernameInputDOM = document.getElementById("InputUsername");
const passwordInputDOM = document.getElementById("InputPassword");
const cityInputDOM = document.getElementById("InputCity");
const stateInputDOM = document.getElementById("InputState");
const phoneInputDOM = document.getElementById("InputPhone");
const descInputDOM = document.getElementById("floatingTextarea");
const newUserButtonDOM = document.getElementById("button-submit");
const userCancelButtonDOM = document.getElementById("button-cancel");
const newUserErrorDOM = document.getElementById("new-user-error");

//Bit Flags for input
let firstNameFlag = 1, emailFlag = 2, passwordFlag = 4, cityFlag = 8;
let stateFlag = 16, phoneFlag = 32, descFlag = 64, lastNameFlag = 128;
let usernameFlag = 256;
let inputFlags = 0;
const inputMask = 511;

//Validation
const flagsToInputDOM = new Map();
flagsToInputDOM.set(firstNameFlag, firstNameInputDOM);
flagsToInputDOM.set(lastNameFlag, lastNameInputDOM);
flagsToInputDOM.set(emailFlag, emailInputDOM);
flagsToInputDOM.set(usernameFlag, usernameInputDOM);
flagsToInputDOM.set(passwordFlag, passwordInputDOM);
flagsToInputDOM.set(cityFlag, cityInputDOM);
flagsToInputDOM.set(stateFlag, stateInputDOM);
flagsToInputDOM.set(phoneFlag, phoneInputDOM);
flagsToInputDOM.set(descFlag, descInputDOM);

//Misc
const phoneFormat = "xxx-xxx-xxxx";

//Helpers
function turnOffFlag(flag) {
    inputFlags &= ~(flag);
    //Display form error when user has incorrect input
    const InputDOM = flagsToInputDOM.get(flag);
    if(InputDOM) InputDOM.className = "form-control is-invalid";
}
function turnOnFlag(flag){
    inputFlags |= flag;
    //Let user know their input is correct
    const InputDOM = flagsToInputDOM.get(flag);
    if(InputDOM) InputDOM.className = "form-control is-valid";
}
function isAllFlagsOn() {
    return (inputFlags & inputMask) === inputMask;
}
function validateName(nameValue, nameFlag) {
    if(!nameValue) return turnOffFlag(nameFlag);

    //Name can only contain letters
    for(let i = 0; i < nameValue.length; ++i) {
        char = nameValue[i];
        if(char.toUpperCase() === char.toLowerCase()) 
            return turnOffFlag(nameFlag);
    }
    turnOnFlag(nameFlag);
}

//Events
function validateFirstNameInput() {
    validateName(firstNameInputDOM.value, firstNameFlag);
}
firstNameInputDOM.addEventListener('input', validateFirstNameInput);

function validateLastNameInput() {
    validateName(lastNameInputDOM.value, lastNameFlag);
}
lastNameInputDOM.addEventListener('input', validateLastNameInput);

function validateEmailInput() {
    //BUG - To do validation but as long as non-empty
    // it wont break any code
    const emailValue = emailInputDOM.value;
    if(emailValue) return turnOnFlag(emailFlag);
    else return turnOffFlag(emailFlag);
}
emailInputDOM.addEventListener('input', validateEmailInput);

function validateUsernameInput() {
    //BUG - Users going to search by name or username?
    //I don't know how to validate this
    const usernameValue = usernameInputDOM.value;
    if(usernameValue) return turnOnFlag(usernameFlag);
    else return turnOffFlag(usernameFlag);
}
usernameInputDOM.addEventListener('input', validateUsernameInput);

function validatePasswordInput() {
    //Passwords can be anything as long as they are not empty
    if(passwordInputDOM.value) return turnOnFlag(passwordFlag);
    else return turnOffFlag(passwordFlag);
}
passwordInputDOM.addEventListener('input', validatePasswordInput);

cityInputDOM.addEventListener('input', () => {
    //TODO - City is a string the user can enter
    validateName(cityInputDOM.value, cityFlag);
});
//TODO - Dropdown
stateInputDOM.addEventListener('input', () => {
    validateName(stateInputDOM.value, stateFlag);
});

function validatePhoneInput() {
    const phoneValue = phoneInputDOM.value;
    if(phoneValue.length !== phoneFormat.length) 
        return turnOffFlag(phoneFlag);

    for(let i = 0; i < phoneFormat.length; ++i) {
        if(phoneFormat[i] === 'x') {
            if(phoneValue[i] < '0' || phoneValue[i] > '9')
                return turnOffFlag(phoneFlag);
        } 
        else if(phoneFormat[i] !== phoneValue[i])
            return turnOffFlag(phoneFlag);
    }
    turnOnFlag(phoneFlag);
}
phoneInputDOM.addEventListener('input', validatePhoneInput);

function validateDescInput() {
    //Desc can be anything as long as its not empty
    if(descInputDOM.value) return turnOnFlag(descFlag);
    else return turnOffFlag(descFlag);
}
descInputDOM.addEventListener('input', validateDescInput);

userCancelButtonDOM.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `home.html`
});

//API Calls
async function submitNewUser(e) {
    e.preventDefault();
    console.log(inputFlags);
    if(!isAllFlagsOn()) {
        newUserErrorDOM.innerText = "Make sure all fields are filled properly!"
        return;
    }
    const response = await fetch(`http://127.0.0.1:7000/players`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        //BUG - values missing in the backend
        // city does not get set in the class
        // desc is missing entirely
        // I passed in a string for the phone number and got a 500
        // so catch JsonSyntaxEception
        body: JSON.stringify({
            'firstName': firstNameInputDOM.value,
            'lastName': lastNameInputDOM.value,
            'username': usernameInputDOM.value,
            'password': passwordInputDOM.value, 
            'visible': true,
            'email': emailInputDOM.value,
            //BUG - phoneNumber should be a string in the backend
            //'phoneNumber': phoneInputDOM.value,
            'phoneNumber': 123,
            'state': stateInputDOM.value,
            'city': cityInputDOM.value,
            'description': descInputDOM.value
        })
    });
    if (response.ok) {
        let user = await response.json();
        //TODO/BUG - Automatically log the user in?
        //window.location.href = `userProfile.html`;
        window.location.href = `home.html`;
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        newUserErrorDOM.innerText = text;
    }
}
newUserButtonDOM.addEventListener('click', submitNewUser);
