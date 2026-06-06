# Apt Store — Order Management System

A full-stack order management and real-time tracking application built with Django REST Framework (backend) and React (frontend).

## Table of Contents
1. Tech Stack
2. Project Structure
3. Setup Guide
4. About Roles
5. Note

---

### 1. Tech Stack
```
Backend
- Python / Django
- Django REST Framework
- Django Channels (WebSockets)
- Daphne (ASGI server)
- SQLite

Frontend
- React 18
- React Router v6
- Axios
- Vite
```


### 2. Project Structure
```
├── backend
│   ├── accounts
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── manager.py
│   │   ├── models.py
│   │   ├── permissions.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── backend
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   └── urls.py
│   ├── orders
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── consumers.py
│   │   ├── models.py
│   │   ├── routing.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   └── manage.py
├── frontend
│   ├── src
│   │   ├── api
│   │   │   ├── client.js
│   │   │   └── orders.js
│   │   ├── components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Topbar.jsx
│   │   ├── context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks
│   │   │   └── useOrderSocket.js
│   │   ├── pages
│   │   │   ├── AuthPage.css
│   │   │   ├── AuthPage.jsx
│   │   │   ├── ReviewerDashboard.css
│   │   │   ├── ReviewerDashboard.jsx
│   │   │   ├── UserDashboard.css
│   │   │   └── UserDashboard.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── requirements.txt
```



### 3. Setup Guide

#### 1. Clone the repository

```bash
git clone https://github.com/himanchal-103/apt-store.git
cd apt-store
```

#### 2. Virtual Environment

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt
```

#### 3. Backend setup

```bash
cd backend

# Run migrations
python3 manage.py migrate

# Collect static files (for Django admin-panel css files)
python3 manage.py collectstatic

# Start the server
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

Backend runs at `http://localhost:8000`

#### 4. Frontend setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`


### 4. Roles

| Role | Access |
|------|--------|
| `user` | Create orders, view own orders, receive live status updates via WebSocket |
| `reviewer` | View all orders, update order status |
| `admin` | Redirected to Django admin panel |

### Creating a Superuser (Admin)

```bash
cd backend
python manage.py createsuperuser
```

Follow the prompts to set username, email, and password. Then login at `http://localhost:8000/admin`.

Alternatively, login through the frontend with `role: admin` and the backend will redirect you to the admin panel.


### 5. Notes

- Both servers must be running simultaneously
- WebSocket connection requires an active session (log in first)
- WebSocket connects only when the user has active orders (status: `pending` or `shipped`) and auto-closes when none remain







