import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configurações do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCjR7ByKvIFDoF61CL5u2SmYjZ2SOqGd4I",
    authDomain: "planoautomatico.firebaseapp.com",
    projectId: "planoautomatico",
    storageBucket: "planoautomatico.appspot.com",
    messagingSenderId: "474178177133",
    appId: "1:474178177133:web:452243accf7de0548b9764",
    measurementId: "G-7GZFKCREKH"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Oculta a div do plano mensal inicialmente
const planoMensagem = document.querySelector(".form-group");
if (planoMensagem) planoMensagem.style.display = 'none';

// Verifica autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "./index.html";
    } else {
        loadUserName(user);
        loadExpirationDate(user);
        loadAnnouncement();
    }
});

// Carrega nome e email do usuário
async function loadUserName(user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    const nameDiv = document.getElementById("name");
    if (docSnap.exists()) {
        const userData = docSnap.data();
        const userName = userData.name || "Usuário";
        nameDiv.textContent = `Bem-vindo, ${userName} (${user.email})`;
    } else {
        nameDiv.textContent = `Bem-vindo, ${user.email}`;
    }
}

// Carrega a data de expiração
async function loadExpirationDate(user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        const expirationDate = userData.date || "Data não definida";
        const expiraDiv = document.getElementById("expira");
        if (expiraDiv) {
            expiraDiv.textContent = `Você voltará a pagar no dia: ${expirationDate}`;
        }

        const currentYear = new Date().getFullYear();
        const expirationYear = new Date(expirationDate).getFullYear();

        if (expirationYear === currentYear) {
            if (planoMensagem) planoMensagem.style.display = 'block';
        }
    }
}

// Carrega anúncio do documento fixo
async function loadAnnouncement() {
    const anuncioRef = doc(db, "users", "gW1fMwZXuzgnk907ZlfVigYphDw1");
    const docSnap = await getDoc(anuncioRef);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        const announcementMessage = userData.informacao;
        if (announcementMessage) checkAndDisplayAnnouncement(announcementMessage);
    }
}

// Mostra o anúncio baseado no período do dia
function checkAndDisplayAnnouncement(message) {
    const today = new Date().toDateString();
    const currentHour = new Date().getHours();
    const period = getPeriodOfDay(currentHour);
    const viewedPeriods = JSON.parse(localStorage.getItem("viewedPeriods")) || {};
    const periods = viewedPeriods[today] || [];

    if (!periods.includes(period)) {
        displayAnnouncement(message);
        periods.push(period);
        viewedPeriods[today] = periods;
        localStorage.setItem("viewedPeriods", JSON.stringify(viewedPeriods));
    }
}

// Define o período do dia
function getPeriodOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'night';
}

// Cria o modal com o anúncio
function displayAnnouncement(message) {
    const modal = document.createElement('div');
    modal.setAttribute('id', 'announcementModal');
    modal.style.position = 'fixed';
    modal.style.top = '10px';
    modal.style.left = '50%';
    modal.style.transform = 'translateX(-50%)';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.color = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '5px';
    modal.style.fontSize = '18px';
    modal.style.zIndex = '1000';
    modal.style.textAlign = 'center';

    modal.innerHTML = `
        <h2 style="color: yellow; font-size: 22px; margin-bottom: 10px;">Atenção!</h2>
        <p>${message}</p>
        <button id="closeModal" style="background-color: red; color: white; border: none; padding: 5px 10px; cursor: pointer;">Fechar</button>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeModal').onclick = function () {
        document.body.removeChild(modal);
    };
}