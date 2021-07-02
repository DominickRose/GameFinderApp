//DOM Object - Profile Tabs
const settingsTabDOM = document.getElementById("settings-tab");
const eventTabDOM = document.getElementById("event-tab");

//DOM Objects - Profile Display
const profileContentDOM = document.getElementById("profile");
const eventContentDOM = document.getElementById("event");
const settingsContentDOM = document.getElementById("settings");
const bioContainerDOM = document.getElementById("bio-container");
const emailTextDOM = document.getElementById("email-text");
const phoneTextDOM = document.getElementById("phone-number-text");
const cityStateTextDOM = document.getElementById("city-state-text");
const nameTextDOM = document.getElementById("name-text");
let bioTextDOM = null;

//DOM Object - Registration Info Table
const regTableNameDOM = document.getElementById("table-reg-for-name");
const regTableStateDOM = document.getElementById("table-reg-for-state");
const regTableCityDOM = document.getElementById("table-reg-for-city");
const regTableDateDOM = document.getElementById("table-reg-for-date");
const regTableContainer = document.getElementById("table-reg-for-container");
//DOM Object - Created Info Table
const createTableNameDOM = document.getElementById("table-create-name");
const createTableStateDOM = document.getElementById("table-create-state");
const createTableCityDOM = document.getElementById("table-create-city");
const createTableDateDOM = document.getElementById("table-create-date");
const createTableContainer = document.getElementById("table-create-container");

//Profile User
let curUser = null;

//DOM Objects - Update Profile
const cityInputDOM = document.getElementById("InputCity");
const stateInputDOM = document.getElementById("InputState");
const emailInputDOM = document.getElementById("InputEmail");
const phoneInputDOM = document.getElementById("InputPhone");
let bioInputDOM = null;
const updateProfileButton = document.getElementById("update-button");
let updateBioButton = null;

//Bit Flags for input
let cityFlag = 1, stateFlag = 2, emailFlag = 4, phoneFlag = 8;
let bioFlag = 16;
let inputFlags = 0;
const inputMask = 15;
const bioMask = 16;
//Bit Flags for reg info table
let activeRegBit = 0;
let sortRegFlags = 0;
//Bit Flags for created info table
let activeCreateBit = 0;
let sortCreateFlags = 0;

//Validation
const flagsToInputDOM = new Map();
flagsToInputDOM.set(cityFlag, cityInputDOM);
flagsToInputDOM.set(stateFlag, stateInputDOM);
flagsToInputDOM.set(emailFlag, emailInputDOM);
flagsToInputDOM.set(phoneFlag, phoneInputDOM);

//Misc
const phoneFormat = "xxx-xxx-xxxx";
const states = [" ", "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
                "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
                "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
                "TN", "TX", "UT", "VT", "VA", "VI", "WA", "WV", "WI", "WY"];
const symbols = "@.";
const specialChars = new Set(['!', '`', '~', '#', '$', '%', '^', '&', '*', '(', 
                            ')', '+', '=', ':', ';', '"', "'", '<', ',', '>', 
                            '?', '/', '|']);

