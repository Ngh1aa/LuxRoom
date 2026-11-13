# LuxRoom

Nền tảng thương mại điện tử nội thất cao cấp với định hướng luxury-minimal.

## Mô tả

LuxRoom là website thương mại điện tử nội thất cao cấp, được thiết kế theo triết lý **luxury-minimal** — tối giản nhưng không kém phần sang trọng. Dự án tập trung giải quyết các vấn đề phổ biến trong mua sắm nội thất online:

- **Khó hình dung sản phẩm** — Trang chi tiết sản phẩm với hình ảnh chất lượng cao, thông tin kỹ thuật đầy đủ
- **Thiếu sự tin tưởng** — Giao diện chuyên nghiệp, nhất quán thể hiện uy tín thương hiệu
- **Lo ngại về giao hàng** — Trang thành công rõ ràng với thông tin đơn hàng chi tiết
- **Thông tin sản phẩm chưa đầy đủ** — Mỗi sản phẩm có mô tả, thông số kỹ thuật và hướng dẫn sử dụng
- **Sự do dự khi thanh toán** — Luồng thanh toán tinh gọn, giảm thiểu các bước không cần thiết

### Các luồng chính

| Luồng | Mô tả |
|-------|-------|
| Khám phá sản phẩm | Trang chủ với bộ sưu tập nổi bật, trang danh sách sản phẩm với bộ lọc |
| Chi tiết sản phẩm | Hình ảnh, mô tả, thông số kỹ thuật, thêm vào giỏ hàng |
| Giỏ hàng & Thanh toán | Quản lý giỏ hàng, thông tin giao hàng, xác nhận đơn hàng |
| Hồ sơ cá nhân | Đăng nhập/đăng ký, quản lý tài khoản |
| Liên hệ & Newsletter | Form liên hệ, đăng ký nhận tin khuyến mãi |

### E-commerce UX upgrade — 23/08/2026

Phiên bản hiện tại giữ nguyên visual direction luxury/editorial và bổ sung luồng mua nội thất hoàn chỉnh hơn:

- Dữ liệu thật cho dimensions, materials, care, finish, availability, lead time và SKU.
- Variant cập nhật ảnh, giá, tình trạng hàng và thời gian giao mà không reload trang.
- Technical dimension visual và measure guide ngay trong PDP.
- Bộ lọc Size, Availability và Delivery; filter drawer riêng cho mobile.
- Giỏ hàng lưu đúng variant, ngày giao dự kiến, địa điểm và phí giao hàng.
- Checkout 4 bước: Contact → Delivery → Payment → Review, với địa chỉ phù hợp thị trường Việt Nam.
- Xác nhận đơn hàng, lưu order ID và trang theo dõi trạng thái giao hàng.
- Wishlist được nâng thành Saved Room, có tổng giá trị, chia sẻ và yêu cầu tư vấn.
- Search thực theo tên, category, room, material, tone, collection và style.

### Cửa hàng hoàn chỉnh không backend (13/11/2026)

Site hoạt động như một cửa hàng nội thất thật, chỉ thiếu backend:

