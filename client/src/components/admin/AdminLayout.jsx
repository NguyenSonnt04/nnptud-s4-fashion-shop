import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { CloseIcon, MenuIcon } from '../Icons.jsx'
import {
  AdminBoxIcon,
  AdminChatIcon,
  AdminDashboardIcon,
  AdminLayersIcon,
  AdminShieldIcon,
  AdminStorefrontIcon,
  AdminTicketIcon,
  AdminUsersIcon,
  AdminWalletIcon,
} from './AdminIcons.jsx'

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', Icon: AdminDashboardIcon, end: true },
  { to: '/admin/categories', label: 'Danh mục', Icon: AdminLayersIcon },
  { to: '/admin/products', label: 'Sản phẩm', Icon: AdminBoxIcon },
  { to: '/admin/variants', label: 'Biến thể', Icon: AdminBoxIcon },
  { to: '/admin/users', label: 'Người dùng', Icon: AdminUsersIcon },
  { to: '/admin/roles', label: 'Vai trò', Icon: AdminShieldIcon },
  { to: '/admin/vouchers', label: 'Voucher', Icon: AdminTicketIcon },
  { to: '/admin/payments', label: 'Thanh toán', Icon: AdminWalletIcon },
  { to: '/admin/messages', label: 'Tin nhắn', Icon: AdminChatIcon },
]

const pageCopy = {
  '/admin': {
    eyebrow: 'Control room',
    title: 'Maison S4 Admin',
    description: 'Theo dõi catalog, người dùng và tình trạng giao dịch trên cùng một panel.',
  },
  '/admin/categories': {
    eyebrow: 'Danh mục',
    title: 'Quản lý taxonomy',
    description: 'Giữ cấu trúc danh mục gọn, rõ và nhất quán với storefront.',
  },
  '/admin/products': {
    eyebrow: 'Catalog',
    title: 'Sản phẩm gốc',
    description: 'Tạo và chỉnh sửa product gốc trước khi triển khai variant theo size và màu.',
  },
  '/admin/variants': {
    eyebrow: 'Biến thể',
    title: 'Kích cỡ, màu sắc, giá',
    description: 'Điều phối biến thể theo SKU để detail page và giỏ hàng hoạt động đúng.',
  },
  '/admin/users': {
    eyebrow: 'Người dùng',
    title: 'Tài khoản & phân quyền',
    description: 'Theo dõi người dùng, role hiện có và trạng thái tài khoản.',
  },
  '/admin/vouchers': {
    eyebrow: 'Khuyến mãi',
    title: 'Voucher & campaign',
    description: 'Tạo mã ưu đãi, đặt điều kiện sử dụng và theo dõi vòng đời voucher.',
  },
  '/admin/payments': {
    eyebrow: 'Giao dịch',
    title: 'Bảng điều phối thanh toán',
    description: 'Theo dõi giao dịch hiện có và cập nhật trạng thái xử lý cho đội vận hành.',
  },
  '/admin/roles': {
    eyebrow: 'Phân quyền',
    title: 'Quản lý vai trò',
    description: 'Tạo và quản lý các vai trò trong hệ thống.',
  },
  '/admin/messages': {
    eyebrow: 'Giao tiếp',
    title: 'Tin nhắn khách hàng',
    description: 'Xem và trả lời tin nhắn hỗ trợ từ khách hàng.',
  },
}

export function AdminLayout() {
  const location = useLocation()
  const { logout, user } = useAuth()
  const currentPath = location.pathname
  const [menuPath, setMenuPath] = useState('')
  const menuOpen = menuPath === currentPath

  const currentPage =
    pageCopy[location.pathname] ||
    pageCopy[
      Object.keys(pageCopy).find(
        (key) => key !== '/admin' && location.pathname.startsWith(`${key}/`),
      ) || '/admin'
    ]

  const displayName = user?.fullName || user?.username || 'Admin'

  return (
    <div className="admin-shell">
      <aside className={menuOpen ? 'admin-sidebar admin-sidebar-open' : 'admin-sidebar'}>
        <div className="admin-sidebar-head">
          <Link className="admin-brand" to="/admin">
            <span className="admin-brand-mark">M</span>
            <span>
              <strong>Maison S4</strong>
              <small>Retail Control Room</small>
            </span>
          </Link>

          <button
            aria-label="Đóng menu quản trị"
            className="admin-menu-button admin-menu-button-inline"
            type="button"
            onClick={() => setMenuPath('')}
          >
            <CloseIcon className="admin-menu-icon" />
          </button>
        </div>

        <nav className="admin-nav" aria-label="Điều hướng quản trị">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'admin-nav-link admin-nav-link-active' : 'admin-nav-link'
              }
              end={item.end}
              to={item.to}
            >
              <item.Icon className="admin-nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-card">
          <p className="admin-sidebar-kicker">Đang đăng nhập</p>
          <strong>{displayName}</strong>
          <span>{user?.email || 'admin@maison-s4.local'}</span>
          <div className="admin-sidebar-actions">
            <Link className="button button-secondary" to="/">
              <AdminStorefrontIcon className="admin-inline-icon" />
              Storefront
            </Link>
            <button className="button button-ghost" type="button" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {menuOpen ? (
        <button
          aria-label="Đóng overlay quản trị"
          className="admin-backdrop"
          type="button"
          onClick={() => setMenuPath('')}
        />
      ) : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Đóng menu quản trị' : 'Mở menu quản trị'}
            className="admin-menu-button"
            type="button"
            onClick={() =>
              setMenuPath((current) => (current === currentPath ? '' : currentPath))
            }
          >
            {menuOpen ? (
              <CloseIcon className="admin-menu-icon" />
            ) : (
              <MenuIcon className="admin-menu-icon" />
            )}
          </button>

          <div className="admin-topbar-copy">
            <p>{currentPage?.eyebrow}</p>
            <h1>{currentPage?.title}</h1>
            <span>{currentPage?.description}</span>
          </div>

          <div className="admin-topbar-links">
            <Link className="button button-secondary" to="/">
              Xem storefront
            </Link>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
