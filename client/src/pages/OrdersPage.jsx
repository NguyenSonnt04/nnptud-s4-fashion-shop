import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { apiRequest } from '../lib/api.js'
import { formatCurrency } from '../lib/format.js'

const STATUS_STYLES = {
  pending: { background: '#fef3cd', color: '#856404', label: 'Chờ xử lý' },
  paid: { background: '#d4edda', color: '#155724', label: 'Đã thanh toán' },
  failed: { background: '#f8d7da', color: '#721c24', label: 'Thất bại' },
  refunded: { background: '#d1ecf1', color: '#0c5460', label: 'Đã hoàn tiền' },
}

function StatusBadge({ status }) {
  let style = STATUS_STYLES[status] || STATUS_STYLES.pending
  return (
    <span
      style={{
        background: style.background,
        borderRadius: '999px',
        color: style.color,
        display: 'inline-block',
        fontSize: '0.8rem',
        fontWeight: 600,
        padding: '0.25rem 0.75rem',
      }}
    >
      {style.label}
    </span>
  )
}

function formatDate(dateString) {
  if (!dateString) {
    return ''
  }

  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

function formatMethodLabel(method) {
  switch (method) {
    case 'COD':
      return 'Thanh toán khi nhận hàng'
    case 'zalopay':
      return 'ZaloPay'
    case 'momo':
      return 'MoMo'
    case 'vnpay':
      return 'VNPay'
    default:
      return method
  }
}

export function OrdersPage() {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [reloadSeed, setReloadSeed] = useState(0)

  useEffect(function () {
    let isActive = true

    async function run() {
      setIsLoading(true)
      setError('')

      try {
        const data = await apiRequest('/payments/my')

        if (!isActive) {
          return
        }

        startTransition(function () {
          setOrders(Array.isArray(data) ? data : [])
        })
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    run()

    return function () {
      isActive = false
    }
  }, [reloadSeed])

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="loading-grid">
          <div className="loading-card loading-card-wide" />
          <div className="loading-card loading-card-wide" />
          <div className="loading-card loading-card-wide" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-section">
        <PageFeedback
          actions={
            <button
              className="button button-primary"
              type="button"
              onClick={function () {
                setReloadSeed(function (seed) {
                  return seed + 1
                })
              }}
            >
              Tải lại
            </button>
          }
          eyebrow="Lỗi dữ liệu"
          message={error}
          title="Không thể tải danh sách đơn hàng."
          tone="error"
        />
      </section>
    )
  }

  if (orders.length === 0) {
    return (
      <>
        <section className="page-section page-hero">
          <p className="section-kicker">Đơn hàng</p>
          <h1>Lịch sử đơn hàng của bạn.</h1>
        </section>

        <section className="page-section">
          <PageFeedback
            actions={
              <Link className="button button-primary" to="/products">
                Khám phá sản phẩm
              </Link>
            }
            eyebrow="Chưa có đơn hàng"
            message="Khi bạn đặt hàng thành công, đơn hàng sẽ hiển thị tại đây."
            title="Bạn chưa có đơn hàng nào."
          />
        </section>
      </>
    )
  }

  return (
    <>
      <section className="page-section page-hero">
        <p className="section-kicker">Đơn hàng</p>
        <h1>Lịch sử đơn hàng của bạn.</h1>
        <p className="hero-copy">
          Theo dõi trạng thái các đơn hàng đã đặt và lịch sử thanh toán.
        </p>
      </section>

      <section className="page-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(function (order) {
            return (
              <article
                key={order._id}
                style={{
                  border: '1px solid var(--color-border, #e5e1db)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-muted, #8a8580)', margin: '0 0 0.25rem' }}>
                      {formatDate(order.createdAt)}
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
                      {formatCurrency(order.amount)}
                    </p>
                    <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--color-muted, #8a8580)' }}>
                      {formatMethodLabel(order.method)}
                      {order.currency ? ' (' + order.currency + ')' : ''}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <StatusBadge status={order.status} />
                    {order.paidAt ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted, #8a8580)', margin: '0.5rem 0 0' }}>
                        Đã thanh toán: {formatDate(order.paidAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link className="button button-secondary" to="/products">
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    </>
  )
}
