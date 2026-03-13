from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Time
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# 1. BẢNG USERS
class User(Base):
    __tablename__ = "Users"

    UserID = Column(Integer, primary_key=True, index=True)
    Email = Column(String(100), unique=True, nullable=False)
    FullName = Column(String(100), nullable=False)  # Tương đương NVARCHAR
    PasswordHash = Column(String(255), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    timetables = relationship("Timetable", back_populates="owner")

    # Khai báo mối quan hệ để Python dễ truy xuất (Không tạo thêm cột)
    boards = relationship("KanbanBoard", back_populates="owner", cascade="all, delete-orphan")
    columns = relationship("ProjectColumn", back_populates="owner", cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="owner", cascade="all, delete-orphan")

# 2. BẢNG KANBAN BOARDS
class KanbanBoard(Base):
    __tablename__ = "KanbanBoards"

    BoardID = Column(Integer, primary_key=True, index=True)
    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="CASCADE"), nullable=False)
    Title = Column(String(200), nullable=False)
    Color = Column(String(50), default="pastel-blue")
    OrderIndex = Column(Integer, default=0)

    owner = relationship("User", back_populates="boards")
    tasks = relationship("KanbanTask", back_populates="board", cascade="all, delete-orphan")

# 3. BẢNG KANBAN TASKS
class KanbanTask(Base):
    __tablename__ = "KanbanTasks"

    TaskID = Column(Integer, primary_key=True, index=True)
    BoardID = Column(Integer, ForeignKey("KanbanBoards.BoardID", ondelete="CASCADE"), nullable=False)
    Title = Column(String(255), nullable=False)
    Description = Column(String(1000), nullable=True) # Thay cho MAX
    PriorityLevel = Column(String(20), default="medium")
    StartDate = Column(Date, nullable=True)
    EndDate = Column(Date, nullable=True)
    Status = Column(String(20), default="pending")

    board = relationship("KanbanBoard", back_populates="tasks")

# 4. BẢNG PROJECT COLUMNS
class ProjectColumn(Base):
    __tablename__ = "ProjectColumns"

    ColumnID = Column(Integer, primary_key=True, index=True)
    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="CASCADE"), nullable=False)
    Title = Column(String(200), nullable=False)
    ColorClass = Column(String(50), default="blue")
    OrderIndex = Column(Integer, default=0)

    owner = relationship("User", back_populates="columns")
    cards = relationship("ProjectCard", back_populates="column", cascade="all, delete-orphan")

# 5. BẢNG PROJECT CARDS
class ProjectCard(Base):
    __tablename__ = "ProjectCards"

    CardID = Column(Integer, primary_key=True, index=True)
    ColumnID = Column(Integer, ForeignKey("ProjectColumns.ColumnID", ondelete="CASCADE"), nullable=False)
    
    # Đã sửa Name -> Title và thêm các cột cần thiết cho việc Kéo Thả
    Title = Column(String(255), nullable=False)
    Description = Column(String(1000), nullable=True) 
    OrderIndex = Column(Integer, default=0) 
    
    # Bộ 3 biến để phục vụ giao diện Ô vuông (Tiến độ) của sếp
    TotalBoxes = Column(Integer, default=5)
    DoneBoxes = Column(Integer, default=0)
    ColorClass = Column(String(50), nullable=True) # Lưu màu riêng lẻ của từng Card

    column = relationship("ProjectColumn", back_populates="cards")

# 6. BẢNG FOCUS SESSIONS
class FocusSession(Base):
    __tablename__ = "FocusSessions"

    SessionID = Column(Integer, primary_key=True, index=True)
    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="CASCADE"), nullable=False)
    RecordDate = Column(Date, nullable=False)
    TotalSeconds = Column(Integer, default=0)

    owner = relationship("User", back_populates="focus_sessions")

# models.py
class Timetable(Base):
    __tablename__ = "Timetables"

    SubjectID = Column(Integer, primary_key=True, index=True)
    UserID = Column(Integer, ForeignKey("Users.UserID"), nullable=False)
    
    SubjectName = Column(String(255), nullable=False)
    DayOfWeek = Column(Integer, nullable=False) # 2=Thứ 2, 3=Thứ 3... 8=Chủ Nhật
    StartTime = Column(Time, nullable=False) # Giờ bắt đầu (VD: 07:00)
    EndTime = Column(Time, nullable=False)   # Giờ kết thúc (VD: 11:30)
    Room = Column(String(50))                # Phòng học (VD: G2-301)
    
    # Quan hệ ngược lại với User (nếu cần)
    owner = relationship("User", back_populates="timetables")