from datetime import datetime, timedelta
from typing import Dict, Set
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
import uvicorn

from .schemas import (
    LocationEvent,
    LocationEventResponse,
    OffersResponse,
    Offer
)

# FastAPI application instance
app = FastAPI(
    title="Maps Backend API",
    description="Backend service for location tracking and offers",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# In-memory storage for deduplication (TODO: replace with proper database)
# Format: {device_id: {timestamp: event_data}}
device_events: Dict[str, Dict[datetime, LocationEvent]] = {}


def is_duplicate_event(device_id: str, timestamp: datetime) -> bool:
    """
    Check if a location event is a duplicate within 30 seconds.
    
    Args:
        device_id: The device identifier
        timestamp: The event timestamp
        
    Returns:
        True if duplicate found within 30 seconds, False otherwise
    """
    if device_id not in device_events:
        return False
    
    # Check for events within 30 seconds of the current timestamp
    time_window = timedelta(seconds=30)
    for event_ts in device_events[device_id].keys():
        if abs((timestamp - event_ts).total_seconds()) <= 30:
            return True
    
    return False


def store_location_event(device_id: str, event: LocationEvent) -> None:
    """
    Store a location event for deduplication purposes.
    
    Args:
        device_id: The device identifier
        event: The location event to store
    """
    if device_id not in device_events:
        device_events[device_id] = {}
    
    device_events[device_id][event.ts] = event
    
    # Clean up old events (older than 1 hour) to prevent memory leaks
    cutoff_time = datetime.now() - timedelta(hours=1)
    device_events[device_id] = {
        ts: event_data 
        for ts, event_data in device_events[device_id].items() 
        if ts > cutoff_time
    }


@app.post("/events/loc", response_model=LocationEventResponse)
async def handle_location_event(event: LocationEvent) -> LocationEventResponse:
    """
    Handle location events from devices.
    
    This endpoint accepts location data and performs deduplication
    to prevent processing the same location multiple times within 30 seconds.
    """
    try:
        # Check for duplicate events within 30 seconds
        if is_duplicate_event(event.device_id, event.ts):
            return LocationEventResponse(
                success=False,
                message="Duplicate event detected within 30 seconds",
                event_id=None
            )
        
        # Store the event for future deduplication
        store_location_event(event.device_id, event)
        
        # TODO: Call geo.handle_location() when implemented
        # await geo.handle_location(event.device_id, event.lat, event.lon, event.ts)
        
        return LocationEventResponse(
            success=True,
            message="Location event processed successfully",
            event_id=f"event_{event.device_id}_{int(event.ts.timestamp())}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process location event: {str(e)}"
        )


@app.get("/offers/{device_id}", response_model=OffersResponse)
async def get_offers(device_id: str) -> OffersResponse:
    """
    Get offers for a specific device.
    
    Currently returns an empty list as a placeholder.
    Future implementation will return relevant offers based on device location and preferences.
    """
    try:
        # TODO: Implement actual offer retrieval logic
        # For now, return empty list as specified
        return OffersResponse(
            device_id=device_id,
            offers=[],
            total_count=0
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve offers: {str(e)}"
        )


@app.get("/health")
async def health_check() -> JSONResponse:
    """Health check endpoint."""
    return JSONResponse(
        content={
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "service": "maps-backend"
        },
        status_code=200
    )


@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint with API information."""
    return JSONResponse(
        content={
            "message": "Maps Backend API",
            "version": "0.1.0",
            "docs": "/docs",
            "health": "/health"
        },
        status_code=200
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 