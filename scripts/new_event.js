//Only logged in users can create events
if(!localStorage.getItem("login-info"))
    window.location.href = `home.html`;

//DOM Objects
const nameInputDOM = document.getElementById("InputName");
const numPlayersInputDOM = document.getElementById("Input#Players");    
const cityInputDOM = document.getElementById("InputCity");
const stateInputDOM = document.getElementById("InputState");
const typeInputDOM = document.getElementById("InputType");
const whenInputDOM = document.getElementById("InputWhen");
const skillInputDOM = document.getElementById("InputSkill");
const descInputDOM = document.getElementById("floatingTextarea");
const newEventButtonDOM = document.getElementById("button-submit");
const eventCancelButtonDOM = document.getElementById("button-cancel");
let newEventErrorDOM = document.getElementById("new-event-error");
let eventWhenErrorDOM = document.getElementById("when-error");

//Bit Flags for input
let nameFlag = 1, numPlayFlag = 2, cityFlag = 4, stateFlag = 8;
let typeFlag = 16, whenFlag = 32, skillFlag = 64, descFlag = 128;
let inputFlags = 0;
const inputMask = 255;

//Validation
const flagsToInputDOM = new Map();
flagsToInputDOM.set(nameFlag, nameInputDOM);
flagsToInputDOM.set(numPlayFlag, numPlayersInputDOM);
flagsToInputDOM.set(cityFlag, cityInputDOM);
flagsToInputDOM.set(stateFlag, stateInputDOM);
flagsToInputDOM.set(typeFlag, typeInputDOM);
flagsToInputDOM.set(whenFlag, whenInputDOM);
flagsToInputDOM.set(skillFlag, skillInputDOM);
flagsToInputDOM.set(descFlag, descInputDOM);

//Misc 
const states = [" ", "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
                "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
                "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
                "TN", "TX", "UT", "VT", "VA", "VI", "WA", "WV", "WI", "WY"];
