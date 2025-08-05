import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from .models import Base

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/maps_db")

# Create engine with appropriate configuration
engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool,  # Use static pool for development
    pool_pre_ping=True,  # Verify connections before use
    echo=False,  # Set to True for SQL debugging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency function that yields a database session.

    This function creates a new database session for each request
    and ensures it's properly closed after use.

    Yields:
        Session: A SQLAlchemy database session

    Example:
        @app.post("/items/")
        def create_item(db: Session = Depends(get_session)):
            # Use db session here
            pass
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def create_tables() -> None:
    """
    Create all database tables.

    This function should be called during application startup
    to ensure all tables exist in the database.
    """
    Base.metadata.create_all(bind=engine)


def drop_tables() -> None:
    """
    Drop all database tables.

    Warning: This will delete all data in the database.
    Only use for testing or development purposes.
    """
    Base.metadata.drop_all(bind=engine)
