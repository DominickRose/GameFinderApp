//Input DOMs
const nameInputDOM = document.getElementById("InputName");
const skillInputDOM = document.getElementById("InputSkill");
const stateInputDOM = document.getElementById("InputState");
const typeInputDOM = document.getElementById("InputType");
const whenInputDOM = document.getElementById("InputWhen");
const filterButton = document.getElementById("filter-results-button");
const eventWhenErrorDOM = document.getElementById("when-error");
//Table DOMs
const tableContainerDOM = document.getElementById("table-container");
const tableNameDOM = document.getElementById("table-name");
const tableStateDOM = document.getElementById("table-state");
const tableCityDOM = document.getElementById("table-city");
const tableDateDOM = document.getElementById("table-date");
const numResultsDOM = document.getElementById("num-search-results");

let eventResults = [];

//Bit Flags for input
let nameFlag = 1, skillFlag = 2, stateFlag = 4, typeFlag = 8, whenFlag = 16;
let inputFlags = 0;
const inputMask = 31;

//Validation
const flagsToInputDOM = new Map();
flagsToInputDOM.set(nameFlag, nameInputDOM);
flagsToInputDOM.set(skillFlag, skillInputDOM);
flagsToInputDOM.set(stateFlag, stateInputDOM);
flagsToInputDOM.set(typeFlag, typeInputDOM);
flagsToInputDOM.set(whenFlag, whenInputDOM);

//Misc 
const states = ["", "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
                "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
                "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
                "TN", "TX", "UT", "VT", "VA", "VI", "WA", "WV", "WI", "WY"];
const skillLevels = ["", "Beginner", "Intermediate", "Expert"];
const types = ["", "2-on-2", "3-on-3", "4-on-4", "6-on-6"];
const whenFormat = "MM/DD/YYYY:HH:MM AM";
const monthToDays =      [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const monthToTotalDays = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
let numInputTime = 0;

//Table
//Events are sorted alpha order by default
let activeBit = 0;
let sortFlags = 1;
let activeBitToDom = [tableNameDOM, tableStateDOM, tableCityDOM, tableDateDOM];
const sortName = (a, b) => {
    if(a.eventTitle < b.eventTitle) { return -1; }
    if(a.eventTitle > b.eventTitle) { return 1; }
    return 0;
};
const sortState = (a, b) => {
    if(a.state < b.state) { return -1; }
    if(a.state > b.state) { return 1; }
    return 0;
};
const sortCity = (a, b) => {
    if(a.city < b.city) { return -1; }
    if(a.city > b.city) { return 1; }
    return 0;
};
const sortDate = (a, b) => {
    if(a.eventDate < b.eventDate) { return -1; }
    if(a.eventDate > b.eventDate) { return 1; }
    return 0;
};
let activeToSortAsc = [sortName, sortState, sortCity, sortDate];
let activeToSortDesc = [(a,b) => { return sortName(a,b) * -1;}, 
                        (a,b) => { return sortState(a,b) * -1;},
                        (a,b) => { return sortCity(a,b) * -1;},
                        (a,b) => { return sortDate(a,b) * -1}];

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

//Helper Functions
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
    if(!nameValue) return turnOnFlag(nameFlag);
    //Name can only contain letters
    for(let i = 0; i < nameValue.length; ++i) {
        char = nameValue[i];
        if(char === ' ') continue;
        if(char.toUpperCase() === char.toLowerCase()) 
            return turnOffFlag(nameFlag);
    }
    turnOnFlag(nameFlag);
}
function updateTableRowsInnerHTML() {
    if(eventResults.length === 0) numResultsDOM.innerText = "No Search results!";
    else numResultsDOM.innerText = "Search Results: " + eventResults.length;
    finalInnerHTML = "";
    for(let i = 0; i < eventResults.length; ++i) {
        finalInnerHTML += `
        <tr id="event-result-row-${i+1}">
            <th scope="row">${i+1}</th>
            <td>${eventResults[i].eventTitle}</td>
            <td>${eventResults[i].state}</td>
            <td>${eventResults[i].city}</td>
            <td>${eventResults[i].eventDate}</td>
        </tr>
        `;
    }
    tableContainerDOM.innerHTML = finalInnerHTML;
    //Set click events for each table row
    for(let i = 0; i < eventResults.length; ++i) {
        document.getElementById(`event-result-row-${i+1}`).addEventListener('click', (e) => {
            e.preventDefault();
            let params = new URLSearchParams();
            params.set('eventId', eventResults[i].eventId);
            window.location.href = `viewEvent.html?${params.toString()}`;
        });
    }
}
function updateArrows() {
    tableNameDOM.innerHTML = "Name";
    tableStateDOM.innerHTML = "State";
    tableCityDOM.innerHTML = "City";
    tableDateDOM.innerHTML = "Date";
    if((sortFlags & (1 << activeBit))) 
        activeBitToDom[activeBit].innerHTML += 
        `<i class="bi bi-arrow-down-short"></i>`;
    else
        activeBitToDom[activeBit].innerHTML += 
        `<i class="bi bi-arrow-up-short"></i>`;
}
function sortResults() {
    let sortFunc;
    if((sortFlags & (1 << activeBit))) sortFunc = activeToSortAsc[activeBit];
    else sortFunc = activeToSortDesc[activeBit]; 
    eventResults.sort(sortFunc);
}
function toggleFlag() {
    sortFlags = (sortFlags ^ (1 << activeBit));
    updateArrows();
    sortResults();
    updateTableRowsInnerHTML();
}
function getDigit(char) {
    if(char < '0' || char > '9') return -10000;
    return char * 1;
}

//Events - Validation
nameInputDOM.addEventListener('input', () => {
    validateName(nameInputDOM.value, nameFlag);
});
function validateWhenInput() {
    const whenValue = whenInputDOM.value;
    numInputTime = 0;
    if(!whenValue) {
        eventWhenErrorDOM.innerText = "";
        return turnOnFlag(whenFlag);
    }
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
}
whenInputDOM.addEventListener('input', validateWhenInput);

//Events - Table
tableNameDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeBit = 0;
    toggleFlag();
});
tableStateDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeBit = 1;
    toggleFlag();
});
tableCityDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeBit = 2;
    toggleFlag();
});
tableDateDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeBit = 3;
    toggleFlag();
})

async function findEventsBy(searchObject) {
    const response = await fetch(`http://127.0.0.1:7000/events/search`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(searchObject)
    });
    if (response.ok) {
        const result = await response.json();
        console.log(result);
        if(result) eventResults = result;
        else eventResults = []; 
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        eventResults = [];
    }
}
filterButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await findEventsBy({'eventTitle': nameInputDOM.value,
                        'eventState': stateInputDOM.value,
                        'eventTime': numInputTime,
                        'eventType': typeInputDOM.value,
                        'eventSkill': stateInputDOM.value});
    updateTableRowsInnerHTML();
});

async function getSearchQuery() {
    let params = new URLSearchParams(window.location.search);
    let queryString = params.get('query');
    if(queryString) await findEventsBy({'eventTitle': queryString,
                                        'eventState': "",
                                        'eventTime': 0,
                                        'eventType': "",
                                        'eventSkill': ""});
    updateTableRowsInnerHTML();
}

//Process
getSearchQuery();
setupStateDropdown();
setupSkillDropdown();
setupTypeDropdown();
turnOnFlag(typeFlag);
turnOnFlag(skillFlag);
turnOnFlag(stateFlag);
turnOnFlag(nameFlag);
turnOnFlag(whenFlag);