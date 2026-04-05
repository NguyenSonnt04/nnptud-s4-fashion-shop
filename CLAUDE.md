# CODING RULES — BẮT BUỘC TUÂN THỦ 100%

> **LƯU Ý CHO AI / NGƯỜI VIẾT CODE:**
> Đây là bộ quy tắc viết code **BẮT BUỘC**. Khi viết code mới (route, controller, schema, middleware, validator...) trong dự án này, bạn **PHẢI** tuân thủ **y chang** từng quy tắc bên dưới — từ cách khai báo biến (`var`/`let`/`const`), cách đặt tên hàm (PascalCase kiểu `CreateAnUser`, `GetAllUser`...), cấu trúc file, pattern response, message lỗi tiếng Việt không dấu, cho đến dấu chấm phẩy.
>
> **KHÔNG được tự ý:**
>
> - Đổi `var`/`let`/`const` theo "best practice" hiện đại.
> - Đổi anonymous `async function` thành arrow function `=>`.
> - Đổi message lỗi tiếng Việt không dấu sang tiếng Anh hay tiếng Việt có dấu.
> - Thêm pattern mới (RESTful status code 200/201/400/500, global error handler, service layer...) nếu chưa có trong file này.
> - "Refactor cho đẹp" — giữ nguyên style hiện tại.
>
> Nếu code hiện có trong repo mâu thuẫn với tài liệu này, **code trong repo là chuẩn** — sửa lại tài liệu, không sửa code theo tài liệu.

---

## 1. CẤU TRÚC THƯ MỤC

```
├── client/                 # Frontend UI (sẽ phát triển)
└── server/                 # Backend API
    ├── app.js              # Entry point Express
    ├── bin/www             # Server bootstrap
    ├── controllers/        # Business logic
    ├── routes/             # Route handlers
    ├── schemas/            # Mongoose schemas
    ├── utils/              # Utility/middleware modules
    ├── resources/          # Static HTML files
    └── uploads/            # Uploaded files
```

> **Lưu ý:** Toàn bộ source code backend nằm trong thư mục `server/`. Các đường dẫn import tương đối (`../schemas/users`, `../utils/authHandler`, ...) bên trong `server/` **không thay đổi** vì đều là relative path trong cùng một cây thư mục con.

### Quy tắc đặt tên file:

- `routes/`, `schemas/`, `controllers/`: tên file **số nhiều, lowercase** — ví dụ: `users.js`, `products.js`, `categories.js`, `carts.js`, `roles.js`, `messages.js`, `inventories.js`.
- `utils/`: tên file **camelCase + Handler** — ví dụ: `authHandler.js`, `validateHandler.js`, `uploadHandler.js`, `SocketHandler.js`, `idHandler.js`.

---

## 2. KHAI BÁO BIẾN & IMPORT

### 2.1. Import module — BẮT BUỘC phân biệt `var` / `let` / `const`

- Dùng `var` cho Express core:
  ```js
  var express = require("express");
  var router = express.Router();
  ```
- Dùng `let` cho module bên ngoài, schema, controller:
  ```js
  let mongoose = require("mongoose");
  let bcrypt = require("bcrypt");
  let jwt = require("jsonwebtoken");
  let slugify = require("slugify");
  let userModel = require("../schemas/users");
  let cartModel = require("../schemas/carts");
  let productModel = require("../schemas/products");
  let userController = require("../controllers/users");
  ```
- Dùng `const` **chỉ khi** destructuring import:
  ```js
  const { CheckLogin } = require("../utils/authHandler");
  const {
    ChangePasswordValidator,
    validatedResult,
  } = require("../utils/validateHandler");
  ```

> **Không được** thay toàn bộ `var`/`let` thành `const`.

### 2.2. Tên biến model — `camelCase + Model` (số ít)

```js
let userModel = require("../schemas/users");
let productModel = require("../schemas/products");
let cartModel = require("../schemas/carts");
let categoryModel = require("../schemas/categories");
let inventoryModel = require("../schemas/inventories");
let roleModel = require("../schemas/roles");
```

### 2.3. Tên biến controller — `camelCase + Controller`

```js
let userController = require("../controllers/users");
```

### 2.4. Biến local trong route handler

**Biến tạo mới — prefix `new` + camelCase:**

```js
let newUser = await userController.CreateAnUser(...)
let newCart = new cartModel({...})
let newProduct = new productModel({...})
let newInventory = new inventoryModel({...})
let newCate = new categoryModel({...})
```

**Biến kết quả query — dùng `result`, `data`, `user`, `cart`, `products`...:**

