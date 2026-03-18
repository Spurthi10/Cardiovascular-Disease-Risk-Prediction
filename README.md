# 🫀 CardioGuard — CVD Risk Prediction App

A full-stack web application for cardiovascular disease risk prediction, based on the deep learning research paper:
**"Cardiovascular Disease Risk Prediction Based on Deep Feature Extraction"** (ICIIBMS 2024).

---

##  Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)
- **Auth**: Session-based with bcrypt password hashing

---

## 📁 Folder Structure

```
cvd-predictor/
├── server.js              ← Main Express server
├── package.json
├── .env                   ← Environment variables
├── models/
│   ├── User.js            ← User schema (name, email, hashed password)
│   └── Prediction.js      ← Prediction schema (inputs, risk score, recs)
├── routes/
│   ├── auth.js            ← /auth/login, /auth/register, /auth/logout
│   ├── prediction.js      ← /api/predict, /api/history, /api/stats
│   └── dashboard.js       ← Placeholder route file
├── public/
│   ├── css/style.css      ← Main stylesheet
│   └── js/main.js         ← Shared JS utilities
└── views/
    ├── index.html         ← Landing page
    ├── login.html         ← Login page
    ├── register.html      ← Registration page
    ├── dashboard.html     ← User dashboard
    ├── predict.html       ← CVD risk assessment form
    ├── history.html       ← Prediction history table
    └── about.html         ← Model & research info
```

---

##  App Features

| Page | URL | Access |
|------|-----|--------|
| Home / Landing | `/` | Public |
| Register | `/register` | Public |
| Login | `/login` | Public |
| Dashboard | `/dashboard` | Auth Required |
| CVD Risk Assessment | `/predict` | Auth Required |
| Prediction History | `/history` | Auth Required |
| About the Model | `/about` | Public |

---

##  Authentication Flow

1. User registers → password bcrypt-hashed → stored in MongoDB
2. User logs in → session created → stored in MongoDB via connect-mongo
3. Protected routes check `req.session.userId`
4. Logout destroys session

---

##  CVD Risk Algorithm

The backend implements a Framingham-inspired scoring system that evaluates:
- **Demographics**: Age, Gender, BMI
- **Blood Pressure**: Systolic, Diastolic
- **Lipids**: Total Cholesterol, HDL, Triglycerides
- **Blood Tests**: Glucose, Hemoglobin
- **Lifestyle**: Smoking, Physical Activity
- **Family History**: Diabetes, Stroke

Risk is normalized to 0–100% probability and classified as:
- 🟢 **Low** (< 30%)
- 🟡 **Moderate** (30–60%)
- 🔴 **High** (> 60%)

---

## 📊 Model Performance (from research paper)

| Model | Accuracy | Precision | Recall | F1 |
|-------|----------|-----------|--------|----|
| KNN | 95.51% | 94.23% | 92.45% | 93.33% |
| SVM | 91.66% | 88.46% | 88.79% | 87.61% |
| **Ours (1D-CNN + Attention)** | **98.72%** | **98.11%** | **96.15%** | **97.46%** |

---

## ⚠️ Disclaimer

This application is for **educational purposes only**. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare professional.
