# DANH SÁCH MODELS — SHOP THỜI TRANG

> Tài liệu tổng hợp 12 models của dự án **ShopThoiTrang**.
> Mục đích: giúp thành viên trong nhóm nắm nhanh schema đã có, đang dở, và sắp làm.
> Quy ước đặt tên & coding style: xem [CLAUDE.md](CLAUDE.md).

---

## TỔNG QUAN

| Trạng thái | Số lượng | Models |
|---|---|---|
| ✅ Đã xong schema | 7 | user, role, product, category, cart, inventory, message |
| ⚠️ Có file, chưa code | 2 | reservation, payment |
| 🆕 Plan thêm mới | 3 | productVariant, voucher, address |
| **TỔNG** | **12** | |

---

## A. MODELS ĐÃ XONG SCHEMA (7)

### 1. user — [server/schemas/users.js](server/schemas/users.js)

Tài khoản người dùng (khách hàng + admin).

| Field | Type | Ghi chú |
|---|---|---|
| username | String | required, unique |
| password | String | required, bcrypt hash trong `pre('save')` |
| email | String | required, unique, lowercase |
| fullName | String | default `""` |
| avatarUrl | String | default placeholder |
| status | Boolean | default `false` |
| role | ObjectId → `role` | required |
| loginCount | Number | default `0`, min `0` |
| lockTime | Date | khóa tài khoản |
| forgotPasswordToken | String | token quên mật khẩu |
| forgotPasswordTokenExp | Date | hạn token |
| isDeleted | Boolean | default `false` |
| timestamps | | createdAt, updatedAt |

---

### 2. role — [server/schemas/roles.js](server/schemas/roles.js)

Phân quyền (ADMIN / USER / ...).

| Field | Type | Ghi chú |
|---|---|---|
| name | String | tên role |
| description | String | mô tả |
| isDeleted | Boolean | default `false` |
| timestamps | | |

---

### 3. product — [server/schemas/products.js](server/schemas/products.js)

Sản phẩm quần áo (thông tin chung, không bao gồm size/màu — xem `productVariant`).

| Field | Type | Ghi chú |
|---|---|---|
| sku | String | required, unique |
| title | String | required, unique |
| slug | String | unique, tạo bằng `slugify` |
| price | Number | min `0` (giá gốc, variant có thể override) |
| description | String | default `""` |
| images | [String] | default `["https://placehold.co/600x400"]` |
| category | ObjectId → `category` | required |
| isDeleted | Boolean | default `false` |
| timestamps | | |

---

### 4. category — [server/schemas/categories.js](server/schemas/categories.js)

Danh mục sản phẩm (áo thun, quần jeans, váy, ...).

| Field | Type | Ghi chú |
|---|---|---|
| name | String | required, unique |
| slug | String | required, unique |
| image | String | default placeholder |
| isDeleted | Boolean | default `false` |
| timestamps | | |

---

### 5. cart — [server/schemas/carts.js](server/schemas/carts.js)

Giỏ hàng của user (mỗi user 1 giỏ).

| Field | Type | Ghi chú |
|---|---|---|
| user | ObjectId → `user` | required, unique |
| products | `[itemCartSchema]` | default `[]` |

**Nested `itemCartSchema`** (`_id: false`):

| Field | Type | Ghi chú |
|---|---|---|
| product | ObjectId → `product` | (sẽ đổi sang ref `productVariant` khi có variants) |
| quantity | Number | min `1` |

---

### 6. inventory — [server/schemas/inventories.js](server/schemas/inventories.js)

Tồn kho theo product (sẽ đổi sang theo variant).

| Field | Type | Ghi chú |
|---|---|---|
| product | ObjectId → `product` | required, unique (sẽ đổi sang `productVariant`) |
| stock | Number | min `0`, default `0` — tồn thực tế |
| reserved | Number | min `0`, default `0` — đang giữ cho reservation |
| soldCount | Number | min `0`, default `0` — đã bán |

> ⚠️ Chưa có `isDeleted` và `timestamps` — cân nhắc bổ sung theo CLAUDE.md.

---

### 7. message — [server/schemas/messages.js](server/schemas/messages.js)

Tin nhắn chat giữa user ↔ user (hoặc user ↔ admin).

| Field | Type | Ghi chú |
|---|---|---|
| from | ObjectId → `user` | người gửi |
| to | ObjectId → `user` | người nhận |
| messageContent | `messageContentSchema` | nội dung |
| timestamps | | |

**Nested `messageContentSchema`** (`_id: false`):

| Field | Type | Ghi chú |
|---|---|---|
| type | String | enum `["text", "file"]` |
| text | String | nội dung text hoặc URL file |

---

## B. MODELS CÓ FILE — CHƯA CODE SCHEMA (2)

### 8. reservation — [server/schemas/reservation.js](server/schemas/reservation.js)

Đơn hàng tạm giữ khi user checkout (cầu nối `cart` → `payment`). Khi tạo sẽ trừ `inventory.stock` và cộng `inventory.reserved`.

