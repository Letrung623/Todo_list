from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 1. CẤU HÌNH THÔNG TIN DATABASE
SERVER = 'localhost' # Hoặc '127.0.0.1'
DATABASE = 'TaskMasterDB'
USERNAME = 'sa' 
PASSWORD = 'Trung#2006' # NHỚ SỬA LẠI PASS CỦA EM NHÉ!

# 2. TẠO CHUỖI KẾT NỐI BẰNG PYMSSQL (Siêu ngắn gọn)
SQLALCHEMY_DATABASE_URL = f"mssql+pymssql://{USERNAME}:{PASSWORD}@{SERVER}/{DATABASE}"

# 3. KHỞI TẠO ENGINE
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. KHỞI TẠO SESSION 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. HÀM CUNG CẤP DATABASE SESSION
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()