import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard.jsx'
import { ArrowRightIcon, DeliveryIcon, ShieldIcon, SparkIcon } from '../components/Icons.jsx'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { apiRequest } from '../lib/api.js'
import {
  buildVariantCountMap,
  normalizeProductSummary,
  resolveImageUrl,
} from '../lib/models.js'

export function HomePage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [reloadSeed, setReloadSeed] = useState(0)
  const [variantCountMap, setVariantCountMap] = useState({})

  useEffect(() => {
    let isActive = true

    async function run() {
      setIsLoading(true)
      setError('')

      const [productsResult, categoriesResult, variantsResult] = await Promise.allSettled([
        apiRequest('/products'),
        apiRequest('/categories'),
        apiRequest('/productVariants'),
      ])

      if (!isActive) {
        return
      }

      if (productsResult.status === 'rejected') {
        setError(productsResult.reason.message)
        setIsLoading(false)
        return
      }

      const nextProducts = productsResult.value || []
      const nextVariants = variantsResult.status === 'fulfilled' ? variantsResult.value : []
      const counts = buildVariantCountMap(nextVariants)

      startTransition(() => {
        setProducts(
          nextProducts.map((product) =>
            normalizeProductSummary(product, counts[product._id] || 0),
          ),
        )
        setCategories(categoriesResult.status === 'fulfilled' ? categoriesResult.value : [])
        setVariantCountMap(counts)
      })

      setIsLoading(false)
    }

    run()

    return () => {
      isActive = false
    }
  }, [reloadSeed])

  const latestProducts = [...products]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 4)
  const featuredProducts = products.slice(0, 3)
  const heroProduct = featuredProducts[0]
  const heroImage = heroProduct ? resolveImageUrl(heroProduct.images[0]) : null

  if (isLoading) {
    return (
      <section className="page-section">
        <div className="editorial-loader">
          <div className="loading-block loading-block-heading" />
          <div className="loading-block" />
          <div className="loading-block loading-block-short" />
          <div className="loading-grid">
            <div className="loading-card" />
            <div className="loading-card" />
            <div className="loading-card" />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <PageFeedback
        actions={
          <button
            className="button button-primary"
            type="button"
            onClick={() => setReloadSeed((seed) => seed + 1)}
          >
            Tải lại
          </button>
        }
        eyebrow="Lỗi dữ liệu"
        message={error}
        title="Trang chủ chưa thể tải bộ sưu tập ngay lúc này."
        tone="error"
      />
    )
  }

  return (
    <>
      <section className="page-section home-hero">
        <div className="home-hero-copy">
          <p className="section-kicker">New Season</p>
          <h1>
            Tinh giản trong từng đường nét, bền vững trong từng chất liệu.
          </h1>
          <p className="hero-copy">
            Khám phá bộ sưu tập mới nhất với phom dáng hiện đại, tông màu trung tính
            và chất liệu cao cấp cho phong cách thanh lịch mỗi ngày.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/products">
              Khám phá sản phẩm
            </Link>
            <Link className="button button-secondary" to="/register">
              Tạo tài khoản mới
            </Link>
          </div>
          <div className="hero-metrics">
            <article>
              <strong>03</strong>
              <span>dải màu nền tảng để phối xuyên tuần</span>
            </article>
            <article>
              <strong>48h</strong>
              <span>đổi size nhanh cho đơn phù hợp điều kiện</span>
            </article>
            <article>
              <strong>Curated</strong>
              <span>mỗi item được chọn để mix tối đa nhiều bối cảnh</span>
            </article>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="hero-visual-frame">
            <div className="hero-visual-card hero-visual-card-back" />
            <div className="hero-visual-card hero-visual-card-front">
              {heroImage ? (
                <img
                  alt={heroProduct ? `${heroProduct.title} nổi bật` : 'Lookbook nổi bật'}
                  src={heroImage}
                />
              ) : null}
              <div className="hero-visual-caption">
                <span>Spotlight</span>
                <strong>{heroProduct?.title || 'Lookbook Maison S4'}</strong>
                <p>
                  {heroProduct?.hasVariants
                    ? 'Nhiều lựa chọn size & màu sắc'
                    : 'Thiết kế tối giản, phong cách vượt thời gian'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section category-strip">
        <div className="section-header">
          <div>
            <p className="section-kicker">Danh mục</p>
            <h2>Khám phá theo phong cách</h2>
          </div>
          <Link className="text-link" to="/products">
            Xem toàn bộ sản phẩm
            <ArrowRightIcon className="inline-icon" />
          </Link>
        </div>

        <div className="category-grid">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category._id}
              className="category-card"
              to={`/products?category=${category._id}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{category.name}</strong>
              <small>Xem bộ sưu tập</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section editorial-panel">
        <div className="editorial-panel-copy">
          <p className="section-kicker">Cam kết</p>
          <h2>Chất lượng là nền tảng, phong cách là bản sắc.</h2>
          <p>
            Mỗi sản phẩm đều được tuyển chọn kỹ lưỡng về chất liệu, form dáng
            và độ bền để mang đến trải nghiệm mua sắm đáng tin cậy.
          </p>
        </div>

        <div className="editorial-badges">
          <article>
            <ShieldIcon className="panel-icon" />
            <strong>Chất liệu cao cấp</strong>
            <p>Tuyển chọn từ những nhà cung cấp uy tín, ưu tiên chất lượng bền vững.</p>
          </article>
          <article>
            <DeliveryIcon className="panel-icon" />
            <strong>Giao hàng toàn quốc</strong>
            <p>Đóng gói cẩn thận, vận chuyển nhanh chóng đến tận tay bạn.</p>
          </article>
          <article>
            <SparkIcon className="panel-icon" />
            <strong>Thiết kế vượt thời gian</strong>
            <p>Phom dáng hiện đại, tông màu trung tính dễ phối cho mọi dịp.</p>
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <div>
            <p className="section-kicker">New arrivals</p>
            <h2>Sản phẩm mới nhất</h2>
          </div>
          <Link className="text-link" to="/products?sort=newest">
            Mở catalog
            <ArrowRightIcon className="inline-icon" />
          </Link>
        </div>

        {latestProducts.length > 0 ? (
          <div className="product-grid">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <PageFeedback
            eyebrow="Chưa có sản phẩm"
            message="Khi backend có thêm dữ liệu sản phẩm, section này sẽ tự hiển thị các item mới nhất."
            title="New arrivals đang trống."
          />
        )}
      </section>

      <section className="page-section spotlight-grid">
        <div className="spotlight-copy">
          <p className="section-kicker">Nổi bật</p>
          <h2>Được yêu thích nhất tuần này</h2>
          <p>
            Những thiết kế đang nhận được nhiều sự quan tâm nhất từ cộng đồng
            Maison S4 trong tuần qua.
          </p>
        </div>

        <div className="spotlight-products">
          {featuredProducts.slice(0, 2).map((product) => (
            <Link className="spotlight-product" key={product.id} to={`/products/${product.id}`}>
              <img alt={product.title} src={product.images[0]} />
              <div>
                <strong>{product.title}</strong>
                <span>
                  {variantCountMap[product.id] > 0
                    ? 'Xem biến thể size và màu'
                    : 'Xem thông tin chi tiết sản phẩm'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
