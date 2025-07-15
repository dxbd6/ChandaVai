// Import necessary functions from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- আপনার Firebase প্রজেক্টের কনফিগারেশন এখানে পেস্ট করুন ---
// এই কোডটি আপনার Firebase প্রজেক্টের সেটিংস থেকে পাবেন
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// -------------------------------------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Firebase Functions ---
async function saveCalculation(data) {
    try {
        await addDoc(collection(db, "calculations"), data);
    } catch (error) {
        console.error("Error writing document: ", error);
    }
}

async function getLeaderboard() {
    const q = query(collection(db, "calculations"), orderBy("chanda", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const leaderboardData = [];
    querySnapshot.forEach((doc) => {
        leaderboardData.push(doc.data());
    });
    return leaderboardData;
}

// --- App Data ---
const professions = [
    "সরকারি চাকরিজীবী", "বেসরকারি চাকরিজীবী", "ডাক্তার", "ইঞ্জিনিয়ার", "শিক্ষক", "ব্যবসায়ী",
    "ফ্রিল্যান্সার", "আইনজীবী", "কৃষক", "দোকানদার", "ছাত্র", "গৃহিণী", "ইউটিউবার",
    "সৎ রাজনীতিবিদ (যদি থাকে)", "চা দোকানদার", "বাড়িওয়ালা", "অন্যান্য"
];
const funnyQuotes = [
    "চাঁদা দিলে দেশ চলে, না দিলে নেতারা বিদেশ চলে যায়!",
    "নোট দিলেই দেশ চলে ভাই, শুধু ভোটে হয় না!",
    "আপনার ১০% দিলে নেতার ১০টা গাড়ি বাড়ে!",
    "দেশপ্রেম বোঝা যায় বিকাশ হিসাব দেখে!",
    "আপনার চাঁদা আমাদের অনুপ্রেরণা, আপনার ফাঁকিবাজি আমাদের বেদনা।",
    "টাকা দেন, উন্নয়ন দেখেন... টিভিতে!"
];

// --- DOM Elements ---
const form = document.getElementById('chandaForm');
const professionSelect = document.getElementById('profession');
const borolokMode = document.getElementById('borolokMode');
const monthlyIncomeInput = document.getElementById('monthlyIncome');
const extraIncomeContainer = document.getElementById('extra-income-container');
const addIncomeBtn = document.getElementById('addIncomeBtn');
const meterBar = document.getElementById('meter');
const receiptDiv = document.getElementById('receipt');
const leaderboardDiv = document.getElementById('leaderboard');
const funnyQuoteP = document.getElementById('funnyQuote');

// --- Functions ---
function populateProfessions() {
    professions.forEach(p => {
        const option = document.createElement('option');
        option.value = p;
        option.textContent = p;
        professionSelect.appendChild(option);
    });
}

async function displayLeaderboard() {
    leaderboardDiv.innerHTML = '<p class="text-center text-gray-500">লোড হচ্ছে...</p>';
    try {
        const leaderboardData = await getLeaderboard();
        if (leaderboardData.length === 0) {
            leaderboardDiv.innerHTML = '<p class="text-center text-gray-500">এখনো কোনো দেশপ্রেমিক পাওয়া যায়নি।</p>';
            return;
        }
        leaderboardDiv.innerHTML = '';
        const ol = document.createElement('ol');
        ol.className = 'list-decimal list-inside space-y-2';
        leaderboardData.forEach(item => {
            const li = document.createElement('li');
            li.className = 'p-2 rounded-md bg-gray-100';
            li.innerHTML = `<span>${item.name || 'অজ্ঞাত দেশপ্রেমিক'} - </span><span class="font-bold text-red-600">${formatCurrency(item.chanda)}</span>`;
            ol.appendChild(li);
        });
        leaderboardDiv.appendChild(ol);
    } catch (error) {
        leaderboardDiv.innerHTML = '<p class="text-center text-red-500">লিডারবোর্ড লোড করা যায়নি।</p>';
    }
}

function formatCurrency(amount) {
    return `৳ ${amount.toLocaleString('bn-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    let totalIncome = parseFloat(monthlyIncomeInput.value) || 0;
    const extraIncomes = document.querySelectorAll('.extra-income');
    extraIncomes.forEach(input => {
        totalIncome += parseFloat(input.value) || 0;
    });
    const chandaAmount = totalIncome * 0.10;
    const remainingAmount = totalIncome * 0.90;
    const record = {
        name: document.getElementById('userName').value || 'অজ্ঞাত দেশপ্রেমিক',
        profession: professionSelect.value,
        totalIncome: totalIncome,
        chanda: chandaAmount,
        timestamp: new Date()
    };
    meterBar.style.width = `${Math.min(10 + (chandaAmount / 1000), 100)}%`;
    document.getElementById('receiptTotalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('receiptChandaAmount').textContent = formatCurrency(chandaAmount);
    document.getElementById('receiptRemainingAmount').textContent = formatCurrency(remainingAmount);
    document.getElementById('receiptMessage').textContent = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
    receiptDiv.classList.remove('hidden');
    await saveCalculation(record);
    await displayLeaderboard();
}

// --- Event Listeners & Initializations ---
document.addEventListener('DOMContentLoaded', () => {
    populateProfessions();
    displayLeaderboard();
    funnyQuoteP.textContent = `"${funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)]}"`;
});

addIncomeBtn.addEventListener('click', () => {
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'flex items-center gap-2';
    const new_input = document.createElement('input');
    new_input.type = 'number';
    new_input.className = 'extra-income w-full p-3 border rounded-lg';
    new_input.placeholder = 'অতিরিক্ত আয়ের পরিমাণ';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '✕';
    removeBtn.className = 'text-red-500 font-bold';
    removeBtn.onclick = () => inputWrapper.remove();
    inputWrapper.appendChild(new_input);
    inputWrapper.appendChild(removeBtn);
    extraIncomeContainer.appendChild(inputWrapper);
});

borolokMode.addEventListener('change', (e) => {
    if (e.target.checked) {
        monthlyIncomeInput.value = Math.floor(Math.random() * (500000 - 100000 + 1)) + 100000;
    } else {
        monthlyIncomeInput.value = '';
    }
});

form.addEventListener('submit', handleFormSubmit);
