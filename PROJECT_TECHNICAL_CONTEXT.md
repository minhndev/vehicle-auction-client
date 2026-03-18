# TECHNICAL CONTEXT SUMMARY: VEHICLE AUCTION API
> **Đối tượng:** AI Developer / Human Developer tiếp quản dự án.
> **Vai trò:** Senior Architect Summary.
> **Ngày cập nhật:** 18/03/2026.

---

## 1. Tổng quan & Tech Stack

**Mục đích dự án:**
Xây dựng hệ thống backend (API) cho sàn đấu giá xe trực tuyến thời gian thực (Real-time Vehicle Auction System). Hệ thống tập trung vào hiệu năng cao, tính toàn vẹn dữ liệu (đặc biệt là tiền đặt cọc và lịch sử đấu giá), và khả năng audit chặt chẽ.

**Tech Stack Chính:**
*   **Java:** 21 (Tận dụng Virtual Threads, Record, Pattern Matching).
*   **Framework:** Spring Boot 3.5.11 (Hỗ trợ mới nhất cho Java 21).
*   **Database Relational:** PostgreSQL (Quản lý dữ liệu chính: User, Auction, Wallet, Transaction).
*   **Database NoSQL:** MongoDB (Lưu trữ Audit Logs, notify logs - tách biệt để giảm tải I/O cho Postgres).
*   **Caching & Messaging:** Redis (Cache dữ liệu phiên đấu giá, Pub/Sub cho WebSocket scaling).
*   **Real-time:** Spring WebSocket (STOMP protocol) để cập nhật giá đấu realtime.
*   **Security:** Spring Security + JWT (Stateless Authentication).
*   **Migration:** Flyway (Version control cho Database Schema).
*   **Storage:** AWS SDK S3 (Tương thích MinIO local) để lưu trữ ảnh xe.
*   **Utilities:**
    *   **Lombok:** Giảm boilerplate code.
    *   **MapStruct:** Mapping Entity <-> DTO hiệu năng cao (compile-time).
    *   **SpringDoc OpenAPI:** Tự động sinh tài liệu API (Swagger UI).

---

## 2. Cấu trúc Thư mục (Project Structure)

Dự án áp dụng **Clean Architecture** (biến thể Hexagonal/Port-Adapter) để tách biệt nghiệp vụ khỏi hạ tầng kỹ thuật.

```text
src/main/java/com/example/vehicle_auction/
├── VehicleAuctionApplication.java       # Main Entry Point
├── domain/                              # [CORE LAYER] Nghiệp vụ cốt lõi
│   ├── entity/                          # Các thực thể nghiệp vụ (Auction, Bid, User)
│   ├── exception/                       # Các Exception định nghĩa riêng (ErrorCode, AppException)
│   └── repository/                      # Interface Repository (Ports - định nghĩa hành vi lưu trữ)
├── application/                         # [APPLICATION LAYER] Use Cases & Logic ứng dụng
│   ├── dto/                             # Data Transfer Objects (Request/Response)
│   ├── usecase/                         # Các class thực thi UseCase cụ thể (Logic xử lý chính)
│   ├── port/                            # Interface định nghĩa Input/Output ports (nếu có tách biệt rõ)
│   └── mapper/                          # MapStruct Interface chuyển đổi Entity <-> DTO
├── infrastructure/                      # [INFRASTRUCTURE LAYER] Triển khai kỹ thuật (Adapters)
│   ├── configuration/                   # Config Beans (Security, JPA, Redis, Swagger...)
│   ├── persistence/                     # Impl của Repository (JPA Repository thực tế)
│   └── service/                         # Các service bên thứ 3 (S3Service, EmailService, VnpayService)
└── presentation/                        # [INTERFACE LAYER] Giao tiếp ra bên ngoài
    ├── controller/                      # REST Controllers (Nhận Request -> Gọi UseCase -> Trả Response)
    ├── request/                         # (Optional) Request Body objects
    ├── response/                        # Standard API Response wrapper
    └── advice/                          # Global Exception Handler
```

---

## 3. Kiến trúc & Design Patterns

*   **Architecture Pattern:**
    *   **Clean Architecture:** Luồng phụ thuộc hướng vào trong (Infrastructure -> Application -> Domain). Domain không phụ thuộc vào bất kỳ framework nào.
    *   **Layered Architecture (lỏng):** Presentation -> Application (UseCase) -> Domain/Infrastructure.

