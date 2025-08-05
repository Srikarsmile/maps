# Maps Application

## Project Purpose

A real-time location tracking and offers delivery system with interactive map visualization. The application consists of:

- **Backend**: FastAPI service for processing location events, managing offers, and handling device interactions
- **Frontend**: React/Next.js application with Mapbox GL integration for visualizing hexagon-based location density
- **Celery Workers**: Background task processing for SMS offer delivery
- **Database**: PostgreSQL with PostGIS extension for spatial data storage

The system tracks mobile device locations, processes them into H3 hexagon coordinates, and delivers targeted promotional offers based on location data.

## Prerequisites

Before running this application, ensure you have the following installed:

### System Requirements
- **Python 3.11+** - Backend API and workers
- **Node.js 18+** - Frontend development
- **PostgreSQL 13+** - Database with PostGIS extension
- **Redis 6+** - Message broker for Celery workers

### Development Tools
- **Git** - Version control
- **pip** - Python package manager
- **npm** - Node.js package manager

## Quick Start

### 1. Database Setup

First, set up the PostgreSQL database with PostGIS extension:

```bash
# Create database and enable PostGIS
psql -f scripts/setup_db.sql
```

This creates the following tables:
- `devices` - Mobile devices that send location data
- `device_pings` - Location pings from devices with H3 hexagon coordinates
- `offers` - Promotional offers that can be delivered to devices
- `delivered_offers` - Tracking which offers were sent to which devices

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .

# Set up environment variables (see Environment Variables section below)
cp .env.example .env  # Create from template if available

# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables (see Environment Variables section below)
cp .env.example .env.local  # Create from template if available

# Run the development server
npm run dev
```

The frontend will be available at: http://localhost:3000

### 4. Celery Workers

```bash
cd backend

# Activate virtual environment (if not already active)
source .venv/bin/activate

# Run Celery worker
celery -A app.workers worker --loglevel=info
```

Or use the provided script:
```bash
./scripts/run_celery.sh
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost/maps_db` | Yes |
| `REDIS_URL` | Redis connection string for Celery | - | Yes |
| `MAPBOX_ACCESS_TOKEN` | Mapbox API token for map rendering | - | Yes (Frontend) |

### Example `.env` file for Backend:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/maps_db
REDIS_URL=redis://localhost:6379/0
```

### Example `.env.local` file for Frontend:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

## Mapbox Access Token

To get a free Mapbox access token:

1. Visit [Mapbox Account](https://account.mapbox.com/access-tokens/)
2. Sign up for a free account
3. Create a new access token
4. Set the token in your frontend environment variables

**Free tier includes:**
- 50,000 map loads per month
- Basic map styles and features
- Suitable for development and small-scale applications

## Project Structure

```
maps/
├── backend/                 # FastAPI backend service
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── geo.py          # Geospatial utilities
│   │   ├── workers.py      # Celery tasks
│   │   └── deps.py         # Dependencies
│   ├── pyproject.toml      # Python dependencies
│   └── README.md
├── frontend/               # React/Next.js frontend
│   ├── components/         # React components
│   │   ├── MapPanel.tsx    # Mapbox map component
│   │   ├── GlassContainer.tsx
│   │   ├── HexTooltip.tsx
│   │   └── OfferCard.tsx
│   ├── pages/              # Next.js pages
│   ├── package.json        # Node.js dependencies
│   └── README.md
├── scripts/                # Utility scripts
│   ├── setup_db.sql        # Database setup
│   └── run_celery.sh       # Celery worker script
└── README.md              # This file
```

## Development

### Backend Development

```bash
cd backend

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Code formatting
black app/
ruff check app/
ruff format app/
```

### Frontend Development

```bash
cd frontend

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## API Endpoints

- `POST /events/loc` - Submit location events from devices
- `GET /offers/{device_id}` - Get offers for a specific device
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License. 