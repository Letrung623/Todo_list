from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import jwt
import os

# module nội bộ
from backend import models, schemas, crud
from backend.database import engine, get_db
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from backend.vision_service import extract_schedule_from_base64

# Khởi tạo Database
models.Base.metadata.create_all(bind=engine)

# app = FastAPI() //may e khong chay dc nen cung tat luon

# Khởi tạo App
app = FastAPI(title="TaskMaster API", version="1.0.0")

# ==========================================
# CẤP GIẤY THÔNG HÀNH CORS CHO FRONTEND
# ==========================================
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"], //may e chay khong dc cai nay
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# ==========================================
# KHU VỰC API (ENDPOINTS) KANBAN & AUTH
# ==========================================

@app.post("/api/users-nhap/")
def tao_user_nhap(db: Session = Depends(get_db)):
    fake_user = models.User(Email="test@ntu.edu.vn", FullName="Admin NTU", PasswordHash="123")
    db.add(fake_user)
    db.commit()
    db.refresh(fake_user)
    return {"message": "Tạo user nháp thành công!", "UserID": fake_user.UserID}

@app.get("/api/boards/{user_id}", response_model=list[schemas.BoardResponse])
def get_boards(user_id: int, db: Session = Depends(get_db)):
    return crud.get_boards_by_user(db, user_id=user_id)

@app.post("/api/boards/", response_model=schemas.BoardResponse)
def create_board(board: schemas.BoardCreate, db: Session = Depends(get_db)):
    return crud.create_board(db=db, board=board)

@app.get("/api/boards/{board_id}/tasks", response_model=list[schemas.TaskResponse])
def get_tasks_in_board(board_id: int, db: Session = Depends(get_db)):
    return crud.get_tasks_by_board(db, board_id=board_id)

@app.post("/api/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    deleted_task = crud.delete_task(db, task_id=task_id)
    if not deleted_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task để xóa")
    return {"message": "Đã xóa công việc thành công!"}

@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    updated_task = crud.update_task(db, task_id=task_id, task_update=task)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task để sửa")
    return updated_task

@app.patch("/api/tasks/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, status_data: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    updated_task = crud.update_task_status(db, task_id=task_id, status=status_data.Status)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task")
    return updated_task

@app.patch("/api/tasks/{task_id}/move", response_model=schemas.TaskResponse)
def move_task(task_id: int, move_data: schemas.TaskMove, db: Session = Depends(get_db)):
    updated_task = crud.move_task(db, task_id=task_id, new_board_id=move_data.BoardID)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task")
    return updated_task

@app.put("/api/boards/{board_id}", response_model=schemas.BoardResponse)
def update_board(board_id: int, board: schemas.BoardUpdate, db: Session = Depends(get_db)):
    return crud.update_board(db, board_id=board_id, board_update=board)

@app.get("/api/fix-order/{user_id}")
def fix_board_order(user_id: int, db: Session = Depends(get_db)):
    import models 
    boards = db.query(models.KanbanBoard).filter(models.KanbanBoard.UserID == user_id).all()
    for index, board in enumerate(boards):
        board.OrderIndex = index + 1
    db.commit()
    return {"message": "Đã reset thứ tự Bảng thành công!"}

@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.Email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký! Vui lòng dùng email khác.")
    return crud.create_user(db=db, user=user)

@app.post("/api/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email hoặc Mật khẩu không chính xác!")
    
    access_token = crud.create_access_token(data={"sub": str(user.UserID)})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "FullName": user.FullName,
        "Email": user.Email
    }

