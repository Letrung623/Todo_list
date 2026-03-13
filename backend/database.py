import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 0. Tải biến môi trường từ két sắt
load_dotenv()

# 1. CẤU HÌNH THÔNG TIN DATABASE (Lấy từ .env)
SERVER = os.getenv("DB_SERVER", "127.0.0.1")
DATABASE = os.getenv("DB_NAME", "TaskMasterDB")
USERNAME = os.getenv("DB_USER", "sa")
PASSWORD = os.getenv("DB_PASSWORD") # Rút mật khẩu từ két sắt ra

# 2. TẠO CHUỖI KẾT NỐI
SQLALCHEMY_DATABASE_URL = f"mssql+pymssql://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}"

# 3. KHỞI TẠO ENGINE
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. KHỞI TẠO SESSION 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()