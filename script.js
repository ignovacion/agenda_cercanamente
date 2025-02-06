import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCUqdOd9hrynY2q_3qJPIqGtEN-kQzE7Vc",
    authDomain: "zoom-e3d70.firebaseapp.com",
    projectId: "zoom-e3d70",
    storageBucket: "zoom-e3d70.firebasestorage.app",
    messagingSenderId: "312018166922",
    appId: "1:312018166922:web:b69f5d99e1aecbbe14f973",
    measurementId: "G-YNHRP63ZHX"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para cargar las reservas desde Firestore
async function loadReservations() {
    const schedule = document.getElementById("schedule");
    const calendar = document.getElementById("calendar");
    const dateInput = document.getElementById("date-input");
    const reservationsCollection = collection(db, "reservations");

    schedule.innerHTML = "";
    calendar.innerHTML = "";
    const formattedDate = dateInput.value;

    const querySnapshot = await getDocs(reservationsCollection);
    let reservations = {};
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!reservations[data.date]) reservations[data.date] = {};
        if (!reservations[data.date][data.company]) reservations[data.date][data.company] = {};
        if (!reservations[data.date][data.company][data.hour]) reservations[data.date][data.company][data.hour] = [];
        reservations[data.date][data.company][data.hour].push({ id: doc.id, person1: data.person1, person2: data.person2 });
    });

    const hours = [];
    for (let i = 8; i < 22; i++) {
        hours.push(`${i}:00 - ${i + 1}:00`);
    }

    hours.forEach(hour => {
        let totalCount = 0;
        let reservationDetails = "";

        Object.keys(reservations[formattedDate] || {}).forEach(company => {
            if (reservations[formattedDate][company][hour]) {
                reservations[formattedDate][company][hour].forEach((reservation) => {
                    reservationDetails += `<div class='event' style='background: #28a745;'>
                        <strong>${hour}</strong>: ${reservation.person1} con ${reservation.person2} (${company})
                        <button onclick="editReservation('${reservation.id}')">✏️</button>
                        <button onclick="deleteReservation('${reservation.id}')">🗑️</button>
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

// Función para hacer una nueva reserva
window.reserve = async function (hour) {
    const person1 = prompt("Ingrese el responsable de la reunión:");
    if (!person1) return;
    const person2 = prompt("Ingrese con quien o en qué estará:");
    if (!person2) return;

    const company = document.getElementById("company").value;
    const formattedDate = document.getElementById("date-input").value;

    await addDoc(collection(db, "reservations"), {
        date: formattedDate,
        company: company,
        hour: hour,
        person1: person1,
        person2: person2
    });
    loadReservations();
};

// Función para editar una reserva
window.editReservation = async function (id) {
    const updatedPerson1 = prompt("Editar responsable:");
    if (!updatedPerson1) return;
    const updatedPerson2 = prompt("Editar con quién o qué:");
    if (!updatedPerson2) return;

    await updateDoc(doc(db, "reservations", id), {
        person1: updatedPerson1,
        person2: updatedPerson2
    });
    loadReservations();
};

// Función para eliminar una reserva
window.deleteReservation = async function (id) {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reserva?")) return;
    await deleteDoc(doc(db, "reservations", id));
    loadReservations();
};

// Eventos
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("date-input").addEventListener("change", loadReservations);
    document.getElementById("company").addEventListener("change", loadReservations);
    document.getElementById("date-input").value = new Date().toISOString().split("T")[0];
    loadReservations();
});
