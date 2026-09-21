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
    renderDashboard();
    renderCustomers();
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

// Eto naman is para ma render lahat ng mga details ng mga input tapos lalabas sa dashboard

function getUniqueCustomers(bookings) { //eto yung function na nagbibilang ng unique customers base sa phone number nila para malaman kung ilan ang total customers at ilan ang bagong customers sa current month.
    const customers = {};

    bookings.forEach(function (booking) {
        const customerKey = booking.phone.trim();

        if (!customers[customerKey]) {
            customers[customerKey] = {
                name: booking.name,
                phone: booking.phone,
                totalBookings: 0,
                latestDate: booking.date,
                firstBookingDate: booking.createdAt || ""
            };
        }

        customers[customerKey].totalBookings += 1;

        if (booking.date > customers[customerKey].latestDate) {
            customers[customerKey].latestDate = booking.date;
        }

        if (
            booking.createdAt &&
            (
                !customers[customerKey].firstBookingDate ||
                booking.createdAt < customers[customerKey].firstBookingDate
            )
        ) {
            customers[customerKey].firstBookingDate = booking.createdAt;
        }
    });

    return Object.values(customers);
}

function renderDashboard() {
    const totalBookings = document.getElementById("totalBookings");

    if (!totalBookings) {
        return;
    }

    const bookings = getBookings();
    const customers = getUniqueCustomers(bookings);

    document.getElementById("totalBookings").textContent = bookings.length;

    document.getElementById("pendingBookings").textContent =
        bookings.filter(function (booking) {
            return booking.status === "pending";
        }).length;

    document.getElementById("confirmedBookings").textContent =
        bookings.filter(function (booking) {
            return booking.status === "confirmed";
        }).length;

    document.getElementById("totalCustomers").textContent = customers.length;

    const recentBookings = document.getElementById("recentBookings");

    if (bookings.length === 0) {
        recentBookings.innerHTML = `
            <tr>
                <td colspan="5">No bookings yet.</td>
            </tr>
        `;

        return;
    }

    const latestBookings = [...bookings]
        .sort(function (firstBooking, secondBooking) {
            return Number(secondBooking.id) - Number(firstBooking.id);
        })
        .slice(0, 5);

    recentBookings.innerHTML = latestBookings.map(function (booking) {
        return `
            <tr>
                <td>${booking.name}</td>
                <td>${booking.service}</td>
                <td>${formatBookingDate(booking.date)}</td>
                <td>${booking.time}</td>
                <td>
                    <span class="badge ${booking.status}">
                        ${booking.status}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

function renderCustomers() {
    const customersTableBody = document.getElementById("customersTableBody");

    if (!customersTableBody) {
        return;
    }

    const bookings = getBookings();
    const customers = getUniqueCustomers(bookings);

    document.getElementById("customerCount").textContent = customers.length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const newCustomersThisMonth = customers.filter(function (customer) {
        if (!customer.firstBookingDate) {
            return false;
        }

        const firstBookingDate = new Date(customer.firstBookingDate);

        return firstBookingDate.getMonth() === currentMonth &&
            firstBookingDate.getFullYear() === currentYear;
    });

    document.getElementById("newCustomerCount").textContent =
        newCustomersThisMonth.length;

    if (customers.length === 0) {
        customersTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Client records will appear here after bookings are submitted.
                </td>
            </tr>
        `;

        return;
    }

    customersTableBody.innerHTML = customers.map(function (customer) {
        return `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.totalBookings}</td>
                <td>${formatBookingDate(customer.latestDate)}</td>
                <td>
                <button class="filterBtn" type="button"
                onclick="deleteCustomer('${customer.phone}')">
                Delete
                </button>
</td>
            </tr>
        `;
    }).join("");
}
function deleteCustomer(phoneNumber) {
    const bookings = getBookings();

    const customerBookings = bookings.filter(function (booking) {
        return booking.phone === phoneNumber;
    });

    const confirmed = window.confirm(
        `Delete this client record and ${customerBookings.length} booking record(s)?`
    );

    if (!confirmed) {
        return;
    }

    const updatedBookings = bookings.filter(function (booking) {
        return booking.phone !== phoneNumber;
    });

    saveBookings(updatedBookings);

    renderBookings();
    renderDashboard();
    renderCustomers();
}

renderDashboard();
renderCustomers();

// dito makakapag add ng services sa admin page, pati image sa services dito din naka input since frontend lang to.

const defaultServices = [
    {
        id: "service-1",
        name: "Softgel Extension",
        description: "Lightweight nail extensions with a natural-looking finish.",
        price: "800 - 1,000 PHP",
        image: "image/pic.jpg"
    },
    {
        id: "service-2",
        name: "Builder Gel / Hard Gel Overlay",
        description: "Adds strength and protection to natural nails.",
        price: "900 - 1,200 PHP",
        image: "image/pic1.jpg"
    },
    {
        id: "service-3",
        name: "Gel Polish",
        description: "Long-lasting color with a smooth, glossy finish.",
        price: "500 - 700 PHP",
        image: "image/pic3.jpg"
    },
    {
        id: "service-4",
        name: "Removal",
        description: "Safe removal of existing gel or nail extensions.",
        price: "300 - 500 PHP",
        image: "image/pic5.jpg"
    }
];

let selectedServiceId = null;
const currentServiceVersion = "2";

function getServices() {
    const savedServices = localStorage.getItem("lionailsServices");
    const savedVersion = localStorage.getItem("lionailsServicesVersion");

    if (!savedServices || savedVersion !== currentServiceVersion) {
        localStorage.setItem(
            "lionailsServices",
            JSON.stringify(defaultServices)
        );

        localStorage.setItem(
            "lionailsServicesVersion",
            currentServiceVersion
        );

        return defaultServices;
    }

    return JSON.parse(savedServices);
}

function saveServices(services) {
    localStorage.setItem("lionailsServices", JSON.stringify(services));
}

function renderServices() {
    const servicesTableBody = document.getElementById("servicesTableBody");

    if (!servicesTableBody) {
        return;
    }

    const services = getServices();

    servicesTableBody.innerHTML = services.map(function (service) {
        return `
            <tr>
                <td>${service.name}</td>
                <td>${service.description}</td>
                <td>${service.price}</td>
                <td><span class="badge confirmed">Active</span></td>
                <td>
                    <button class="filterBtn" type="button"
                        onclick="openServiceModal('${service.id}')">
                        Edit
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function openServiceModal(serviceId = null) {
    const serviceModal = document.getElementById("serviceModal");

    if (!serviceModal) {
        return;
    }

    const serviceForm = document.getElementById("serviceForm");
    const modalTitle = document.getElementById("serviceModalTitle");

    selectedServiceId = serviceId;
    serviceForm.reset();

    if (serviceId) {
        const services = getServices();

        const selectedService = services.find(function (service) {
            return service.id === serviceId;
        });

        modalTitle.textContent = "Edit Service";

        document.getElementById("serviceName").value = selectedService.name;
        document.getElementById("serviceDescription").value =
            selectedService.description;
        document.getElementById("servicePrice").value = selectedService.price;
        document.getElementById("serviceImage").value =
            selectedService.image || "";
    } else {
        modalTitle.textContent = "Add Service";
    }

    serviceModal.style.display = "flex";
}

function closeServiceModal() {
    const serviceModal = document.getElementById("serviceModal");

    if (serviceModal) {
        serviceModal.style.display = "none";
    }

    selectedServiceId = null;
}

const serviceForm = document.getElementById("serviceForm");

if (serviceForm) {
    serviceForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const serviceName = document.getElementById("serviceName").value.trim();
        const serviceDescription =
            document.getElementById("serviceDescription").value.trim();
        const servicePrice =
            document.getElementById("servicePrice").value.trim();
        const serviceImage =
            document.getElementById("serviceImage").value.trim();
        const services = getServices();

        if (selectedServiceId) {
            const updatedServices = services.map(function (service) {
                if (service.id === selectedServiceId) {
                    service.name = serviceName;
                    service.description = serviceDescription;
                    service.price = servicePrice;
                    service.image = serviceImage || "image/pic.jpg"; 
                }

                return service;
            });

            saveServices(updatedServices);
        } else {
            services.push({
                id: Date.now().toString(),
                name: serviceName,
                description: serviceDescription,
                price: servicePrice,
                image: serviceImage || "image/pic.jpg" 
            });

            saveServices(services);
        }

        closeServiceModal();
        renderServices();
    });
}

renderServices();