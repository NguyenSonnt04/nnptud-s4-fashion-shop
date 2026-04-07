import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { PageFeedback } from '../PageFeedback.jsx'
import { isAdminUser } from '../../lib/admin.js'

export function AdminRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, isHydrating, user } = useAuth()

  if (isHydrating) {
    return (
      <PageFeedback
        eyebrow="Admin panel"
        message="Mình đang kiểm tra phiên đăng nhập và quyền quản trị trước khi mở khu điều hành."
        title="Xin chờ một chút."
      />
    )
  }

  if (!isAuthenticated) {
    return (
      <PageFeedback
        eyebrow="Đăng nhập quản trị"
        message="Panel này dùng chung phiên đăng nhập với storefront. Hãy đăng nhập bằng tài khoản admin để tiếp tục."
        title="Bạn cần đăng nhập để mở khu quản trị."
        actions={
          <>
            <Link
              className="button button-primary"
              state={{ from: `${location.pathname}${location.search}` }}
              to="/login"
            >
              Đăng nhập
            </Link>
            <Link className="button button-secondary" to="/">
              Về storefront
            </Link>
          </>
        }
      />
    )
  }

  if (!isAdminUser(user)) {
    return (
      <PageFeedback
        eyebrow="Không đủ quyền"
        message="Backend hiện chỉ cho tài khoản có role ADMIN truy cập các route quản trị. Bạn có thể quay lại storefront hoặc đăng nhập bằng tài khoản khác."
        title="Tài khoản này chưa có quyền vào admin panel."
        tone="error"
        actions={
          <>
            <Link className="button button-primary" to="/">
              Về storefront
            </Link>
            <Link className="button button-secondary" to="/products">
              Xem sản phẩm
            </Link>
          </>
        }
      />
    )
  }

  return children
}