| Field | Type | Ghi chú |
|---|---|---|
| user | ObjectId → `user` | required |
| products | `[itemReservationSchema]` | snapshot tại thời điểm đặt |
| status | String | enum `["actived", "cancelled", "expired", "transfer"]` |
| expiredIn | Date | hết hạn giữ hàng |
| amount | Number | tổng tiền |
| isDeleted | Boolean | default `false` |
| timestamps | | |

**Nested `itemReservationSchema`** (`_id: false`):

| Field | Type | Ghi chú |
|---|---|---|
| product | ObjectId → `product` / `productVariant` | |
| quantity | Number | min `1` |
| price | Number | giá tại thời điểm đặt |
| title | String | snapshot tên sản phẩm |
| subtotal | Number | `price * quantity` |
| promotion | Number | giảm giá áp dụng |

---

### 9. payment — [server/schemas/payments.js](server/schemas/payments.js)

Giao dịch thanh toán cho mỗi reservation.

| Field | Type | Ghi chú |
|---|---|---|
| user | ObjectId → `user` | required |
| reservation | ObjectId → `reservation` | required |
| method | String | enum `["COD", "zalopay", "momo", "vnpay", ...]` |
| transactionID | String | mã giao dịch từ cổng thanh toán |
| currency | String | default `"VND"` |
| status | String | enum `["pending", "paid", "failed", "refunded"]` |
| providerResponse | Mixed | raw response từ cổng thanh toán |
| pendingAt | Date | |
| paidAt | Date | |
| failedAt | Date | |
| refundAt | Date | |
| isDeleted | Boolean | default `false` |
| timestamps | | |

---

## C. MODELS PLAN THÊM MỚI (3)

### 10. productVariant — *(chưa có file)*

Biến thể sản phẩm theo **size + màu**. Đây là model **bắt buộc với shop quần áo** vì 1 sản phẩm thường có nhiều size/màu với tồn kho khác nhau.

| Field | Type | Ghi chú |
|---|---|---|
| product | ObjectId → `product` | required |
| sku | String | required, unique (VD: `AO001-M-RED`) |
| size | String | enum `["S", "M", "L", "XL", "XXL", ...]` |
| color | String | tên màu (VD: `"do"`, `"den"`, `"trang"`) |
| price | Number | min `0`, override giá của product (optional) |
| images | [String] | ảnh riêng của variant |
| isDeleted | Boolean | default `false` |
| timestamps | | |

> **Lưu ý quan trọng:**
> - Khi thêm `productVariant`, **phải sửa** [schemas/inventories.js](server/schemas/inventories.js): đổi `ref: 'product'` → `ref: 'productVariant'`.
> - **Phải sửa** [schemas/carts.js](server/schemas/carts.js) và `reservation`: ref về `productVariant` thay vì `product`.

---

### 11. voucher — *(chưa có file)*

Mã giảm giá / khuyến mãi.

| Field | Type | Ghi chú |
|---|---|---|
| code | String | required, unique (VD: `SALE50`) |
| type | String | enum `["percent", "fixed"]` |
| value | Number | % giảm hoặc số tiền giảm |
| minOrder | Number | đơn tối thiểu để áp dụng |
| maxDiscount | Number | mức giảm tối đa (cho type percent) |
| quantity | Number | tổng số lượt dùng |
| usedCount | Number | default `0` — đã dùng bao nhiêu |
| startDate | Date | bắt đầu hiệu lực |
| endDate | Date | hết hiệu lực |
| isDeleted | Boolean | default `false` |
| timestamps | | |

---

### 12. address — *(chưa có file)*

Địa chỉ giao hàng của user (1 user có thể có nhiều địa chỉ).

| Field | Type | Ghi chú |
|---|---|---|
| user | ObjectId → `user` | required |
| fullName | String | tên người nhận |
| phone | String | số điện thoại nhận hàng |
| province | String | tỉnh / thành |
| district | String | quận / huyện |
| ward | String | phường / xã |
| detail | String | số nhà, tên đường |
| isDefault | Boolean | default `false` — địa chỉ mặc định |
| isDeleted | Boolean | default `false` |
| timestamps | | |

---

## LƯU Ý CHUNG

1. **Tất cả schema PHẢI có**:
   - `isDeleted: { type: Boolean, default: false }` (soft delete — xem [CLAUDE.md](CLAUDE.md) mục 5.4 & mục 9).
   - `timestamps: true`.
2. **Model name**: số ít, lowercase (`user`, `product`, `productVariant`, ...).
3. **Biến schema**: `camelCase + Schema` (`userSchema`, `productVariantSchema`, ...).
4. **Ref**: dùng tên model số ít (`ref: "user"`, `ref: "productVariant"`).
5. **Nested schema**: phải có `{ _id: false }`.
6. **Khi có `productVariant`**: cập nhật lại `inventory`, `cart`, `reservation` để ref về variant.

---

## THỨ TỰ ĐỀ XUẤT CODE TIẾP

1. **productVariant** → sau đó chỉnh `inventory` + `cart` ref theo variant.
2. **reservation** (đơn hàng).
3. **payment** (thanh toán).
4. **voucher** (mã giảm giá).
5. **address** (địa chỉ giao hàng).
