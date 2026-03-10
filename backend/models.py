from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime
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
    Name = Column(String(255), nullable=False)
    TotalTasks = Column(Integer, default=1)
    DoneTasks = Column(Integer, default=0)
    OverrideColor = Column(String(50), nullable=True)

    column = relationship("ProjectColumn", back_populates="cards")

# 6. BẢNG FOCUS SESSIONS
class FocusSession(Base):
    __tablename__ = "FocusSessions"

    SessionID = Column(Integer, primary_key=True, index=True)
    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="CASCADE"), nullable=False)
    RecordDate = Column(Date, nullable=False)
    TotalSeconds = Column(Integer, default=0)

    owner = relationship("User", back_populates="focus_sessions")