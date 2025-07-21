import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from .models import Base


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    print("Connecting to: " + os.getenv('DATABASE_URL'))
    create_tables()
    print("Tables created!")
