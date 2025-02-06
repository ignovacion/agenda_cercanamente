document.addEventListener("DOMContentLoaded", function () {
    const schedule = document.getElementById("schedule");
    const companySelect = document.getElementById("company");
    const calendar = document.getElementById("calendar");
    const dateDisplay = document.getElementById("date-display");
    const prevDay = document.getElementById("prev-day");
    const nextDay = document.getElementById("next-day");
    let currentDate = new Date();

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    function loadReservations() {
        schedule.innerHTML = "";
        calendar.innerHTML = "";
        const company = companySelect.value;
        const reservations = JSON.parse(localStorage.getItem("reservations")) || {};
        const formattedDate = formatDate(currentDate);
        dateDisplay.textContent = currentDate.toLocaleDateString();

        if (!reservations[company]) reservations[company] = {};
        if (!reservations[company][formattedDate]) reservations[company][formattedDate] = {};

        const hours = [];
        for (let i = 8; i < 22; i++) {
            hours.push(`${i}:00 - ${i + 1}:00`);
        }

        hours.forEach(hour => {
            const count = reservations[company][formattedDate][hour]?.length || 0;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${hour}</td>
                <td>
                    <button onclick="reserve('${hour}')">Reservar</button>
                    <span>${count} sesiones</span>
                </td>
            `;
            if (count >= 2) {
                row.classList.add("red-alert");
            }
            schedule.appendChild(row);
        });

        Object.keys(reservations[company][formattedDate] || {}).forEach(hour => {
            reservations[company][formattedDate][hour].forEach(name => {
                const event = document.createElement("div");
                event.classList.add("event");
                event.innerHTML = `<strong>${hour}</strong>: ${name}`;
                calendar.appendChild(event);
            });
        });
    }

    window.reserve = function (hour) {
        const name = prompt("Ingrese su nombre para la reserva:");
        if (!name) return;

        const company = companySelect.value;
        const formattedDate = formatDate(currentDate);
        let reservations = JSON.parse(localStorage.getItem("reservations")) || {};
        if (!reservations[company]) reservations[company] = {};
        if (!reservations[company][formattedDate]) reservations[company][formattedDate] = {};
        if (!reservations[company][formattedDate][hour]) reservations[company][formattedDate][hour] = [];

        reservations[company][formattedDate][hour].push(name);
        localStorage.setItem("reservations", JSON.stringify(reservations));
        loadReservations();
    };

    prevDay.addEventListener("click", function () {
        currentDate.setDate(currentDate.getDate() - 1);
        loadReservations();
    });

    nextDay.addEventListener("click", function () {
        currentDate.setDate(currentDate.getDate() + 1);
        loadReservations();
    });

    companySelect.addEventListener("change", loadReservations);
    loadReservations();
});
