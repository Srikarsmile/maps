# Maps Backend API

A FastAPI-based backend service for location tracking and offers management.

## Features

- **Location Event Processing**: Accept and process device location events with deduplication
- **Offers Management**: Retrieve offers for specific devices (placeholder implementation)
- **Health Monitoring**: Built-in health check endpoint
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## Setup

### Prerequisites

- Python 3.11+
- pip

### Installation

1. Install dependencies:
```bash
pip install fastapi uvicorn pydantic httpx
```

2. Run the application:
```bash
python app/main.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST /events/loc
Accepts location events from devices.

**Request Body:**
```json
{
  "device_id": "string",
  "lat": 37.7749,
  "lon": -122.4194,
  "ts": "2025-08-05T11:26:14.771467"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location event processed successfully",
  "event_id": "event_device_123_1754373374"
}
```

**Features:**
- Validates latitude (-90 to 90) and longitude (-180 to 180)
- Deduplicates events within 30 seconds for the same device
- Returns unique event ID for successful processing

### GET /offers/{device_id}
Retrieves offers for a specific device.

**Response:**
```json
{
  "device_id": "test_device_123",
  "offers": [],
  "total_count": 0
}
```

**Note:** Currently returns empty list as placeholder implementation.

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-05T11:26:14.771467",
  "service": "maps-backend"
}
```

### GET /
Root endpoint with API information.

**Response:**
```json
{
  "message": "Maps Backend API",
  "version": "0.1.0",
  "docs": "/docs",
  "health": "/health"
}
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Development

### Project Structure
```
backend/
├── app/
│   ├── main.py          # FastAPI application and endpoints
│   ├── schemas.py       # Pydantic models for data validation
│   ├── geo.py           # Geographic processing (TODO)
│   ├── models.py        # Database models (TODO)
│   ├── deps.py          # Dependencies (TODO)
│   └── workers.py       # Background workers (TODO)
└── pyproject.toml       # Project configuration
```

### TODO Items

1. **Geo Processing**: Implement `geo.handle_location()` function
2. **Database Integration**: Replace in-memory storage with proper database
3. **Offer Logic**: Implement actual offer retrieval based on location and preferences
4. **Authentication**: Add device authentication and authorization
5. **Rate Limiting**: Implement API rate limiting
6. **Logging**: Add comprehensive logging
7. **Testing**: Add unit and integration tests

## Running the Application

### Development Mode
```bash
python app/main.py
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request**: Invalid request data
- **500 Internal Server Error**: Server-side errors with detailed messages
- **Validation Errors**: Automatic Pydantic validation with clear error messages

## Deduplication Logic

Location events are deduplicated using an in-memory storage system:
- Events from the same device within 30 seconds are considered duplicates
- Old events (older than 1 hour) are automatically cleaned up to prevent memory leaks
- **Note**: This is a temporary implementation - will be replaced with database storage 