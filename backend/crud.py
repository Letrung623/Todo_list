from sqlalchemy.orm import Session
import models, schemas
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone

# Công cụ băm nát mật khẩu bằng thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. Hàm LẤY danh sách Board của một User cụ thể (READ)
def get_boards_by_user(db: Session, user_id: int):
    # Tương đương lệnh: SELECT * FROM KanbanBoards WHERE UserID = user_id
    return db.query(models.KanbanBoard).filter(models.KanbanBoard.UserID == user_id).all()

# 2. Hàm TẠO MỚI một Board (CREATE)
def create_board(db: Session, board: schemas.BoardCreate):
    # Biến dữ liệu từ Pydantic (schemas) thành Object của SQLAlchemy (models)
    db_board = models.KanbanBoard(
        UserID=board.UserID,
        Title=board.Title,
        Color=board.Color,
        OrderIndex=board.OrderIndex
    )
    db.add(db_board)        # Xếp hàng chờ
    db.commit()             # Chốt hạ lưu vào ổ cứng SQL Server
    db.refresh(db_board)    # Cập nhật lại Object để lấy cái BoardID vừa được tự động sinh ra
    return db_board

# --- KHU VỰC CỦA KANBAN TASK ---

# 1. Lấy toàn bộ Task của một Board
def get_tasks_by_board(db: Session, board_id: int):
    return db.query(models.KanbanTask).filter(models.KanbanTask.BoardID == board_id).all()

# 2. Tạo Task mới
def create_task(db: Session, task: schemas.TaskCreate):
    # Cú pháp **task.model_dump() giúp bung toàn bộ dữ liệu từ Pydantic ra mà không cần gõ từng dòng
    db_task = models.KanbanTask(**task.model_dump()) 
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# 3. Xóa Task
def delete_task(db: Session, task_id: int):
    db_task = db.query(models.KanbanTask).filter(models.KanbanTask.TaskID == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task

# 4. Cập nhật Task (Sửa nội dung)
def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate):
    # 1. Tìm cái task cần sửa trong DB
    db_task = db.query(models.KanbanTask).filter(models.KanbanTask.TaskID == task_id).first()
    
    if db_task:
        # 2. Cập nhật từng trường dữ liệu
        db_task.Title = task_update.Title
        db_task.Description = task_update.Description
        db_task.PriorityLevel = task_update.PriorityLevel
        db_task.StartDate = task_update.StartDate
        db_task.EndDate = task_update.EndDate
        # Không cập nhật Status ở đây vì mình sẽ làm nút Checkbox riêng
        
        # 3. Chốt hạ lưu vào ổ cứng
        db.commit()
        db.refresh(db_task)
        
    return db_task

# 5. Cập nhật Trạng thái Task (Tích Checkbox)
def update_task_status(db: Session, task_id: int, status: str):
    db_task = db.query(models.KanbanTask).filter(models.KanbanTask.TaskID == task_id).first()
    if db_task:
        db_task.Status = status
        db.commit()
        db.refresh(db_task)
    return db_task
# 6. Đổi Bảng cho Task (Kéo thả)
def move_task(db: Session, task_id: int, new_board_id: int):
    db_task = db.query(models.KanbanTask).filter(models.KanbanTask.TaskID == task_id).first()
    if db_task:
        db_task.BoardID = new_board_id
        db.commit()
        db.refresh(db_task)
    return db_task

# 7. Sửa thông tin Bảng (Và cập nhật vị trí khi kéo thả)
def update_board(db: Session, board_id: int, board_update: schemas.BoardUpdate):
    db_board = db.query(models.KanbanBoard).filter(models.KanbanBoard.BoardID == board_id).first()
    if db_board:
        db_board.Title = board_update.Title
        db_board.Color = board_update.Color
        db_board.OrderIndex = board_update.OrderIndex # 🌟 DÒNG THÊM MỚI QUAN TRỌNG
        db.commit()
        db.refresh(db_board)
    return db_board

# ==========================================
# KHU VỰC CỦA USER (AUTH)
# ==========================================

# 1. Tìm user bằng Email (Dùng để check xem email đã bị đăng ký chưa)
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.Email == email).first()

# 2. Tạo User mới (Băm mật khẩu trước khi lưu)
def create_user(db: Session, user: schemas.UserCreate):
    # Băm mật khẩu ra thành chuỗi mã hóa
    hashed_password = pwd_context.hash(user.Password)
    
    # Tạo object User để nhét vào DB (Lưu ý: Không lưu user.Password mà lưu hashed_password)
    db_user = models.User(
        FullName=user.FullName, 
        Email=user.Email, 
        PasswordHash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ==========================================
# CẤU HÌNH BẢO MẬT JWT
# ==========================================
# Đây là chữ ký mật của riêng hệ thống em. Tuyệt đối không để lộ!
SECRET_KEY = "BiMatCuaHiep66KHMT" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Vòng tay VIP có hạn sử dụng 1 ngày (24 tiếng)

# 3. Hàm soi mật khẩu (So sánh Pass người dùng nhập với Pass giun dế trong SQL)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 4. Hàm Xác thực Đăng nhập
def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False # Không tìm thấy Email
    if not verify_password(password, user.PasswordHash):
        return False # Sai mật khẩu
    return user # Đúng hết thì trả về ông User đó

# 5. Máy in "Vòng tay VIP" (Tạo JWT Token)
def create_access_token(data: dict):
    to_encode = data.copy()
    # Hẹn giờ hủy token
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Ký tên đóng dấu bằng SECRET_KEY
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def delete_board(db: Session, board_id: int):
    board = db.query(models.KanbanBoard).filter(models.KanbanBoard.BoardID == board_id).first()
    if board:
        # THAY CHỮ Task THÀNH KanbanTask (hoặc tên đúng của em) Ở 2 CHỖ DƯỚI ĐÂY:
        db.query(models.KanbanTask).filter(models.KanbanTask.BoardID == board_id).delete(synchronize_session=False)
        
        db.delete(board)
        db.commit()
        return True
    return False