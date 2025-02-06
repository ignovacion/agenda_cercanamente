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
        const reservations = JSON.parse(localStorage.getItem("reservations")) || {};
        const formattedDate = dateInput.value;

        if (!reservations[formattedDate]) reservations[formattedDate] = {};

        const hours = [];
        for (let i = 8; i < 22; i++) {
            hours.push(`${i}:00 - ${i + 1}:00`);
        }

        hours.forEach(hour => {
            let totalCount = 0;
            let reservationDetails = "";

            Object.keys(reservations[formattedDate]).forEach(company => {
                if (reservations[formattedDate][company] && reservations[formattedDate][company][hour]) {
                    reservations[formattedDate][company][hour].forEach((reservation, index) => {
                        reservationDetails += `<div class='event'>
                            <strong>${hour}</strong>: ${reservation.person1} con ${reservation.person2} (${company})
                            <button onclick="editReservation('${formattedDate}', '${company}', '${hour}', ${index})">✏️</button>
                            <button onclick="deleteReservation('${formattedDate}', '${company}', '${hour}', ${index})">🗑️</button>
                        </div>`;
                    });
                    totalCount += reservations[formattedDate][company][hour].length;
                }
            });

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${hour}</td>
                <td>
                    <button onclick="reserve('${hour}')">Reservar</button>
                    <span>${totalCount} sesiones</span>
                </td>
            `;
            if (totalCount >= 2) {
                row.classList.add("red-alert");
            }
            schedule.appendChild(row);
            calendar.innerHTML += reservationDetails;
        });
    }

    window.reserve = function (hour) {
        const person1 = prompt("Ingrese el responsable de la reunión:");
        if (!person1) return;
        const person2 = prompt("Ingrese con quien o en qué estará:");
        if (!person2) return;

        const company = companySelect.value;
        const formattedDate = dateInput.value;
        let reservations = JSON.parse(localStorage.getItem("reservations")) || {};
        if (!reservations[formattedDate]) reservations[formattedDate] = {};
        if (!reservations[formattedDate][company]) reservations[formattedDate][company] = {};
        if (!reservations[formattedDate][company][hour]) reservations[formattedDate][company][hour] = [];

        // Verificar si ya existe la reserva
        const exists = reservations[formattedDate][company][hour].some(res => res.person1 === person1 && res.person2 === person2);
        if (exists) {
            alert("Esta reunión ya está reservada.");
            return;
        }

        reservations[formattedDate][company][hour].push({ person1, person2 });
        localStorage.setItem("reservations", JSON.stringify(reservations));
        loadReservations();
    };

    window.editReservation = function (date, company, hour, index) {
        let reservations = JSON.parse(localStorage.getItem("reservations"));
        const updatedPerson1 = prompt("Editar responsable:", reservations[date][company][hour][index].person1);
        if (!updatedPerson1) return;
        const updatedPerson2 = prompt("Editar con quién o qué:", reservations[date][company][hour][index].person2);
        if (!updatedPerson2) return;

        reservations[date][company][hour][index] = { person1: updatedPerson1, person2: updatedPerson2 };
        localStorage.setItem("reservations", JSON.stringify(reservations));
        loadReservations();
    };

    window.deleteReservation = function (date, company, hour, index) {
        if (!confirm("¿Estás seguro de que quieres eliminar esta reserva?")) return;
        
        let reservations = JSON.parse(localStorage.getItem("reservations"));
        reservations[date][company][hour].splice(index, 1);
        if (reservations[date][company][hour].length === 0) {
            delete reservations[date][company][hour];
        }
        if (Object.keys(reservations[date][company]).length === 0) {
            delete reservations[date][company];
        }
        if (Object.keys(reservations[date]).length === 0) {
            delete reservations[date];
        }
        localStorage.setItem("reservations", JSON.stringify(reservations));
        loadReservations();
    };

    dateInput.addEventListener("change", loadReservations);
    companySelect.addEventListener("change", loadReservations);
    dateInput.value = formatDate(new Date());
    loadReservations();
});
