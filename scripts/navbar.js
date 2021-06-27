
const navbarContainerDOM = document.getElementById("navbar-container");
let dropdownContainerDOM;
let usernameLoginInputDOM;
let passwordLoginInputDOM;
let loginErrorDOM;

//API Calls
async function login(e) {
    e.preventDefault();
    //Exit if any of these fields are empty
    if(!usernameLoginInputDOM.value || !passwordLoginInputDOM.value) {
        loginErrorDOM.innerText = "Please fill out all fields";
        return;
    }
    const response = await fetch(`http://127.0.0.1:7000/players/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            'username': usernameLoginInputDOM.value,
            'password': passwordLoginInputDOM.value
        })
    });
    if (response.ok) {
        let user = await response.json();
        localStorage.setItem("login-info", JSON.stringify(user));
        window.location.href = `userProfile.html`;
    }
    else {
        let text = await response.text();
        console.log(response.status, text);
        loginErrorDOM.innerText = text;
    }
}
async function logout(e) {
    e.preventDefault();
    //BUG - Logout route
    /*const response = await fetch(`http://127.0.0.1:7000/players/login`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            'username': usernameLoginInputDOM.value,
            'password': passwordLoginInputDOM.value
        })
    });
    */
    localStorage.removeItem("login-info");
    window.location.href = `home.html`;
}

function createLoginDropDown() {
    dropdownContainerDOM.innerHTML = `
    <p class="u-center-text">Sign up today and start finding volleyball games near you!</p>
    <div class="dropdown-divider"></div>
    <form class="px-4 py-3">
        <label class="form-label u-color-red mb-1" id="login-error"></label>
        <div class="mb-3">
            <label for="username-input" class="form-label">Username</label>
            <input type="text" class="form-control" id="username-input"
                placeholder="Username">
        </div>
        <div class="mb-3">
            <label for="password-input" class="form-label">Password</label>
            <input type="password" class="form-control" id="password-input"
                placeholder="Password">
        </div>
        <div class="u-center-text mb-3">
            <button type="submit" class="btn btn-primary" id="login-button">Login</button>
        </div>
        <div class="u-center-text mb-3">
            <button type="submit" class="btn btn-primary" id="sign-up-button">Sign up</button>
        </div>
    </form>
    `;
    document.getElementById("login-button").addEventListener('click', login);
    document.getElementById("sign-up-button").addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `createUser.html`;
    });
    loginErrorDOM = document.getElementById("login-error");
    usernameLoginInputDOM = document.getElementById("username-input");
    passwordLoginInputDOM = document.getElementById("password-input");
}

function createUserDropDown() {
    const user = JSON.parse(localStorage.getItem("login-info"));
    dropdownContainerDOM.innerHTML = `
    <p class="u-center-text">
        <img src="/docs/5.0/assets/brand/bootstrap-logo.svg" alt="" width="30" height="24"
        class="d-inline-block">
        </img>
        ${user.firstName + " " + user.lastName}
    </p>
    <div class="dropdown-divider"></div>
    <form class="px-4 py-3">
        <div class="u-center-text mb-3">
            <button type="submit" class="btn btn-primary" id="my-events-button">My Events</button>
        </div>
        <div class="u-center-text mb-3">
            <button type="submit" class="btn btn-primary" id="new-event-button">New Event</button>
        </div>
        <div class="u-center-text u-margin-top-med mb-3">
            <button type="submit" class="btn btn-primary" id="logout-button">Logout</button>
        </div>
    </form>
    `;
    document.getElementById("my-events-button").addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `userProfile.html`;
    });
    document.getElementById("new-event-button").addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `createEvent.html`;
    });
    document.getElementById("logout-button").addEventListener('click', logout);
}

function updateDropdownContainer() {
    const user = localStorage.getItem("login-info");
    user ? createUserDropDown() : createLoginDropDown();
}

function createNavBar() {
    navbarContainerDOM.innerHTML = `
    <nav class="navbar navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="home.html">
                <p class="h4">Ismadoro
                <img src="/docs/5.0/assets/brand/bootstrap-logo.svg" alt="" width="30" height="24"
                    class="d-inline-block align-text-bottom">
                </img>
                </p>
                <p class="h6">Find Volleyball matches near you!</p>
            </a>
            <form class="nav-search-size">
                <input class="form-control nav-search-bar-pos" type="search" placeholder="Search" aria-label="Search">
                <div class="nav-search-buttons">
                    <div class="mb-3">
                        <button class="btn btn-outline-success" type="submit">Players</button>
                    </div>
                    <div>
                        <button class="btn btn-outline-success" type="submit">Events</button>
                    </div>
                </div>
            </form>
            
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2"
                    data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                    More
                </button>
                <div id="dropdown-container" class="dropdown-menu dropdown-menu-end dropdown-pos">
                </div>
            </div>
        </div>
    </nav>
    `;
    dropdownContainerDOM = document.getElementById("dropdown-container");
    updateDropdownContainer(); 
}

//Process
createNavBar();