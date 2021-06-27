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
const newEventErrorDOM = document.getElementById("new-event-error");

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

//Misc - Can be AM or PM
const whenFormat = "MM/DD/YYYY:HH:MM AM";
const monthToDays =      [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const monthToTotalDays = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
let numInputTime = 0;

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
    if(char < '0' || char > '9') return -1000;
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

//TODO - possible dropdown with set options?
stateInputDOM.addEventListener('input', () => {
    validateName(stateInputDOM.value, stateFlag);
});
skillInputDOM.addEventListener('input', () => {
    //Beginner
    //INterm
    //Expert
    validateName(skillInputDOM.value, skillFlag);
});

//TODO - Dropdowns
//6-on-6
//4-on-4
//3-on-3
//2-on-2
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
    if(whenValue.length !== whenFormat.length)
        return turnOffFlag(whenFlag);

    console.log(whenValue);
    //BUG - Inform user exactly what went wrong  
    //Check for slashes
    if(whenValue[2] !== '/' || whenValue[5] !== '/')
        return turnOffFlag(whenFlag);
 
    //Check colons
    if(whenValue[10] !== ':' || whenValue[13] !== ':')
        return turnOffFlag(whenFlag);
    
    //Check space
    if(whenValue[16] !== ' ') return turnOffFlag(whenFlag);

    //Check AM/PM
    if(whenValue[17] !== 'A' && whenValue[17] !== 'P')
        return turnOffFlag(whenFlag);
    if(whenValue[18] !== 'M') return turnOffFlag(whenFlag);

    //Hour
    let hour = (getDigit(whenValue[11]) * 10) + getDigit(whenValue[12]);
    console.log(hour);
    //Hour must be between 1 and 12
    if(hour < 1 || hour > 12) return turnOffFlag(whenFlag);
    if(hour === 12 && whenValue[17] === 'A') hour = 0;
    if(whenValue[17] === 'P') hour += 12;

    //Minute
    let minute = (getDigit(whenValue[14]) * 10) + getDigit(whenValue[15]);
    //Minute must be between 0 and 59
    if(minute < 0 || minute > 59) return turnOffFlag(whenFlag);

    //Month
    let month = (getDigit(whenValue[0]) * 10) + getDigit(whenValue[1]);
    //Month must be between 1 and 12
    if(month < 1 || month > 12) return turnOffFlag(whenFlag);

    //Day
    let day = (getDigit(whenValue[3]) * 10) + getDigit(whenValue[4]);
    //Day must be within bounds depending on month
    if(day < 1 || day > monthToDays[month]) return turnOffFlag(whenFlag);
    day -= 1;

    //Year
    let year = (getDigit(whenValue[6]) * 1000) + (getDigit(whenValue[7] * 100));
    year += ((getDigit(whenValue[8]) * 10) + getDigit(whenValue[9]));
    //BUG - Users cannot post events whose dates are in the past

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
    window.location.href = `userProfile.html`
});

//API Calls
async function submitNewEvent() {
    //TODO: Please implement this function and fix any bugs you can
    //Note that the when should be stored as a number in the back end
    //(numInputTime)
    e.preventDefault();
}
newEventButtonDOM.addEventListener('click', submitNewEvent);