*   **Design Patterns Chính:**
    *   **Repository Pattern:** Ẩn chi tiết truy cập dữ liệu (Interface ở Domain, Impl ở Infrastructure).
    *   **DTO Pattern:** Sử dụng DTO cho mọi giao tiếp qua API, không expose Entity trực tiếp.
    *   **Builder Pattern:** Sử dụng Lombok `@Builder` cho việc khởi tạo object phức tạp.
    *   **Strategy Pattern:** Có thể sử dụng trong xử lý thanh toán (Payment Strategy) hoặc login (Auth Strategy).
    *   **Observer Pattern:** WebSocket sử dụng mô hình Pub/Sub cho real-time updates.

---

## 4. Luồng Nghiệp vụ Chính (Core Business Flow)

Luồng dữ liệu điển hình cho một request (Ví dụ: Tạo phiên đấu giá):

1.  **Presentation Layer:** `AuctionController` nhận HTTP POST request. Validate input cơ bản (`@Valid`).
2.  **Application Layer:** Controller gọi `CreateAuctionUseCase`.
    *   UseCase thực hiện validate nghiệp vụ (vd: thời gian bắt đầu < thời gian kết thúc).
    *   UseCase gọi `ProductRepository` để lấy thông tin xe.
3.  **Domain Layer:** UseCase khởi tạo Entity `Auction`. Entity đảm bảo tính toàn vẹn dữ liệu nội tại.
4.  **Infrastructure Layer:** UseCase gọi `AuctionRepository.save(auction)` để lưu xuống DB.
5.  **Response:** UseCase trả về `AuctionResponse` (qua MapStruct mapper). Controller bọc trong `ResponseEntity`.

**Luồng Real-time Bidding:**
1.  User gửi bid qua WebSocket `/app/bid`.
2.  Server xử lý bid trong `BidUseCase`:
    *   Kiểm tra số dư (Redis/DB).
    *   So sánh giá bid với giá hiện tại (Redis caching để nhanh).
3.  Nếu hợp lệ: **Update DB -> Publish `BidPlacedEvent` & `OutbidEvent` -> Listener nhận Event và phát sóng qua WebSocket / Lưu Notification vào DB**.
    *   *(Ghi chú: Việc áp dụng **Event-Driven Architecture** giúp tách biệt logic xử lý bid và thông báo, tăng khả năng mở rộng).*

---

## 5. Hệ thống API & Entry Points

*   **Endpoint Chính:** `http://localhost:8080/api/v1`
*   **Swagger UI:** `http://localhost:8080/swagger-ui/index.html` (Tài liệu chi tiết API).
*   **Các Controllers Quan trọng:**
    *   `AuthController`: Login, Register, Refresh Token.
    *   `AuctionController`: CRUD đấu giá, tìm kiếm.
    *   `BidController`: Xử lý đặt giá (fallback HTTP nếu WS lỗi).
    *   `PaymentController`: Tích hợp VNPay, nạp/rút tiền.
    *   `OrderController`: Xử lý đơn hàng sau khi thắng đấu giá.

*   **Main Class:** `com.example.vehicle_auction.VehicleAuctionApplication`

---

## 6. Cấu hình & Môi trường

*   **File Cấu hình:**
    *   `application.yaml`: Default config (App name, Profile).
    *   `application-dev.yaml`: Config môi trường Dev (DB Connection, Redis, Mail, S3/MinIO).
*   **Biến Môi trường (Cần lưu ý):**
    *   `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: Kết nối PostgreSQL.
    *   `MONGO_URI`: Kết nối MongoDB.
    *   `REDIS_HOST`: Kết nối Redis.
    *   `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`: Cấu hình gửi mail.
    *   AWS S3 Keys (hoặc MinIO): `access-key`, `secret-key`.

---

## 7. Trạng thái Hiện tại & Hướng phát triển

**Đã hoàn thành:**
*   Hệ thống Authentication (JWT).
*   Cấu trúc dự án Clean Architecture chuẩn.
*   Database Migration cơ bản (Tables: Users, Auctions, Bids...).
*   CRUD cơ bản cho Xe và Phiên đấu giá.
*   **Tích hợp thanh toán VNPAY:** Nạp tiền và Hoàn tiền (Lưu ý: Môi trường Sandbox VNPAY yêu cầu quyết toán T+1 mới cho phép hoàn tiền).

**Vấn đề Kỹ thuật còn tồn đọng:**
*   *(Hiện tại chưa có vấn đề nghiêm trọng - Code VNPAY đã ổn định).*

**Hướng phát triển (TODOs):**
1.  **Hoàn thiện Real-time:** Đảm bảo WebSocket handle được lượng connection lớn (cân nhắc dùng Redis Pub/Sub backplane nếu scale nhiều instances).
2.  **Tối ưu Query:** Review các query JPA, tránh N+1 problem khi load danh sách đấu giá kèm hình ảnh.
3.  **Unit Tests:** Bổ sung test case cho các luồng thanh toán và đấu giá quan trọng (`src/test/java`).

---
