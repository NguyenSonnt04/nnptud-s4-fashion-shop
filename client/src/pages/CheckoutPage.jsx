import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { apiRequest, ApiError } from '../lib/api.js'
import { formatCurrency } from '../lib/format.js'
import { hydrateCartLine } from '../lib/models.js'

const PAYMENT_METHODS = [
  { label: 'Thanh toán khi nhận hàng', value: 'COD' },
  { label: 'ZaloPay', value: 'zalopay' },
  { label: 'MoMo', value: 'momo' },
  { label: 'VNPay', value: 'vnpay' },
]

export function CheckoutPage() {
  const { refreshCartCount } = useCart()
  const [addresses, setAddresses] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lines, setLines] = useState([])
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('COD')

  useEffect(function () {
    let isActive = true

    async function run() {
      setIsLoading(true)
      setError('')

      try {
        const [cartResult, addressResult] = await Promise.allSettled([
          apiRequest('/carts'),
          apiRequest('/addresses'),
        ])

        if (!isActive) {
          return
        }

        if (cartResult.status === 'rejected') {
          setError(cartResult.reason.message)
          setIsLoading(false)
          return
        }

        const rawLines = cartResult.value || []
        const hydratedLines = await Promise.all(
          rawLines.map(async function (line) {
            try {
              const variantDetail = await apiRequest('/productVariants/' + line.product)
              return hydrateCartLine(line, variantDetail, 'variant')
            } catch (variantError) {
              if (!(variantError instanceof ApiError) || variantError.status !== 404) {
                throw variantError
              }

              try {
                const productDetail = await apiRequest('/products/' + line.product)
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

        const nextAddresses = addressResult.status === 'fulfilled' ? addressResult.value : []

        startTransition(function () {
          setLines(hydratedLines.filter(Boolean))
          setAddresses(Array.isArray(nextAddresses) ? nextAddresses : [])
          if (Array.isArray(nextAddresses) && nextAddresses.length > 0) {
            setSelectedAddress(nextAddresses[0]._id)
          }
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
  }, [])

  const subtotal = lines.reduce(function (total, line) {
    return total + line.price * line.quantity
  }, 0)

  const itemCount = lines.reduce(function (total, line) {
    return total + line.quantity
  }, 0)

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setError('Vui lòng chọn địa chỉ giao hàng.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await apiRequest('/payments', {
        method: 'POST',
        body: {
          method: selectedMethod,
          amount: subtotal,
          address: selectedAddress,
        },
      })

      await refreshCartCount()
      setOrderSuccess(true)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <section className="page-section">
        <PageFeedback
          actions={
            <>
              <Link className="button button-primary" to="/orders">
                Xem đơn hàng
              </Link>
              <Link className="button button-secondary" to="/products">
                Tiếp tục mua sắm
              </Link>
            </>
          }
          eyebrow="Đặt hàng thành công"
          message="Đơn hàng của bạn đã được tạo. Bạn có thể theo dõi trạng thái đơn hàng trong trang đơn hàng."
          title="Cảm ơn bạn đã đặt hàng!"
          tone="success"
        />
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="loading-grid">
          <div className="loading-card loading-card-wide" />
          <div className="loading-card loading-card-wide" />
        </div>
      </section>
    )
  }

  if (!isLoading && lines.length === 0 && !error) {
    return (
      <section className="page-section">
        <PageFeedback
          actions={
            <Link className="button button-primary" to="/products">
              Xem sản phẩm
            </Link>
          }
          eyebrow="Giỏ hàng trống"
          message="Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán."
          title="Chưa có sản phẩm nào để thanh toán."
        />
      </section>
    )
  }

  return (
    <>
      <section className="page-section page-hero">
        <p className="section-kicker">Thanh toán</p>
        <h1>Kiểm tra đơn hàng và chọn phương thức thanh toán phù hợp.</h1>
      </section>

      {error ? (
        <section className="page-section">
          <div className="status-banner status-banner-error">{error}</div>
        </section>
      ) : null}

      <section className="page-section cart-layout">
        <div className="cart-lines">
          <p className="section-kicker">Sản phẩm trong giỏ</p>

          <div className="cart-line-list">
            {lines.map(function (line) {
              return (
                <article className="cart-line" key={line.id}>
                  <Link className="cart-line-media" to={'/products/' + line.productId}>
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
                    <p>Số lượng: {line.quantity}</p>
                  </div>
                </article>
              )
            })}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p className="section-kicker">Địa chỉ giao hàng</p>

            {addresses.length === 0 ? (
              <div style={{ marginTop: '1rem' }}>
                <p>Bạn chưa có địa chỉ nào.</p>
                <Link className="button button-secondary" to="/account/addresses" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                  Thêm địa chỉ mới
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {addresses.map(function (address) {
                  let isSelected = selectedAddress === address._id
                  return (
                    <label
                      key={address._id}
                      className={isSelected ? 'option-chip option-chip-active' : 'option-chip'}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', cursor: 'pointer' }}
                    >
                      <input
                        checked={isSelected}
                        name="address"
                        type="radio"
                        value={address._id}
                        onChange={function () {
                          setSelectedAddress(address._id)
                        }}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <div>
                        <strong>{address.fullName || address.name || ''}</strong>
                        <p style={{ margin: 0 }}>{address.phone || ''}</p>
                        <p style={{ margin: 0 }}>
                          {[address.street, address.ward, address.district, address.city, address.province]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </label>
                  )
                })}
                <Link className="button button-secondary" to="/account/addresses" style={{ alignSelf: 'flex-start' }}>
                  Quản lý địa chỉ
                </Link>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p className="section-kicker">Phương thức thanh toán</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              {PAYMENT_METHODS.map(function (pm) {
                let isActive = selectedMethod === pm.value
                return (
                  <button
                    key={pm.value}
                    className={isActive ? 'option-chip option-chip-active' : 'option-chip'}
                    type="button"
                    onClick={function () {
                      setSelectedMethod(pm.value)
                    }}
                  >
                    {pm.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <aside className="cart-summary">
          <p className="section-kicker">Tóm tắt đơn hàng</p>
          <h2>Xác nhận trước khi đặt hàng.</h2>

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
              <span>Phương thức</span>
              <strong>{PAYMENT_METHODS.find(function (pm) { return pm.value === selectedMethod })?.label || selectedMethod}</strong>
            </div>
          </div>

          <div className="summary-total">
            <span>Tổng cộng</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <button
            className="button button-primary button-block"
            disabled={isSubmitting || lines.length === 0 || (!selectedAddress && addresses.length > 0)}
            type="button"
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
          </button>
          <Link className="button button-secondary button-block" to="/cart">
            Quay lại giỏ hàng
          </Link>
        </aside>
      </section>
    </>
  )
}
