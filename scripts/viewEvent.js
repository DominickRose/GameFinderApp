let eventId = 1;
const eventName = document.getElementById("event-name");
let cityState = null;
const eventTime = document.getElementById("event-when-text");
const eventType = document.getElementById("event-type-text");
const eventSkill = document.getElementById("event-skill-text");
const eventDesc = document.getElementById("event-info-text");
const eventPlayers = document.getElementById("events-players-registered");
const eventContainer = document.getElementById("players-reg-container");
const registerButton = document.getElementById("register-event-button");
const registerInfo = document.getElementById("register-info");

//Owner Buttons
const ownerButtonContainerDOM = document.getElementById("owner-button-container");
let deleteButtonDOM;
let updateButtonDOM;

let currentEvent;
let curUser;

//When Display
let minutes = "00", hours = 0, pm = "";
let day = 0, month = 0, year = 0;
const monthToTotalDays = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
let monthNames = ["", "January", "Febuary", "March", "April", "May", "June", "July", "August", 
                  "September", "October", "November", "December"];

function getOwnerButtonInnerHTML(isOwner) {
    if(isOwner) return `
        <div class="col-auto">
            <h3 id="event-city-state"></h3>
        </div>
        <div class="col-auto">
            <button type="submit" class="btn btn-primary" id="update-event-button">Update</button>
        </div>
        <div class="col-auto">
            <button type="submit" class="btn btn-primary" id="delete-event-button">Delete</button>
        </div>
    `;
    else return `
        <div class="col-auto">
            <h3 id="event-city-state"></h3>
        </div>
    `;
}

function extractDateInfo(eventDate) {
    //Extract Hours + Minutes
    let numMinutes = eventDate % 60;
    minutes = numMinutes >= 10 ? minutes.substr(0, 0) : minutes.substr(0, 1);
    minutes += numMinutes;
    eventDate -= minutes;
    eventDate /= 60;
    hours = eventDate % 24;
    eventDate -= hours;
    eventDate /= 24;
    let pm = 'A';
    if(hours > 12) {
        hours -= 12;
        pm = 'P'
    }
    pm += "M";
    
    //Extract Year
    year = Math.trunc(eventDate / 365); 
    eventDate -= year * 365;

    //Extract Months + Days
    for(month = 0; month < monthToTotalDays.length; ++month) {
        if(eventDate < monthToTotalDays[month]) break;
    }
    day = (eventDate - monthToTotalDays[--month])+1;
}
function setEventview(){
    eventName.innerHTML = currentEvent.eventTitle;
    cityState.innerHTML = currentEvent.city + " " + currentEvent.state;
    extractDateInfo(currentEvent.eventDate);
    timeInnerHTML = monthNames[month] + " " + day + " "  + year + " @ ";
    timeInnerHTML += hours + ":" + minutes + pm; 
    eventTime.innerHTML = timeInnerHTML;
    eventType.innerHTML = currentEvent.eventType;
    eventSkill.innerHTML = currentEvent.skillLevel;
    eventDesc.innerHTML = currentEvent.description;
}

//API Calls
async function getEventsById() {
    let params = new URLSearchParams(window.location.search);
    eventId = params.get('eventId');
    const response = await fetch(`http://localhost:7000/events/${eventId}`);
    if(response.ok){
        currentEvent = await response.json()
        eventId = currentEvent.eventId;
    }else{
        let text = await response.text();
        console.log(response.status, text);
    }
}
async function deleteEvent() {
    if(!curUser || curUser.playerId !== currentEvent.ownerId)
        return;

    const response = await fetch(`http://127.0.0.1:7000/events/${eventId}`, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });

    if (response.ok) {
        localStorage.setItem("profileView", 1);
        window.location.href = `userProfile.html?user=me`;
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
    }
}
async function registerForEvent() {
    const response = await fetch(`http://127.0.0.1:7000/registrations`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',

        body: JSON.stringify({
            'playerId': curUser.playerId,
            'eventId': currentEvent.eventId
        })
    });
    if (response.ok) {
        registerInfo.innerText = "Successfully registered!";
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        registerInfo.innerText = text;
    }
}

async function initEventView() {
    await getEventsById();
    if(!currentEvent) {
        window.location.href = `404.html`;
        return;
    }
    //Determine if this event is ours or not
    curUser = JSON.parse(localStorage.getItem("login-info"));
    if(!curUser || curUser.playerId !== currentEvent.ownerId) {
        ownerButtonContainerDOM.innerHTML = getOwnerButtonInnerHTML(false);
        ownerButtonContainerDOM.className = "row g-3 mt-1 justify-content-left";
    }
    else {
        ownerButtonContainerDOM.innerHTML = getOwnerButtonInnerHTML(true);
        updateButtonDOM = document.getElementById("update-event-button");
        updateButtonDOM.addEventListener('click', () => {
            let params = new URLSearchParams();
            params.set('eventId', currentEvent.eventId);
            window.location.href = `createEvent.html?${params.toString()}`;
        });
        deleteButtonDOM = document.getElementById("delete-event-button");
        deleteButtonDOM.addEventListener('click', deleteEvent);
    }
    
    if(!curUser) registerButton.disabled = true;
    else {
        //BUG - remove registration option if already registered
        registerButton.addEventListener('click', registerForEvent);
    }
    cityState = document.getElementById("event-city-state");
    setEventview();
}

//Process
initEventView();