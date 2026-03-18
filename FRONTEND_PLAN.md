# Kế hoạch Xây dựng Frontend cho Vehicle Auction System

## 1. Tổng quan Dự án
Dự án "Vehicle Auction System" là nền tảng đấu giá xe trực tuyến thời gian thực. Frontend (FE) sẽ đóng vai trò là giao diện người dùng chính, kết nối với Backend API (Java Spring Boot) để cung cấp các chức năng xem, đấu giá, quản lý tài khoản và giao dịch.

## 2. Tech Stack Hiện tại

Dựa trên cấu hình hiện tại của dự án, dưới đây là Tech Stack đang được sử dụng:

*   **Framework chính:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (Client-side rendering SPA).
*   **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) (Đảm bảo type-safety khi làm việc với DTO phức tạp từ API).
*   **State Management:**
    *   **Global State (Client):** [Redux Toolkit](https://redux-toolkit.js.org/) kết hợp `react-redux` - Xử lý global state (auth, dữ liệu toàn cục,...).
*   **Data Fetching & API:** [Axios](https://axios-http.com/).
*   **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) (Validation schema).
*   **Routing:** [React Router v7](https://reactrouter.com/) (`react-router-dom`).
*   **Đa ngôn ngữ (i18n):** [i18next](https://www.i18next.com/) + `react-i18next` cùng browser language detector.
*   **Date Utils:** [date-fns](https://date-fns.org/).
*   **Build Tool & Code Quality:** Vite, ESLint, TypeScript.

## 3. Cấu trúc Dự án (Current Structure)

Cấu trúc thư mục hiện tại theo kiến trúc feature-based kết hợp phân lớp chuẩn:

```
frontend/
├── public/                 # Static assets (images, fonts, favicon)
├── src/
│   ├── api/                # Cấu hình Axios instance, interceptors và api calls
│   ├── components/         # Reusable UI components (Button, Input, UI modules...)
│   ├── features/           # Domain/Feature-based logic & components (Auth, Auction...)
│   ├── hooks/              # Custom React hooks (dùng chung ngoài các feature)
│   ├── i18n/               # Cấu hình đa ngôn ngữ (translation json files & setup i18next)
│   ├── layouts/            # Page layouts (MainLayout, AuthLayout, AdminLayout...)
│   ├── pages/              # Các trang chính ứng với React Router, ghép nối feature/component vào layout
│   ├── routes/             # Cấu hình routing cho ứng dụng
│   ├── store/              # State management utilities (Redux slices, global store config)
│   ├── styles/             # Global styles, css modules hoặc biến
│   ├── types/              # TypeScript interfaces/types toàn cục
│   ├── utils/              # Helper functions (date formatting, currency, validation...)
│   ├── App.tsx             # Root component (Providers)
│   ├── main.tsx            # Application entry point
│   └── index.css           # Cấu hình style/reset chung
├── .env.example            # Biến môi trường mẫu
├── package.json
├── vite.config.ts          # Cấu hình Vite
├── eslint.config.js        # Cấu hình ESLint (Flat config)
└── tsconfig*.json          # Cấu hình TypeScript
```

## 4. Các Màn hình & Chức năng Chính (Dựa trên API)

### 4.1. Phân hệ Public (Khách & Người dùng)
*   **Trang chủ (Home):**
    *   Hiển thị các phiên đấu giá nổi bật (Featured Auctions).
    *   Tìm kiếm & Lọc xe (Theo hãng, loại xe, giá, năm sản xuất...).
    *   API: `GET /api/public/auctions`, `GET /api/public/categories`.
*   **Trang Chi tiết Đấu giá (Auction Detail):**
    *   Thông tin chi tiết xe, thư viện ảnh (Slider).
    *   Thông tin phiên đấu giá: Giá khởi điểm, bước giá, thời gian còn lại (Countdown timer).
    *   **Khu vực Đấu giá (Real-time):**
        *   Hiển thị giá hiện tại, người giữ giá cao nhất.
        *   Form đặt giá (Cần đăng nhập).
        *   Lịch sử đấu giá (Real-time update qua WebSocket).
    *   API: `GET /api/public/auctions/{id}`, `WS /topic/auction/{id}`.
*   **Trang Danh sách Sản phẩm:** Grid/List view các xe đang được đấu giá.

### 4.2. Phân hệ Authentication
*   **Đăng nhập / Đăng ký:** Form Login, Register.
*   **Quên mật khẩu / Reset Password:** Quy trình gửi email và đặt lại mật khẩu.
*   **Xác thực:** Lưu trữ Access Token (JWT) trong localStorage/HttpOnly Cookie.
*   API: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/forgot-password`.

### 4.3. Phân hệ User (Yêu cầu đăng nhập)
*   **Dashboard Cá nhân:** Tổng quan số dư, số xe đang đấu giá, thông báo mới.
*   **Quản lý Hồ sơ (Profile):** Cập nhật thông tin cá nhân, đổi mật khẩu, xác thực danh tính (KYC).
*   **Ví tiền & Nạp tiền (Wallet/Deposit):**
    *   Xem số dư hiện tại.
    *   Nạp tiền qua VNPay (Tích hợp payment gateway).
    *   Lịch sử giao dịch.
    *   API: `POST /api/deposits`, `GET /api/transactions`.
*   **Lịch sử Đấu giá (My Bids):** Các phiên đã tham gia, trạng thái (Thắng/Thua).
*   **Danh sách Quan tâm (Watchlist):** Các xe đã lưu lại.
*   **Đơn hàng & Checkout (Orders):**
    *   Danh sách xe chiến thắng đấu giá.
    *   **Màn hình Checkout:** Bắt buộc điền **Thông tin giao hàng (Shipping Address, Phone)** trước khi thanh toán.
    *   Tương tác với `CheckoutOrderUseCase` để cập nhật thông tin đơn hàng.

### 4.4. Phân hệ Admin
*   **Dashboard:** Thống kê tổng quan (User, Revenue, Auctions).
*   **Quản lý Người dùng:** Danh sách User, Phân quyền (Role/Permission), Khóa/Mở khóa.
*   **Quản lý Xe & Danh mục:** Thêm/Sửa/Xóa xe, Upload ảnh, Quản lý danh mục.
*   **Quản lý Đấu giá:** Tạo phiên đấu giá, Duyệt đấu giá, Hủy phiên.
*   **Quản lý Giao dịch:** Duyệt nạp/rút tiền (nếu có thủ công), Xem lịch sử thanh toán.

## 5. Tích hợp API & WebSocket

### 5.1. Cấu hình Axios
*   Tạo Axios Instance với `baseURL` trỏ tới `/api/v1`.
*   Sử dụng Interceptors để tự động đính kèm `Authorization: Bearer <token>` vào header của mỗi request.
*   Xử lý lỗi 401 (Unauthorized) tự động logout hoặc refresh token.

### 5.2. WebSocket (Real-time Bidding)
*   Sử dụng thư viện tương thích với Spring Boot WebSocket (VD: `@stomp/stompjs` hoặc `sockjs-client`).
*   Khi vào trang chi tiết đấu giá:
    *   Subscribe vào topic: `/topic/auction/{auctionId}` để nhận update giá mới nhất.
    *   Gửi bid qua endpoint: `/app/chat.sendMessage` (hoặc tương đương theo config BE).
*   Xử lý hiển thị thông báo "Bạn đã bị vượt giá!" ngay lập tức.

### 5.3. Quy trình Thanh toán & Checkout

#### A. Flow Nạp tiền (Deposit)
1.  User chọn số tiền nạp -> Gọi API `POST /api/payments/create`.
2.  Nhận URL redirect -> Chuyển hướng sang VNPay.
3.  Thanh toán xong -> VNPay redirect về URL Frontend (Callback).

#### B. Flow Thanh toán Đơn hàng (Checkout Order)
1.  User chọn xe đã thắng đấu giá -> Nhấn "Checkout".
2.  **Quan trọng:** Hiển thị Form điền **Thông tin giao hàng (Shipping Address)**.
3.  Validate form -> Gọi API Checkout (để lưu Shipping Info & tạo Payment Link).
4.  Redirect sang VNPay (hoặc trừ tiền ví) -> Hoàn tất đơn hàng.

## 6. Lộ trình Triển khai (Phasing)

### Phase 1: Core Foundation & Public View
*   Setup dự án, cấu hình Routing, Axios, Tailwind.
*   Build Layouts (Header, Footer, Sidebar).
*   Trang Home, Danh sách xe, Chi tiết xe (Static data -> API integration).
*   Chức năng Đăng nhập/Đăng ký cơ bản.

### Phase 2: User Features & Bidding Logic
*   Tích hợp WebSocket cho Real-time bidding.
*   Chức năng đặt giá (Bid placement).
*   Trang Profile, Lịch sử đấu giá.
*   Quản lý Watchlist.

### Phase 3: Admin & Seller Portals
*   Xây dựng Admin Dashboard, User Management.
*   Seller Dashboard & Quản lý xe.
*   Cơ chế Upload ảnh tự động (`/files/upload`) cho chức năng Đăng ký xe.

### Phase 4: Order Management & User Engagement
*   Khung hiển thị và Quản lý Đơn hàng cho người thắng đấu giá (`/orders/my-orders`).
*   Quản lý danh sách yệu thích Watchlist.
*   Hệ thống chuông Thông báo Real-time (Notifications).

### Phase 5: Advanced Admin Control & Finalization
*   Xét duyệt xe (Admin Approve/Reject Vehicle).
*   Quản lý danh mục (Category CRUD).
*   Kiểm soát phiên đấu giá toàn hệ thống (Hủy, Thêm, Quản trị rủi ro).
*   Hoàn thiện Error Handling toàn cầu và kết nối API thực tế cho Payments.

---
**Lưu ý:**
*   Tham khảo Swagger UI tại `http://localhost:8080/swagger-ui/index.html` (khi chạy backend) để biết chính xác cấu trúc Request/Response.
*   Đảm bảo xử lý validation kỹ càng ở phía client để giảm tải cho server.

