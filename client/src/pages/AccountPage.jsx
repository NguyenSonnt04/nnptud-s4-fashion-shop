import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'
import { PageFeedback } from '../components/PageFeedback.jsx'

export function AccountPage() {
  const { isAuthenticated, isHydrating, user } = useAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    confirmPassword: '',
    newpassword: '',
    oldpassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isHydrating) {
    return (
      <PageFeedback
        eyebrow="Đang khôi phục phiên"
        message="Nếu bạn đã đăng nhập trước đó, mình sẽ đưa bạn trở lại đúng trang đang xem."
        title="Xin chờ một chút."
      />
    )
  }

  if (!isAuthenticated) {
    return (
      <PageFeedback
        actions={
          <>
            <Link className="button button-primary" state={{ from: '/account' }} to="/login">
              Đăng nhập
            </Link>
            <Link className="button button-secondary" to="/products">
              Tiếp tục xem sản phẩm
            </Link>
          </>
        }
        eyebrow="Tài khoản cá nhân"
        message="Bạn cần đăng nhập để xem thông tin tài khoản và đổi mật khẩu."
        title="Đăng nhập để truy cập tài khoản."
      />
    )
  }

  async function handleChangePassword(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.newpassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }

    if (form.newpassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await apiRequest('/auth/changepassword', {
        body: {
          newpassword: form.newpassword,
          oldpassword: form.oldpassword,
        },
        method: 'GET',
      })

      if (data && data.message === 'da cap nhat') {
        setSuccess('Mật khẩu đã được cập nhật thành công.')
        setForm({ confirmPassword: '', newpassword: '', oldpassword: '' })
      } else if (data && data.message) {
        setError(data.message)
      }
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="page-section page-hero">
        <p className="section-kicker">Tài khoản</p>
        <h1>Thông tin tài khoản và cài đặt bảo mật của bạn.</h1>
      </section>

      <section className="page-section auth-layout">
        <aside className="auth-panel">
          <p className="section-kicker">Thông tin cá nhân</p>
          <h2>Xin chào, {user.fullName || user.username}.</h2>

          <div className="auth-panel-notes">
            <p>
              <strong>Tên đăng nhập:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.fullName ? (
              <p>
                <strong>Họ tên:</strong> {user.fullName}
              </p>
            ) : null}
          </div>

          <div className="auth-panel-notes">
            <p>
              <Link className="text-link" to="/account/addresses">
                Quản lý địa chỉ giao hàng
              </Link>
            </p>
            <p>
              <Link className="text-link" to="/account/orders">
                Xem lịch sử đơn hàng
              </Link>
            </p>
          </div>
        </aside>

        <div className="auth-card">
          <div className="auth-card-head">
            <p>Bảo mật</p>
            <h2>Đổi mật khẩu</h2>
          </div>

          <form className="auth-form" onSubmit={handleChangePassword}>
            <label className="field">
              <span>Mật khẩu hiện tại</span>
              <input
                autoComplete="current-password"
                placeholder="Nhập mật khẩu hiện tại"
                required
                type="password"
                value={form.oldpassword}
                onChange={(event) =>
                  setForm((current) => ({ ...current, oldpassword: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>Mật khẩu mới</span>
              <input
                autoComplete="new-password"
                placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                required
                type="password"
                value={form.newpassword}
                onChange={(event) =>
                  setForm((current) => ({ ...current, newpassword: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>Xác nhận mật khẩu mới</span>
              <input
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
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

            {success ? (
              <p className="status-banner status-banner-success" role="status">
                {success}
              </p>
            ) : null}

            <button className="button button-primary button-block" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
