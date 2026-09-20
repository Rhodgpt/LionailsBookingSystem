// ADMIN CREDENTIALS muna
const users = {
    owner: "lionails",
    staff: "staff123",
    manager: "manager123"
};

// Dito na yungLOGIN FUNCTION
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let errorMessage = document.getElementById("errorMessage");
        
        // check kung tama yung password and error handling 
        if (users[username] && users[username] === password) {
            // store lang yung username sa localStorage para alam natin sino naka-login
            localStorage.setItem("adminUser", username);
            window.location.href = "Admin-dashboard.html";
        } else {
            // error message if wrong
            errorMessage.textContent = "Invalid username or password";
            errorMessage.classList.add("show");
            document.getElementById("password").value = "";
        }
    });
}

// Dito na yung CHECK LOGIN FUNCTION
function checkLogin() {
    let adminUser = localStorage.getItem("adminUser");
    
    // kung walang login, direct sa login page
    if (!adminUser && !window.location.href.includes("Admin-login")) {
        window.location.href = "Admin-login.html";
    }
    
    return adminUser;
}

// Dito na yung LOGOUT FUNCTION
function logout() {
    localStorage.removeItem("adminUser");
    window.location.href = "Admin-login.html";
}


// ADMIN BOOKINGS PAGE to 

let currentBookingFilter = "all";

function getBookings() {
    const savedBookings = localStorage.getItem("lionailsBookings");

    if (!savedBookings) {
        return [];
    }

    return JSON.parse(savedBookings); //ginagawang text yung JSON data para magamit sa JS bago lang sakin to 
}

function saveBookings(bookings) {
    localStorage.setItem("lionailsBookings", JSON.stringify(bookings)); // connected sya dito
}

function formatBookingDate(dateValue) {
    const date = new Date(dateValue + "T00:00:00"); //"T00:00:00" para maging midnight ang oras at maiwasan ang date na bumabalik sa previous day dahil sa timezone.

    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function renderBookings() {
    const bookingsTableBody = document.getElementById("bookingsTableBody");

    if (!bookingsTableBody) {
        return;
    }

    const bookings = getBookings();

    const filteredBookings = bookings.filter(function (booking) {
        return currentBookingFilter === "all" ||
            booking.status === currentBookingFilter;
    });

    if (filteredBookings.length === 0) {
        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="7">No ${currentBookingFilter} bookings found.</td>
            </tr>
        `;

        return;
    }

    bookingsTableBody.innerHTML = filteredBookings.map(function (booking) {
        let actions = "";

        if (booking.status === "pending") {
            actions = `
                <button class="filterBtn" onclick="updateBookingStatus('${booking.id}', 'confirmed')">
                    Confirm
                </button>
                <button class="filterBtn" onclick="updateBookingStatus('${booking.id}', 'cancelled')">
                    Cancel
                </button>
            `;
        } else {
            actions = "—";
        }

        return `
            <tr>
                <td>${booking.name}</td>
                <td>${booking.phone}</td>
                <td>${booking.service}</td>
                <td>${formatBookingDate(booking.date)}</td>
                <td>${booking.time}</td>
                <td>
                    <span class="badge ${booking.status}">
                        ${booking.status}
                    </span>
                </td>
                <td>${actions}</td>
            </tr>
        `;
    }).join("");
}

function updateBookingStatus(bookingId, newStatus) {
    const bookings = getBookings();

    const updatedBookings = bookings.map(function (booking) {
        if (booking.id === bookingId) {
            booking.status = newStatus;
        }

        return booking;
    });

    saveBookings(updatedBookings);
    renderBookings();
}

const filterButtons = document.querySelectorAll(".filterBtn[data-filter]");

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentBookingFilter = button.dataset.filter;

        filterButtons.forEach(function (filterButton) {
            filterButton.classList.remove("active");
        });

        button.classList.add("active");
        renderBookings();
    });
});

renderBookings();