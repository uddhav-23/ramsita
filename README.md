
## 📌 QR-Based Registration System for Conference (Built with React)

This is a **QR-based event registration system** developed for an **International Conference on Sustainability** hosted at Acropolis Institute. The system streamlines participant verification and automates email communication with event details. It also includes a fully functional **admin panel** to manage attendees and event data.

---

### ✨ Features

#### 🧑‍💼 **For Participants:**

* Scan a QR code to verify registration.
* On successful verification, receive event details (time, venue, speaker info) directly via email.
* Real-time feedback on registration status.

#### 🛠 **For Admins:**

* Add new unique IDs for participants.
* Edit participant form details.
* Scan and verify QR codes live during the event.
* Track verification status and responses.
* Fully functional admin panel (secured).

---

### 💻 Tech Stack

| Technology                           | Usage                                    |
| ------------------------------------ | ---------------------------------------- |
| **React.js**                         | Frontend application                     |
| **Firebase / Realtime DB** (if used) | Data storage and retrieval               |
| **EmailJS**                          | Send automated emails after verification |
| **QR Code Scanner Library**          | Scan and verify participant IDs          |
| **React Router**                     | Page navigation (admin/user panel)       |
| **CSS / Tailwind / Bootstrap**       | UI styling                               |

---

### 🚀 Project Setup & Installation

```bash
git clone https://github.com/yourusername/qr-registration-system.git
cd qr-registration-system
npm install
npm start
```

> 🔑 Ensure you configure your EmailJS credentials and database before running.

---

### 📂 Project Structure (Simplified)

```
├── public/
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx
│   │   ├── QRScanner.jsx
│   │   ├── RegistrationForm.jsx
│   │   └── ...
│   ├── utils/
│   │   └── emailService.js
│   ├── App.js
│   ├── index.js
│   └── ...
├── .env
└── README.md
```

---

### 🔐 Configuration

#### 1. **EmailJS Setup**

* Create an account at [EmailJS](https://www.emailjs.com/)
* Get your `service_id`, `template_id`, and `user_id`
* Store them securely in `.env` or config files.

#### 2. **Database Setup**

* Configure Firebase or any other backend to store participant data.
* Each entry should have a unique ID and status field for verification.

---

### 🏁 How It Works

1. **User scans the QR code** at the event desk.
2. **System checks the ID** in the backend database.
3. If valid, sends an email using **EmailJS** with event info:

   * Venue
   * Time
   * Speaker line-up
   * Event instructions
4. Admin can monitor verification status in real-time.

---

### 🧑‍💻 Author & Credits

Developed by: **UDDHAV JOSHI**
Mentor/Support: **CSIT Department, Acropolis Institute**
Conference: **International Conference on Sustainability 2025**

---

### 📬 Contact

If you’d like to contribute, report a bug, or suggest improvements, feel free to connect:

* Email: uddhavjoshi24@gmail.com/uddhavjoshi221011@acropolis.in

---

### 📜 License

This project is licensed under the MIT License.

---

