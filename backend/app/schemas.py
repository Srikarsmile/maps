from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class LocationEvent(BaseModel):
    """Schema for location event data."""
    device_id: str = Field(..., description="Unique device identifier")
    lat: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    lon: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    ts: datetime = Field(..., description="Timestamp of the location event")


class LocationEventResponse(BaseModel):
    """Response schema for location event processing."""
    success: bool = Field(..., description="Whether the event was processed successfully")
    message: str = Field(..., description="Processing result message")
    event_id: Optional[str] = Field(None, description="Unique event identifier if created")


class Offer(BaseModel):
    """Schema for offer data."""
    id: str = Field(..., description="Unique offer identifier")
    title: str = Field(..., description="Offer title")
    description: str = Field(..., description="Offer description")
    discount: Optional[float] = Field(None, ge=0, le=100, description="Discount percentage")
    valid_until: datetime = Field(..., description="Offer expiration timestamp")


class OffersResponse(BaseModel):
    """Response schema for offers endpoint."""
    device_id: str = Field(..., description="Device identifier")
    offers: List[Offer] = Field(default_factory=list, description="List of available offers")
    total_count: int = Field(0, description="Total number of offers") 