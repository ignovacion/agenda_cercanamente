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
        const reservations = JSON.parse(localStorage.getItem("reserv
