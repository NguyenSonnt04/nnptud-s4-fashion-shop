# BÁO CÁO ĐỒ ÁN

## XÂY DỰNG WEBSITE SHOP THỜI TRANG

---

**Trường:** _{{Tên trường}}_
**Khoa:** _{{Tên khoa}}_
**Môn học:** _{{Tên môn đầy đủ — NNPTUD}}_
**Lớp:** _{{Tên lớp}}_
**Học kỳ:** _{{Học kỳ - Năm học}}_
**Giảng viên hướng dẫn:** _{{Họ tên GVHD}}_

**Nhóm thực hiện:**

| STT | Họ và tên | MSSV | Vai trò |
|---|---|---|---|
| 1 | _{{Tên thành viên 1}}_ | _{{MSSV}}_ | _{{Nhóm trưởng / ...}}_ |
| 2 | _{{Tên thành viên 2}}_ | _{{MSSV}}_ | _{{...}}_ |
| 3 | _{{Tên thành viên 3}}_ | _{{MSSV}}_ | _{{...}}_ |

---

## MỤC LỤC

1. [Giới thiệu đề tài](#1-giới-thiệu-đề-tài)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Cấu trúc dự án](#3-cấu-trúc-dự-án)
4. [Danh sách chức năng](#4-danh-sách-chức-năng)
5. [Chi tiết API & Demo Postman](#5-chi-tiết-api--demo-postman)
   - [5.1. Module Index (Home & Chat)](#51-module-index-home--chat)
   - [5.2. Module Auth (Xác thực)](#52-module-auth-xác-thực)
   - [5.3. Module Users (Người dùng)](#53-module-users-người-dùng)
   - [5.4. Module Roles (Phân quyền)](#54-module-roles-phân-quyền)
   - [5.5. Module Categories (Danh mục)](#55-module-categories-danh-mục)
   - [5.6. Module Products (Sản phẩm)](#56-module-products-sản-phẩm)
   - [5.7. Module Carts (Giỏ hàng)](#57-module-carts-giỏ-hàng)
   - [5.8. Module Upload (Tải file)](#58-module-upload-tải-file)
   - [5.9. Module Messages (Tin nhắn)](#59-module-messages-tin-nhắn)
6. [Kết luận](#6-kết-luận)

---

## 1. GIỚI THIỆU ĐỀ TÀI

- **Tên đề tài:** Xây dựng Website Shop Thời Trang
- **Mô tả:** Hệ thống backend API cho website bán quần áo thời trang, cung cấp đầy đủ các chức năng quản lý người dùng, sản phẩm, danh mục, giỏ hàng, đơn hàng, upload hình ảnh/excel và chat thời gian thực giữa các người dùng.
- **Đối tượng sử dụng:** Khách hàng (USER), Quản trị viên (ADMIN), Kiểm duyệt viên (MODERATOR).
- **Repository:** `https://github.com/NguyenSonnt04/nnptud-s4-fashion-shop`

---

## 2. CÔNG NGHỆ SỬ DỤNG

| Công nghệ | Vai trò |
|---|---|
| **Node.js + Express 4** | Web framework |
| **MongoDB + Mongoose 9** | Cơ sở dữ liệu NoSQL + ODM |
| **JWT (jsonwebtoken)** | Xác thực token |
| **bcrypt** | Mã hóa mật khẩu |
| **express-validator** | Validate input |
| **Multer** | Upload file |
| **ExcelJS** | Đọc file Excel |
| **Socket.IO** | Chat realtime |
| **slugify** | Tạo slug URL-friendly |
| **cookie-parser** | Quản lý cookie |
| **Postman** | Test API |

---

## 3. CẤU TRÚC DỰ ÁN

```
ShopThoiTrang/
├── client/                     # Frontend UI (đang phát triển)
├── server/                     # Backend API
│   ├── app.js                  # Entry point Express
│   ├── bin/www                 # Server bootstrap
│   ├── controllers/            # Business logic
│   │   └── users.js
│   ├── routes/                 # Route handlers
│   │   ├── auth.js
│   │   ├── carts.js
│   │   ├── categories.js
│   │   ├── index.js
│   │   ├── messages.js
│   │   ├── products.js
│   │   ├── roles.js
│   │   ├── upload.js
│   │   └── users.js
│   ├── schemas/                # Mongoose schemas
│   │   ├── carts.js
│   │   ├── categories.js
│   │   ├── inventories.js
│   │   ├── messages.js
│   │   ├── payments.js
│   │   ├── products.js
│   │   ├── reservation.js
│   │   ├── roles.js
│   │   └── users.js
│   ├── utils/                  # Middleware & helpers
│   │   ├── SocketHandler.js
│   │   ├── authHandler.js
│   │   ├── uploadHandler.js
│   │   └── validateHandler.js
│   ├── resources/              # Static HTML files
│   ├── uploads/                # Uploaded files
│   └── package.json
├── CLAUDE.md                   # Coding rules
├── MODELS.md                   # Data models docs
├── BAOCAO.md                   # Báo cáo đồ án
└── .gitignore
```

**Prefix API:** tất cả endpoint đều có tiền tố `/api/v1/{resource}` (trừ route trang chủ).

**Cơ sở dữ liệu:** MongoDB, database `db_ecommerce`, kết nối tại `mongodb://localhost:27017/db_ecommerce`.

---

## 4. DANH SÁCH CHỨC NĂNG

Tổng cộng **41 endpoints** chia làm **9 module**:

| STT | Module | Số endpoint | Chức năng chính |
|---|---|---|---|
| 1 | Index | 2 | Trang chủ, trang chat |
| 2 | Auth | 7 | Đăng ký, đăng nhập, quên mật khẩu, đổi mật khẩu, xem thông tin user hiện tại |
| 3 | Users | 5 | CRUD người dùng (admin) |
| 4 | Roles | 5 | CRUD vai trò phân quyền |
| 5 | Categories | 5 | CRUD danh mục sản phẩm |
| 6 | Products | 5 | CRUD sản phẩm + filter theo tên, giá |
| 7 | Carts | 5 | Xem, thêm, xóa, giảm, sửa số lượng giỏ hàng |
| 8 | Upload | 4 | Upload 1 file, nhiều file, file excel, xem file |
| 9 | Messages | 3 | Gửi tin nhắn, xem lịch sử chat, chat realtime qua Socket.IO |

**Ký hiệu middleware trong bảng:**

- 🔓 **Public** — không cần đăng nhập
- 🔒 **CheckLogin** — phải đăng nhập
- 👑 **CheckRole(ADMIN)** — phải có role ADMIN
- 👮 **CheckRole(ADMIN, MODERATOR)** — phải có role ADMIN hoặc MODERATOR
- ✅ **Validator** — có middleware validate input

---

## 5. CHI TIẾT API & DEMO POSTMAN

> **Ghi chú:** Tất cả screenshot Postman được chèn ngay dưới phần mô tả của từng API. Các ảnh được lưu tại folder `./images/` theo quy ước tên file `{module}_{tên_api}.png`.

### 5.1. Module Index (Home & Chat)

#### 5.1.1. GET `/`

- **Chức năng:** Trang chủ — render view EJS `index`.
- **Middleware:** 🔓 Public
- **Response:** HTML page với tiêu đề "Express"

**Hình 5.1.1**: Truy cập trang chủ
![Hình 5.1.1](./images/index_home.png)

---

#### 5.1.2. GET `/chat`

- **Chức năng:** Trả về trang chat HTML tĩnh (`resources/chat.html`) — dùng cho client Socket.IO.
- **Middleware:** 🔓 Public
- **Response:** HTML file chat.html

**Hình 5.1.2**: Trang chat realtime
![Hình 5.1.2](./images/index_chat.png)

---

### 5.2. Module Auth (Xác thực)

Base URL: `/api/v1/auth`

#### 5.2.1. POST `/api/v1/auth/register`

- **Chức năng:** Đăng ký tài khoản mới. Khi đăng ký thành công, **tự động tạo giỏ hàng** cho user bằng MongoDB transaction (rollback nếu fail).
- **Middleware:** 🔓 Public
- **Request body:**
  ```json
  {
    "username": "user01",
    "password": "User@12345",
    "email": "user01@gmail.com"
  }
  ```
- **Response thành công:** thông tin `cart` đã được populate với `user`.
- **Response lỗi:** `404` — thông báo lỗi (trùng username, email, v.v.)

**Hình 5.2.1**: Đăng ký tài khoản mới
![Hình 5.2.1](./images/auth_register.png)

---

#### 5.2.2. POST `/api/v1/auth/login`

- **Chức năng:** Đăng nhập bằng `username` + `password`. Trả về JWT token (expire 1h) + set cookie `NNPTUD_S4` (30 ngày).
- **Cơ chế bảo mật:**
  - Sai password 3 lần → khóa tài khoản 1 giờ (`lockTime`).
  - Kiểm tra `lockTime` trước khi cho đăng nhập.
- **Middleware:** 🔓 Public
- **Request body:**
  ```json
  {
    "username": "user01",
    "password": "User@12345"
  }
  ```
- **Response thành công:** JWT token (string).
- **Response lỗi:** `404` + message `"thong tin dang nhap sai"` hoặc `"ban dang bi ban"`.

**Hình 5.2.2**: Đăng nhập thành công, trả về token
![Hình 5.2.2](./images/auth_login.png)

**Hình 5.2.2b**: Đăng nhập sai mật khẩu
![Hình 5.2.2b](./images/auth_login_fail.png)

---

#### 5.2.3. GET `/api/v1/auth/me`

- **Chức năng:** Lấy thông tin user hiện tại từ JWT token (Bearer header hoặc cookie).
- **Middleware:** 🔒 CheckLogin
- **Headers:** `Authorization: Bearer {token}`
- **Response:** thông tin user đã populate `role`.

**Hình 5.2.3**: Lấy thông tin user hiện tại
![Hình 5.2.3](./images/auth_me.png)

---

#### 5.2.4. POST `/api/v1/auth/logout`

- **Chức năng:** Đăng xuất — xóa cookie `NNPTUD_S4`.
- **Middleware:** 🔒 CheckLogin
- **Response:** `{ "message": "logout" }`

**Hình 5.2.4**: Đăng xuất
![Hình 5.2.4](./images/auth_logout.png)

---

#### 5.2.5. GET `/api/v1/auth/changepassword`

- **Chức năng:** Đổi mật khẩu. So sánh `oldpassword` với mật khẩu hiện tại, nếu đúng thì cập nhật `newpassword`.
- **Middleware:** 🔒 CheckLogin + ✅ `ChangePasswordValidator` + `validatedResult`
- **Request body:**
  ```json
  {
    "oldpassword": "User@12345",
    "newpassword": "NewPass@123"
  }
  ```
- **Response:** `{ "message": "da cap nhat" }` hoặc `{ "message": "old password k dung" }`.

**Hình 5.2.5**: Đổi mật khẩu
![Hình 5.2.5](./images/auth_changepassword.png)

---

#### 5.2.6. POST `/api/v1/auth/forgotpassword`

- **Chức năng:** Quên mật khẩu. Tạo token random 32 bytes (hex) lưu vào `forgotPasswordToken`, hết hạn sau 10 phút. Token được log ra console dưới dạng URL reset.
- **Middleware:** 🔓 Public
- **Request body:**
  ```json
  { "email": "user01@gmail.com" }
  ```
- **Response:** `{ "message": "check mail" }`

**Hình 5.2.6**: Yêu cầu quên mật khẩu
![Hình 5.2.6](./images/auth_forgotpassword.png)

---

#### 5.2.7. POST `/api/v1/auth/resetpassword/:token`

- **Chức năng:** Đặt lại mật khẩu bằng token nhận được. Kiểm tra token còn hiệu lực, nếu đúng thì update `password` và xóa token.
- **Middleware:** 🔓 Public
- **URL param:** `:token` — token nhận từ bước forgot password.
- **Request body:**
  ```json
  { "password": "NewPass@123" }
  ```
- **Response:** `{ "message": "update thanh cong" }`

**Hình 5.2.7**: Đặt lại mật khẩu với token
![Hình 5.2.7](./images/auth_resetpassword.png)

---

### 5.3. Module Users (Người dùng)

Base URL: `/api/v1/users`

#### 5.3.1. GET `/api/v1/users`

- **Chức năng:** Lấy danh sách tất cả user chưa bị xóa (soft delete).
- **Middleware:** 🔒 CheckLogin + 👑 CheckRole("ADMIN")
- **Response:** `[ { ...user1 }, { ...user2 }, ... ]`

**Hình 5.3.1**: Lấy danh sách users (chỉ ADMIN)
![Hình 5.3.1](./images/users_getall.png)

---

#### 5.3.2. GET `/api/v1/users/:id`

- **Chức năng:** Lấy thông tin user theo ID.
- **Middleware:** 🔒 CheckLogin + 👮 CheckRole("ADMIN", "MODERATOR")
- **URL param:** `:id` — ObjectId của user.
- **Response:** thông tin user hoặc `{ "message": "id not found" }`.

**Hình 5.3.2**: Lấy user theo ID
![Hình 5.3.2](./images/users_getbyid.png)

---

#### 5.3.3. POST `/api/v1/users`

- **Chức năng:** Tạo user mới (dành cho admin thêm tài khoản).
- **Middleware:** ✅ `CreateAnUserValidator` + `validatedResult`
- **Request body:**
  ```json
  {
    "username": "admin01",
    "password": "Admin@12345",
    "email": "admin@gmail.com",
    "role": "69b0ddec842e41e8160132b8",
    "fullName": "Nguyen Van A",
    "avatarUrl": "https://i.sstatic.net/l60Hf.png"
  }
  ```
- **Validate:**
  - `username`: không rỗng, chỉ chứa ký tự alphanumeric.
  - `email`: không rỗng, đúng định dạng email.
  - `password`: ít nhất 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt.
  - `role`: ObjectId hợp lệ.
  - `avatarUrl`: URL hợp lệ (optional).

**Hình 5.3.3**: Tạo user mới
![Hình 5.3.3](./images/users_create.png)

**Hình 5.3.3b**: Lỗi validation khi input không hợp lệ
![Hình 5.3.3b](./images/users_create_fail.png)

---

#### 5.3.4. PUT `/api/v1/users/:id`

- **Chức năng:** Cập nhật thông tin user. **Không được đổi** `username` và `email`.
- **Middleware:** ✅ `ModifyAnUser` + `validatedResult`
- **Request body:** bất kỳ field nào cần update (trừ username, email).

**Hình 5.3.4**: Cập nhật thông tin user
![Hình 5.3.4](./images/users_update.png)

---

#### 5.3.5. DELETE `/api/v1/users/:id`

- **Chức năng:** Soft delete user (set `isDeleted: true`).
- **Middleware:** 🔓 (không có — có thể bổ sung sau)
- **Response:** thông tin user đã cập nhật.

**Hình 5.3.5**: Xóa user (soft delete)
![Hình 5.3.5](./images/users_delete.png)

---

### 5.4. Module Roles (Phân quyền)

Base URL: `/api/v1/roles`

#### 5.4.1. GET `/api/v1/roles`

- **Chức năng:** Lấy tất cả role chưa bị xóa.
- **Middleware:** 🔓 Public
- **Response:** `[ { _id, name, description, ... }, ... ]`

**Hình 5.4.1**: Danh sách roles
![Hình 5.4.1](./images/roles_getall.png)

---

#### 5.4.2. GET `/api/v1/roles/:id`

- **Chức năng:** Lấy role theo ID.
- **Middleware:** 🔓 Public
- **Response:** thông tin role hoặc `{ "message": "id not found" }`.

**Hình 5.4.2**: Lấy role theo ID
![Hình 5.4.2](./images/roles_getbyid.png)

---

#### 5.4.3. POST `/api/v1/roles`

- **Chức năng:** Tạo role mới (ADMIN, USER, MODERATOR, ...).
- **Request body:**
  ```json
  {
    "name": "ADMIN",
    "description": "Quan tri vien"
  }
  ```

**Hình 5.4.3**: Tạo role mới
![Hình 5.4.3](./images/roles_create.png)

---

#### 5.4.4. PUT `/api/v1/roles/:id`

- **Chức năng:** Cập nhật role.

**Hình 5.4.4**: Cập nhật role
![Hình 5.4.4](./images/roles_update.png)

---

#### 5.4.5. DELETE `/api/v1/roles/:id`

- **Chức năng:** Soft delete role.

**Hình 5.4.5**: Xóa role
![Hình 5.4.5](./images/roles_delete.png)

---

### 5.5. Module Categories (Danh mục)

Base URL: `/api/v1/categories`

#### 5.5.1. GET `/api/v1/categories`

- **Chức năng:** Lấy tất cả danh mục chưa bị xóa.
- **Middleware:** 🔓 Public

**Hình 5.5.1**: Danh sách danh mục
![Hình 5.5.1](./images/categories_getall.png)

---

#### 5.5.2. GET `/api/v1/categories/:id`

- **Chức năng:** Lấy danh mục theo ID.

**Hình 5.5.2**: Lấy danh mục theo ID
![Hình 5.5.2](./images/categories_getbyid.png)

---

#### 5.5.3. POST `/api/v1/categories`

- **Chức năng:** Tạo danh mục mới. `slug` được tự động sinh từ `name` bằng `slugify` (lowercase, dấu `-` thay khoảng trắng).
- **Request body:**
  ```json
  {
    "name": "Ao Thun",
    "image": "https://example.com/ao-thun.jpg"
  }
  ```
- **Ví dụ slug sinh tự động:** `"Ao Thun"` → `"ao-thun"`.

**Hình 5.5.3**: Tạo danh mục mới
![Hình 5.5.3](./images/categories_create.png)

---

#### 5.5.4. PUT `/api/v1/categories/:id`

- **Chức năng:** Cập nhật danh mục.

**Hình 5.5.4**: Cập nhật danh mục
![Hình 5.5.4](./images/categories_update.png)

---

#### 5.5.5. DELETE `/api/v1/categories/:id`

- **Chức năng:** Soft delete danh mục.

**Hình 5.5.5**: Xóa danh mục
![Hình 5.5.5](./images/categories_delete.png)

---

### 5.6. Module Products (Sản phẩm)

Base URL: `/api/v1/products`

#### 5.6.1. GET `/api/v1/products`

- **Chức năng:** Lấy danh sách sản phẩm, hỗ trợ **filter** qua query string.
- **Query params:**
  - `title` — tìm theo tên (regex, không phân biệt hoa thường).
  - `minprice` — giá tối thiểu (mặc định 0).
  - `maxprice` — giá tối đa (mặc định 10000).
- **Ví dụ:** `GET /api/v1/products?title=ao&minprice=100&maxprice=500`
- **Response:** mảng sản phẩm kèm thông tin category (populate).

**Hình 5.6.1**: Lấy danh sách sản phẩm có filter
![Hình 5.6.1](./images/products_getall.png)

---

#### 5.6.2. GET `/api/v1/products/:id`

- **Chức năng:** Lấy chi tiết sản phẩm theo ID.
- **Response:** thông tin sản phẩm hoặc `"ID NOT FOUND"`.

**Hình 5.6.2**: Chi tiết sản phẩm
![Hình 5.6.2](./images/products_getbyid.png)

---

#### 5.6.3. POST `/api/v1/products`

- **Chức năng:** Tạo sản phẩm mới. Sử dụng **MongoDB transaction** — tạo `product` và `inventory` (tồn kho = 0) cùng lúc, rollback nếu 1 trong 2 fail.
- **Request body:**
  ```json
  {
    "title": "Ao thun nam tron",
    "price": 150000,
    "description": "Ao thun cotton 100%",
    "images": ["https://example.com/img1.jpg"],
    "category": "{{category_id}}"
  }
  ```
- **Lưu ý:** `slug` tự động sinh từ `title`. `sku` phải unique.

**Hình 5.6.3**: Tạo sản phẩm mới (kèm tạo inventory)
![Hình 5.6.3](./images/products_create.png)

---

#### 5.6.4. PUT `/api/v1/products/:id`

- **Chức năng:** Cập nhật thông tin sản phẩm.

**Hình 5.6.4**: Cập nhật sản phẩm
![Hình 5.6.4](./images/products_update.png)

---

#### 5.6.5. DELETE `/api/v1/products/:id`

- **Chức năng:** Soft delete sản phẩm.

**Hình 5.6.5**: Xóa sản phẩm
![Hình 5.6.5](./images/products_delete.png)

---

### 5.7. Module Carts (Giỏ hàng)

Base URL: `/api/v1/carts`

**Đặc điểm:** Tất cả API cart đều yêu cầu đăng nhập. Mỗi user có **duy nhất 1 cart** (được tạo tự động khi register). Giỏ hàng **kiểm tra tồn kho** (`inventory.stock`) trước khi add/increase.

#### 5.7.1. GET `/api/v1/carts`

- **Chức năng:** Lấy giỏ hàng của user đang đăng nhập.
- **Middleware:** 🔒 CheckLogin
- **Response:** danh sách `products` trong cart (`[{ product, quantity }]`).

**Hình 5.7.1**: Xem giỏ hàng
![Hình 5.7.1](./images/carts_get.png)

---

#### 5.7.2. POST `/api/v1/carts/add`

- **Chức năng:** Thêm sản phẩm vào giỏ. Nếu sản phẩm đã có → tăng `quantity` lên 1. Kiểm tra tồn kho trước.
- **Middleware:** 🔒 CheckLogin
- **Request body:**
  ```json
  { "product": "{{product_id}}" }
  ```
- **Lỗi:**
  - `404` `"san pham khong ton tai"` — nếu product không có trong inventory.
  - `404` `"ton kho khong du"` — nếu stock không đủ.

**Hình 5.7.2**: Thêm sản phẩm vào giỏ
![Hình 5.7.2](./images/carts_add.png)

**Hình 5.7.2b**: Lỗi khi tồn kho không đủ
![Hình 5.7.2b](./images/carts_add_fail.png)

---

#### 5.7.3. POST `/api/v1/carts/remove`

- **Chức năng:** Xóa hoàn toàn sản phẩm khỏi giỏ.
- **Middleware:** 🔒 CheckLogin
- **Request body:**
  ```json
  { "product": "{{product_id}}" }
  ```

**Hình 5.7.3**: Xóa sản phẩm khỏi giỏ
![Hình 5.7.3](./images/carts_remove.png)

---

#### 5.7.4. POST `/api/v1/carts/decrease`

- **Chức năng:** Giảm `quantity` của 1 sản phẩm đi 1. Nếu còn 1 → xóa khỏi giỏ.
- **Middleware:** 🔒 CheckLogin

**Hình 5.7.4**: Giảm số lượng sản phẩm
![Hình 5.7.4](./images/carts_decrease.png)

---

#### 5.7.5. POST `/api/v1/carts/modify`

- **Chức năng:** Đặt lại `quantity` cho 1 sản phẩm. Nếu set = 0 → xóa khỏi giỏ.
- **Middleware:** 🔒 CheckLogin
- **Request body:**
  ```json
  {
    "product": "{{product_id}}",
    "quantity": 5
  }
  ```

**Hình 5.7.5**: Sửa số lượng sản phẩm trong giỏ
![Hình 5.7.5](./images/carts_modify.png)

---

### 5.8. Module Upload (Tải file)

Base URL: `/api/v1/upload`

**Cấu hình multer:**
- Thư mục lưu: `uploads/`
- Tên file: `{timestamp}-{random}.{ext}`
- Giới hạn: 5MB
- Filter image: MIME type bắt đầu bằng `image`
- Filter excel: MIME type chứa `spreadsheetml.sheet` (`.xlsx`)

#### 5.8.1. GET `/api/v1/upload/:filename`

- **Chức năng:** Trả về file đã upload theo tên.
- **URL param:** `:filename` — tên file trong thư mục `uploads/`.

**Hình 5.8.1**: Xem file đã upload
![Hình 5.8.1](./images/upload_get.png)

---

#### 5.8.2. POST `/api/v1/upload/one_file`

- **Chức năng:** Upload 1 file ảnh.
- **Request:** `form-data`, field `file` (type: File).
- **Response:**
  ```json
  {
    "filename": "1774672141097-591482056.jpg",
    "path": "uploads\\1774672141097-591482056.jpg",
    "size": 123456
  }
  ```

**Hình 5.8.2**: Upload 1 file ảnh
![Hình 5.8.2](./images/upload_one_file.png)

---

#### 5.8.3. POST `/api/v1/upload/multiple_file`

- **Chức năng:** Upload nhiều file ảnh cùng lúc.
- **Request:** `form-data`, field `files` (multiple files).

**Hình 5.8.3**: Upload nhiều file ảnh
![Hình 5.8.3](./images/upload_multiple_file.png)

---

#### 5.8.4. POST `/api/v1/upload/excel`

- **Chức năng:** Upload file Excel `.xlsx` để **import sản phẩm hàng loạt**.
- **Cơ chế:**
  - Đọc file bằng `exceljs`, lấy worksheet đầu tiên.
  - Lấy danh sách categories và products hiện có để kiểm tra.
  - Chia row thành **batch 50**, mỗi batch dùng 1 MongoDB transaction.
  - Mỗi row validate: price > 0, stock > 0, category tồn tại, title/sku không trùng.
  - Insert bằng `insertMany` để tăng hiệu năng.
- **Định dạng file excel:**

  | SKU | Title | Category | Price | Stock |
  |---|---|---|---|---|
  | AO001 | Ao thun nam | Ao Thun | 150000 | 50 |
  | QJ001 | Quan jeans nam | Quan Jeans | 350000 | 30 |

- **Response:** mảng kết quả từng row (sản phẩm hợp lệ hoặc mảng lỗi).

**Hình 5.8.4**: Upload excel import sản phẩm hàng loạt
![Hình 5.8.4](./images/upload_excel.png)

---

### 5.9. Module Messages (Tin nhắn)

Base URL: `/api/v1/messages`

**Đặc điểm:**
- Hệ thống chat 1-1 giữa các user.
- Hỗ trợ tin nhắn **text** và **file** (ảnh đính kèm).
- Tích hợp **Socket.IO** để chat realtime (xem mục Socket bên dưới).

#### 5.9.1. GET `/api/v1/messages`

- **Chức năng:** Lấy danh sách các cuộc trò chuyện của user hiện tại — mỗi cuộc trò chuyện là tin nhắn **mới nhất** với 1 người khác.
- **Middleware:** 🔒 CheckLogin
- **Response:**
  ```json
  [
    { "user": "{{user_id_khác}}", "message": { ... tin nhắn mới nhất ... } },
    ...
  ]
  ```

**Hình 5.9.1**: Danh sách cuộc trò chuyện
![Hình 5.9.1](./images/messages_conversations.png)

---

#### 5.9.2. GET `/api/v1/messages/:userid`

- **Chức năng:** Lấy toàn bộ lịch sử chat giữa user hiện tại và user `:userid`. Sắp xếp mới nhất trước.
- **Middleware:** 🔒 CheckLogin
- **Response:** mảng tin nhắn đã populate `from` và `to`.

**Hình 5.9.2**: Lịch sử chat với 1 user
![Hình 5.9.2](./images/messages_history.png)

---

#### 5.9.3. POST `/api/v1/messages`

- **Chức năng:** Gửi tin nhắn đến user khác. Hỗ trợ cả text và file ảnh.
- **Middleware:** 🔒 CheckLogin + `uploadImage.single('file')`
- **Request (form-data):**
  - `to` — ObjectId của user nhận.
  - `text` — nội dung text (nếu là text message).
  - `file` — file ảnh (nếu là file message).
- **Logic:** nếu có `file` → `messageContent.type = 'file'`, ngược lại → `type = 'text'`.

**Hình 5.9.3**: Gửi tin nhắn text
![Hình 5.9.3](./images/messages_send_text.png)

**Hình 5.9.3b**: Gửi tin nhắn kèm file ảnh
![Hình 5.9.3b](./images/messages_send_file.png)

---

#### 5.9.4. Chat realtime qua Socket.IO (bonus)

Ngoài các REST API trên, hệ thống còn tích hợp **Socket.IO** trong file [server/utils/SocketHandler.js](server/utils/SocketHandler.js) để đẩy tin nhắn realtime:

- **Auth:** client gửi JWT token qua `socket.handshake.auth.token`, server verify bằng `jwt.verify`.
- **Events:**
  - `connection` → server emit `welcome` kèm username.
  - `user` → client join vào room theo userId để nhận thông báo.
  - `newMessage` → khi có tin nhắn mới, server emit `newMessage` tới cả room `from` và `to`.
- **Client HTML demo:** `resources/chat.html` (truy cập qua `GET /chat`).

**Hình 5.9.4**: Giao diện chat realtime
![Hình 5.9.4](./images/messages_realtime.png)

---

## 6. KẾT LUẬN

### 6.1. Kết quả đạt được

- Xây dựng thành công **REST API backend** cho website shop thời trang với **41 endpoints** chia làm 9 module.
- Tích hợp đầy đủ các kỹ thuật quan trọng:
  - ✅ **Xác thực & phân quyền** đa tầng (JWT + cookie + role-based access control).
  - ✅ **Mã hóa mật khẩu** bằng bcrypt trong Mongoose `pre('save')` hook.
  - ✅ **Validate input** qua express-validator với message tiếng Việt.
  - ✅ **Soft delete** toàn bộ resource (không hard delete).
  - ✅ **MongoDB transaction** cho thao tác nhiều document (register → tạo cart, create product → tạo inventory, import excel batch 50).
  - ✅ **Upload file** ảnh đơn/đa + import sản phẩm hàng loạt từ Excel.
  - ✅ **Chat realtime** qua Socket.IO, hỗ trợ tin nhắn text + file.
  - ✅ **Quên mật khẩu** bằng crypto token có hạn 10 phút.
  - ✅ **Khóa tài khoản** tự động sau 3 lần đăng nhập sai.

### 6.2. Hạn chế

- Chưa có model cho **size / màu** của sản phẩm (đặc thù shop thời trang).
- Chưa có **đơn hàng** (reservation) và **thanh toán** (payment) — schema mới chỉ dừng ở comment.
- Chưa tích hợp gửi email thật (hiện chỉ log URL reset password ra console).
- Chưa có frontend, chỉ mới có 1 trang chat HTML tĩnh để demo Socket.IO.
- Một số endpoint chưa có phân quyền chặt chẽ (ví dụ DELETE user, CRUD roles/categories/products).

### 6.3. Hướng phát triển

Theo kế hoạch trong [MODELS.md](MODELS.md), dự án sẽ bổ sung thêm **5 model** mới:

1. **productVariant** — biến thể size/màu cho từng sản phẩm (ưu tiên cao).
2. **reservation** — đơn hàng tạm giữ khi checkout.
3. **payment** — thanh toán qua các cổng (COD, ZaloPay, MoMo, VNPay).
4. **voucher** — mã giảm giá.
5. **address** — địa chỉ giao hàng của user.

Sau đó sẽ xây dựng frontend React/Vue để hoàn thiện hệ thống end-to-end.

---

## PHỤ LỤC

### A. Cấu trúc folder screenshot

Tất cả ảnh Postman được lưu trong folder `./images/`:

```
images/
├── index_home.png
├── index_chat.png
├── auth_register.png
├── auth_login.png
├── auth_login_fail.png
├── auth_me.png
├── auth_logout.png
├── auth_changepassword.png
├── auth_forgotpassword.png
├── auth_resetpassword.png
├── users_getall.png
├── users_getbyid.png
├── users_create.png
├── users_create_fail.png
├── users_update.png
├── users_delete.png
├── roles_getall.png
├── roles_getbyid.png
├── roles_create.png
├── roles_update.png
├── roles_delete.png
├── categories_getall.png
├── categories_getbyid.png
├── categories_create.png
├── categories_update.png
├── categories_delete.png
├── products_getall.png
├── products_getbyid.png
├── products_create.png
├── products_update.png
├── products_delete.png
├── carts_get.png
├── carts_add.png
├── carts_add_fail.png
├── carts_remove.png
├── carts_decrease.png
├── carts_modify.png
├── upload_get.png
├── upload_one_file.png
├── upload_multiple_file.png
├── upload_excel.png
├── messages_conversations.png
├── messages_history.png
├── messages_send_text.png
├── messages_send_file.png
└── messages_realtime.png
```

### B. Quy tắc đặt tên screenshot

`{module}_{tên_api}[_{biến_thể}].png`

- **module**: tên module (auth, users, products, ...)
- **tên_api**: hành động (login, getall, create, ...)
- **biến_thể** (optional): `fail` (lỗi), `b` (ảnh phụ thứ 2), ...

### C. Hướng dẫn test Postman

1. Import collection (nếu có) hoặc tạo request thủ công theo base URL `http://localhost:3000`.
2. Với các API cần đăng nhập, thêm header: `Authorization: Bearer {{token}}`.
3. Token lấy từ response của `POST /api/v1/auth/login`.
4. Với upload file, chọn tab `Body` → `form-data`, field `file` / `files` chọn type `File`.

---

**-- HẾT --**
