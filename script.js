document.addEventListener("DOMContentLoaded", function () {
    const schedule = document.getElementById("schedule");
    const companySelect = document.getElementById("company");
    const calendar = document.getElementById("calendar");
    const hours = [];

    for (let i = 8; i < 22; i++) {
        hours.push(`${i}:00 - ${i + 1}:00`);
    }

    function loadReservations() {
        schedule.innerHTML = "";
        calendar.innerHTML = "";
        const company = companySelect.value;
        const reservations = JSON.parse(localStorage.getItem("reservations")) || {};

        // Mostrar horarios en tabla
        hours.forEach(hour => {
            const count = reservations[company]?.[hour]?.length || 0;
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

        // Mostrar reservas en el calendario
        Object.keys(reservations[company] || {}).forEach(hour => {
            reservations[company][hour].forEach(name => {
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
        let reservations = JSON.parse(localStorage.getItem("reservations")) || {};
        if (!reservations[company]) reservations[company] = {};
        if (!reservations[company][hour]) reservations[company][hour] = [];

        reservations[company][hour].push(name);
        localStorage.setItem("reservations", JSON.stringify(reservations));
        loadReservations();
    };

    companySelect.addEventListener("change", loadReservations);
    loadReservations();
});
