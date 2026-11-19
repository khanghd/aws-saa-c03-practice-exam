# Luyện đề chứng chỉ

Trang web luyện đề nhiều chứng chỉ, chạy hoàn toàn offline (static HTML, không cần server/backend). Mở `index.html` để chọn chứng chỉ muốn luyện.

## Chứng chỉ hiện có

### AWS Certified Solutions Architect – Associate (SAA-C03) — [`saa-c03/`](saa-c03/)

- **1019 câu hỏi** — đã được rà soát và sửa lỗi cấu trúc/dữ liệu (key trùng, thiếu option, đáp án sai) qua nhiều vòng kiểm tra độc lập.
- **Giải thích chi tiết từng câu** — dịch + phân tích yêu cầu đề bài, từ khóa cốt lõi, phân tích đúng/sai từng đáp án, mẹo làm bài.
- 3 chế độ luyện:
  - Theo bộ đề có sẵn (20 câu/bộ, 51 bộ)
  - Ngẫu nhiên (tự chọn số câu)
  - Ôn lại câu đã trả lời sai (lưu tại trình duyệt qua `localStorage`, không cần tài khoản)
- 10 full đề thi thử (65 câu/đề), xử lý và giải thích riêng từng đề: [`saa-c03/full-exams/`](saa-c03/full-exams/)
- Cheat sheet tổng hợp 4 domain thi: [`saa-c03/cheatsheet.html`](saa-c03/cheatsheet.html)
- Hỗ trợ cả câu 1 đáp án và câu "Choose two/three" (checkbox giới hạn đúng số lượng).

### Claude Certified Associate Foundations (CCAO-F) — [`ccao-f/`](ccao-f/)

- 119 câu hỏi luyện từng câu, có giải thích theo AI Fluency Framework (process controls, independent verification, proportional to risk).
- Lọc theo Set, theo bộ 30 câu, theo trạng thái (chưa làm/làm sai/đã đánh dấu).
- Cheat sheet tổng hợp 7 domain thi: [`ccao-f/cheatsheet.html`](ccao-f/cheatsheet.html)

### Claude Certified Architect – Foundations (CCAR-F) — [`ccar-f/`](ccar-f/)

- **Học theo chương**: 11 phần theo 6 chương (blueprint CCAR-F), mỗi phần có key takeaways + kiểm tra nhanh, theo dõi tiến độ qua `localStorage`.
- **Luyện đề mở rộng 187 câu** gộp/khử trùng lặp (cả trùng nguyên văn lẫn trùng nội dung bị diễn đạt lại/đảo đáp án) từ 6 bộ đề cộng đồng, lọc theo domain hoặc theo lượt 30 câu.
- **Đề mock 60 câu** mô phỏng theo 6 scenario, bám sát format đề thi thật (120 phút, 720/1000 điểm đạt) — xem ở bản đề lẻ tự chứa `full-exams/mock-exam.html`.
- **Quick reference** tổng hợp ngay trong app — không cần file cheat sheet riêng.
- Dữ liệu câu hỏi tách riêng khỏi app (`question.json`/`question-data.js` + `explanations.json`/`explanations-data.js`), có script `build.mjs` tái sinh toàn bộ file phát sinh sau khi sửa dữ liệu.
- 13 đề lẻ, tự chứa (không cần mở `index.html`): [`ccar-f/full-exams/`](ccar-f/full-exams/) — 7 lượt 30 câu (bộ 187 câu, lượt cuối 7 câu), 1 đề mock đầy đủ 60 câu, 5 đề theo domain (gộp cả 2 bộ đề).

## Cách dùng

Mở trực tiếp `index.html` bằng trình duyệt — không cần cài đặt, không cần server. Chọn chứng chỉ muốn luyện, trang sẽ dẫn vào app riêng của chứng chỉ đó.

Nếu deploy qua GitHub Pages: bật Pages ở nhánh chứa `index.html`, trang sẽ chạy ngay (toàn bộ dữ liệu được nhúng sẵn, không gọi API bên ngoài).

## Cấu trúc file

| File/Thư mục | Nội dung |
|---|---|
| `index.html` | Trang chọn chứng chỉ |
| `saa-c03/index.html` | App luyện đề SAA-C03 |
| `saa-c03/question-data.js` | Toàn bộ 1019 câu hỏi SAA-C03 (nhúng từ `question.json`) |
| `saa-c03/explanations-data.js` | Giải thích chi tiết cho từng câu SAA-C03, theo id |
| `saa-c03/question.json` | Dữ liệu gốc dạng JSON (nguồn để tái tạo lại `question-data.js` nếu cần sửa) |
| `saa-c03/cheatsheet.html` | Cheat sheet SAA-C03 |
| `saa-c03/full-exams/` | 10 full đề thi thử SAA-C03 (65 câu/đề) |
| `ccao-f/index.html` | App luyện đề CCAO-F |
| `ccao-f/cheatsheet.html` | Cheat sheet CCAO-F |
| `ccar-f/index.html` | App học + luyện đề CCAR-F (học theo chương, luyện đề 60/187 câu, quick reference) |
| `ccar-f/question-data.js` | Toàn bộ nội dung học (sections) + 247 câu hỏi CCAR-F (60+187, nhúng từ `question.json`) |
| `ccar-f/explanations-data.js` | Giải thích ("why") cho từng câu/mini-quiz CCAR-F, theo id (nhúng từ `explanations.json`) |
| `ccar-f/question.json` | Dữ liệu gốc dạng JSON — sửa câu hỏi ở đây rồi chạy `node build.mjs` |
| `ccar-f/explanations.json` | Giải thích gốc dạng JSON — sửa ở đây rồi chạy `node build.mjs` |
| `ccar-f/build.mjs` | Script tái sinh `question-data.js`, `explanations-data.js`, và toàn bộ `full-exams/*.html` từ 2 file JSON trên |
| `ccar-f/full-exams/` | 13 đề lẻ CCAR-F tự chứa: 7 lượt 30 câu, 1 đề mock 60 câu, 5 đề theo domain |

## Nguồn dữ liệu

- **SAA-C03**: câu hỏi tổng hợp từ các bộ đề luyện thi SAA-C03 cộng đồng, đã qua xử lý: sửa lỗi OCR/transcription (text dính chữ, policy JSON bị thiếu do là ảnh trong PDF gốc), đối chiếu và sửa lại các đáp án sai so với phân tích kỹ thuật AWS, bổ sung giải thích.
- **CCAO-F**: câu hỏi tổng hợp từ nguồn luyện thi cộng đồng (chỉ có câu hỏi + đáp án, không kèm đáp án chính thức) — đáp án đúng và giải thích do AI suy luận dựa trên nội dung chính thức của chứng chỉ, nên đối chiếu lại nếu có kết quả chính thức.
- **CCAR-F**: nội dung học theo chương tự biên soạn bám theo blueprint CCAR-F; câu hỏi luyện đề gộp/khử trùng lặp từ 6 bộ đề luyện tập cộng đồng, tự phân loại theo domain — là câu hỏi mô phỏng tự biên soạn, không phải đề thi thật.

Đây là tài liệu tự luyện tập cá nhân — không thay thế việc ôn tập bằng tài liệu chính thức của từng chứng chỉ.

## Lưu ý

Dữ liệu được tạo với sự hỗ trợ của AI (Claude) và đã được kiểm tra nhiều vòng, nhưng vẫn có thể còn sai sót. Nếu phát hiện câu nào sai, hãy tự kiểm tra lại với tài liệu chính thức của chứng chỉ tương ứng.
