import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../lib/api.js'

export function ResetPasswordPage() {
  const { token } = useParams()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    confirmPassword: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }

    setIsSubmitting(true)

    try {
      await apiRequest(`/auth/resetpassword/${token}`, {
        method: 'POST',
        body: { password: form.password },
      })
      setSuccess(true)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section auth-layout">
      <aside className="auth-panel">
        <p className="section-kicker">Đặt lại mật khẩu</p>
        <h1>Tạo mật khẩu mới cho tài khoản.</h1>
        <p>
          Nhập mật khẩu mới để hoàn tất quá trình khôi phục tài khoản.
          Mật khẩu cần có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
        </p>
        <div className="auth-panel-notes">
          <p>Liên kết đặt lại mật khẩu chỉ sử dụng được một lần.</p>
          <p>Sau khi đổi mật khẩu, bạn có thể đăng nhập ngay lập tức.</p>
        </div>
      </aside>

      <div className="auth-card">
        <div className="auth-card-head">
          <p>Đặt lại mật khẩu</p>
          <h2>Tạo mật khẩu mới</h2>
        </div>

        {success ? (
          <>
            <p className="status-banner status-banner-success" role="status">
              Đặt lại mật khẩu thành công
            </p>
            <p className="auth-switch">
              <Link to="/login">Đăng nhập với mật khẩu mới</Link>
            </p>
          </>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Mật khẩu mới</span>
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

              <button className="button button-primary button-block" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>

            <p className="auth-switch">
              Đã nhớ mật khẩu?{' '}
              <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </>
        )}
      </div>
    </section>
  )
}
