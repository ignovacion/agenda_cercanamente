document.addEventListener("DOMContentLoaded", function () {
    const schedule = document.getElementById("schedule");
    const companySelect = document.getElementById("company");
    const calendar = document.getElementById("calendar");
    const dateInput = document.getElementById("date-input");
    
    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    function loadReservations() {
        schedule.innerHTML = "";
        calendar.innerHTML = "";
        const company = companySelect.value;
        const reservations = JSON.parse(localStorage.getItem("reservations")) || {};
        const formattedDate = dateInput.value;

        if (!reservations[formattedDate]) reservations[formattedDate] = {};
        if (!reservations[formattedDate][company]) reservations[formattedDate][company] = {};

        const hours = [];
        for (let i = 8; i < 22; i++) {
            hours.push(`${i}:00 - ${i + 1}:00`);
        }

        hours.forEach(hour => {
            const count = reservations[formattedDate][company][hour]?.length || 0;
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

        Object.keys(reservations[formattedDate][company] || {}).forEach(hour => {
            reservations[formattedDate][company][hour].forEach(name => {
                const event = document.createElement("div");
                event.classList.add("event");
                event.innerHTML = `<strong>${hour}</strong>: ${name} (${company})`;
                calendar.appendChild(event);
            });
        });
    }

    window.reserve = function (hour) {
        const name = prompt("Ingrese su nombre para la reserva:");
        if (!name) return;

        const company = companySelect.value;
        const formattedDate = dateInput.value;
        let reservations = JSON.parse(localStorage.getItem("reservations")) || {};
        if (!reservations[formattedDate]) reservations[formattedDate] = {};
        if (!reservations[formattedDate][company]) reservations[formattedDate][company] = {};
        if (!reservations[formattedDate][company][hour]) reservations[formattedDate][company][hour] = [];

        reservations[formattedDate][company][hour].push(name);
        localStorage.setItem("reservations", JSON.stringify(reservations));
        loadReservations();
    };

    dateInput.addEventListener("change", loadReservations);
    companySelect.addEventListener("change", loadReservations);
    dateInput.value = formatDate(new Date());
    loadReservations();
});
