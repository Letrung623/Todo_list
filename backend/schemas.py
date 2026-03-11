from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from pydantic import BaseModel, EmailStr

# ==========================================
# SCHEMAS CHO KANBAN BOARD
# ==========================================

# 1. Khung xương cơ bản (Chứa các trường bắt buộc phải có)
class BoardBase(BaseModel):
    Title: str
    Color: str = "pastel-blue"
    OrderIndex: int = 0

# 2. Dữ liệu Frontend gửi lên khi TẠO MỚI (Request)
class BoardCreate(BoardBase):
    UserID: int # Cần biết Board này của ai (Sau này làm Login sẽ giấu cái này đi)

# 3. Dữ liệu Backend trả về cho Frontend (Response)
class BoardResponse(BoardBase):
    BoardID: int
    UserID: int

    class Config:
        # Lệnh này cực kỳ quan trọng: Ép Pydantic biết cách đọc dữ liệu từ SQLAlchemy (Class models)
        from_attributes = True 
        # Nếu máy em cài Pydantic bản cũ (v1) thì dùng: orm_mode = True

# ==========================================
# SCHEMAS CHO KANBAN TASK
# ==========================================

class TaskBase(BaseModel):
    Title: str
    Description: Optional[str] = None
    PriorityLevel: str = "medium"
    StartDate: Optional[date] = None
    EndDate: Optional[date] = None
    Status: str = "pending"

class TaskCreate(TaskBase):
    BoardID: int  # Phải biết Task này nhét vào Bảng nào

# Dùng cho API Cập nhật (Sửa nội dung)
class TaskUpdate(TaskBase):
    pass # Pass nghĩa là mượn y nguyên cấu trúc của TaskBase (Title, Desc, Priority...) không cần thêm gì.

class TaskResponse(TaskBase):
    TaskID: int
    BoardID: int

    class Config:
        from_attributes = True
# Dùng cho API PATCH (Chỉ cập nhật mỗi trạng thái)
class TaskStatusUpdate(BaseModel):
    Status: str
# Dùng cho API Kéo thả (Chuyển Bảng)
class TaskMove(BaseModel):
    BoardID: int
# Dùng cho API sửa Bảng
class BoardUpdate(BoardBase):
    pass

# ==========================================
# SCHEMAS CHO USER (ĐĂNG KÝ / ĐĂNG NHẬP)
# ==========================================
class UserCreate(BaseModel):
    FullName: str
    Email: EmailStr
    Password: str

class UserResponse(BaseModel):
    UserID: int
    FullName: str
    Email: EmailStr
    
    class Config:
        from_attributes = True