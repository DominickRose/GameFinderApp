//Table DOMs
const tableContainerDOM = document.getElementById("table-container");
const tableNameDOM = document.getElementById("table-name");
const tableStateDOM = document.getElementById("table-state");
const tableCityDOM = document.getElementById("table-city");
const tableDateDOM = document.getElementById("table-date");

let eventResults = [];
//Table
//Events are sorted time order by default
let activeBit = 0;
let sortFlags = 1;
const monthToTotalDays = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 366];
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

//Helper Functions
function eventNumDateToString(eventDate) {
    let base = "00/00/0000";
    //Extract Hours + Minutes
    let minutes = eventDate % 60;
    eventDate -= minutes;
    eventDate /= 60;
    let hours = eventDate % 24;
    eventDate -= hours;
    eventDate /= 24;
    
    //Extract Year
    let year = Math.trunc(eventDate / 365); 
    eventDate -= year * 365;
    if(year >= 1000) startPos = 6;
    else if(year >= 100) startPos = 7; 
    else if(year >= 10) startPos = 8;
    else startPos = 9;
    base = base.substr(0, startPos) + `${year}`;

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
function updateTableRowsInnerHTML() {
    finalInnerHTML = "";
    for(let i = 0; i < eventResults.length; ++i) {
        finalInnerHTML += `
        <tr id="event-result-row-${i+1}">
            <th scope="row">${i+1}</th>
            <td>${eventResults[i].eventTitle}</td>
            <td>${eventResults[i].state}</td>
            <td>${eventResults[i].city}</td>
            <td>${eventNumDateToString(eventResults[i].eventDate)}</td>
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
//Events
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

//API Calls
async function findEventsBy(searchObject) {
    const response = await fetch(`http://54.219.209.0:7000//events/search`, {
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
async function getRecentEvents() {
    //09/06/2021
    await findEventsBy({'eventTitle': "",
                        'eventState': "",
                        'eventTime': 1062594720,
                        'eventType': "",
                        'eventSkill': ""});
    updateTableRowsInnerHTML();
}
getRecentEvents(); 