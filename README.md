Lyvore – Full Stack E-Commerce Platform (MERN)

**Lyvore** is a **production-structured full-stack e-commerce application** built using the **MERN stack**, featuring **separate user and admin frontends**, **role-based access control**, and a **Razorpay payment flow implemented in test mode** for end-to-end verification.

User and Admin applications are **deployed independently** and communicate with a RESTful backend API.

---

## Tech Stack

**Frontend:**
React.js, Tailwind CSS, Axios, JWT Authentication

**Backend:**
Node.js, Express.js, MongoDB, Mongoose, REST API

**Payments:**
Razorpay (Test Mode – Full Payment Flow Implemented)

**Authentication & Security:**
JWT, Role-Based Access Control (RBAC), Protected Routes, Environment Variables

**Deployment:**
Vercel for frontend , Render for backend (Frontend & Admin deployed separately)

---

 System Architecture

* **User Frontend:** Customer-facing e-commerce application
* **Admin Frontend:** Secure dashboard for administrative operations
* **Backend API:** Centralized authentication, business logic, payments, and database handling

Decoupled architecture designed for scalability and maintainability.

---

## User Features

* User registration & login (JWT-based)
* Product listing and detailed product views
* Cart management
* Checkout flow
* **Razorpay payment flow (test mode)**
* Order history and order status tracking

---

## Admin Dashboard Features

* Secure admin authentication
* Product CRUD operations
* Inventory management
* Order and payment status monitoring
* User management
* Admin-only protected routes

---

## Payment Integration

* Integrated **Razorpay in test mode**
* Complete payment lifecycle implemented:

  * Order creation
  * Checkout flow
  * Payment verification
  * Success and failure handling
* Backend-validated payment signatures

⚠️ **No real money is involved**, but the **entire payment workflow is fully functional and verifiable**, matching real-world integration logic.

This demonstrates correct payment gateway implementation without financial risk.

---

## Security Implementation

* JWT-based authentication
* API-level route protection
* Environment variable-based secret management

---

## Environment Variables

```env
MONGO_URI=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## Deployment

* User Frontend: https://lyvore-frontend.vercel.app/
* Admin Dashboard: https://lyvore-admin.vercel.app
* Backend API: https://lyvore-backend.onrender.com

All components are deployed separately.

> User credentials :
email : newuser@gmail.com
pass : newuser

> Admin credentials are not public and can be shared **upon request**.
---

## Key Engineering Highlights

* MERN stack full-stack application
* Separate Admin & User frontends
* Razorpay payment flow (test mode)
* Secure authentication & authorization
* RESTful API design
* Production-style project structure
* Independent deployments

---

## Screenshots

Admin dashboard and user interface screenshots are included in the repository.

---

## Author

**Ayisha Beevi**.
Computer Science Engineering Graduate
Full Stack Developer (MERN)

---

### Reviewer Note

This project focuses on **architecture, security, and real-world workflows**, not mock UI screens.
Payment logic, authentication flow, and admin controls are implemented end-to-end.
