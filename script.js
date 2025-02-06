import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const reservationsCollection = collection(db, "reservations");

async function loadReservations() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const querySnapshot = await getDocs(reservationsCollection);
    let reservations = {};
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!reservations[data.date]) reservations[data.date] = [];
        reservations[data.date].push({ id: doc.id, ...data });
    });

    for (const date in reservations) {
        reservations[date].forEach(reservation => {
            const event = document.createElement("div");
            event.classList.add("event");
            event.innerHTML = `<strong>${reservation.date} - ${reservation.hour}</strong>: 
                ${reservation.patient} (${reservation.medium}) - ${reservation.state}`;
            calendar.appendChild(event);
        });
    }
}

window.reserve = async function () {
    const patient = document.getElementById("patient").value;
    const medium = document.getElementById("medium").value;
    const state = document.getElementById("state").value;
    const professional = document.getElementById("professional").value;
    const formattedDate = document.getElementById("date-input").value;
    const hour = document.getElementById("hour").value;
    const repeatInterval = parseInt(document.getElementById("repeat").value);
    const repeatCount = parseInt(document.getElementById("repeat-count").value);

    if (!patient || !hour) return alert("Debe ingresar un paciente y una hora válida");

    let date = new Date(formattedDate.split('-').reverse().join('-'));

    for (let i = 0; i < repeatCount; i++) {
        let formattedNewDate = date.toISOString().split("T")[0].split('-').reverse().join('-');

        await addDoc(reservationsCollection, {
            date: formattedNewDate,
            professional: professional,
            hour: hour,
            patient: patient,
            medium: medium,
            state: state
        });

        date.setDate(date.getDate() + repeatInterval);
    }

    loadReservations();
};

document.addEventListener("DOMContentLoaded", loadReservations);
