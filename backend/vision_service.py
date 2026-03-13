import os
import json
from groq import Groq
from dotenv import load_dotenv

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
def extract_schedule_from_base64(base64_image: str):
    prompt = """
    Phân tích hình ảnh thời khoá biểu.
    Trích xuất thành ĐÚNG 1 mảng JSON với cấu trúc chuẩn sau:
    [
      {
        "SubjectName": "Tên môn học",
        "DayOfWeek": 2, 
        "StartTime": "07:00",
        "EndTime": "09:30",
        "Room": "Tên phòng"
      }
    ]
    Quy tắc:
    - DayOfWeek: Số nguyên từ 2 (Thứ 2) đến 8 (Chủ nhật).
    - StartTime và EndTime: Định dạng HH:MM. Tự suy luận từ tiết học (ví dụ tiết 1-3 sáng là 07:00 - 09:30, tiết 1-3 chiều là 13:00 - 15:30).
    - Room: Tên phòng học, nếu không có ghi "Chưa rõ".
    Chỉ trả về ĐÚNG mảng JSON, tuyệt đối không giải thích, không bọc bằng markdown (```json).
    """

    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct", # Dùng model vision của Groq (Llama 4 chưa hỗ trợ vision trên API Groq public)
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64_image}"
                        },
                    },
                ],
            }
        ],
        temperature=0
    )

    result = completion.choices[0].message.content
    
    # Mẹo ngành: Xóa rác markdown (```json ... ```) do AI hay bị "bệnh" trả về dư thừa
    result = result.replace("```json", "").replace("```", "").strip()
    
    try:
        return json.loads(result) # Ép kiểu về Dictionary chuẩn của Python
    except json.JSONDecodeError:
        raise Exception("AI không trả về chuẩn JSON. Kết quả lỗi: " + result)