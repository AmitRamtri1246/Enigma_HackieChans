from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    
    model_config = {"env_file": ".env"}

settings = Settings()