@app.delete("/api/boards/{board_id}")
def delete_board(board_id: int, db: Session = Depends(get_db)):
    success = crud.delete_board(db, board_id=board_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy Bảng để xóa")
    return {"message": "Đã xóa Bảng và các công việc bên trong!"}


# Cổng bảo vệ: Yêu cầu phải có Token (Đăng nhập rồi) mới được gọi API
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

def get_current_user_id(token: str = Depends(oauth2_scheme)):
    """Hàm trung gian để dịch cái Token lấy ra UserID"""
    try:
        payload = jwt.decode(token, "Trung#2006", algorithms=["HS256"]) # NHỚ ĐỔI SECRET KEY CHO KHỚP VỚI CỦA EM
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        return int(user_id)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn hoặc sai lệch")

# ==========================================
# API LƯU THỜI KHÓA BIỂU VÀO DATABASE
# ==========================================
@app.post("/api/timetable/save")
def save_extracted_timetable(
    payload: schemas.TimetableSaveRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    try:
        # Trả lại hàm chuẩn, không có cờ lệnh nữa
        result = crud.save_timetables(db=db, user_id=user_id, subjects_data=payload.subjects)
        return {"success": True, "message": result["message"]}
    except Exception as e:
        print("❌ LỖI LƯU DATABASE:", str(e))
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")
# ==========================================
# API LẤY THỜI KHÓA BIỂU TỪ DATABASE (ĐỂ CHỐNG F5)
# ==========================================
@app.get("/api/timetable/get")
def get_saved_timetable(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id) # Phải có vòng tay VIP mới cho lấy
):
    # Lục trong Database xem user này có TKB không
    subjects = db.query(models.Timetable).filter(models.Timetable.UserID == user_id).all()
    return {"success": True, "data": subjects}

# ==========================================
# ROUTER CHO PROJECT COLUMNS
# ==========================================
@app.get("/api/projects/columns", response_model=list[schemas.ProjectColumnResponse])
def get_columns(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return crud.get_project_columns(db, user_id=user_id)

@app.post("/api/projects/columns", response_model=schemas.ProjectColumnResponse)
def create_column(column: schemas.ProjectColumnCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return crud.create_project_column(db=db, column=column, user_id=user_id)

# ==========================================
# ROUTER CHO PROJECT CARDS
# ==========================================
@app.get("/api/projects/columns/{column_id}/cards", response_model=list[schemas.ProjectCardResponse])
def get_cards(column_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return crud.get_project_cards(db, column_id=column_id)

@app.post("/api/projects/cards", response_model=schemas.ProjectCardResponse)
def create_card(card: schemas.ProjectCardCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return crud.create_project_card(db=db, card=card)

# API này cực quan trọng: Dùng để sửa nội dung Card HOẶC kéo thả Card sang Cột khác
@app.patch("/api/projects/cards/{card_id}", response_model=schemas.ProjectCardResponse)
def update_card(card_id: int, card_data: schemas.ProjectCardUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    updated_card = crud.update_project_card(db, card_id=card_id, card_data=card_data)
    if not updated_card:
        raise HTTPException(status_code=404, detail="Không tìm thấy Thẻ công việc này!")
    return updated_card

@app.delete("/api/projects/cards/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    success = crud.delete_project_card(db, card_id=card_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy Thẻ công việc để xóa!")
    return {"success": True, "message": "Đã xóa thẻ an toàn!"}

@app.patch("/api/projects/columns/{column_id}", response_model=schemas.ProjectColumnResponse)
def update_column(column_id: int, column_data: schemas.ProjectColumnCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_col = db.query(models.ProjectColumn).filter(models.ProjectColumn.ColumnID == column_id, models.ProjectColumn.UserID == user_id).first()
    if not db_col: raise HTTPException(status_code=404, detail="Không tìm thấy cột")
    db_col.Title = column_data.Title
    db_col.ColorClass = column_data.ColorClass
    db.commit()
    db.refresh(db_col)
    return db_col

@app.delete("/api/projects/columns/{column_id}")
def delete_column(column_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_col = db.query(models.ProjectColumn).filter(models.ProjectColumn.ColumnID == column_id, models.ProjectColumn.UserID == user_id).first()
    if not db_col: raise HTTPException(status_code=404, detail="Không tìm thấy cột")
    db.delete(db_col)
    db.commit()
    return {"success": True}

# Sửa ĐÚNG CÁI DÒNG NÀY THÔI SẾP NHÉ
@app.post("/api/timetable/extract")
async def upload_schedule_image(file: UploadFile = File(...)):
    try:
        print(f"📥 Đang nhận file: {file.filename}...")
        contents = await file.read()
        
        # Mã hóa sang base64
        base64_image = base64.b64encode(contents).decode("utf-8")
        
        print("🤖 Đang gửi cho AI Groq phân tích. Đợi xíu nha...")
        # Gửi cho hàm AI xử lý
        schedule_data = extract_schedule_from_base64(base64_image)
        
        print("✅ Phân tích xong! Trả về Frontend...")
        # 🌟 Đổi chữ "status" thành "success" để Frontend nhận diện được
        return {"success": True, "data": schedule_data}
        
    except Exception as e:
        # 🚨 LÔI CỔ LỖI RA TERMINAL ĐỂ ANH EM MÌNH BẮT BỆNH
        error_msg = str(e)
        print(f"\n❌ LỖI CRASH RỒI SẾP TRUNG ƠI: {error_msg}\n")
        
        # Trả về đúng format Frontend đang mong chờ
        return {"success": False, "error": error_msg}