# Crypto Market Analytics API

A RESTful API built with **Node.js**, **Express.js**, and **MongoDB** for cryptocurrency market analytics, authentication, search, statistics, portfolio simulations, and admin management.

---

## Features

* JWT Authentication
* User Registration & Login
* Role-Based Access Control (Admin/User)
* Crypto Coin CRUD Operations
* Market Analytics
* Search Functionality
* Portfolio Simulation
* Statistics Dashboard
* Rate Limiting
* Logging Middleware
* Global Error Handling
* CSV & JSON Export
* Protected Routes

---

# Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Express Rate Limit
* dotenv

---

# Folder Structure

```text
backend/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── admin.controller.js
│   ├── analytics.controller.js
│   ├── auth.controller.js
│   ├── coin.controller.js
│   ├── search.controller.js
│   └── stats.controller.js
│
├── data/
│   └── crypto-dataset.json
│
├── middlewares/
│   ├── admin.middleware.js
│   ├── auth.middleware.js
│   ├── errorHandler.middleware.js
│   ├── logger.middleware.js
│   └── rateLimiter.middleware.js
│
├── models/
│   ├── Coin.model.js
│   └── User.model.js
│
├── routes/
│   ├── admin.routes.js
│   ├── analytics.routes.js
│   ├── auth.routes.js
│   ├── coin.routes.js
│   ├── jwt.routes.js
│   ├── middleware.routes.js
│   ├── protected.routes.js
│   ├── search.routes.js
│   └── stats.routes.js
│
├── .env
├── .env.example
├── package.json
└── server.js
```

---

# Installation

```bash
git clone <repository-url>

cd backend

npm install
```

---

# Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
CORS_ORIGIN=*
```

---

# Run Project

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

---

# Base URL

### Local Development
```http
http://localhost:5000/api/v1
```

### Production / Live
```http
https://crypto-historical-365days-parv-suhagiya.onrender.com/api/v1
```

---

# Authentication Routes

Base Route:

```http
/api/v1/auth
```

| Method | Route            |
| ------ | ---------------- |
| POST   | /register        |
| POST   | /login           |
| POST   | /logout          |
| GET    | /profile         |
| PATCH  | /profile         |
| DELETE | /profile         |
| POST   | /forgot-password |
| POST   | /reset-password  |
| POST   | /change-password |
| POST   | /verify-email    |

---

# JWT Routes

Base Route:

```http
/api/v1/jwt
```

| Method | Route           |
| ------ | --------------- |
| GET    | /profile        |
| GET    | /dashboard      |
| POST   | /generate-token |
| POST   | /verify-token   |
| GET    | /admin          |
| GET    | /private-stats  |
| POST   | /refresh-token  |
| DELETE | /revoke-token   |

---

# Coin Routes

Base Route:

```http
/api/v1/coins
```

## System

| Method | Route           |
| ------ | --------------- |
| GET    | /system/health  |
| HEAD   | /system/health  |
| GET    | /system/version |
| GET    | /system/config  |

## Export

| Method | Route        |
| ------ | ------------ |
| GET    | /export/csv  |
| GET    | /export/json |

## Cache

| Method | Route        |
| ------ | ------------ |
| GET    | /cache/clear |

*Admin Only*

## Analytics & Insights

| Method | Route                    |
| ------ | ------------------------ |
| GET    | /recommendations         |
| GET    | /predictions             |
| GET    | /portfolio/simulate      |
| POST   | /portfolio/simulate      |
| GET    | /heatmap                 |
| GET    | /market-status           |
| GET    | /performance/top-monthly |
| GET    | /performance/top-yearly  |
| GET    | /alerts/high-volatility  |
| GET    | /alerts/market-drop      |
| POST   | /report                  |

## Filters

```http
/filter/high-price
/filter/low-price
/filter/high-volume
/filter/low-volume
/filter/high-market-cap
/filter/low-market-cap
/filter/high-volatility
/filter/low-volatility
/filter/high-return
/filter/negative-return
/filter/bullish
/filter/bearish
/filter/profitable
/filter/loss-making
/filter/missing-values
```

## Sorting

```http
/sort/price-asc
/sort/price-desc
/sort/volume-desc
/sort/rank-asc
/sort/return-desc
```

## Market Data

```http
/latest
/trending
/recent
/random
/oldest
/newest
/top-market-cap
/top-volume
/top-gainers
/top-losers
```

## Search by Field

| Method | Route           |
| ------ | --------------- |
| GET    | /exists/:id     |
| GET    | /name/:coinName |
| GET    | /symbol/:symbol |
| GET    | /rank/:rank     |
| GET    | /month/:month   |
| GET    | /date/:date     |

## Coin Metrics

| Method | Route                |
| ------ | -------------------- |
| GET    | /performance/:coinId |
| GET    | /volatility/:coinId  |
| GET    | /market-cap/:coinId  |
| GET    | /volume/:coinId      |
| GET    | /returns/:coinId     |
| GET    | /price/:coinId       |

## Comparisons

| Method | Route                         |
| ------ | ----------------------------- |
| GET    | /compare/:coin1/:coin2        |
| GET    | /compare/:coin1/:coin2/:coin3 |

## Historical Data

| Method | Route                   |
| ------ | ----------------------- |
| GET    | /history/:coinId        |
| GET    | /history/:coinId/:month |

## CRUD

| Method | Route |
| ------ | ----- |
| GET    | /     |
| POST   | /     |
| GET    | /:id  |
| PUT    | /:id  |
| PATCH  | /:id  |
| DELETE | /:id  |

## Bulk Operations

*Admin Only*

| Method | Route        |
| ------ | ------------ |
| POST   | /bulk-create |
| PATCH  | /bulk-update |
| DELETE | /bulk-delete |

---

# Search Routes

Base Route:

```http
/api/v1/search
```

| Method | Route  |
| ------ | ------ |
| GET    | /coins |
| HEAD   | /coins |

---

# Analytics Routes

Base Route:

```http
/api/v1/analytics
```

```http
GET /price/highest
GET /price/lowest
GET /price/average
GET /price/history/:coinId
GET /price/trend
GET /price/growth
GET /price/drop

GET /volume/highest
GET /volume/lowest
GET /volume/average
GET /volume/spike

GET /returns/top
GET /returns/negative
GET /returns/cumulative

GET /volatility/high
```

---

# Statistics Routes

Base Route:

```http
/api/v1/stats
```

```http
GET /market-cap
GET /average-price
GET /average-volume
GET /highest-market-cap
GET /highest-volume
GET /top-gainers
GET /top-losers
GET /monthly-analysis
GET /coin-count
GET /rank-distribution
GET /price-distribution
GET /volatility-distribution
GET /market-summary
GET /daily-analysis
GET /yearly-analysis
```

---

# Admin Routes

Base Route:

```http
/api/v1/admin
```

*Admin + Authentication Required*

```http
GET /coins
GET /stats
GET /users
```

---

# Protected Routes

Base Route:

```http
/api/v1/protected
```

*Authentication Required*

```http
POST   /coins
PATCH  /coins/:id
DELETE /coins/:id
```

---

# Middleware Testing Routes

Base Route:

```http
/api/v1/middleware
```

```http
GET /logger
GET /auth
GET /rate-limit
GET /error-handler
```

---

# API Response Format

```json
{
  "success": true,
  "message": "Request successful",
  "data": {},
  "pagination": {}
}
```

---

# Author

**Parv Suhagiya**

Crypto Market Analytics API – Backend Assignment Project.
