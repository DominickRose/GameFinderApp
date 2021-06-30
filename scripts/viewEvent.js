let eventId = 1;
const eventName = document.getElementById("event-name");
const cityState = document.getElementById("event-city-state");
const eventTime = document.getElementById("event-when-text");
const eventType = document.getElementById("event-type-text");
const eventSkill = document.getElementById("event-skill-text");
const eventDesc = document.getElementById("event-info-text");
const eventPlayers = document.getElementById("events-players-registered");
const eventContainer = document.getElementById("players-reg-container");

let currentEvent;

function convertNumberToDate() {
    
}
function setEventview(){
    eventName.innerHTML = currentEvent.eventTitle;
    cityState.innerHTML = currentEvent.city + " " + currentEvent.state;
    // todo deal with date number messyness
    eventType.innerHTML = currentEvent.eventType;
    eventSkill.innerHTML = currentEvent.skillLevel;
    eventDesc.innerHTML = currentEvent.description;
}

async function getEventsById(){
    let params = new URLSearchParams(window.location.search);
    eventId = params.get('eventId');
    const response = await fetch(`http://localhost:7000/events/${eventId}`)
    let innerRows = ""

    if(response.ok){
        let params = new URLSearchParams();
        currentEvent = await response.json()
        console.log(currentEvent);
        setEventview();
    }else{
        let text = await response.text();
        console.log(response.status, text);
    }
}


getEventsById();