import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

// Exportar Firestore
export { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc };

document.addEventListener("DOMContentLoaded", function () {
    const schedule = document.getElementById("schedule");
    const professionalSelect = document.getElementById("professional");
    const calendar = document.getElementById("calendar");
    const dateInput = document.getElementById("date-input");
    const reservationsCollection = collection(db, "reservations");
    
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0'); // Día con dos dígitos
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos
        const year = date.getFullYear(); // Año completo
        return `${day}-${month}-${year}`; // Retorna DD-MM-YYYY
    }

    async function loadReservations() {
        schedule.innerHTML = "";
        calendar.innerHTML = "";
        const formattedDate = dateInput.value;
        
        const querySnapshot = await getDocs(reservationsCollection);
        let reservations = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!reservations[data.date]) reservations[data.date] = [];
            reservations[data.date].push({ id: doc.id, ...data });
        });

        const hours = [];
        for (let i = 8; i < 22; i++) {
            [":00", ":15", ":20", ":30"].forEach(suffix => {
                hours.push(`${i}${suffix}`);
            });
        }

        hours.forEach(hour => {
            let reservationDetails = "";
            (reservations[formattedDate] || []).forEach(reservation => {
                reservationDetails += `<div class='event' style='background: #28a745;'>
                    <strong>${hour}</strong>: ${reservation.patient} (${reservation.medium}) - ${reservation.state}
                    <button onclick="editReservation('${reservation.id}')">✏️</button>
                    <button onclick="deleteReservation('${reservation.id}')">🗑️</button>
                </div>`;
            });

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type='text' placeholder='Paciente' id='patient-${hour}'></td>
                <td>
                    <select id='medium-${hour}'>
                        <option value='Zoom'>Zoom</option>
                        <option value='WhatsApp'>WhatsApp</option>
                        <option value='Meet'>Meet</option>
                        <option value='Otro'>Otro</option>
                    </select>
                </td>
                <td>
                    <select id='state-${hour}'>
                        <option value='Presente'>Presente</option>
                        <option value='Ausente'>Ausente</option>
                    </select>
                </td>
                <td>${hour}</td>
                <td><button onclick="reserve('${hour}')">Reservar</button></td>
            `;
            schedule.appendChild(row);
            calendar.innerHTML += reservationDetails;
        });
    }

    window.reserve = async function (hour) {
        const patient = document.getElementById(`patient-${hour}`).value;
        const medium = document.getElementById(`medium-${hour}`).value;
        const state = document.getElementById(`state-${hour}`).value;
        const professional = professionalSelect.value;
        const formattedDate = dateInput.value;

        if (!patient) return alert("Debe ingresar un paciente");

        await addDoc(reservationsCollection, {
            date: formattedDate,
            professional: professional,
            hour: hour,
            patient: patient,
            medium: medium,
            state: state
        });
        loadReservations();
    };

    window.editReservation = async function (id) {
        const updatedState = prompt("Editar estado (Presente/Ausente):");
        if (!updatedState) return;

        await updateDoc(doc(db, "reservations", id), {
            state: updatedState
        });
        loadReservations();
    };

    window.deleteReservation = async function (id) {
        if (!confirm("¿Estás seguro de que quieres eliminar esta reserva?")) return;
        await deleteDoc(doc(db, "reservations", id));
        loadReservations();
    };

    dateInput.addEventListener("change", loadReservations);
    professionalSelect.addEventListener("change", loadReservations);
    dateInput.value = formatDate(new Date());
    loadReservations();
});
