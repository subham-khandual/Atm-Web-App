# ATM Management System (Mobile & Desktop Phone-Size)

A sleek, responsive, and beginner-friendly **ATM Simulator** designed for **+2 (Grade 11/12) Computer Science** practicals and viva examinations.

- **Design**: Sleek, phone-sized terminal (`max-width: 400px`) that fits perfectly on both Mobile and Desktop screens with zero awkward scrolling.
- **Tech Stack**: Pure **HTML5, CSS3 & Vanilla JavaScript** (uses browser `localStorage`).
- **Zero Backend**: No Python, no Node.js, no external servers or dependencies.

---

## 🎯 5 Core Features

1. **🔑 Create ATM PIN (Using Account Number)**
   - Enter Account Number, Name, 4-digit PIN, and initial deposit balance.
   - Saves account directly in the browser.

2. **💳 ATM Login**
   - Fast login with Account Number and 4-digit PIN.
   - Includes a 1-click **"Demo Login (1234)"** chip for instant testing.

3. **👛 Check Balance**
   - High-contrast glowing balance display with Account Holder Name and Masked Account Number.

4. **💵 Cash Withdrawal**
   - Fast cash pills (₹500, ₹1,000, ₹2,000, ₹5,000) or custom input.
   - Validates available balance, deducts money, and plays a cash counting sound with a success banner!

5. **📥 Cash Deposit**
   - Quick deposit buttons or custom input.
   - Adds money to balance instantly and updates account state.

6. **🔄 Update ATM PIN**
   - Verify current PIN and change to a new 4-digit PIN securely.

---

## 🚀 How to Run

Double click **`index.html`** in File Explorer, or run in PowerShell:
```powershell
Start-Process index.html
```

---

## 🔑 Default Demo Accounts

- **Account 1**: A/C: `1001001234` | PIN: `1234` *(Rahul Sharma - ₹ 25,000)*
- **Account 2**: A/C: `1001005678` | PIN: `5678` *(Pooja Verma - ₹ 15,000)*
- Or click **"🔑 Create ATM PIN"** to register your own account!