```js
let result = await productModel.findByIdAndUpdate(...)
let data = await productModel.find({...})
let user = req.user;
let cart = await cartModel.findOne({...})
let products = cart.products
```

**Biến từ request:**

```js
let id = req.params.id;
let { username, password, email } = req.body; // destructuring
let productId = req.body.product;
let quantity = req.body.quantity;
let queries = req.query;
```

**Biến filter/query:**

```js
let titleQ = queries.title ? queries.title.toLowerCase() : "";
let min = queries.minprice ? queries.minprice : 0;
let max = queries.maxprice ? queries.maxprice : 10000;
```

**Biến session (transaction):**

```js
let session = await mongoose.startSession();
```

**Biến token:**

```js
let token;
let token = jwt.sign({...}, 'secret', { expiresIn: '1h' })
```

---

## 3. ĐẶT TÊN HÀM

### 3.1. Controller function — PascalCase theo công thức bắt buộc

**Công thức:** `Hành động` + `An` / `All` + `TênModel` + (`By` + `Điều kiện`)

```js
CreateAnUser(
  username,
  password,
  email,
  role,
  session,
  fullName,
  avatarUrl,
  status,
  loginCount,
);
GetAllUser();
GetAnUserByUsername(username);
GetAnUserByEmail(email);
GetAnUserByToken(token);
GetAnUserById(id);
```

**Ví dụ áp dụng cho model khác (Product):**

```js
CreateAnProduct(...)
GetAllProduct()
GetAnProductById(id)
GetAnProductBySlug(slug)
```

> Tên model trong function **số ít**: `GetAllUser` (không phải `GetAllUsers`).

### 3.2. Middleware function — PascalCase

```js
CheckLogin          // async function (req, res, next)
CheckRole(...)      // factory function trả về middleware
```

### 3.3. Validator array — PascalCase

**Công thức:** `Create` / `Modify` / `ChangePassword` + `An` + `TênModel` + (`Validator` — optional)

```js
CreateAnUserValidator;
ModifyAnUser;
ChangePasswordValidator;
```

### 3.4. Utility function

```js
validatedResult; // middleware → camelCase
uploadImage; // multer instance → camelCase
uploadExcel; // multer instance → camelCase
SocketServer(); // setup function → PascalCase
GenID(); // PascalCase
getItemByID(); // camelCase
```

### 3.5. Route handler — **BẮT BUỘC anonymous async function**

```js
router.get('/',    async function (req, res, next) { ... })
router.post('/',   async function (req, res, next) { ... })
```

> **TUYỆT ĐỐI KHÔNG** dùng arrow function `async (req, res) => {}`. Luôn viết đầy đủ `async function (req, res, next)`.

---

## 4. VIẾT ROUTE

### 4.1. Prefix API — `/api/v1/{resource}` (số nhiều)

Đăng ký trong `app.js`:

```js
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/roles", require("./routes/roles"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/categories", require("./routes/categories"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/carts", require("./routes/carts"));
app.use("/api/v1/upload", require("./routes/upload"));
app.use("/api/v1/messages", require("./routes/messages"));
```

### 4.2. CRUD pattern chuẩn

```js
router.get('/',       async function (req, res, next) { ... })   // Get all
router.get('/:id',    async function (req, res, next) { ... })   // Get by ID
router.post('/',      async function (req, res, next) { ... })   // Create
router.put('/:id',    async function (req, res, next) { ... })   // Update
router.delete('/:id', async function (req, res, next) { ... })   // Soft delete
```

### 4.3. Cart-style route — POST + action name

```js
router.get('/',          CheckLogin, async function ...)  // Get cart
router.post('/add',      CheckLogin, async function ...)  // Add to cart
router.post('/remove',   CheckLogin, async function ...)  // Remove from cart
router.post('/decrease', CheckLogin, async function ...)  // Decrease qty
router.post('/modify',   CheckLogin, async function ...)  // Set qty
```

### 4.4. Auth route pattern

```js
router.post('/register', ...)
router.post('/login', ...)
router.get('/me', CheckLogin, ...)
router.post('/logout', CheckLogin, ...)
router.get('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, ...)
router.post('/forgotpassword', ...)
router.post('/resetpassword/:token', ...)
```

### 4.5. Thứ tự middleware chain (BẮT BUỘC)

```
CheckLogin → CheckRole("ADMIN") → ValidatorArray → validatedResult → handler
```

---

## 5. VIẾT SCHEMA (MONGOOSE)

### 5.1. Khai báo schema

```js
let mongoose = require("mongoose");
let productSchema = mongoose.Schema(
  {
    // fields...
  },
  {
    timestamps: true,
  },
);
module.exports = new mongoose.model("product", productSchema);
```

