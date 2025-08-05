from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

Base = declarative_base()


class Device(Base):
    """Device model representing mobile devices that send location data."""

    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    pings: Mapped[list["DevicePing"]] = relationship(
        "DevicePing", back_populates="device", cascade="all, delete-orphan"
    )
    delivered_offers: Mapped[list["DeliveredOffer"]] = relationship(
        "DeliveredOffer", back_populates="device", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Device(id={self.id}, phone='{self.phone}', created_at='{self.created_at}')>"


class DevicePing(Base):
    """Device ping model representing location pings from devices."""

    __tablename__ = "device_pings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    h3_hex: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    ts: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    # Relationships
    device: Mapped["Device"] = relationship("Device", back_populates="pings")

    # Indexes for common query patterns
    __table_args__ = (
        Index("idx_device_pings_device_ts", "device_id", "ts"),
        Index("idx_device_pings_h3_ts", "h3_hex", "ts"),
    )

    def __repr__(self) -> str:
        return f"<DevicePing(id={self.id}, device_id={self.device_id}, h3_hex='{self.h3_hex}', ts='{self.ts}')>"


class Offer(Base):
    """Offer model representing promotional offers that can be delivered to devices."""

    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    h3_hex: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    affluent_only: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    weather_trigger: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    delivered_offers: Mapped[list["DeliveredOffer"]] = relationship(
        "DeliveredOffer", back_populates="offer", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Offer(id={self.id}, h3_hex='{self.h3_hex}', title='{self.title}', affluent_only={self.affluent_only})>"


class DeliveredOffer(Base):
    """Delivered offer model tracking which offers were sent to which devices."""

    __tablename__ = "delivered_offers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    offer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("offers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    # Relationships
    device: Mapped["Device"] = relationship("Device", back_populates="delivered_offers")
    offer: Mapped["Offer"] = relationship("Offer", back_populates="delivered_offers")

    # Indexes for common query patterns
    __table_args__ = (
        Index("idx_delivered_offers_device_sent", "device_id", "sent_at"),
        Index("idx_delivered_offers_offer_sent", "offer_id", "sent_at"),
        # Ensure a device can't receive the same offer multiple times
        Index("idx_delivered_offers_unique", "device_id", "offer_id", unique=True),
    )

    def __repr__(self) -> str:
        return f"<DeliveredOffer(id={self.id}, device_id={self.device_id}, offer_id={self.offer_id}, sent_at='{self.sent_at}')>"
