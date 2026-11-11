/**
 * ====================================================================
 * ATM MANAGEMENT SYSTEM (+2 STUDENT LEVEL PROJECT)
 * ====================================================================
 * Pure HTML5, CSS3 & Vanilla JavaScript (Browser localStorage)
 * Features:
 * 1. Create ATM PIN using Account Number
 * 2. ATM Login
 * 3. Balance Check
 * 4. Cash Withdrawal (with balance validation & cash banner)
 * 5. Cash Deposit (with instant balance update)
 * 6. Update ATM PIN
 * ====================================================================
 */

// 1. LIGHTWEIGHT AUDIO FEEDBACK (Web Audio API)
const soundCtx = window.AudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playBeep(freq = 1100, duration = 0.06) {
    if (!soundCtx) return;
    try {
        if (soundCtx.state === "suspended") soundCtx.resume();
        const osc = soundCtx.createOscillator();
        const gain = soundCtx.createGain();
        osc.frequency.setValueAtTime(freq, soundCtx.currentTime);
        gain.gain.setValueAtTime(0.08, soundCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, soundCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(soundCtx.destination);
        osc.start();
        osc.stop(soundCtx.currentTime + duration);
    } catch (e) {}
}

function playSuccessChime() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => playBeep(freq, 0.14), i * 75);
    });
}

function playErrorBuzz() {
    playBeep(180, 0.25);
}

function playCashSound() {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => playBeep(320 + Math.random() * 140, 0.04), i * 65);
    }
}

// 2. DATABASE SYSTEM (Browser LocalStorage)
const STORAGE_KEY = "ATM_STUDENT_DATABASE";

function getDatabase() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        const initialAccounts = {
            "1001001234": {
                accountNumber: "1001001234",
                name: "Rahul Sharma",
                pin: "1234",
                balance: 25000.00
            },
            "1001005678": {
                accountNumber: "1001005678",
                name: "Pooja Verma",
                pin: "5678",
                balance: 15000.00
            }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAccounts));
        return initialAccounts;
    }
    return JSON.parse(data);
}

