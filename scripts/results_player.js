const tableContainerDOM = document.getElementById("table-container");
const tableNameDOM = document.getElementById("table-name");
const tableStateDOM = document.getElementById("table-state");
const tableCityDOM = document.getElementById("table-city");
const numResultsDOM = document.getElementById("num-search-results");

let playerResults = [];

//Players are sorted alpha order by default
let activeBit = 0;
let sortFlags = 1;
let activeBitToDom = [tableNameDOM, tableStateDOM, tableCityDOM];
const sortName = (a, b) => {
    const aName = a.firstName + " " + a.lastName;
    const bName = b.firstName + " " + b.lastName;
    if(aName < bName) { return -1; }
    if(aName > bName) { return 1; }
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
let activeToSortAsc = [sortName, sortState, sortCity];
let activeToSortDesc = [(a,b) => { return sortName(a,b) * -1;}, 
                        (a,b) => { return sortState(a,b) * -1;},
                        (a,b) => { return sortCity(a,b) * -1;}];

//Helper Functions
function updateTableRowsInnerHTML() {
    finalInnerHTML = "";
    for(let i = 0; i < playerResults.length; ++i) {
        finalInnerHTML += `
        <tr id="player-result-row-${i+1}">
            <th scope="row">${i+1}</th>
            <td>${playerResults[i].firstName + " " + playerResults[i].lastName}</td>
            <td>${playerResults[i].state}</td>
            <td>${playerResults[i].city}</td>
        </tr>
        `;
    }
    tableContainerDOM.innerHTML = finalInnerHTML;
    //Set click events for each table row
    for(let i = 0; i < playerResults.length; ++i) {
        document.getElementById(`player-result-row-${i+1}`).addEventListener('click', (e) => {
            e.preventDefault();
            let params = new URLSearchParams();
            params.set('user', playerResults[i].playerId);
            window.location.href = `userProfile.html?${params.toString()}`;
        });
    }
}
function updateArrows() {
    tableNameDOM.innerHTML = "Name";
    tableStateDOM.innerHTML = "State";
    tableCityDOM.innerHTML = "City";
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
    playerResults.sort(sortFunc);
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

//API Calls
async function getAllUsers(queryString) {
    const response = await fetch(`http://127.0.0.1:7000/players?name=${queryString}`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });
    if (response.ok) {
        playerResults = await response.json();
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        playerResults = [];
    }
}
async function getSearchQuery() {
    let params = new URLSearchParams(window.location.search);
    let queryString = params.get('query');
    if(queryString) await getAllUsers(queryString);
    if(playerResults.length === 0) numResultsDOM.innerText = "No Search results!";
    else numResultsDOM.innerText = "Search Results: " + playerResults.length;
    updateTableRowsInnerHTML();
}

//Process
getSearchQuery();