import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QuantityControl } from '../components/QuantityControl.jsx'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { apiRequest, ApiError } from '../lib/api.js'
import { formatCurrency } from '../lib/format.js'
import { hydrateCartLine } from '../lib/models.js'

export function CartPage() {
  const { refreshCartCount } = useCart()
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [lines, setLines] = useState([])
  const [reloadSeed, setReloadSeed] = useState(0)

  useEffect(() => {
    let isActive = true

    async function run() {
      setIsLoading(true)
      setError('')

      try {
        const rawLines = await apiRequest('/carts')
        const hydratedLines = await Promise.all(
          rawLines.map(async (line) => {
            try {
              const variantDetail = await apiRequest(`/productVariants/${line.product}`)
              return hydrateCartLine(line, variantDetail, 'variant')
            } catch (variantError) {
              if (!(variantError instanceof ApiError) || variantError.status !== 404) {
                throw variantError
              }

              try {
                const productDetail = await apiRequest(`/products/${line.product}`)
                return hydrateCartLine(line, productDetail, 'product')
              } catch {
                return null
              }
            }
          }),
        )

        if (!isActive) {
          return
        }

        startTransition(() => {
          setLines(hydratedLines.filter(Boolean))
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

    return () => {
      isActive = false
    }
  }, [reloadSeed])

  async function mutateLine(line, mutation, nextQuantity) {
    setBusyId(line.id)
    setError('')

    try {
      if (mutation === 'modify') {
        await apiRequest('/carts/modify', {
          body: {
            product: line.sourceId,
            quantity: nextQuantity,
          },
          method: 'POST',
        })
      } else {
        await apiRequest(`/carts/${mutation}`, {
          body: {
            product: line.sourceId,
          },
          method: 'POST',
        })
      }

      await refreshCartCount()
      setReloadSeed((seed) => seed + 1)
    } catch (mutationError) {
      setError(mutationError.message)
    } finally {
      setBusyId('')
    }
  }

  const itemCount = lines.reduce((total, line) => total + line.quantity, 0)
  const subtotal = lines.reduce((total, line) => total + line.price * line.quantity, 0)

  return (
    <>
      <section className="page-section page-hero">
        <p className="section-kicker">Giỏ hàng</p>
        <h1>Những món bạn đã chọn được gom lại thành một summary rõ ràng và dễ chỉnh số lượng.</h1>
        <p className="hero-copy">
          Hydration ưu tiên đọc productVariant trước, rồi fallback về product để vẫn hiển
          thị được cả những line item cũ.
        </p>
      </section>

      <section className="page-section cart-layout">
        <div className="cart-lines">
          {isLoading ? (
            <div className="loading-grid">
              <div className="loading-card loading-card-wide" />
              <div className="loading-card loading-card-wide" />
            </div>
          ) : null}

          {!isLoading && error ? (
            <PageFeedback
              actions={
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => setReloadSeed((seed) => seed + 1)}
                >
                  Tải lại giỏ hàng
                </button>
              }
              eyebrow="Lỗi giỏ hàng"
              message={error}
              title="Mình chưa thể đọc dữ liệu giỏ hàng từ backend."
              tone="error"
            />
          ) : null}

          {!isLoading && !error && lines.length === 0 ? (
            <PageFeedback
              actions={
                <Link className="button button-primary" to="/products">
                  Xem sản phẩm
                </Link>
              }
              eyebrow="Giỏ hàng trống"
              message="Bạn có thể tiếp tục duyệt catalog, chọn size và màu ở trang detail rồi quay lại đây."
              title="Hiện chưa có sản phẩm nào trong giỏ."
            />
          ) : null}

          {!isLoading && !error && lines.length > 0 ? (
            <div className="cart-line-list">
              {lines.map((line) => (
                <article className="cart-line" key={line.id}>
                  <Link className="cart-line-media" to={`/products/${line.productId}`}>
                    <img alt={line.title} src={line.image} />
                  </Link>

                  <div className="cart-line-body">
                    <div className="cart-line-heading">
                      <div>
                        <h2>{line.title}</h2>
                        <p>{line.subtitle}</p>
                      </div>
                      <div className="price-block">
                        <strong>{formatCurrency(line.price)}</strong>
                        {line.originalPrice ? (
                          <span>{formatCurrency(line.originalPrice)}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="cart-line-actions">
                      <QuantityControl
                        disabled={busyId === line.id}
                        value={line.quantity}
                        onCommit={(nextValue) => mutateLine(line, 'modify', nextValue)}
                        onDecrease={() => mutateLine(line, 'decrease')}
                        onIncrease={() => mutateLine(line, 'add')}
                      />

                      <button
                        className="button button-ghost"
                        disabled={busyId === line.id}
                        type="button"
                        onClick={() => mutateLine(line, 'remove')}
                      >
                        Xóa khỏi giỏ
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="cart-summary">
          <p className="section-kicker">Tóm tắt đơn</p>
          <h2>Những gì bạn đang chuẩn bị mang về.</h2>

          <div className="summary-list">
            <div>
              <span>Số lượng item</span>
              <strong>{itemCount}</strong>
            </div>
            <div>
              <span>Tạm tính</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span>Phí vận chuyển</span>
              <strong>Thông báo ở bước checkout</strong>
            </div>
          </div>

          <div className="summary-total">
            <span>Tổng tạm tính</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <Link className="button button-primary button-block" to="/checkout">
            Tiến hành thanh toán
          </Link>
          <Link className="button button-secondary button-block" to="/products">
            Tiếp tục mua sắm
          </Link>
        </aside>
      </section>
    </>
  )
}
