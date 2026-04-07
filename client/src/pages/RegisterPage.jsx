import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export function RegisterPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isHydrating, register } = useAuth()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    confirmPassword: '',
    email: '',
    password: '',
    username: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = location.state?.from || '/products'

  if (isHydrating) {
    return (
      <PageFeedback
        eyebrow="Đang khôi phục phiên"
        message="Nếu bạn đã có phiên đăng nhập hợp lệ, storefront sẽ điều hướng lại ngay."
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

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }

    setIsSubmitting(true)

    try {
      await register(form)
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section auth-layout">
      <aside className="auth-panel auth-panel-warm">
        <p className="section-kicker">Tạo tài khoản</p>
        <h1>Gia nhập Maison S4 ngay hôm nay.</h1>
        <p>
          Tạo tài khoản để lưu giỏ hàng, theo dõi đơn hàng và nhận thông tin
          về các bộ sưu tập mới nhất.
        </p>
        <div className="auth-panel-notes">
          <p>Đăng ký nhanh chỉ với tên đăng nhập, email và mật khẩu.</p>
          <p>Bạn sẽ được tự động đăng nhập sau khi hoàn tất.</p>
        </div>
      </aside>

      <div className="auth-card">
        <div className="auth-card-head">
          <p>Bắt đầu</p>
          <h2>Tạo tài khoản mới</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Tên đăng nhập</span>
            <input
              autoComplete="username"
              placeholder="Chỉ chứa chữ và số"
              required
              type="text"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({ ...current, username: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              placeholder="you@example.com"
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Mật khẩu</span>
            <input
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </label>

          <label className="field">
            <span>Xác nhận mật khẩu</span>
            <input
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              required
              type="password"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
            />
          </label>

          {error ? (
            <p className="status-banner status-banner-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="button button-primary button-block" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản?{' '}
          <Link state={{ from: redirectTo }} to="/login">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </section>
  )
}