const skillLevels = [" ", "Beginner", "Intermediate", "Expert"];
const types = [" ", "2-on-2", "3-on-3", "4-on-4", "6-on-6"];
//Can be AM or PM
const whenFormat = "MM/DD/YYYY:HH:MM AM";
const monthToDays =      [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const monthToTotalDays = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
let numInputTime = 0;

//Dropdown setups
function setupStateDropdown() {
    let finalInnerHTML = `<option id="state-option-none" selected>${states[0]}</option>`;
    for(let i = 1; i < states.length; ++i) {
        finalInnerHTML += `
         <option id="state-option-${states[i]}">${states[i]}</option>
        `;
    }
    stateInputDOM.innerHTML = finalInnerHTML;
}
function setupSkillDropdown() {
    let finalInnerHTML = `<option id="skill-option-none" selected>${skillLevels[0]}</option>`;
    for(let i = 1; i < skillLevels.length; ++i) {
        finalInnerHTML += `
         <option id="skill-option-${skillLevels[i]}">${skillLevels[i]}</option>
        `;
    }
    skillInputDOM.innerHTML = finalInnerHTML;
}
function setupTypeDropdown() {
    let finalInnerHTML = `<option id="type-option-none" selected>${types[0]}</option>`;
    for(let i = 1; i < types.length; ++i) {
        finalInnerHTML += `
         <option id="type-option-${types[i]}">${types[i]}</option>
        `;
    }
    typeInputDOM.innerHTML = finalInnerHTML;
}

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
function getDigit(char) {
    if(char < '0' || char > '9') return -10000;
    return char * 1;
}

//Events
function validateNameInput() {
    validateName(nameInputDOM.value, nameFlag);
}
nameInputDOM.addEventListener('input', validateNameInput);

function validateNumPlayersInput() {
    //Events must have 2 or more participants
    if(!numPlayersInputDOM.value || numPlayersInputDOM.value <= 1)
        return turnOffFlag(numPlayFlag);

    turnOnFlag(numPlayFlag);
}
numPlayersInputDOM.addEventListener('input', validateNumPlayersInput);


cityInputDOM.addEventListener('input', () => {
    validateName(cityInputDOM.value, cityFlag);
});

stateInputDOM.addEventListener('input', () => {
    validateName(stateInputDOM.value, stateFlag);
});
skillInputDOM.addEventListener('input', () => {
    validateName(skillInputDOM.value, skillFlag);
});

function validateTypeInput() {
    const typeValue = typeInputDOM.value;
    if(typeValue) return turnOnFlag(typeFlag);
    else return turnOffFlag(typeFlag);
}
typeInputDOM.addEventListener('input', validateTypeInput);

function validateDescInput() {
    //Desc can be anything as long as its not empty
    if(descInputDOM.value) return turnOnFlag(descFlag);
    else return turnOffFlag(descFlag);
}
descInputDOM.addEventListener('input', validateDescInput);

function validateWhenInput() {
    const whenValue = whenInputDOM.value;
    if(whenValue.length !== whenFormat.length) {
        eventWhenErrorDOM.innerText = "Enter start date in this format: MM/DD/YYYY:HH:MM AM";
        return turnOffFlag(whenFlag);
    }

    console.log(whenValue);
    //Check for slashes
    if(whenValue[2] !== '/' || whenValue[5] !== '/') {
        eventWhenErrorDOM.innerText = "You're missing slashes";
        return turnOffFlag(whenFlag);
    }
 
    //Check colons
    if(whenValue[10] !== ':' || whenValue[13] !== ':') {
        eventWhenErrorDOM.innerText = "You're missing colons";
        return turnOffFlag(whenFlag);
    }
    
    //Check space
    if(whenValue[16] !== ' ') {
        eventWhenErrorDOM.innerText = "You're missing a space before AM/PM";
        return turnOffFlag(whenFlag);
    }

    //Check AM/PM
    if(whenValue[18] !== 'M' || (whenValue[17] !== 'A' && whenValue[17] !== 'P')) {
        eventWhenErrorDOM.innerText = "Final two characters should be AM or PM";
        return turnOffFlag(whenFlag);
    }


    //Hour
    let hour = (getDigit(whenValue[11]) * 10) + getDigit(whenValue[12]);
    console.log(hour);
    //Hour must be between 1 and 12
    if(hour < 1 || hour > 12) {
        eventWhenErrorDOM.innerText = "Hour must be between 1-12";
        return turnOffFlag(whenFlag);
    }
    if(hour === 12 && whenValue[17] === 'A') hour = 0;
    if(whenValue[17] === 'P') hour += 12;

    //Minute
    let minute = (getDigit(whenValue[14]) * 10) + getDigit(whenValue[15]);
    //Minute must be between 0 and 59
    if(minute < 0 || minute > 59) {
        eventWhenErrorDOM.innerText = "Minute must be between 0-59";
        return turnOffFlag(whenFlag);
    }

    //Month
    let month = (getDigit(whenValue[0]) * 10) + getDigit(whenValue[1]);
    //Month must be between 1 and 12
    if(month < 1 || month > 12) {
        eventWhenErrorDOM.innerText = "Month must be between 1-12";
        return turnOffFlag(whenFlag);
    }

    //Day
    let day = (getDigit(whenValue[3]) * 10) + getDigit(whenValue[4]);
    //Day must be within bounds depending on month
    if(day < 1 || day > monthToDays[month]) {
        eventWhenErrorDOM.innerText = "Day must be between 1-"+monthToDays[month];
        return turnOffFlag(whenFlag);
    }
    day -= 1;

    //Year
    let year = (getDigit(whenValue[6]) * 1000) + (getDigit(whenValue[7]) * 100);
    year += ((getDigit(whenValue[8]) * 10) + getDigit(whenValue[9]));
    if(year < 0) {
        eventWhenErrorDOM.innerText = "Year must be 4 digits";
        return turnOffFlag(whenFlag);
    }

    eventWhenErrorDOM.innerText = "";
    turnOnFlag(whenFlag);
    //Convert string time to number 
    //(basically approx minutes) 
    numInputTime = year * 365 * 24 * 60;
    numInputTime += monthToTotalDays[month] * 24 * 60;
    numInputTime += day * 24 * 60;
    numInputTime += hour * 60;
    numInputTime += minute;
    console.log(numInputTime);
}
whenInputDOM.addEventListener('input', validateWhenInput);

eventCancelButtonDOM.addEventListener('click', (e) => {
    e.preventDefault();
    let params = new URLSearchParams();
    params.set('user', "me");
    window.location.href = `userProfile.html?${params.toString()}`;
});

//API Calls
async function submitNewEvent(e) {
    e.preventDefault();
    user = localStorage.getItem("login-info");
    if(!user) return;
    if(!isAllFlagsOn()) {
        newEventErrorDOM.innerText = "Make sure all fields are filled properly!"
        return;
    }
    const event = {
        "ownerId":user.playerId,
	    "eventDate":numInputTime,
	    "city":cityInputDOM.value,
	    "state":stateInputDOM.value,
	    "description":descInputDOM.value,
	    "skillLevel":skillInputDOM.value,
	    "eventTitle":nameInputDOM.value,
	    "eventType":typeInputDOM.value,
	    "maxPlayers":numPlayersInputDOM.value
    }

    const config = {
        method:"POST",
        headers:{'Content-Type':"application/json"},
        body: JSON.stringify(event)
    }

    //BUG - Users cannot post events whose dates are in the past
    const response = await fetch("http://localhost:7000/events", config)

        if(response.ok){
            let newEvent = await response.json();
            let params = new URLSearchParams();
            params.set('eventId', newEvent.eventId);
            window.location.href = `viewEvent.html?${params.toString()}`;
        }else{
            let text = await response.text();
            console.log(response.status, text);
        }

}
newEventButtonDOM.addEventListener('click', submitNewEvent);

//Process
setupStateDropdown();
setupSkillDropdown();
setupTypeDropdown();