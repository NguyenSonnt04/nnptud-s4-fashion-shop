import { startTransition, useEffect, useEffectEvent, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { apiRequest } from '../lib/api.js'
import { formatCurrency } from '../lib/format.js'
import { getDisplayPrice, normalizeProductSummary, normalizeVariant } from '../lib/models.js'

function uniqueValues(list) {
  return [...new Set(list)]
}

export function ProductDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { refreshCartCount } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [product, setProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [variants, setVariants] = useState([])

  const loadDetail = useEffectEvent(async () => {
    setIsLoading(true)
    setError('')
    setSelectedColor('')
    setSelectedSize('')
    setStatusMessage('')
    setActiveImage(0)

    try {
      const [productData, variantsData] = await Promise.all([
        apiRequest(`/products/${id}`),
        apiRequest(`/productVariants?product=${id}`),
      ])

      const normalizedVariants = variantsData.map(normalizeVariant)
      const normalizedProduct = normalizeProductSummary(productData, normalizedVariants.length)

      startTransition(() => {
        setProduct(normalizedProduct)
        setVariants(normalizedVariants)
      })

      const singleColor = uniqueValues(normalizedVariants.map((variant) => variant.color))
      const singleSize = uniqueValues(normalizedVariants.map((variant) => variant.size))

      if (singleColor.length === 1) {
        setSelectedColor(singleColor[0])
      }

      if (singleSize.length === 1) {
        setSelectedSize(singleSize[0])
      }
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    loadDetail()
  }, [id])

  const availableColors = selectedSize
    ? uniqueValues(
        variants
          .filter((variant) => variant.size === selectedSize)
          .map((variant) => variant.color),
      )
    : uniqueValues(variants.map((variant) => variant.color))

  const availableSizes = selectedColor
    ? uniqueValues(
        variants
          .filter((variant) => variant.color === selectedColor)
          .map((variant) => variant.size),
      )
    : uniqueValues(variants.map((variant) => variant.size))

  const selectedVariant =
    variants.find(
      (variant) => variant.color === selectedColor && variant.size === selectedSize,
    ) || null

  const galleryImages = selectedVariant?.images || product?.images || []
  const detailPrice = selectedVariant
    ? {
        current: selectedVariant.price,
        original: selectedVariant.originalPrice,
      }
    : getDisplayPrice(product)

  useEffect(() => {
    setActiveImage(0)
  }, [selectedVariant?.id, product?.id])

  async function handleAddToCart() {
    setStatusMessage('')

    if (!product) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }

    if (variants.length > 0 && !selectedVariant) {
      setStatusMessage('Hãy chọn đủ size và màu trước khi thêm vào giỏ.')
      return
    }

    setIsSubmitting(true)

    try {
      await apiRequest('/carts/add', {
        body: {
          product: selectedVariant ? selectedVariant.id : product.id,
        },
        method: 'POST',
      })
      await refreshCartCount()
      setStatusMessage('Đã thêm sản phẩm vào giỏ hàng.')
    } catch (submitError) {
      setStatusMessage(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="loading-grid">
          <div className="loading-card loading-card-tall" />
          <div className="loading-card loading-card-tall" />
        </div>
      </section>
    )
  }

  if (error || !product) {
    return (
      <PageFeedback
        actions={
          <Link className="button button-primary" to="/products">
            Quay lại catalog
          </Link>
        }
        eyebrow="Không thể mở chi tiết"
        message={error || 'Sản phẩm này hiện không còn khả dụng.'}
        title="Trang detail chưa thể hiển thị sản phẩm."
        tone="error"
      />
    )
  }

  return (
    <section className="page-section detail-layout">
      <div className="detail-gallery">
        <div className="detail-gallery-main">
          <img alt={product.title} src={galleryImages[activeImage]} />
        </div>

        <div className="detail-gallery-thumbs">
          {galleryImages.map((image, index) => (
            <button
              aria-label={`Xem ảnh ${index + 1}`}
              className={index === activeImage ? 'thumb-button thumb-button-active' : 'thumb-button'}
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
            >
              <img alt="" src={image} />
            </button>
          ))}
        </div>
      </div>

      <aside className="detail-panel">
        <p className="section-kicker">{product.categoryName}</p>
        <h1>{product.title}</h1>
        <p className="detail-copy">{product.description}</p>

        <div className="detail-price">
          <strong>{formatCurrency(detailPrice.current)}</strong>
          {detailPrice.original ? <span>{formatCurrency(detailPrice.original)}</span> : null}
        </div>

        {variants.length > 0 ? (
          <div className="detail-options">
            {uniqueValues(variants.map((variant) => variant.color)).length > 1 ? (
              <div className="option-group">
                <div className="option-group-head">
                  <span>Màu sắc</span>
                  <strong>{selectedColor || 'Chưa chọn'}</strong>
                </div>
                <div className="option-row">
                  {uniqueValues(variants.map((variant) => variant.color)).map((color) => {
                    const sample = variants.find((variant) => variant.color === color)
                    const disabled = !availableColors.includes(color)

                    return (
                      <button
                        className={
                          color === selectedColor ? 'color-chip color-chip-active' : 'color-chip'
                        }
                        disabled={disabled}
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                      >
                        <span
                          className="color-chip-swatch"
                          style={{ backgroundColor: sample?.colorCode || '#d1c6b8' }}
                        />
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {uniqueValues(variants.map((variant) => variant.size)).length > 1 ? (
              <div className="option-group">
                <div className="option-group-head">
                  <span>Kích thước</span>
                  <strong>{selectedSize || 'Chưa chọn'}</strong>
                </div>
                <div className="option-row">
                  {uniqueValues(variants.map((variant) => variant.size)).map((size) => {
                    const disabled = !availableSizes.includes(size)
                    return (
                      <button
                        className={
                          size === selectedSize ? 'option-chip option-chip-active' : 'option-chip'
                        }
                        disabled={disabled}
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="detail-meta">
          <div>
            <span>SKU</span>
            <strong>{selectedVariant?.sku || product.sku}</strong>
          </div>
          <div>
            <span>Chất liệu</span>
            <strong>{selectedVariant?.material || 'Chưa có thông tin'}</strong>
          </div>
          <div>
            <span>Trạng thái</span>
            <strong>{selectedVariant?.status || 'Chưa chọn biến thể'}</strong>
          </div>
          {selectedVariant?.weight ? (
            <div>
              <span>Khối lượng</span>
              <strong>{selectedVariant.weight} g</strong>
            </div>
          ) : null}
          {selectedVariant?.barcode ? (
            <div>
              <span>Barcode</span>
              <strong>{selectedVariant.barcode}</strong>
            </div>
          ) : null}
        </div>

        {statusMessage ? (
          <p
            className={
              statusMessage.includes('Đã thêm')
                ? 'status-banner status-banner-success'
                : 'status-banner status-banner-error'
            }
            role="alert"
          >
            {statusMessage}
          </p>
        ) : null}

        <div className="detail-actions">
          <button
            className="button button-primary button-block"
            disabled={isSubmitting}
            type="button"
            onClick={handleAddToCart}
          >
            {isSubmitting ? 'Đang thêm vào giỏ...' : 'Thêm vào giỏ hàng'}
          </button>
          <Link className="button button-secondary button-block" to="/products">
            Quay lại catalog
          </Link>
        </div>
      </aside>
    </section>
  )
}
