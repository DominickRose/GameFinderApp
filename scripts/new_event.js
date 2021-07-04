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
const monthToTotalDays = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 366];
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
function validateNameWithSpaces(nameValue, nameFlag) {
    if(!nameValue) return turnOffFlag(nameFlag);

    //Name can only contain letters
    for(let i = 0; i < nameValue.length; ++i) {
        char = nameValue[i];
        if(char === ' ') continue;
        if(char.toUpperCase() === char.toLowerCase()) 
            return turnOffFlag(nameFlag);
    }
    turnOnFlag(nameFlag);
}
function getDigit(char) {
    if(char < '0' || char > '9') return -10000;
    return char * 1;
}
function eventNumDateToString(eventDate) {
    let base = "00/00/0000:00:00 AM";
    //Extract Hours + Minutes
    let minutes = eventDate % 60;
    eventDate -= minutes;
    eventDate /= 60;
    let hours = eventDate % 24;
    eventDate -= hours;
    eventDate /= 24;
    //Determine AM/PM
    let pm = 'A';
    if(hours > 11) pm = 'P';
    //Fix hours number
    if(pm === 'A') {
        if(hours === 0) hours = 12;
    }
    else if(pm === 'P') {
        if(hours !== 12) hours -= 12;
    }
    //Get minutes to string form
    let startPos = minutes >= 10 ? 14 : 15;
    base = base.substr(0, startPos) + `${minutes} ${pm}` + base.substr(18);
    //Get hours to string form
    startPos = hours >= 10 ? 11 : 12;
    base = base.substr(0, startPos) + `${hours}` + base.substr(13);
    
    //Extract Year
    let year = Math.trunc(eventDate / 365); 
    eventDate -= year * 365;
    if(year >= 1000) startPos = 6;
    else if(year >= 100) startPos = 7; 
    else if(year >= 10) startPos = 8;
    else startPos = 9;
    base = base.substr(0, startPos) + `${year}` + base.substr(10);

    //Extract Months + Days
    let month;
    for(month = 0; month < monthToTotalDays.length; ++month) {
        if(eventDate < monthToTotalDays[month]) break;
    }
    let days = (eventDate - monthToTotalDays[--month])+1;
    startPos = days >= 10 ? 3 : 4;
    base = base.substr(0, startPos) + `${days}` + base.substr(5);
    startPos = month >= 10 ? 0 : 1;
    base = base.substr(0, startPos) + `${month}` + base.substr(2);
    return base;
}
function setInputFields(event) {
    nameInputDOM.value = event.eventTitle;
    validateNameWithSpaces(nameInputDOM.value, nameFlag);
    numPlayersInputDOM.value = event.maxPlayers;
    validateNumPlayersInput();
    cityInputDOM.value = event.city;
    validateName(cityInputDOM.value, cityFlag);
    stateInputDOM.value = event.state;
    validateName(stateInputDOM.value, stateFlag);
    typeInputDOM.value = event.eventType;
    validateTypeInput();
    whenInputDOM.value = eventNumDateToString(event.eventDate);
    validateWhenInput();
    skillInputDOM.value = event.skillLevel;
    validateName(skillInputDOM.value, skillFlag);
    descInputDOM.value = event.description;
    validateDescInput();
}

//Events
function validateNameInput() {
    validateNameWithSpaces(nameInputDOM.value, nameFlag);
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
    //Hour must be between 1 and 12
    if(hour < 1 || hour > 12) {
        eventWhenErrorDOM.innerText = "Hour must be between 1-12";
        return turnOffFlag(whenFlag);
    }
    //Convert hour to 0-23
    //AM -> 0-11
    //PM -> 12-23
    if(whenValue[17] === 'A') {
        if(hour === 12) hour = 0;
    }
    else if(whenValue[17] === 'P') {
        if(hour !== 12) hour += 12;
    }

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
async function submitEvent(e, method, id) {
    e.preventDefault();
    user = JSON.parse(localStorage.getItem("login-info"));
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
        method: method,
        headers:{'Content-Type':"application/json"},
        body: JSON.stringify(event)
    }

    //BUG - Users cannot post events whose dates are in the past

    const response = await fetch("http://localhost:7000/events"+id, config);
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
async function getEvent(eventId) {
    const response = await fetch(`http://localhost:7000/events/${eventId}`);
    if(response.ok){
        currentEvent = await response.json()
        return currentEvent;
    }else{
        window.location.href = `404.html`;
        return null;
    }
}

async function initializeForm() {
    let params = new URLSearchParams(window.location.search);
    let eventId = params.get('eventId');
    if(!eventId) {
        newEventButtonDOM.addEventListener('click', async (e) => {
            e.preventDefault();
            await submitEvent(e, "POST", "");
        });
        return;
    }
    const curEvent = await getEvent(eventId);
    if(curEvent) {
        newEventButtonDOM.innerText = "Update";
        newEventButtonDOM.addEventListener('click', async (e) => {
            e.preventDefault();
            await submitEvent(e, "PUT", `/${eventId}`);
        });
        setInputFields(curEvent);
    }
}

//Process
setupStateDropdown();
setupSkillDropdown();
setupTypeDropdown();
initializeForm();