function saveDatabase(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

let currentUser = null;

function formatINR(amount) {
    return "₹ " + parseFloat(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 3. SCREEN NAVIGATION
const PROTECTED_SCREENS = ["screen-services", "screen-balance", "screen-withdrawal", "screen-deposit", "screen-update-pin"];

function showScreen(screenId) {
    if (PROTECTED_SCREENS.includes(screenId) && !currentUser) {
        screenId = "screen-login";
        setTimeout(() => showAlert("alert-login", "Please login with your Account Number & PIN first!"), 50);
    }

    playBeep(1150, 0.05);

    document.querySelectorAll(".atm-view-screen").forEach(screen => {
        screen.style.display = "none";
    });

    const target = document.getElementById(screenId);
    if (target) target.style.display = "flex";

    hideAlerts();

    const banner = document.getElementById("cash-dispense-banner");
    if (banner) banner.style.display = "none";

    if (currentUser) {
        const db = getDatabase();
        if (db[currentUser.accountNumber]) currentUser = db[currentUser.accountNumber];
        updateUserBars();
    }
}

function updateUserBars() {
    const headerUser = document.getElementById("screen-header-user");
    if (currentUser) {
        headerUser.textContent = `${currentUser.name.toUpperCase()} (•••• ${currentUser.accountNumber.slice(-4)})`;
        
        const dName = document.getElementById("dash-user-name");
        const dAcc = document.getElementById("dash-user-acc");
        const dBal = document.getElementById("dash-user-bal");
        if (dName) dName.textContent = currentUser.name;
        if (dAcc) dAcc.textContent = "A/C: •••• " + currentUser.accountNumber.slice(-4);
        if (dBal) dBal.textContent = formatINR(currentUser.balance);
    } else {
        headerUser.textContent = "APEX BANK ATM";
    }
}

function showAlert(elementId, message, isError = true) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.display = "block";
    el.style.color = isError ? "#ff8a8a" : "#00ffaa";
    el.style.background = isError ? "rgba(255, 60, 60, 0.16)" : "rgba(0, 255, 170, 0.14)";
    el.style.border = isError ? "1px solid #ff5252" : "1px solid #00ffaa";

    if (isError) playErrorBuzz();
    else playSuccessChime();
}

function hideAlerts() {
    document.querySelectorAll(".atm-alert-box").forEach(el => el.style.display = "none");
}

// 4. CORE ATM OPERATIONS

/**
 * 1. Create ATM PIN using Account Number
 */
function handleCreatePin(e) {
    if (e) e.preventDefault();
    hideAlerts();

    const accNum = document.getElementById("create-acc-num").value.trim();
    const name = document.getElementById("create-name").value.trim();
    const pin = document.getElementById("create-pin").value.trim();
    const confirmPin = document.getElementById("create-confirm-pin").value.trim();
    const initialDeposit = parseFloat(document.getElementById("create-initial-balance").value) || 0;

    if (!/^\d{10}$/.test(accNum)) {
        return showAlert("alert-create-pin", "Account number must be exactly 10 numeric digits!");
    }
    if (!name) {
        return showAlert("alert-create-pin", "Please enter account holder name!");
    }
    if (!/^\d{4}$/.test(pin)) {
        return showAlert("alert-create-pin", "PIN must be exactly 4 numeric digits!");
    }
    if (pin !== confirmPin) {
        return showAlert("alert-create-pin", "PIN and Confirm PIN do not match!");
    }

    const db = getDatabase();
    if (db[accNum]) {
        return showAlert("alert-create-pin", "Account already exists! Use Update PIN instead.");
    }

    db[accNum] = {
        accountNumber: accNum,
        name: name,
        pin: pin,
        balance: initialDeposit >= 0 ? initialDeposit : 5000.00
    };

    saveDatabase(db);
    showAlert("alert-create-pin", `PIN created for A/C ${accNum}! Redirecting...`, false);

    // Clear create form
    document.getElementById("create-acc-num").value = "";
    document.getElementById("create-name").value = "";
    document.getElementById("create-pin").value = "";
    document.getElementById("create-confirm-pin").value = "";

    setTimeout(() => {
        document.getElementById("login-acc-num").value = accNum;
        document.getElementById("login-pin").value = pin;
        showScreen("screen-login");
    }, 1200);
}

/**
 * 2. ATM Login
 */
function handleLogin(e) {
    if (e) e.preventDefault();
    hideAlerts();

    const accNum = document.getElementById("login-acc-num").value.trim();
    const pin = document.getElementById("login-pin").value.trim();

    if (!/^\d{10}$/.test(accNum)) {
        return showAlert("alert-login", "Account number must be exactly 10 numeric digits!");
    }
    if (!/^\d{4}$/.test(pin)) {
        return showAlert("alert-login", "PIN must be exactly 4 numeric digits!");
    }

    const db = getDatabase();
    const account = db[accNum];

    if (!account) {
        return showAlert("alert-login", "Account not found! Click 'Create ATM PIN' below.");
    }
    if (account.pin !== pin) {
        return showAlert("alert-login", "Incorrect 4-digit PIN! Please try again.");
    }

    currentUser = account;
    playSuccessChime();
    updateUserBars();
    showScreen("screen-services");
}

function fillDemoLogin() {
    playBeep(950, 0.06);
    document.getElementById("login-acc-num").value = "1001001234";
    document.getElementById("login-pin").value = "1234";
    hideAlerts();
}

/**
 * 3. Balance Check
 */
function openBalanceScreen() {
    if (!currentUser) return showScreen("screen-login");

    const db = getDatabase();
    currentUser = db[currentUser.accountNumber];

    document.getElementById("bal-display-name").textContent = currentUser.name;
    document.getElementById("bal-display-acc").textContent = "•••• " + currentUser.accountNumber.slice(-4);
    document.getElementById("bal-display-amount").textContent = formatINR(currentUser.balance);

    showScreen("screen-balance");
}

/**
 * 4. Cash Withdrawal
 */
function setWithdrawVal(amt) {
    playBeep(1000, 0.05);
    document.getElementById("withdraw-amount").value = amt;
}

function handleWithdrawal(e) {
    if (e) e.preventDefault();
    hideAlerts();
    if (!currentUser) return showScreen("screen-login");

    const amount = parseFloat(document.getElementById("withdraw-amount").value);
    if (isNaN(amount) || amount <= 0) {
        return showAlert("alert-withdrawal", "Enter a valid positive amount!");
    }
    if (amount % 100 !== 0) {
        return showAlert("alert-withdrawal", "Amount must be in multiples of ₹100!");
    }

    const db = getDatabase();
    const account = db[currentUser.accountNumber];

    if (amount > account.balance) {
        return showAlert("alert-withdrawal", `Insufficient balance! Available: ${formatINR(account.balance)}`);
    }

    account.balance -= amount;
    saveDatabase(db);
    currentUser = account;
    updateUserBars();

    playCashSound();
    document.getElementById("withdraw-amount").value = "";

    const banner = document.getElementById("cash-dispense-banner");
    document.getElementById("cash-dispensed-val").textContent = formatINR(amount);
    banner.style.display = "block";

    showAlert("alert-withdrawal", `Withdrawn ${formatINR(amount)}. New Balance: ${formatINR(account.balance)}`, false);
}

/**
 * 5. Cash Deposit
 */
function setDepositVal(amt) {
    playBeep(1000, 0.05);
    document.getElementById("deposit-amount").value = amt;
}

function handleDeposit(e) {
    if (e) e.preventDefault();
    hideAlerts();
    if (!currentUser) return showScreen("screen-login");

    const amount = parseFloat(document.getElementById("deposit-amount").value);
    if (isNaN(amount) || amount <= 0) {
        return showAlert("alert-deposit", "Enter a valid deposit amount!");
    }
    if (amount % 100 !== 0) {
        return showAlert("alert-deposit", "Accepted notes: ₹100, ₹200, ₹500 multiples only!");
    }

    const db = getDatabase();
    const account = db[currentUser.accountNumber];

    account.balance += amount;
    saveDatabase(db);
    currentUser = account;
    updateUserBars();

    document.getElementById("deposit-amount").value = "";
    showAlert("alert-deposit", `Deposited ${formatINR(amount)}! New Balance: ${formatINR(account.balance)}`, false);
}

/**
 * 6. Update ATM PIN
 */
function handleUpdatePin(e) {
    if (e) e.preventDefault();
    hideAlerts();
    if (!currentUser) return showScreen("screen-login");

    const oldPin = document.getElementById("update-pin-old").value.trim();
    const newPin = document.getElementById("update-pin-new").value.trim();
    const confirmPin = document.getElementById("update-pin-confirm").value.trim();

    const db = getDatabase();
    const account = db[currentUser.accountNumber];

    if (oldPin !== account.pin) {
        return showAlert("alert-update-pin", "Current PIN is incorrect!");
    }
    if (!/^\d{4}$/.test(newPin)) {
        return showAlert("alert-update-pin", "New PIN must be 4 numeric digits!");
    }
    if (newPin !== confirmPin) {
        return showAlert("alert-update-pin", "New PIN and Confirm PIN do not match!");
    }
    if (newPin === oldPin) {
        return showAlert("alert-update-pin", "New PIN cannot be same as old PIN!");
    }

    account.pin = newPin;
    saveDatabase(db);
    currentUser = account;

    document.getElementById("update-pin-old").value = "";
    document.getElementById("update-pin-new").value = "";
    document.getElementById("update-pin-confirm").value = "";

    showAlert("alert-update-pin", "ATM PIN updated successfully!", false);
}

/**
 * 7. Logout / Exit
 */
function handleExit() {
    playBeep(900, 0.1);
    currentUser = null;
    document.getElementById("login-acc-num").value = "";
    document.getElementById("login-pin").value = "";
    updateUserBars();
    showScreen("screen-login");
}

// 5. LIVE CLOCK & INIT
function startClock() {
    const clockEl = document.getElementById("atm-live-clock");
    if (!clockEl) return;
    const update = () => {
        clockEl.textContent = new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };
    update();
    setInterval(update, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    getDatabase();
    startClock();
    showScreen("screen-login");
});