- **Dữ liệu:** mọi dữ liệu người dùng (giỏ hàng, wishlist, compare, saved rooms, đơn hàng, tài khoản, địa chỉ, review) nằm trong **sessionStorage** của tab, được seed một lần từ `js/store-data.js`. Dữ liệu còn khi chuyển trang/reload, mất khi đóng tab.
- **Demo tools (ẩn):** khách truy cập bình thường không thấy công cụ demo. Mở URL bất kỳ với `?demo=1` (ví dụ https://lux-room.vercel.app/?demo=1) để hiện panel nổi **Demo tools** ở góc trái dưới, gồm **Simulate a failed request** (request kế tiếp thất bại để kiểm tra lỗi + thử lại) và **Reset demo data** (đưa mọi thứ về seed). Cờ được giữ trong sessionStorage của tab; `?demo=0` hoặc nút **Hide demo tools** để tắt.
- **Luồng đã hoàn thiện:** lọc/sắp xếp/tìm kiếm/phân trang có loading và lỗi; PDP có finish, size, tồn kho giới hạn số lượng, ước tính giao hàng, review và trạng thái không tìm thấy; compare; wishlist; saved rooms (tạo, đổi tên, xoá, thêm/bớt món); giỏ hàng (số lượng, xoá, mã giảm giá hợp lệ/không hợp lệ/hết hạn, lưu để mua sau); checkout (địa chỉ, khung giờ giao, thanh toán khi nhận hàng hoặc thanh toán mô phỏng — không thu thập thẻ, review, trang thành công có mã đơn); theo dõi đơn, lịch sử đơn, huỷ/đổi trả; đăng ký/đăng nhập/đăng xuất/quên mật khẩu (mô phỏng); sửa hồ sơ và sổ địa chỉ; form liên hệ.
- **Không có giao dịch thật:** không thu tiền, không gửi email, không có thẻ (chỉ Pay on delivery / Bank transfer). Footer mỗi trang có một dòng "Concept product designed by Đỗ Anh Nghĩa."
- **Vào thẳng như khách đã đăng nhập:** link portfolio nên trỏ tới **https://lux-room.vercel.app/** — khách vào trang chủ, đã đăng nhập sẵn là **Linh Tran** (`linh.tran@luxroom.vn`), nên Profile, Orders (LR-6020192, LR-6110115) và Saved rooms có dữ liệu ngay. Đăng xuất vẫn hoạt động; trang đăng nhập có nút **Continue as Linh Tran** và vẫn nhận mật khẩu `luxroom123`.
- Các trang tài liệu `figma-*` vẫn được giữ (case study link trực tiếp) nhưng không được link từ cửa hàng.

Kiểm thử (cần Playwright qua `NODE_PATH`, phục vụ bản build `dist/`):

```bash
npm run build
py -3 -m http.server 8923 --bind 127.0.0.1 --directory dist
node qa/e2e-full-prototype.mjs --base http://127.0.0.1:8923   # toàn bộ luồng (dùng ?demo=1) + kiểm tra không còn chữ prototype khi không có ?demo
node qa/inventory-controls.mjs        # liệt kê và bấm thử mọi control trên 16 trang
npm run qa                            # các kiểm tra tĩnh sẵn có
```

### Đối tượng sử dụng

Dự án phù hợp để:

- Sử dụng làm **UI/UX case study** cho portfolio Business Analyst
- Luyện tập **front-end development** với HTML, CSS, JavaScript thuần
- Tham khảo **design system** và định hướng luxury-minimal

## Công nghệ

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Design Tool**: Figma
- **Không sử dụng framework** — pure vanilla implementation

## Cài đặt

### Yêu cầu

- Trình duyệt hiện đại (Chrome, Firefox, Safari, Edge)
- VS Code (khuyến nghị để sử dụng Live Server)

### Các bước cài đặt

**1. Clone repository**

```bash
git clone https://github.com/username/LuxRoom.git
```

**2. Mở thư mục project**

```bash
cd LuxRoom
```

**3. Chạy project**

_Cách 1 — Mở trực tiếp bằng trình duyệt:_

```bash
# Mở file src/index.html trong trình duyệt
# Windows: double-click file hoặc click chuột phải > Open with
# macOS: open src/index.html
# Linux: xdg-open src/index.html
```

_Cách 2 — Sử dụng Live Server (khuyến nghị):_

1. Cài đặt extension **Live Server** trong VS Code
2. Click chuột phải vào `src/index.html`
3. Chọn **"Open with Live Server"**

## Cấu trúc project

```
LuxRoom/
├── src/                    # Các trang HTML
│   ├── index.html          # Trang chủ
│   ├── products.html       # Danh sách sản phẩm
│   ├── detail.html         # Chi tiết sản phẩm
│   ├── cart.html           # Giỏ hàng
│   ├── checkout.html       # Thanh toán
│   ├── about.html          # Giới thiệu
│   ├── contact.html        # Liên hệ
│   ├── auth.html           # Đăng nhập / Đăng ký
│   ├── profile.html        # Hồ sơ cá nhân
│   └── success.html        # Trang xác nhận đặt hàng thành công
├── css/                    # Stylesheets
│   ├── common.css          # Header, footer, navigation, newsletter
│   ├── design-system.css   # Design tokens, biến CSS
│   ├── index.css           # Trang chủ
│   ├── products.css        # Danh sách sản phẩm
│   ├── detail.css          # Chi tiết sản phẩm
│   ├── cart.css            # Giỏ hàng
│   ├── checkout.css        # Thanh toán
│   ├── about.css           # Giới thiệu
│   ├── contact.css         # Liên hệ
│   ├── auth.css            # Đăng nhập / Đăng ký
│   ├── profile.css         # Hồ sơ cá nhân
│   └── success.css         # Trang thành công
├── js/                     # JavaScript files
│   ├── common.js           # Dữ liệu sản phẩm, xử lý cart, newsletter
│   ├── index.js            # Logic trang chủ
│   ├── products.js         # Logic danh sách sản phẩm
│   ├── detail.js           # Logic chi tiết sản phẩm
│   ├── cart.js             # Logic giỏ hàng
│   ├── checkout.js         # Logic thanh toán
│   ├── contact.js          # Logic liên hệ
│   └── auth.js             # Logic xác thực
├── public/assets/          # Hình ảnh mockup tham khảo từ Figma
├── screenshots/           # Ảnh chụp màn hình các trang
├── img/                    # Hình ảnh nội dung
└── docs/ba_portfolio/      # Tài liệu BA (PRD, User Stories, BPMN, ERD)
```

## Cách sử dụng

### Khám phá sản phẩm

1. Mở `src/index.html` — trang chủ với bộ sưu tập nổi bật
2. Click vào banner hoặc nút "Khám phá" để xem danh sách sản phẩm
3. Trang `src/products.html` hiển thị các sản phẩm với bộ lọc theo danh mục

### Xem chi tiết sản phẩm

1. Click vào sản phẩm bất kỳ để mở `src/detail.html`
2. Xem hình ảnh, mô tả, thông số kỹ thuật
3. Chọn số lượng và nhấn "Thêm vào giỏ hàng"

### Luồng giỏ hàng và thanh toán

1. Icon giỏ hàng ở header hiển thị số lượng sản phẩm đã thêm
2. Truy cập `src/cart.html` để xem và chỉnh sửa giỏ hàng
3. Nhấn "Thanh toán" để chuyển sang `src/checkout.html`
4. Điền thông tin giao hàng và xác nhận đơn hàng
5. Trang `src/success.html` xác nhận đặt hàng thành công

### Các trang khác

| Trang | Mục đích |
|-------|----------|
| `src/about.html` | Câu chuyện thương hiệu, giá trị cốt lõi |
| `src/contact.html` | Form liên hệ, thông tin cửa hàng |
| `src/auth.html` | Đăng nhập / Đăng ký tài khoản |
| `src/profile.html` | Quản lý thông tin cá nhân |

### Về thiết kế Luxury-Minimal

Dự án tuân thủ nguyên tắc thiết kế luxury-minimal:

- **Màu sắc**: Tông màu trung tính (trắng, đen, be, xám) làm chủ đạo
- **Typography**: Font chữ sans-serif rõ ràng, hierarchy rõ ràng
- **Whitespace**: Sử dụng khoảng trắng dồi dào để tạo cảm giác sang trọng
- **Hình ảnh**: Sản phẩm được chụp/placehound với nền sạch, tối giản
- **Interaction**: Animation mềm mại, hover effects tinh tế

## Tài liệu BA Portfolio

Dự án được thiết kế như một **BA portfolio** hoàn chỉnh với các tài liệu phân tích trong `docs/ba_portfolio/`:

1. **PRD** — Product Requirements Document: Tổng quan sản phẩm, mục tiêu, User Stories
2. **User Stories (Gherkin)** — Các kịch bản người dùng với acceptance criteria
3. **BPMN** — Business Process Models: Sơ đồ quy trình nghiệp vụ
4. **ERD** — Conceptual Data Architecture: Mô hình dữ liệu

## Screenshots

Xem thêm hình ảnh minh họa trong thư mục `screenshots/`:

| Trang | File |
|-------|------|
| Trang chủ | `screenshots/Home.png` |
| Danh sách sản phẩm | `screenshots/Funiture - Product.png`, `Search.png` |
| Chi tiết sản phẩm | `screenshots/detail product.png` |
| Giỏ hàng | `screenshots/cart.png` |
| Giới thiệu | `screenshots/About us.png` |
| Liên hệ | `screenshots/Contact.png` |
| Tài khoản | `screenshots/Account Dropdown.png` |

---

**Vai trò**: Business Analyst & UI/UX Designer

Được xây dựng với mục tiêu thể hiện kỹ năng phân tích nghiệp vụ và thiết kế trải nghiệm người dùng.
