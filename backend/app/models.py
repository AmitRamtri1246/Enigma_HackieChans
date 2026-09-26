from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    # One of: citizen, organization, collector, municipality.
    role = Column(String(32), nullable=False, server_default="citizen")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_data = Column(Text, nullable=False)
    item_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    subtype = Column(String(100), nullable=True)
    stream = Column(String(100), nullable=True)
    confidence = Column(Integer, nullable=False, default=90)
    circularity_score = Column(Integer, nullable=False, default=85)
    suggested_actions = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", backref="scans")

