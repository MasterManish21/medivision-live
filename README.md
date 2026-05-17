# 🏥 Medivision — AI-Powered Medical Assistance Platform

A full-stack healthcare web application with a React frontend and Flask backend, ready for AI model integration.

---

## 🚀 Quick Start

### 1. Start the Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at → **http://localhost:5000**

---

### 2. Start the Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → **http://localhost:3000**

---

## 📁 Folder Structure

```
Medivision/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navbar + dark mode
│   │   │   ├── Footer.jsx        # Footer with contact info
│   │   │   └── Chatbot.jsx       # Floating chatbot window
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx   # Dark/light mode state
│   │   │   └── AuthContext.jsx    # Auth state (dummy)
│   │   ├── data/
│   │   │   └── hospitals.js       # Static hospital dataset
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Hero + features + testimonials
│   │   │   ├── Dashboard.jsx      # Upload + analyze + results
│   │   │   ├── Hospitals.jsx      # Hospital directory + filter
│   │   │   ├── ChatbotPage.jsx    # Chatbot landing page
│   │   │   └── Auth.jsx           # Login / Sign-up UI
│   │   ├── services/
│   │   │   └── api.js             # Axios API layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                       # VITE_API_URL=http://localhost:5000
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── backend/
    ├── app.py                     # Flask API
    └── requirements.txt
```

---

## 🔌 API Endpoints

| Method | Endpoint   | Description                     |
|--------|------------|---------------------------------|
| POST   | /predict   | Upload image → get diagnosis    |
| GET    | /health    | Backend health check            |
| GET    | /diseases  | List all mock diseases          |

### POST /predict — Request

```
Content-Type: multipart/form-data
Body: image = <file>
```

### POST /predict — Response

```json
{
  "disease": "Skin Allergy",
  "confidence": 87,
  "category": "Dermatology",
  "status": "success"
}
```

---

## 🤖 Future AI Integration

In `backend/app.py`, find the `/predict` route and replace the mock section:

```python
# Replace this with AI model prediction
# Example:
#   img_bytes = image.read()
#   result = model.predict(img_bytes)
#   disease = result["label"]
#   confidence = result["score"]
```

You can plug in:
- **TensorFlow / PyTorch** model
- **Google Gemini API** vision model
- **Hugging Face** pipeline

---

## ✨ Features

- 🏠 **Home Page** — Hero, stats, features, how-it-works, testimonials
- 🔬 **Dashboard** — Drag-and-drop image upload, AI analysis, confidence bar
- 🏥 **Hospitals** — Filterable directory with 9 real hospital cards
- 🤖 **Chatbot** — Floating chatbot with dummy AI responses
- 🔐 **Auth** — Login / Signup UI with dummy state
- 🌙 **Dark Mode** — System-aware + toggle persisted in localStorage
- 🔔 **Toast Notifications** — Success / error feedback
- 📱 **Fully Responsive** — Mobile + desktop

---

## 🛠 Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Routing  | React Router v6          |
| HTTP     | Axios                    |
| Icons    | Lucide React             |
| Toasts   | React Hot Toast          |
| Backend  | Python Flask             |
| CORS     | Flask-CORS               |
