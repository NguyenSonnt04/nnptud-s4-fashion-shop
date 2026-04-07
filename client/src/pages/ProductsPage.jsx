import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard.jsx'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { apiRequest } from '../lib/api.js'
import { buildVariantCountMap, normalizeProductSummary } from '../lib/models.js'

const sortOptions = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Giá tăng dần', value: 'price-asc' },
  { label: 'Giá giảm dần', value: 'price-desc' },
]

function sortProducts(products, sort) {
  const sorted = [...products]

  if (sort === 'price-asc') {
    return sorted.sort((left, right) => left.price - right.price)
  }

  if (sort === 'price-desc') {
    return sorted.sort((left, right) => right.price - left.price)
  }

  return sorted.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [reloadSeed, setReloadSeed] = useState(0)
  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [variantCountMap, setVariantCountMap] = useState({})
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    let isActive = true

    async function runMeta() {
      const [categoriesResult, variantsResult] = await Promise.allSettled([
        apiRequest('/categories'),
        apiRequest('/productVariants'),
      ])

      if (!isActive) {
        return
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value)
      }

      if (variantsResult.status === 'fulfilled') {
        setVariantCountMap(buildVariantCountMap(variantsResult.value))
      }
    }

    runMeta()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function runProducts() {
      setIsLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (deferredQuery) {
        params.set('title', deferredQuery)
      }
      if (minPrice) {
        params.set('minprice', minPrice)
      }
      if (maxPrice) {
        params.set('maxprice', maxPrice)
      }

      try {
        const queryString = params.toString()
        const data = await apiRequest(`/products${queryString ? `?${queryString}` : ''}`)
        if (!isActive) {
          return
        }
        startTransition(() => {
          setProducts(
            data.map((product) =>
              normalizeProductSummary(product, variantCountMap[product._id] || 0),
            ),
          )
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

    runProducts()

    return () => {
      isActive = false
    }
  }, [deferredQuery, maxPrice, minPrice, reloadSeed, variantCountMap])

  useEffect(() => {
    const nextParams = new URLSearchParams()

    if (query) {
      nextParams.set('q', query)
    }
    if (minPrice) {
      nextParams.set('min', minPrice)
    }
    if (maxPrice) {
      nextParams.set('max', maxPrice)
    }
    if (selectedCategory) {
      nextParams.set('category', selectedCategory)
    }
    if (sortBy && sortBy !== 'newest') {
      nextParams.set('sort', sortBy)
    }

    setSearchParams(nextParams, { replace: true })
  }, [maxPrice, minPrice, query, selectedCategory, setSearchParams, sortBy])

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryId === selectedCategory)
    : products
  const sortedProducts = sortProducts(filteredProducts, sortBy)

  return (
    <>
      <section className="page-section page-hero">
        <p className="section-kicker">Catalog</p>
        <h1>Tất cả sản phẩm được trình bày như một mặt báo thời trang gọn và dễ lọc.</h1>
        <p className="hero-copy">
          Search và khoảng giá sẽ gọi backend trực tiếp, còn category và sort được xử lý
          phía client để giữ trải nghiệm linh hoạt với contract API hiện có.
        </p>
      </section>

      <section className="page-section filter-panel">
        <div className="filter-grid">
          <label className="field">
            <span>Tìm theo tên</span>
            <input
              placeholder="Nhập tên sản phẩm"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Giá từ</span>
            <input
              min="0"
              placeholder="0"
              type="number"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Giá đến</span>
            <input
              min="0"
              placeholder="1000000"
              type="number"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Danh mục</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Sắp xếp</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <div>
            <p className="section-kicker">Kết quả</p>
            <h2>{sortedProducts.length} sản phẩm đang hiển thị.</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-grid">
            <div className="loading-card" />
            <div className="loading-card" />
            <div className="loading-card" />
            <div className="loading-card" />
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
                Thử lại
              </button>
            }
            eyebrow="Lỗi tải catalog"
            message={error}
            title="Catalog chưa thể kết nối tới backend."
            tone="error"
          />
        ) : null}

        {!isLoading && !error && sortedProducts.length === 0 ? (
          <PageFeedback
            eyebrow="Không có kết quả"
            message="Hãy nới khoảng giá, đổi từ khóa hoặc quay lại tất cả danh mục để xem thêm sản phẩm."
            title="Chưa có sản phẩm khớp bộ lọc hiện tại."
          />
        ) : null}

        {!isLoading && !error && sortedProducts.length > 0 ? (
          <div className="product-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}
