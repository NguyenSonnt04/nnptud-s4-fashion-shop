import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api.js'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await apiRequest('/auth/forgotpassword', {
        method: 'POST',
        body: { email },
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
        <p className="section-kicker">Quên mật khẩu</p>
        <h1>Khôi phục tài khoản của bạn.</h1>
        <p>
          Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu.
          Chúng tôi sẽ gửi hướng dẫn qua email để bạn tạo mật khẩu mới.
        </p>
        <div className="auth-panel-notes">
          <p>Liên kết đặt lại mật khẩu có hiệu lực trong thời gian giới hạn.</p>
          <p>Kiểm tra mục spam nếu bạn không thấy email trong hộp thư đến.</p>
        </div>
      </aside>

      <div className="auth-card">
        <div className="auth-card-head">
          <p>Quên mật khẩu</p>
          <h2>Khôi phục mật khẩu</h2>
        </div>

        {success ? (
          <>
            <p className="status-banner status-banner-success" role="status">
              Vui lòng kiểm tra email của bạn
            </p>
            <p className="auth-switch">
              <Link to="/login">Quay lại trang đăng nhập</Link>
            </p>
          </>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Email</span>
                <input
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              {error ? (
                <p className="status-banner status-banner-error" role="alert">
                  {error}
                </p>
              ) : null}

              <button className="button button-primary button-block" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
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
