import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { PageFeedback } from './PageFeedback.jsx'

export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, isHydrating } = useAuth()

  if (isHydrating) {
    return (
      <PageFeedback
        eyebrow="Đang tải"
        message="Mình đang kiểm tra phiên đăng nhập trước khi mở giỏ hàng của bạn."
        title="Xin chờ một chút."
      />
    )
  }

  if (!isAuthenticated) {
    return (
      <PageFeedback
        eyebrow="Giỏ hàng cá nhân"
        message="Bạn vẫn có thể xem sản phẩm tự do. Khi sẵn sàng mua, hãy đăng nhập để đồng bộ giỏ hàng với backend."
        title="Đăng nhập để sử dụng giỏ hàng của riêng bạn."
        actions={
          <>
            <Link
              className="button button-primary"
              state={{ from: `${location.pathname}${location.search}` }}
              to="/login"
            >
              Đăng nhập
            </Link>
            <Link className="button button-secondary" to="/products">
              Tiếp tục xem sản phẩm
            </Link>
          </>
        }
      />
    )
  }

  return children
}
