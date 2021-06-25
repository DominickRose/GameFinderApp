
const navbarContainerDOM = document.getElementById("navbar-container");
let dropdownContainerDOM;
let isLoggedIn = false;

function createLoginDropDown() {
    dropdownContainerDOM.innerHTML = `
    <p class="u-center-text">Sign up today and start finding volleyball games near you!</p>
    <div class="dropdown-divider"></div>
    <form class="px-4 py-3">
        <div class="mb-3">
            <label for="exampleDropdownFormEmail1" class="form-label">Email address</label>
            <input type="email" class="form-control" id="exampleDropdownFormEmail1"
                placeholder="email@example.com">
        </div>
        <div class="mb-3">
            <label for="exampleDropdownFormPassword1" class="form-label">Password</label>
            <input type="password" class="form-control" id="exampleDropdownFormPassword1"
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
    document.getElementById("login-button").addEventListener('click', (e) => { 
        e.preventDefault();
        isLoggedIn = true; 
        updateDropdownContainer();
    });
}

function createUserDropDown(name) {
    dropdownContainerDOM.innerHTML = `
    <p class="u-center-text">
        <img src="/docs/5.0/assets/brand/bootstrap-logo.svg" alt="" width="30" height="24"
        class="d-inline-block">
        </img>
        ${name}
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
    document.getElementById("logout-button").addEventListener('click', (e) => { 
        e.preventDefault();
        isLoggedIn = false; 
        updateDropdownContainer();
    });
}

function updateDropdownContainer() {
    isLoggedIn ? createUserDropDown("John David") : createLoginDropDown();
}

function createNavBar() {
    navbarContainerDOM.innerHTML = `
    <nav class="navbar navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">
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
                    data-bs-toggle="dropdown" aria-expanded="false">
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