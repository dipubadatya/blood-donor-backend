
# 🩸 Blood Donor Tracker – Backend API

A secure and scalable REST API built with Node.js and Express that connects medical clinics with nearby blood donors using geospatial queries, role-based access control, and JWT authentication.

---

## 🌐 Live API

Base URL:
https://blood-donor-backend-0ri5.onrender.com

---

## 📦 Repository

https://github.com/dipubadatya/blood-donor-backend

---

## 🚀 Core Features

### 🔐 Authentication & Security
- JWT-based authentication
- Password hashing using bcryptjs
- Role-based route protection
- Secure HTTP headers with Helmet

---

### 🧑‍🩸 Donor Features

- Register as donor
- Store blood group
- Store geolocation (GeoJSON format)
- Update profile details
- Toggle availability (Available / Not Available)
- Access protected donor dashboard

---

### 🏥 Medical Clinic Features

- Register as medical clinic
- Search donors by blood group
- Filter donors within 5km / 10km radius
- Sort donors by nearest distance
- View donor details including:
  - Name
  - Blood group
  - Contact info
  - Distance
  - Availability status

---

## 🗺 Geolocation Logic

Donor location is stored in MongoDB using GeoJSON:

```

{
type: "Point",
coordinates: [longitude, latitude]
}

```

Search uses MongoDB `$near` operator:

- Distance filtering in kilometers
- Radius-based donor discovery
- Real-time distance calculation

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Helmet
- Render (Deployment)

---

## 📁 Folder Structure

```

backend/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
├── server.js
└── package.json

```

---

## ⚙️ Installation (Local Development)

### 1️⃣ Clone Repository

```

git clone [https://github.com/dipubadatya/blood-donor-backend.git](https://github.com/dipubadatya/blood-donor-backend.git)
cd blood-donor-backend

```

### 2️⃣ Install Dependencies  

```

npm install

```

### 3️⃣ Setup Environment Variables

Create a `.env` file:

```

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development

```

### 4️⃣ Start Development Server

```

npm run dev

```

Server runs on:
http://localhost:5000

---

## 🔐 Role-Based Access Control

- Middleware verifies JWT token
- Role-based authorization checks:
  - donor routes accessible only by donor role
  - medical routes accessible only by medical role
- Secure protected routes

---

## 📌 API Endpoints Summary

### Auth
POST /api/auth/register  
POST /api/auth/login  

### Donor
GET /api/donor/profile  
PUT /api/donor/update  
PATCH /api/donor/toggle-availability  

### Medical
GET /api/medical/search?bloodGroup=A+&radius=5  

---

## 🚀 Deployment

Backend deployed on Render.

- Environment variables configured in Render dashboard
- Production build automatically redeployed on push

---

## 📸 Screenshots

<p align="center"> <img width="1920" height="1032" alt="Screenshot 2026-02-21 131849" src="https://github.com/user-attachments/assets/226955d9-7b2b-4b3a-8be8-8230dc6896e2" /> </p>
<p align="center"> <img width="1920" height="1032" alt="Screenshot 2026-02-21 131502" src="https://github.com/user-attachments/assets/e3970f7d-f868-402b-a591-f4b98ded7120" />  </p>



---

## 👨‍💻 Author

DIPU BADATYA
GitHub: https://github.com/dipubadatya  
LinkedIn: https://www.linkedin.com/in/dipu-badatya/
```