//Table
let registeredFor = [];
let activeRegBitToDom = [regTableNameDOM, regTableStateDOM, regTableCityDOM, regTableDateDOM];
let createdEvents = [];
let activeCreateBitToDom = [createTableNameDOM, createTableStateDOM, createTableCityDOM, createTableDateDOM];

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
function isBioFlagOn() {
    return (inputFlags & bioMask) === bioMask;
}
function validateName(nameValue, nameFlag) {
    if(!nameValue) return turnOffFlag(nameFlag);
    if(nameValue.length > 50) return turnOffFlag(nameFlag);
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
function setupStateDropdown() {
    let finalInnerHTML = `<option selected>${states[0]}</option>`;
    for(let i = 1; i < states.length; ++i) {
        finalInnerHTML += `
         <option>${states[i]}</option>
        `;
    }
    stateInputDOM.innerHTML = finalInnerHTML;
}
function getProfileTabInnerHTML(userId) {
    if(userId == "me") return `
        <div class="form-floating">
            <textarea class="form-control" style="height: 10rem" placeholder="Leave a description here" id="floatingTextarea"></textarea>
            <label for="floatingTextarea">Description</label>
        </div>
        <div class="row justify-content-center mt-3">
            <div class="col-3">
                <button type="submit" id="button-update-bio" class="btn btn-primary">Update Bio</button>
            </div>
        </div>
    `;
    else return `<p id="bio-text"><p>`;
}

//Helper Functions - Table
function updateTableRowsInnerHTML(tableContainerDOM, eventList, idName) {
    finalInnerHTML = "";
    for(let i = 0; i < eventList.length; ++i) {
        finalInnerHTML += `
        <tr id="${idName}-row-${i+1}">
            <th scope="row">${i+1}</th>
            <td>${eventList[i].eventTitle}</td>
            <td>${eventList[i].state}</td>
            <td>${eventList[i].city}</td>
            <td>${eventList[i].eventDate}</td>
        </tr>
        `;
    }
    tableContainerDOM.innerHTML = finalInnerHTML;
    //Set click events for each table row
    for(let i = 0; i < eventList.length; ++i) {
        document.getElementById(`${idName}-row-${i+1}`).addEventListener('click', (e) => {
            e.preventDefault();
            let params = new URLSearchParams();
            params.set('eventId', eventList[i].eventId);
            window.location.href = `viewEvent.html?${params.toString()}`;
        });
    }
}
function updateArrows(activeBitToDOM, sortFlags, activeBit) {
    activeBitToDOM[0].innerHTML = "Name";
    activeBitToDOM[1].innerHTML = "State";
    activeBitToDOM[2].innerHTML = "City";
    activeBitToDOM[3].innerHTML = "Date";
    if((sortFlags & (1 << activeBit))) 
        activeBitToDOM[activeBit].innerHTML += 
        `<i class="bi bi-arrow-down-short"></i>`;
    else
        activeBitToDOM[activeBit].innerHTML += 
        `<i class="bi bi-arrow-up-short"></i>`;
}
function sortResults(eventList, sortFlags, activeBit) {
    let sortFunc;
    if((sortFlags & (1 << activeBit))) sortFunc = activeToSortAsc[activeBit];
    else sortFunc = activeToSortDesc[activeBit]; 
    eventList.sort(sortFunc);
}
function toggleFlag(tableContainerDOM, eventList, activeBitToDOM, 
                    sortFlags, activeBit, idName) {
    updateArrows(activeBitToDOM, sortFlags, activeBit);
    sortResults(eventList, sortFlags, activeBit);
    updateTableRowsInnerHTML(tableContainerDOM, eventList, idName);
}
//API Calls
async function getUser(userID) {
    const response = await fetch(`http://127.0.0.1:7000/players/${userID}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });
    if (response.ok) {
        let user = await response.json();
        return user;
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        return null;
    }
}
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
    const user = JSON.parse(localStorage.getItem("login-info"));
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
async function getRegistrationInfo(userId) {
    const response = await fetch(`http://127.0.0.1:7000/events?playerId=${userId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });
    if (response.ok) {
        registeredFor = await response.json();
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        registeredFor = [];
    }
}
async function getCreatedInfo(userId) {
    const response = await fetch(`http://127.0.0.1:7000/events/user/${userId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });
    if (response.ok) {
        createdEvents = await response.json();
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        createdEvents = [];
    }
}


//Events - Settings Tab
cityInputDOM.addEventListener('input', () => {
    validateName(cityInputDOM.value, cityFlag);
});
stateInputDOM.addEventListener('input', () => {
    validateName(stateInputDOM.value, stateFlag);
});

function validateEmailInput() {
    const emailValue = emailInputDOM.value;
    if(!emailValue) return turnOffFlag(emailFlag);
    let symbolIndex = 0, i = 0;
    
    let funcScanToSymbol = () => {
        for(i; i < emailValue.length; ++i) {
            //NO special characters
            if(specialChars.has(emailValue)) break;
            if(emailValue[i] === symbols[symbolIndex]) {
                ++symbolIndex;
                ++i;
                break;
            }
        }
    };
    //Scan until we find @ symbol
    funcScanToSymbol();
    //Exit if we dont find @ or current char is .
    if(symbolIndex === 0 || emailValue[i] == symbols[symbolIndex]) 
        return turnOffFlag(emailFlag);
    //Scan until we find . symbol
    funcScanToSymbol();
    //Exit if we dont find . or reach end of 
    if(symbolIndex === 1 || i === emailValue.length) 
        return turnOffFlag(emailFlag);

    turnOnFlag(emailFlag); 
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

function validateBioInput() {
    bioInputDOM.value ? turnOnFlag(bioFlag) : turnOffFlag(bioFlag);
}

async function makePublic(e) {
    e.preventDefault();
    curUser.visible = true;
    let result = await updateUser(curUser);
    if(result === "") updateVisibilityText(curUser.visible);
}
publicProfileButton.addEventListener('click', makePublic);

async function makePrivate(e) {
    e.preventDefault();
    curUser.visible = false;
    let result = await updateUser(curUser);
    if(result === "") updateVisibilityText(curUser.visible);
}
privateProfileButton.addEventListener('click', makePrivate);

async function updateBio(e) {
    e.preventDefault();
    if(!isBioFlagOn()) return;
    curUser.bio = bioInputDOM.value;
    let result = await updateUser(curUser);
    if(result === "") initUserProfile();
}

async function updateProfile(e) {
    e.preventDefault();
    if(!isAllFlagsOn()) {
        return;
    }
    curUser.state = stateInputDOM.value;
    curUser.city = cityInputDOM.value;
    curUser.email = emailInputDOM.value;
    curUser.phoneNumber = phoneInputDOM.value;
    let result = await updateUser(curUser);
    if(result === "") initUserProfile();
}
updateProfileButton.addEventListener('click', updateProfile);

newEventButtonDOM.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = `createEvent.html`;
});

//Events - Table Register Info
regTableNameDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeRegBit = 0;
    sortRegFlags = (sortRegFlags ^ (1 << activeRegBit));
    toggleFlag(regTableContainer, registeredFor, activeRegBitToDom,
                sortRegFlags, activeRegBit, "reg-for-table");
});
regTableStateDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeRegBit = 1;
    sortRegFlags = (sortRegFlags ^ (1 << activeRegBit));
    toggleFlag(regTableContainer, registeredFor, activeRegBitToDom,
        sortRegFlags, activeRegBit, "reg-for-table");
});
regTableCityDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeRegBit = 2;
    sortRegFlags = (sortRegFlags ^ (1 << activeRegBit));
    toggleFlag(regTableContainer, registeredFor, activeRegBitToDom,
        sortRegFlags, activeRegBit, "reg-for-table");
});
regTableDateDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeRegBit = 3;
    sortRegFlags = (sortRegFlags ^ (1 << activeRegBit));
    toggleFlag(regTableContainer, registeredFor, activeRegBitToDom,
        sortRegFlags, activeRegBit, "reg-for-table");
})
//Events - Table Created Info
createTableNameDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeCreateBit = 0;
    sortCreateFlags = (sortCreateFlags ^ (1 << activeCreateBit));
    toggleFlag(createTableContainer, createdEvents, activeCreateBitToDom,
        sortCreateFlags, activeCreateBit, "create-table");
});
createTableStateDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeCreateBit = 1;
    sortCreateFlags = (sortCreateFlags ^ (1 << activeCreateBit));
    toggleFlag(createTableContainer, createdEvents, activeCreateBitToDom,
        sortCreateFlags, activeCreateBit, "create-table");
});
createTableCityDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeCreateBit = 2;
    sortCreateFlags = (sortCreateFlags ^ (1 << activeCreateBit));
    toggleFlag(createTableContainer, createdEvents, activeCreateBitToDom,
        sortCreateFlags, activeCreateBit, "create-table");
});
createTableDateDOM.addEventListener('click', (e) => {
    e.preventDefault();
    activeCreateBit = 3;
    sortCreateFlags = (sortCreateFlags ^ (1 << activeCreateBit));
    toggleFlag(createTableContainer, createdEvents, activeCreateBitToDom,
        sortCreateFlags, activeCreateBit, "create-table");
})

//Init Functions
function setProfileText() {
    //Profile Text
    nameTextDOM.innerText = curUser.firstName + " " + curUser.lastName;
    emailTextDOM.innerText = curUser.email;
    phoneTextDOM.innerText = curUser.phoneNumber;
    cityStateTextDOM.innerText = curUser.city + ", " + curUser.state;
    if(bioTextDOM) bioTextDOM.innerText = curUser.bio;
    //BUG - Recent events are missing
}
function setPersonalSettings() {
    //Settings
    setupStateDropdown();
    updateVisibilityText(curUser.visible);
    stateInputDOM.value = curUser.state;
    validateName(stateInputDOM.value, stateFlag);
    cityInputDOM.value = curUser.city;
    validateName(cityInputDOM.value, cityFlag);
    emailInputDOM.value = curUser.email;
    validateEmailInput();
    phoneInputDOM.value = curUser.phoneNumber;
    validatePhoneInput();
    bioInputDOM.value = curUser.bio;
    validateBioInput();
}
async function setEventsRegisteredFor(userId) {
    await getRegistrationInfo(userId); 
    updateTableRowsInnerHTML(regTableContainer, registeredFor, "reg-for-table");
}
async function setEventsCreated(userId){
    await getCreatedInfo(userId);
    updateTableRowsInnerHTML(createTableContainer, createdEvents, "create-table");
}
async function initUserProfile() {
    let params = new URLSearchParams(window.location.search);
    let userId = params.get('user');
    if(!userId) window.location.href = `404.html`;
    //Viewing our own profile
    bioContainerDOM.innerHTML = getProfileTabInnerHTML(userId);
    if(userId === "me") {
        curUser = JSON.parse(localStorage.getItem("login-info"));
        if(!curUser) window.location.href = `404.html`;
        let profileView = localStorage.getItem("profileView");
        //View events tab
        if(profileView === '1') {
            document.getElementById("profile-tab").className= "nav-link";
            document.getElementById("profile-tab").ariaSelected = false;
            profileContentDOM.className = "tab-pane fade";
            document.getElementById("event-tab").className = "nav-link active";
            document.getElementById("event-tab").ariaSelected = true;
            eventContentDOM.className = "tab-pane fade show active";
        }
        //Setup Bio Update
        bioInputDOM = document.getElementById("floatingTextarea");
        bioInputDOM.addEventListener('input', validateBioInput);
        flagsToInputDOM.set(bioFlag, bioInputDOM);
        updateBioButton = document.getElementById("button-update-bio");
        updateBioButton.addEventListener('click', updateBio);
        //Setup personal Settings
        setProfileText(); 
        setPersonalSettings();
        await setEventsRegisteredFor(curUser.playerId);
        await setEventsCreated(curUser.playerId);
    }
    //Viewing another profile
    else {
        curUser = await getUser(userId);
        if(!curUser) window.location.href = `404.html`;
        //Clear settings
        settingsTabDOM.disabled = true;
        settingsTabDOM.className = "nav-link disabled";
        document.getElementById("settings").innerHTML = "";
        //Check for public/private profiles
        if(curUser.visible) {
            bioTextDOM = document.getElementById("bio-text");
            setProfileText();
            await setEventsRegisteredFor(userId);
            //Clear new event button in events tab
            document.getElementById("new-event-btn-container").innerHTML = ""; 
        }
        else {
            //Clear events tab
            eventTabDOM.disabled = true;
            eventTabDOM.className = "nav-link disabled";
            eventContentDOM.innerHTML = "";
            settingsContentDOM.innerHTML = "";
            //Let viewer know that this profile is private
            profileContentDOM.innerHTML = `
            <h1 class="u-center-text u-color-red mt-5 mb-5">This users profile is private</h1>
            `;
        }
    }
}

//Process
initUserProfile();