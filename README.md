# AWS SAA-C03 Quiz App

Trang web luyện đề AWS Certified Solutions Architect – Associate (SAA-C03), chạy hoàn toàn offline (static HTML, không cần server/backend).

## Tính năng

- **1019 câu hỏi** — đã được rà soát và sửa lỗi cấu trúc/dữ liệu (key trùng, thiếu option, đáp án sai) qua nhiều vòng kiểm tra độc lập.
- **Giải thích chi tiết từng câu** — dịch + phân tích yêu cầu đề bài, từ khóa cốt lõi, phân tích đúng/sai từng đáp án, mẹo làm bài.
- 3 chế độ luyện:
  - Theo bộ đề có sẵn (20 câu/bộ, 51 bộ)
  - Ngẫu nhiên (tự chọn số câu)
  - Ôn lại câu đã trả lời sai (lưu tại trình duyệt qua `localStorage`, không cần tài khoản)
- Hỗ trợ cả câu 1 đáp án và câu "Choose two/three" (checkbox giới hạn đúng số lượng).

## Cách dùng

Mở trực tiếp `index.html` bằng trình duyệt — không cần cài đặt, không cần server.

Nếu deploy qua GitHub Pages: bật Pages ở nhánh chứa `index.html`, trang sẽ chạy ngay (toàn bộ dữ liệu được nhúng sẵn trong `question-data.js` và `explanations-data.js`, không gọi API bên ngoài).

## Cấu trúc file

| File | Nội dung |
|---|---|
| `index.html` | Giao diện + logic luyện đề |
| `question-data.js` | Toàn bộ 1019 câu hỏi (nhúng từ `question.json`) |
| `explanations-data.js` | Giải thích chi tiết cho từng câu, theo id |
| `question.json` | Dữ liệu gốc dạng JSON (nguồn để tái tạo lại `question-data.js` nếu cần sửa) |

## Nguồn dữ liệu

Câu hỏi tổng hợp từ các bộ đề luyện thi SAA-C03 cộng đồng, đã qua xử lý: sửa lỗi OCR/transcription (text dính chữ, policy JSON bị thiếu do là ảnh trong PDF gốc), đối chiếu và sửa lại các đáp án sai so với phân tích kỹ thuật AWS, bổ sung giải thích. Đây là tài liệu tự luyện tập cá nhân — không thay thế việc ôn tập bằng tài liệu chính thức của AWS.

## Lưu ý

Dữ liệu được tạo với sự hỗ trợ của AI (Claude) và đã được kiểm tra nhiều vòng, nhưng vẫn có thể còn sai sót. Nếu phát hiện câu nào sai, hãy tự kiểm tra lại với tài liệu AWS chính thức.
