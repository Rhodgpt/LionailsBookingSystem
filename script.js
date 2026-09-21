//para to sa button sa taas kapag pipindutijn mo magiging ginto kulay
const navButtons = document.querySelectorAll(".navigation button");

navButtons.forEach(button => {
    button.addEventListener("click", () => {

        navButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
    });
});
//para to sa button sa taas kapag pipindutijn mo magiging ginto kulay

//button ng View saka book apoint


//button ng View saka book apoint

// CLIENT BOOKING FORM

const bookingForm = document.getElementById("bookingForm");
const bookingDate = document.getElementById("bookingDate");
const bookingTime = document.getElementById("bookingTime");
const bookingMessage = document.getElementById("bookingMessage");

const availableTimeSlots = [
    "9:00 AM - 12:00 AM",
    "1:00 PM - 04:00 PM",
    "4:00 PM - 07:00 PM",
    "7:00 PM - 10:00 PM",
];

// for saving booking and it will list in the admin booking page then admin can confirm or cancel the booking
function getSavedBookings() {
    const savedBookings = localStorage.getItem("lionailsBookings");

    if (!savedBookings) {
        return [];
    }

    return JSON.parse(savedBookings);
}

function setMinimumBookingDate() {
    if (!bookingDate) {
        return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    bookingDate.min = `${year}-${month}-${day}`;
}

function showAvailableTimeSlots() {
    if (!bookingDate || !bookingTime) {
        return;
    }

    const selectedDate = bookingDate.value;

    if (!selectedDate) {
        bookingTime.innerHTML = `<option value="">Select a date first</option>`;
        bookingTime.disabled = true;
        return;
    }

    const bookings = getSavedBookings();

    const bookedTimes = bookings
        .filter(function (booking) {
            return booking.date === selectedDate &&
                booking.status !== "cancelled";
        })
        .map(function (booking) {
            return booking.time;
        });

    const openTimeSlots = availableTimeSlots.filter(function (time) {
        return !bookedTimes.includes(time);
    });

    bookingTime.innerHTML = `<option value="">Select a time slot</option>`;

    if (openTimeSlots.length === 0) {
        bookingTime.innerHTML = `<option value="">No available time slots</option>`;
        bookingTime.disabled = true;

        if (bookingMessage) {
            bookingMessage.textContent = "This date is fully booked. Please choose another date.";
        }

        return;
    }

    openTimeSlots.forEach(function (time) {
        bookingTime.innerHTML += `<option value="${time}">${time}</option>`;
    });

    bookingTime.disabled = false;

    if (bookingMessage) {
        bookingMessage.textContent = "";
    }
}

if (bookingDate) {
    setMinimumBookingDate();
    bookingDate.addEventListener("change", showAvailableTimeSlots);
}

if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newBooking = {
            id: Date.now().toString(),
            name: document.getElementById("clientName").value.trim(),
            phone: document.getElementById("clientPhone").value.trim(),
            service: document.getElementById("bookingService").value,
            date: bookingDate.value,
            time: bookingTime.value,
            notes: document.getElementById("bookingNotes").value.trim(),
            status: "pending",
            createdAt: new Date().toDateString()
        };

        const bookings = getSavedBookings();
        bookings.push(newBooking);

        localStorage.setItem("lionailsBookings", JSON.stringify(bookings));

        bookingMessage.textContent =
            "Booking submitted successfully. Please wait for admin confirmation.";

        bookingForm.reset();
        bookingTime.innerHTML = `<option value="">Select a date first</option>`;
        bookingTime.disabled = true;
    });
}

// LOAD ADMIN SERVICES INTO CLIENT BOOKING FORM

const bookingService = document.getElementById("bookingService");

const defaultBookingServices = [
    "Softgel Extension",
    "Builder Gel / Hard Gel Overlay",
    "Gel Polish",
    "Removal"
];

function loadBookingServices() {
    if (!bookingService) {
        return;
    }

    const savedServices = localStorage.getItem("lionailsServices");

    let services = defaultBookingServices;

    if (savedServices) {
        services = JSON.parse(savedServices);
    }

    bookingService.innerHTML = `
        <option value="">Select a service</option>
    `;

    services.forEach(function (service) {
        const serviceName = typeof service === "string"
            ? service
            : service.name;

        bookingService.innerHTML += `
            <option value="${serviceName}">${serviceName}</option>
        `;
    });

    bookingService.disabled = false;
}

loadBookingServices();

// CLIENT SERVICES GALLERY

const clientServicesGrid = document.getElementById("clientServicesGrid");

const fallbackClientServices = [
    {
        name: "Softgel Extension",
        description: "Lightweight nail extensions with a natural-looking finish.",
        price: "₱450 - ₱550",
        image: "image/pic.jpg"
    },
    {
        name: "Builder Gel / Hard Gel Overlay",
        description: "Adds strength and protection to natural nails.",
        price: "₱500 - ₱550",
        image: "image/pic1.jpg"
    },
    {
        name: "Gel Polish",
        description: "Long-lasting color with a smooth, glossy finish.",
        price: "₱249 - ₱299",
        image: "image/pic3.jpg"
    },
    {
        name: "Removal",
        description: "Safe removal of existing gel or nail extensions.",
        price: "₱200 - ₱300",
        image: "image/pic5.jpg"
    }
];

function getClientServices() {
    const savedServices = localStorage.getItem("lionailsServices");

    if (!savedServices) {
        return fallbackClientServices;
    }

    return JSON.parse(savedServices);
}

function renderClientServices() {
    if (!clientServicesGrid) {
        return;
    }

    const services = getClientServices();

    clientServicesGrid.innerHTML = services.map(function (service) {
        const imagePath = service.image || "image/pic.jpg";

        return `
            <div class="serviceBox">
                <div class="serviceImage">
                    <img src="${imagePath}" alt="${service.name}">
                </div>

                <div class="serviceDetails">
                    <div class="serviceName">${service.name}</div>
                    <div class="servicePrice">${service.price}</div>

                    <div class="serviceText">
                        ${service.description}
                    </div>

                    <button class="serviceBookBtn"
                        onclick="bookSelectedService('${service.name}')">
                        BOOK THIS SERVICE
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function bookSelectedService(serviceName) {
    window.location.href =
        `book_appointment.html?service=${encodeURIComponent(serviceName)}`;
}

function selectServiceFromLink() {
    if (!bookingService) {
        return;
    }

    const selectedService = new URLSearchParams(
        window.location.search
    ).get("service");

    if (selectedService) {
        bookingService.value = selectedService;
    }
}

renderClientServices();
selectServiceFromLink();

// CONTACT FORM updated

const contactForm = document.getElementById("contactForm");
const contactMessage = document.getElementById("contactMessage");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        contactMessage.textContent =
            "Thank you! Your message has been received.";

        contactForm.reset();
    });
}