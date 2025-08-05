# Geographic utilities and functions 
from h3 import latlng_to_cell, cell_to_boundary


def latlon_to_h3(lat: float, lon: float, res: int = 9) -> str:
    """
    Convert latitude and longitude to H3 hexagon ID.
    
    Args:
        lat: Latitude in decimal degrees
        lon: Longitude in decimal degrees  
        res: H3 resolution (0-15, default 9)
        
    Returns:
        H3 hexagon ID as string
    """
    return str(latlng_to_cell(lat, lon, res))


def is_affluent(h3_id: str) -> bool:
    """
    Check if an H3 hexagon represents an affluent area.
    
    TODO: Replace with real data; currently stubs Knightsbridge hex
    
    Args:
        h3_id: H3 hexagon ID
        
    Returns:
        True if affluent area, False otherwise
    """
    # TODO: Replace with real affluent area data
    # Stub: Knightsbridge area (example H3 hex)
    affluent_hexes = [
        "8928308280fffff",  # Example Knightsbridge hex
        "8928308281fffff",  # Example affluent area hex
    ]
    return h3_id in affluent_hexes


def current_weather(lat: float, lon: float) -> str:
    """
    Get current weather conditions for given coordinates.
    
    TODO: Integrate with real weather API
    
    Args:
        lat: Latitude in decimal degrees
        lon: Longitude in decimal degrees
        
    Returns:
        Weather condition as string (e.g., "drizzle", "sunny", "rainy")
    """
    # TODO: Integrate with real weather API (OpenWeatherMap, etc.)
    # For now, return "drizzle" as specified
    return "drizzle"


def handle_location(device_id: str, lat: float, lon: float) -> None:
    """
    Handle location update and trigger SMS offers for affluent areas in drizzle.
    
    1. Convert lat/lon to H3 hexagon
    2. Check if affluent area and weather is drizzle
    3. Enqueue Celery task to send offer SMS
    
    Args:
        device_id: Unique device identifier
        lat: Latitude in decimal degrees
        lon: Longitude in decimal degrees
    """
    # 1. Convert lat/lon to H3 hexagon
    hex_id = latlon_to_h3(lat, lon)
    
    # 2. Check if affluent area and weather is drizzle
    if is_affluent(hex_id) and current_weather(lat, lon) == 'drizzle':
        # TODO: Import and enqueue Celery task
        # from .workers import send_offer_sms
        # send_offer_sms.delay(device_id, lat, lon)
        pass 