from celery import Celery
from dotenv import load_dotenv
import os, time

load_dotenv()
celery = Celery(__name__, broker=os.environ["REDIS_URL"])

@celery.task
def send_offer_sms(device_id: str, offer_id: int | None = None) -> None:
    """Dev stub prints instead of sending Twilio SMS."""
    print(f"[{time.strftime('%X')}] Would send SMS to {device_id}: offer {offer_id}") 