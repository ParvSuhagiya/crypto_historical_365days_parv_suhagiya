# Crypto Market Analytics Dashboard

Production-grade React frontend for the Crypto Market Analytics platform. All data is fetched live from the Node.js + Express + MongoDB REST API.

## Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS 4** for styling
- **Redux Toolkit** for global state
- **React Router v7** for routing
- **Axios** for API calls
- **Formik + Yup** for forms
- **Recharts** for data visualization
- **React Hot Toast** for notifications

## Prerequisites

- Node.js 18+
- Backend API (defaults to Render: `https://crypto-historical-365days-parv-suhagiya.onrender.com/api/v1` or local: `http://localhost:5000/api/v1` via environment variable)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/           # Axios instance + API service modules
├── app/           # Redux store
├── features/      # Redux slices (auth, coins, stats, ui)
├── components/    # Reusable UI, layout, charts, coins
├── pages/         # Route pages (auth, dashboard, admin, profile)
├── hooks/         # Custom React hooks
├── routes/        # Router + route guards
└── utils/         # Formatters and constants
```

## Features

- JWT authentication (login, register, profile management)
- Overview dashboard with stat cards and charts
- Full coin CRUD with filters, sorting, search, and export
- Analytics page (price, volume, returns, volatility)
- Statistics page with distribution and time analysis
- Live search with debounce and pagination
- Coin detail page with history and comparison
- Admin panel (users, stats, bulk operations, cache clear)
- Role-based access control for admin routes

## API Integration

All requests go through `src/api/axiosInstance.js` with JWT interceptors. Token is stored in `localStorage` under the key `token`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Design System

- Primary brand: `#1E40AF` / `#3B82F6`
- Font: Inter (Google Fonts)
- Dark sidebar: `#0F172A`
- All components use rounded corners (`rounded-lg` minimum)

## License

Private — for demo and development use.
