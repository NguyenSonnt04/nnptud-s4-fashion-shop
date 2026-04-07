import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminEmptyState,
  AdminImageField,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
} from '../../components/admin/AdminShared.jsx'
import {
  extractEntityId,
  formatAdminCurrency,
  formatAdminDateTime,
  parseListInput,
  toNumber,
} from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'
import { resolveImageUrl } from '../../lib/models.js'

const initialForm = {
  category: '',
  description: '',
  images: '',
  price: '',
  sku: '',
  title: '',
}

export function AdminProductsPage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [variants, setVariants] = useState([])

  const isEditing = Boolean(selectedId)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [categoryData, productData, variantData] = await Promise.all([
        apiRequest('/categories'),
        apiRequest('/products'),
        apiRequest('/productVariants'),
      ])

      startTransition(() => {
        setCategories(categoryData)
        setProducts(productData)
        setVariants(variantData)
      })
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const categoryMap = useMemo(() => {
    return categories.reduce((map, category) => {
      map[category._id] = category
      return map
    }, {})
  }, [categories])

  const variantCountMap = useMemo(() => {
    return variants.reduce((map, variant) => {
      const productId = extractEntityId(variant.product)
      map[productId] = (map[productId] || 0) + 1
      return map
    }, {})
  }, [variants])

  const filteredProducts = useMemo(() => {
    const keyword = filter.trim().toLowerCase()

    return [...products]
      .filter((product) => {
        if (!keyword) {
          return true
        }

        const categoryName =
          product.category?.name || categoryMap[extractEntityId(product.category)]?.name || ''

        return [product.title, product.sku, categoryName]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      })
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
  }, [categoryMap, filter, products])

  function resetForm() {
    setSelectedId('')
    setForm(initialForm)
  }

  function handleEdit(product) {
    setSelectedId(product._id)
    setForm({
      category: extractEntityId(product.category),
      description: product.description || '',
      images: (product.images || []).join('\n'),
      price: String(product.price || ''),
      sku: product.sku || '',
      title: product.title || '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        category: form.category,
        description: form.description.trim(),
        images: parseListInput(form.images),
        price: toNumber(form.price),
        sku: form.sku.trim(),
        title: form.title.trim(),
      }

      if (isEditing) {
        await apiRequest(`/products/${selectedId}`, {
          body: payload,
          method: 'PUT',
        })
      } else {
        await apiRequest('/products', {
          body: payload,
          method: 'POST',
        })
      }

      await loadData()
      resetForm()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Xóa mềm sản phẩm "${product.title}"?`)) {
      return
    }

    try {
      await apiRequest(`/products/${product._id}`, {
        method: 'DELETE',
      })
      await loadData()
      if (selectedId === product._id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <>
      <AdminPageHeader
        description="Product gốc là lớp nền để storefront render listing, còn detail sẽ nối xuống variant."
        eyebrow="Catalog"
        title="Quản lý sản phẩm gốc"
        actions={
          <button className="button button-secondary" type="button" onClick={resetForm}>
            {isEditing ? 'Tạo sản phẩm mới' : 'Làm mới form'}
          </button>
        }
      />

      <section className="admin-grid">
        <AdminPanel
          description="Tạo product mới trước, rồi qua tab Biến thể để thêm size, màu và stock."
          title={isEditing ? 'Cập nhật product' : 'Tạo product mới'}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>SKU</span>
                <input
                  placeholder="MS4-SHIRT-001"
                  required
                  type="text"
                  value={form.sku}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sku: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Giá gốc</span>
                <input
                  min="0"
                  placeholder="890000"
                  required
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Tên sản phẩm</span>
              <input
                placeholder="Relaxed Linen Shirt"
                required
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>Danh mục</span>
              <select
                required
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Mô tả</span>
              <textarea
                placeholder="Mô tả ngắn cho storefront và detail page"
                rows="5"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>

            <AdminImageField
              hint="Có thể nhập nhiều URL/path, mỗi dòng một ảnh. Listing sẽ dùng ảnh đầu tiên."
              label="Bộ ảnh sản phẩm"
              required
              value={form.images}
              onChange={(value) => setForm((current) => ({ ...current, images: value }))}
            />

            {error ? (
              <p className="status-banner status-banner-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-form-actions">
              <button className="button button-primary" disabled={isSaving} type="submit">
                {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo product'}
              </button>
              {isEditing ? (
                <button className="button button-secondary" type="button" onClick={resetForm}>
                  Hủy chỉnh sửa
                </button>
              ) : null}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel
          description="Bảng này bám trực tiếp `/products`, đồng thời hiển thị số variant đã nối theo từng product."
          title="Danh sách product"
        >
          <div className="admin-toolbar">
            <label className="field">
              <span>Tìm nhanh</span>
              <input
                placeholder="Tên, SKU hoặc danh mục"
                type="search"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              />
            </label>
          </div>

          {isLoading ? (
            <div className="loading-grid">
              <div className="loading-card" />
              <div className="loading-card" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Biến thể</th>
                    <th>Cập nhật</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const categoryName =
                      product.category?.name || categoryMap[extractEntityId(product.category)]?.name

                    return (
                      <tr key={product._id}>
                        <td>
                          <div className="admin-table-media">
                            <img alt={product.title} src={resolveImageUrl(product.images?.[0])} />
                            <div className="admin-table-title">
                              <strong>{product.title}</strong>
                              <span className="admin-table-subtle">{product.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td>{categoryName || 'Chưa gán'}</td>
                        <td>{formatAdminCurrency(product.price)}</td>
                        <td>
                          <AdminStatusPill tone="info">
                            {variantCountMap[product._id] || 0} variant
                          </AdminStatusPill>
                        </td>
                        <td>{formatAdminDateTime(product.updatedAt)}</td>
                        <td>
                          <div className="admin-table-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => handleEdit(product)}
                            >
                              Sửa
                            </button>
                            <button
                              className="button button-ghost"
                              type="button"
                              onClick={() => handleDelete(product)}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState
              message="Thử đổi từ khóa tìm kiếm hoặc tạo sản phẩm đầu tiên ở form bên trái."
              title="Không có product phù hợp"
            />
          )}
        </AdminPanel>
      </section>
    </>
  )
}
