from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, crud
from database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

# (Giữ nguyên mấy dòng khởi tạo app ở bài trước...)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskMaster API", version="1.0.0")

# ==========================================
# CẤP GIẤY THÔNG HÀNH CORS CHO FRONTEND
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Cho phép mọi trang web (Frontend) gọi API này
    allow_credentials=True,
    allow_methods=["*"], # Cho phép mọi lệnh GET, POST, PUT, DELETE
    allow_headers=["*"],
)

# ==========================================
# KHU VỰC API (ENDPOINTS)
# ==========================================

# API 1: Tạo một User "nháp" (Vì phải có User thì mới tạo được Board do dính Khóa Ngoại)
@app.post("/api/users-nhap/")
def tao_user_nhap(db: Session = Depends(get_db)):
    # Hàm này thầy viết nhanh để em có 1 user test. Sau này làm tính năng Đăng Ký mình sẽ xóa đi.
    fake_user = models.User(Email="test@ntu.edu.vn", FullName="Admin NTU", PasswordHash="123")
    db.add(fake_user)
    db.commit()
    db.refresh(fake_user)
    return {"message": "Tạo user nháp thành công!", "UserID": fake_user.UserID}


# API 2: Lấy danh sách Board của User (Phương thức GET)
@app.get("/api/boards/{user_id}", response_model=list[schemas.BoardResponse])
def get_boards(user_id: int, db: Session = Depends(get_db)):
    boards = crud.get_boards_by_user(db, user_id=user_id)
    return boards


# API 3: Tạo Board mới (Phương thức POST)
@app.post("/api/boards/", response_model=schemas.BoardResponse)
def create_board(board: schemas.BoardCreate, db: Session = Depends(get_db)):
    return crud.create_board(db=db, board=board)

# --- API CHO KANBAN TASKS ---

# Lấy danh sách Task trong 1 Board
@app.get("/api/boards/{board_id}/tasks", response_model=list[schemas.TaskResponse])
def get_tasks_in_board(board_id: int, db: Session = Depends(get_db)):
    return crud.get_tasks_by_board(db, board_id=board_id)

# Tạo Task mới
@app.post("/api/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)

# Xóa Task
@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    deleted_task = crud.delete_task(db, task_id=task_id)
    if not deleted_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task để xóa")
    return {"message": "Đã xóa công việc thành công!"}

# Cập nhật thông tin Task
@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    updated_task = crud.update_task(db, task_id=task_id, task_update=task)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task để sửa")
    return updated_task

# Cập nhật trạng thái Hoàn thành (Checkbox)
@app.patch("/api/tasks/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, status_data: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    updated_task = crud.update_task_status(db, task_id=task_id, status=status_data.Status)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task")
    return updated_task

# API Cập nhật BoardID khi kéo thả Task
@app.patch("/api/tasks/{task_id}/move", response_model=schemas.TaskResponse)
def move_task(task_id: int, move_data: schemas.TaskMove, db: Session = Depends(get_db)):
    updated_task = crud.move_task(db, task_id=task_id, new_board_id=move_data.BoardID)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Không tìm thấy Task")
    return updated_task

# Cập nhật thông tin Bảng
@app.put("/api/boards/{board_id}", response_model=schemas.BoardResponse)
def update_board(board_id: int, board: schemas.BoardUpdate, db: Session = Depends(get_db)):
    return crud.update_board(db, board_id=board_id, board_update=board)