Hoặc (cho phép) dùng `const` + `new mongoose.Schema(...)`:

```js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({ ... }, { timestamps: true });
module.exports = mongoose.model("user", userSchema);
```

### 5.2. Model name — **số ít, lowercase**

```js
mongoose.model("user", userSchema);
mongoose.model("product", productSchema);
mongoose.model("category", categorySchema);
mongoose.model("cart", cartSchema);
mongoose.model("role", roleSchema);
mongoose.model("inventory", inventorySchema);
mongoose.model("message", messageSchema);
```

### 5.3. Tên biến schema — `camelCase + Schema`

```js
let userSchema, productSchema, categorySchema, cartSchema;
let itemCartSchema; // nested schema
let messageContentSchema; // nested schema
```

### 5.4. Field chuẩn BẮT BUỘC ở mỗi schema

```js
isDeleted: { type: Boolean, default: false }   // Soft delete
timestamps: true                                // createdAt, updatedAt
```

### 5.5. Ref — dùng tên model số ít

```js
ref: "user";
ref: "product";
ref: "category";
ref: "role";
```

### 5.6. ObjectId type

```js
type: mongoose.Schema.Types.ObjectId, ref: "role"
type: mongoose.Types.ObjectId,       ref: 'product'
```

### 5.7. Nested schema — `_id: false`

```js
let itemCartSchema = mongoose.Schema(
  {
    product: { type: mongoose.Types.ObjectId, ref: "product" },
    quantity: { type: Number, min: 1 },
  },
  { _id: false },
);
```

---

## 6. VIẾT CONTROLLER

### 6.1. Cấu trúc file controller — export object chứa async function

```js
let userModel = require("../schemas/users");
module.exports = {
  FunctionName: async function (params) {
    // logic
    return result;
  },
  AnotherFunction: async function (params) {
    // logic
  },
};
```

**Nguyên tắc BẮT BUỘC:**

- Export là **object chứa các async function** (KHÔNG export từng hàm rời).
- Mỗi function nhận **tham số trực tiếp**, KHÔNG nhận `req, res`.
- **Return data** — TUYỆT ĐỐI KHÔNG gọi `res.send()` trong controller.

### 6.2. Query pattern

```js
// Tìm tất cả
let users = await userModel.find({ isDeleted: false });

// Tìm một theo điều kiện
let user = await userModel.findOne({ isDeleted: false, username: username });

// Tìm một theo ID + populate
let user = await userModel
  .findOne({ isDeleted: false, _id: id })
  .populate("role");
```

---

## 7. RESPONSE & ERROR HANDLING

### 7.1. Response thành công — trả trực tiếp data

```js
res.send(data);
res.send(result);
res.send(cart);
res.send(newCart);
res.send(token);
```

### 7.2. Response có message

```js
res.send({ message: "logout" });
res.send({ message: "da cap nhat" });
res.send({ message: "check mail" });
res.send({ message: "update thanh cong" });
```

### 7.3. Error response — **status 404** + message tiếng Việt KHÔNG DẤU

```js
res.status(404).send({ message: "ban chua dang nhap" });
res.status(404).send({ message: "thong tin dang nhap sai" });
res.status(404).send({ message: "ban dang bi ban" });
res.status(404).send({ message: "san pham khong ton tai" });
res.status(404).send({ message: "san pham khong ton tai trong gio hang" });
res.status(404).send("ton kho khong du");
res.status(404).send("ID NOT FOUND");
res.status(404).send(error.message);
res.status(403).send({ message: "ban khong co quyen" });
```

> **KHÔNG được** dùng status code khác (400, 401, 422, 500...) cho lỗi — mặc định là `404` trừ khi là lỗi phân quyền dùng `403`.

### 7.4. Try-catch pattern BẮT BUỘC

```js
router.get("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    // logic...
    res.send(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});
```

---

## 8. TRANSACTION PATTERN

```js
let session = await mongoose.startSession();
session.startTransaction()
try {
    let newItem1 = new model1({...})
    await newItem1.save({ session });

    let newItem2 = new model2({...})
    await newItem2.save({ session })

    await session.commitTransaction()
    await session.endSession()
    res.send(result)
} catch (error) {
    await session.abortTransaction()
    await session.endSession()
    res.status(404).send(error.message)
}
```

---

## 9. SOFT DELETE — BẮT BUỘC

**TUYỆT ĐỐI KHÔNG hard delete.** Luôn dùng soft delete:

