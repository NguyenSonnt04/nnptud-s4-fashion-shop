import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { isAdminUser } from '../lib/admin.js'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export function LoginPage() {
  const location = useLocation()
  const { isAuthenticated, isHydrating, login, user } = useAuth()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    password: '',
    username: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from || (isAdminUser(user) ? '/admin' : '/products')

  if (isHydrating) {
    return (
      <PageFeedback
        eyebrow="Đang khôi phục phiên"
        message="Nếu bạn đã đăng nhập trước đó, mình sẽ đưa bạn trở lại đúng trang đang xem."
        title="Xin chờ một chút."
      />
    )
  }

  if (isAuthenticated) {
    return <Navigate replace to={redirectTo} />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login(form)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section auth-layout">
      <aside className="auth-panel">
        <p className="section-kicker">Đăng nhập</p>
        <h1>Chào mừng trở lại Maison S4.</h1>
        <p>
          Đăng nhập để truy cập giỏ hàng, theo dõi đơn hàng và khám phá
          bộ sưu tập mới nhất dành riêng cho bạn.
        </p>
        <div className="auth-panel-notes">
          <p>Bạn có thể xem sản phẩm tự do mà không cần đăng nhập.</p>
          <p>Giỏ hàng sẽ được đồng bộ ngay sau khi đăng nhập thành công.</p>
        </div>
      </aside>

      <div className="auth-card">
        <div className="auth-card-head">
          <p>Xin chào trở lại</p>
          <h2>Đăng nhập tài khoản</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Tên đăng nhập</span>
            <input
              autoComplete="username"
              placeholder="vd: maisonuser"
              required
              type="text"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Mật khẩu</span>
            <input
              autoComplete="current-password"
              placeholder="Nhập mật khẩu của bạn"
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </label>

          {error ? (
            <p className="status-banner status-banner-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="button button-primary button-block" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản?{' '}
          <Link state={{ from: redirectTo }} to="/register">
            Tạo tài khoản mới
          </Link>
        </p>
        <p className="auth-switch">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>
      </div>
    </section>
  )
}
