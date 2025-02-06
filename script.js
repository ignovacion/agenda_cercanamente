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
                    totalCoun
