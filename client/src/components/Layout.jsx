import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { BagIcon, CloseIcon, MenuIcon } from './Icons.jsx'
import { ChatWidget } from './ChatWidget.jsx'

const navItems = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/products', label: 'Sản phẩm' },
  { to: '/cart', label: 'Giỏ hàng' },
]

export function Layout() {
  const location = useLocation()
  const { count } = useCart()
  const { isAuthenticated, isHydrating, logout, user } = useAuth()
  const currentPath = `${location.pathname}${location.search}`
  const [menuPath, setMenuPath] = useState('')
  const menuOpen = menuPath === currentPath

  const displayName = user?.fullName || user?.username || 'Khách hàng'

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="site-brand" to="/">
            <span className="site-brand-mark">M</span>
            <span>
              <strong>Maison S4</strong>
              <small>Editorial Fashion Store</small>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Điều hướng chính">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
                end={item.end}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-actions">
            {isAuthenticated ? (
              <>
                <NavLink className="button button-ghost" to="/account">
                  {displayName}
                </NavLink>
                <button className="button button-ghost" type="button" onClick={logout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink className="button button-ghost" to="/login">
                  Đăng nhập
                </NavLink>
                <NavLink className="button button-primary button-small" to="/register">
                  Tạo tài khoản
                </NavLink>
              </>
            )}

            <NavLink className="cart-pill" to="/cart">
              <BagIcon className="cart-pill-icon" />
              <span>Giỏ hàng</span>
              <strong>{count}</strong>
            </NavLink>

            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              className="mobile-menu-button"
              type="button"
              onClick={() =>
                setMenuPath((current) => (current === currentPath ? '' : currentPath))
              }
            >
              {menuOpen ? (
                <CloseIcon className="mobile-menu-icon" />
              ) : (
                <MenuIcon className="mobile-menu-icon" />
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="mobile-nav" aria-label="Menu di động">
            <div className="mobile-nav-links">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link mobile-nav-link-active' : 'mobile-nav-link'
                  }
                  end={item.end}
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="mobile-nav-footer">
              {isAuthenticated ? (
                <>
                  <p className="mobile-nav-user">{displayName}</p>
                  <button className="button button-secondary" type="button" onClick={logout}>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <NavLink className="button button-secondary" to="/login">
                    Đăng nhập
                  </NavLink>
                  <NavLink className="button button-primary" to="/register">
                    Tạo tài khoản
                  </NavLink>
                </>
              )}

              {isHydrating ? (
                <p className="mobile-nav-note">Đang khôi phục phiên đăng nhập...</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <ChatWidget />

      <footer className="site-footer">
        <div>
          <p className="footer-kicker">Maison S4</p>
          <h2>Phong cách riêng, chất lượng bền vững.</h2>
        </div>
        <div className="footer-meta">
          <p>
            Maison S4 mang đến những bộ sưu tập thời trang được tuyển chọn kỹ lưỡng,
            tập trung vào chất liệu và thiết kế vượt thời gian.
          </p>
          <div className="footer-links">
            <Link to="/">Trang chủ</Link>
            <Link to="/products">Bộ sưu tập</Link>
            <Link to="/cart">Giỏ hàng</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
