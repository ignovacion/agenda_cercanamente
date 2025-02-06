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
    const companySelect = document.getElementById("company");
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
                            <button onclick="editReservation('${reservation.id}', '${formattedDate}', '${company}', '${hour}')">✏️</button>
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

    window.reserve = async function (hour) {
        const person1 = prompt("Ingrese nombre del Paciente. En caso de que sea otra hora diferente a las :00 indíquela entre paréntesis");
        if (!person1) return;
        const person2 = prompt("Ingrese si será por Zoom, Whatsapp, Meet, u otra. En caso de ser AUSENTE editar posterior a la sesión");
        if (!person2) return;

        const company = companySelect.value;
        let formattedDate = dateInput.value;
        
        const repeatInterval = parseInt(document.getElementById("repeat").value); // 0 = no repetir, 7 = semanal, 15 = quincenal
        const repeatCount = parseInt(document.getElementById("repeat-count").value); // Número de repeticiones

        for (let i = 0; i < repeatCount; i++) {
            await addDoc(reservationsCollection, {
                repeat_interval: repeatInterval,
                date: formattedDate,
                company: company,
                hour: hour,
                person1: person1,
                person2: person2
            });

            // Incrementa la fecha según el intervalo de repetición
            let dateParts = formattedDate.split("-");
            let newDate = new Date(dateParts[2], dateParts[1] - 1, parseInt(dateParts[0]) + repeatInterval);
            formattedDate = formatDate(newDate);
        }
        
        loadReservations();
    };

    dateInput.addEventListener("change", loadReservations);
    companySelect.addEventListener("change", loadReservations);
    dateInput.value = formatDate(new Date());
    loadReservations();
});