```js
router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productModel.findById(id);
    result.isDeleted = true;
    await result.save();
    res.send(result);
  } catch (error) {
    res.status(404).send(error.message);
  }
});
```

Mọi query đọc phải có filter: `{ isDeleted: false }`.

---

## 10. VALIDATION PATTERN

### 10.1. Validator array dùng `express-validator`

```js
let { body, validationResult } = require("express-validator");

module.exports = {
  validatedResult: function (req, res, next) {
    let result = validationResult(req);
    if (result.errors.length > 0) {
      res.status(404).send(
        result.errors.map(function (e) {
          return { [e.path]: e.msg };
        }),
      );
    } else {
      next();
    }
  },
  CreateAnUserValidator: [
    body("username")
      .notEmpty()
      .withMessage("username khong duoc rong")
      .bail()
      .isAlphanumeric()
      .withMessage("username khong duoc chua ki tu dac biet"),
    body("email")
      .notEmpty()
      .withMessage("email khong duoc rong")
      .bail()
      .isEmail()
      .withMessage("email sai dinh dang")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("password khong duoc rong")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage("password it nhat 8 ki tu..."),
    body("avatarUrl")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("URL sai dinh dang"),
    body("role")
      .notEmpty()
      .withMessage("role khong duoc de trong")
      .bail()
      .isMongoId()
      .withMessage("role khong hop le"),
  ],
};
```

### 10.2. Message validation — tiếng Việt KHÔNG DẤU

```
"username khong duoc rong"
"email sai dinh dang"
"password khong duoc rong"
"role khong duoc de trong"
"khong duoc thay doi username"
"URL hinh anh phai hop le"
```

---

## 11. QUY TẮC KHÁC

### 11.1. Authentication

- JWT secret: `'secret'` (hardcode string, không dùng env).
- Cookie name: tự đặt theo tên dự án (ví dụ `'NNPTUD_S4'`).
- Token expiry: `'1h'`.
- Cookie maxAge: `30 * 24 * 3600 * 1000` (30 ngày).
- Thứ tự kiểm tra: **Bearer token trước → cookie sau**.

### 11.2. Password hashing

- Dùng `bcrypt` trong `pre('save')` hook của schema.
- `bcrypt.genSaltSync(10)` + `bcrypt.hashSync()`.
- So sánh: `bcrypt.compareSync(password, user.password)`.

### 11.3. Slug generation

```js
let slug = slugify(req.body.title, {
  replacement: "-",
  remove: undefined,
  lower: true,
  trim: true,
});
```

### 11.4. Get by ID pattern trong route

```js
let result = await model.find({ isDeleted: false, _id: id });
if (result.length > 0) {
  res.send(result[0]);
} else {
  res.status(404).send("ID NOT FOUND");
}
```

### 11.5. Update pattern

```js
let result = await model.findByIdAndUpdate(id, req.body, { new: true });
res.send(result);
```

### 11.6. Cart findIndex pattern — dùng anonymous function, không dùng arrow

```js
let index = products.findIndex(function (f) {
  return f.product == productId;
});
```

### 11.7. Populate

```js
.populate('role')
.populate('user')
.populate({ path: 'category', select: 'name' })
```

### 11.8. Ngôn ngữ message

- Error + validation message: **tiếng Việt không dấu**.
- Ví dụ: `"ban chua dang nhap"`, `"san pham khong ton tai"`, `"ton kho khong du"`, `"username khong duoc rong"`.

---

## 12. CHECKLIST TRƯỚC KHI COMMIT CODE MỚI

Trước khi viết / submit bất kỳ file nào, tự kiểm tra:

- [ ] `var` cho express core, `let` cho module/schema, `const` chỉ cho destructuring?
- [ ] Biến model tên `xxxModel`, biến controller tên `xxxController`?
- [ ] Hàm controller đặt theo công thức `CreateAnX` / `GetAllX` / `GetAnXByY`?
- [ ] Route handler là `async function (req, res, next)`, KHÔNG phải arrow?
- [ ] API prefix `/api/v1/{resource_số_nhiều}`?
- [ ] Schema có `isDeleted` + `timestamps: true`?
- [ ] Model name số ít, lowercase?
- [ ] Controller return data, KHÔNG gọi `res.send`?
- [ ] Mọi route có `try-catch`, catch trả `res.status(404).send(error.message)`?
- [ ] Delete là soft delete, mọi query đọc filter `isDeleted: false`?
- [ ] Message lỗi là **tiếng Việt không dấu**?
- [ ] Validator dùng `express-validator` + chain `.bail()` + `withMessage`?
- [ ] Không có bất kỳ arrow function `=>` nào trong route handler / validator callback?
