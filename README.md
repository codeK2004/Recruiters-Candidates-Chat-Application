# HireChat (FastJob99)  
_A Real-Time Chatting Application Between Recruiters and Candidates_

## 📖 About the Project
**HireChat (FastJob99)** is a **web-based communication platform** that bridges the gap between recruiters and candidates during the hiring process.  
Recruiters can manage candidates, update their statuses, send bulk messages, and chat instantly.  
Candidates can chat with recruiters, view their application status, and get instant updates — all in one simple, fast, and private interface.

This project is built as a **front-end focused application** where all data is stored locally in the browser using `localStorage`, ensuring **speed, privacy, and security** without needing a backend server.

## ✨ Key Features

### 👔 Recruiter Features
- **Role-Based Access** – Secure registration & login as a recruiter  
- **Candidate Status Management** – Track and update candidate status (`Selected`, `Rejected`, `Interviewing`, etc.)  
- **Bulk Messaging** – Send messages to multiple candidates at once by their status  
- **Real-Time Chat** – Communicate instantly with candidates  
- **Unread Notifications** – Recruiters get alerts for unread messages  
- **Organized Chat History** – Persistent conversation records for context  
- **Responsive UI** – Easy-to-use, modern, and responsive design  

### 👨‍💻 Candidate Features
- **Direct Communication** – Chat instantly with recruiters  
- **Application Status Visibility** – View application progress in real-time  
- **Persistent Chat History** – All conversations are saved for reference  
- **Real-Time Notifications** – Alerts for new recruiter messages or status changes  
- **Privacy First** – All personal data is stored locally in the browser  

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS  
- **State Management:** React Context API  
- **Data Storage:** Browser LocalStorage (no external DB required)  
- **UI Components:** Custom-built React components with Modal dialogs  

## 📂 Project Structure
fastjob99/
│── public/ # Static assets (index.html, icons, etc.)
│── src/
│ ├── components/ # Reusable UI components (ChatBox, StatusModal, etc.)
│ ├── context/ # Context API setup for global state
│ ├── pages/ # Recruiter and Candidate main pages
│ ├── utils/ # Helper functions (localStorage handlers, etc.)
│ ├── App.js # Root app component
│ ├── index.js # Entry point
│ └── styles.css # Tailwind CSS integration
│── package.json # Project dependencies and scripts
│── README.md # Project documentation

