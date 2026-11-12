import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base,sessionmaker
from fastapi import HTTPException
load_dotenv()
Base=declarative_base()
try:
    DATABASE_URL=os.getenv("DATABASE_URL")
    engine=create_engine(DATABASE_URL)
    Session=sessionmaker(
        autoflush=False
        ,autocommit=False
        ,bind=engine
    )
    def get_db():
        db=Session()
        try:
            yield db
        except:
            db.close()
except Exception as e:
    print(f"Cannot Upload Database Url \n Reason:{e}")