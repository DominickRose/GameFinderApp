//BUG - check if user is viewing thier profile or someone else
//BUG - This is written assuming the user is logged in

//DOM Objects - Profile Display
const profileContentDOM = document.getElementById("profile");
const emailTextDOM = document.getElementById("email-text");
const phoneTextDOM = document.getElementById("phone-number-text");
const cityStateTextDOM = document.getElementById("city-state-text");
const nameTextDOM = document.getElementById("name-text");
const bioTextDOM = document.getElementById("bio-text");

//DOM Objects - Update Profile
const cityInputDOM = document.getElementById("InputCity");
const stateInputDOM = document.getElementById("InputState");
const emailInputDOM = document.getElementById("InputEmail");
const phoneInputDOM = document.getElementById("InputPhone");
const updateProfileButton = document.getElementById("update-button");

//Bit Flags for input
let cityFlag = 1, stateFlag = 2, emailFlag = 4, phoneFlag = 8;
let inputFlags = 0;
const inputMask = 15;

//Validation
const flagsToInputDOM = new Map();
flagsToInputDOM.set(cityFlag, cityInputDOM);
flagsToInputDOM.set(stateFlag, stateInputDOM);
flagsToInputDOM.set(emailFlag, emailInputDOM);
flagsToInputDOM.set(phoneFlag, phoneInputDOM);

//Misc
const phoneFormat = "xxx-xxx-xxxx";

//DOM Objects - Visability + Close
const publicProfileButton = document.getElementById("button-public");
const privateProfileButton = document.getElementById("button-private");
const visibleTextDOM = document.getElementById("visibility-text");
const newEventButtonDOM = document.getElementById("button-new-event");
const deleteUserButtonDOM = document.getElementById("delete-user-button");

//Helper Function - Validation
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

//Helper Functions - Display
function updateVisibilityText(visible) {
    if(visible) {
        visibleTextDOM.innerText = "Your profile is visible";
        visibleTextDOM.className = "u-color-green mt-3";
    }
    else {
        visibleTextDOM.innerText = "Your profile is not visible";
        visibleTextDOM.className = "u-color-red mt-3";
    }
}

//API Calls
async function updateUser(json_body) {
    const response = await fetch(`http://127.0.0.1:7000/players/${json_body.playerId}`, {
        method: 'PUT',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(json_body)
    });
    if (response.ok) {
        let user = await response.json();
        console.log(user);
        localStorage.setItem("login-info", JSON.stringify(user));
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        return text;
    }
    return "";
}
async function deleteUser(e) {
    e.preventDefault();
    if(!localStorage.getItem("login-info")) return;
    //BUG - passed in undefined as id and got a 500
    const user = localStorage.getItem("login-info");
    //const user = JSON.parse(localStorage.getItem("login-info"));
    const response = await fetch(`http://127.0.0.1:7000/players/${user.playerId}`, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });
    if (response.ok) {
        localStorage.removeItem("login-info");
        window.location.href = `home.html`;
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
    }
}
deleteUserButtonDOM.addEventListener('click', deleteUser);


//Events - Settings Tab
//BUG - possible dropdown with set options?
cityInputDOM.addEventListener('input', () => {
    cityInputDOM.value ? turnOnFlag(cityFlag) : turnOffFlag(cityFlag);
});
stateInputDOM.addEventListener('input', () => {
    stateInputDOM.value ? turnOnFlag(stateFlag) : turnOffFlag(stateFlag);
});

function validateEmailInput() {
    //BUG - To do validation but as long as non-empty
    // it wont break any code
    const emailValue = emailInputDOM.value;
    if(emailValue) return turnOnFlag(emailFlag);
    else return turnOffFlag(emailFlag);
}
emailInputDOM.addEventListener('input', validateEmailInput);

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

async function makePublic(e) {
    e.preventDefault();
    let user = JSON.parse(localStorage.getItem("login-info"));
    user.visible = true;
    let result = await updateUser(user);
    if(result === "") updateVisibilityText(user.visible);
}
publicProfileButton.addEventListener('click', makePublic);

async function makePrivate(e) {
    e.preventDefault();
    let user = JSON.parse(localStorage.getItem("login-info"));
    user.visible = false;
    let result = await updateUser(user);
    if(result === "") updateVisibilityText(user.visible);
}
privateProfileButton.addEventListener('click', makePrivate);

async function updateProfile(e) {
    e.preventDefault();
    if(!isAllFlagsOn()) {
        return;
    }
    let user = JSON.parse(localStorage.getItem("login-info"));
    user.state = stateInputDOM.value;
    user.city = cityInputDOM.value;
    user.email = emailInputDOM.value;
    user.phoneNumber = phoneInputDOM.value;
    let result = await updateUser(user);
    if(result === "") initUserProfile();
}
updateProfileButton.addEventListener('click', updateProfile);

newEventButtonDOM.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `createEvent.html`;
});

function initUserProfile() {
    let user = JSON.parse(localStorage.getItem("login-info"));
    //Profile Text
    nameTextDOM.innerText = user.firstName + " " + user.lastName;
    emailTextDOM.innerText = user.email;
    phoneTextDOM.innerText = user.phoneNumber;
    cityStateTextDOM.innerText = user.city + ", " + user.state;
    //BUG - bio is missing
    //BUG - Recent events are missing
    //Settings
    updateVisibilityText(user.visible);
    stateInputDOM.value = user.state;
    validateName(stateInputDOM.value, stateFlag);
    cityInputDOM.value = user.city;
    validateName(cityInputDOM.value, cityFlag);
    emailInputDOM.value = user.email;
    validateEmailInput();
    phoneInputDOM.value = user.phoneNumber;
    validatePhoneInput();
}

//Process
initUserProfile();