from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, time

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

# ==========================================
# SCHEMAS CHO THỜI KHÓA BIỂU
# ==========================================

class TimetableItem(BaseModel):
    SubjectName: str
    DayOfWeek: int
    StartTime: time
    EndTime: time
    Room: Optional[str] = "Chưa rõ"

# Khuôn mẫu để nhận 1 mảng (list) các môn học từ Step 2 gửi lên
class TimetableSaveRequest(BaseModel):
    subjects: List[TimetableItem]

# ==========================================
# SCHEMAS CHO CỘT DỰ ÁN (PROJECT COLUMNS)
# ==========================================
class ProjectColumnCreate(BaseModel):
    Title: str
    OrderIndex: int = 0

class ProjectColumnResponse(ProjectColumnCreate):
    ColumnID: int
    UserID: int
    
    class Config:
        from_attributes = True # Dùng cho Pydantic v2 (nếu lỗi thì sửa thành orm_mode = True)

# ==========================================
# SCHEMAS CHO THẺ CÔNG VIỆC (PROJECT CARDS)
# ==========================================
class ProjectCardCreate(BaseModel):
    ColumnID: int
    Title: str
    Description: Optional[str] = None
    DueDate: Optional[date] = None
    OrderIndex: int = 0

class ProjectCardUpdate(BaseModel):
    # Tất cả đều là Optional để sếp có thể cập nhật từng phần (ví dụ chỉ kéo thả thì chỉ đổi ColumnID)
    ColumnID: Optional[int] = None
    Title: Optional[str] = None
    Description: Optional[str] = None
    DueDate: Optional[date] = None
    OrderIndex: Optional[int] = None

class ProjectCardResponse(ProjectCardCreate):
    CardID: int
    
    class Config:
        from_attributes = True

# ==========================================
# SCHEMAS CHO CỘT DỰ ÁN (PROJECT COLUMNS)
# ==========================================
class ProjectColumnCreate(BaseModel):
    Title: str
    ColorClass: str = "blue"  # Sếp có màu cho cột nên thêm dòng này
    OrderIndex: int = 0

class ProjectColumnResponse(ProjectColumnCreate):
    ColumnID: int
    UserID: int
    class Config:
        from_attributes = True

# ==========================================
# SCHEMAS CHO THẺ CÔNG VIỆC (PROJECT CARDS)
# ==========================================
class ProjectCardCreate(BaseModel):
    ColumnID: int
    Title: str
    Description: Optional[str] = None
    TotalBoxes: int = 5      # Tổng số ô tiến độ
    DoneBoxes: int = 0       # Số ô đã xong
    ColorClass: Optional[str] = None # Màu riêng của thẻ
    OrderIndex: int = 0

class ProjectCardUpdate(BaseModel):
    ColumnID: Optional[int] = None
    Title: Optional[str] = None
    Description: Optional[str] = None
    TotalBoxes: Optional[int] = None
    DoneBoxes: Optional[int] = None
    ColorClass: Optional[str] = None
    OrderIndex: Optional[int] = None

class ProjectCardResponse(ProjectCardCreate):
    CardID: int
    class Config:
        from_attributes = True