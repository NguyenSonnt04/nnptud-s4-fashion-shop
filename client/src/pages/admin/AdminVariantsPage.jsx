import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminEmptyState,
  AdminImageField,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
} from '../../components/admin/AdminShared.jsx'
import {
  VARIANT_SIZES,
  VARIANT_STATUSES,
  extractEntityId,
  formatAdminCurrency,
  formatAdminDateTime,
  parseListInput,
  toNumber,
} from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'
import { resolveImageUrl } from '../../lib/models.js'

const initialForm = {
  barcode: '',
  color: '',
  colorCode: '#d1c6b8',
  discountPrice: '0',
  images: '',
  material: '',
  price: '',
  product: '',
  size: 'M',
  sku: '',
  status: 'active',
  stock: '0',
  weight: '0',
}

export function AdminVariantsPage() {
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
      const [productData, variantData] = await Promise.all([
        apiRequest('/products'),
        apiRequest('/productVariants'),
      ])

      startTransition(() => {
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

  const productMap = useMemo(() => {
    return products.reduce((map, product) => {
      map[product._id] = product
      return map
    }, {})
  }, [products])

  const filteredVariants = useMemo(() => {
    const keyword = filter.trim().toLowerCase()

    return [...variants]
      .filter((variant) => {
        if (!keyword) {
          return true
        }

        const productName =
          variant.product?.title || productMap[extractEntityId(variant.product)]?.title || ''

        return [variant.sku, variant.color, variant.size, productName]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      })
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
  }, [filter, productMap, variants])

  function resetForm() {
    setSelectedId('')
    setForm(initialForm)
  }

  function handleEdit(variant) {
    setSelectedId(variant._id)
    setForm({
      barcode: variant.barcode || '',
      color: variant.color || '',
      colorCode: variant.colorCode || '#d1c6b8',
      discountPrice: String(variant.discountPrice || 0),
      images: (variant.images || []).join('\n'),
      material: variant.material || '',
      price: String(variant.price || ''),
      product: extractEntityId(variant.product),
      size: variant.size || 'M',
      sku: variant.sku || '',
      status: variant.status || 'active',
      stock: '0',
      weight: String(variant.weight || 0),
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        barcode: form.barcode.trim(),
        color: form.color.trim(),
        colorCode: form.colorCode,
        discountPrice: toNumber(form.discountPrice),
        images: parseListInput(form.images),
        material: form.material.trim(),
        price: toNumber(form.price),
        product: form.product,
        size: form.size,
        sku: form.sku.trim(),
        status: form.status,
        weight: toNumber(form.weight),
      }

      if (isEditing) {
        await apiRequest(`/productVariants/${selectedId}`, {
          body: payload,
          method: 'PUT',
        })
      } else {
        await apiRequest('/productVariants', {
          body: {
            ...payload,
            stock: toNumber(form.stock),
          },
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

  async function handleDelete(variant) {
    if (!window.confirm(`Xóa mềm variant "${variant.sku}"?`)) {
      return
    }

    try {
      await apiRequest(`/productVariants/${variant._id}`, {
        method: 'DELETE',
      })
      await loadData()
      if (selectedId === variant._id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <>
      <AdminPageHeader
        description="Detail page và giỏ hàng đang dựa vào lớp variant này để chọn size, màu và giá bán thực tế."
        eyebrow="Biến thể"
        title="Điều phối SKU ở cấp màu và kích cỡ"
        actions={
          <button className="button button-secondary" type="button" onClick={resetForm}>
            {isEditing ? 'Tạo variant mới' : 'Làm mới form'}
          </button>
        }
      />

      <section className="admin-grid">
        <AdminPanel
          description="Stock hiện chỉ có ở API tạo mới, nên panel giữ trường tồn kho cho luồng tạo variant."
          title={isEditing ? 'Cập nhật variant' : 'Tạo variant mới'}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Product gốc</span>
                <select
                  required
                  value={form.product}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, product: event.target.value }))
                  }
                >
                  <option value="">Chọn product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>SKU variant</span>
                <input
                  placeholder="MS4-SHIRT-001-BLK-M"
                  required
                  type="text"
                  value={form.sku}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sku: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Màu sắc</span>
                <input
                  placeholder="Đen"
                  required
                  type="text"
                  value={form.color}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, color: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Mã màu</span>
                <input
                  type="color"
                  value={form.colorCode}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, colorCode: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Size</span>
                <select
                  value={form.size}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, size: event.target.value }))
                  }
                >
                  {VARIANT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Trạng thái</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  {VARIANT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Giá bán</span>
                <input
                  min="0"
                  required
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Giá giảm</span>
                <input
                  min="0"
                  type="number"
                  value={form.discountPrice}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, discountPrice: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Barcode</span>
                <input
                  placeholder="Tùy chọn"
                  type="text"
                  value={form.barcode}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, barcode: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Chất liệu</span>
                <input
                  placeholder="Cotton blend"
                  type="text"
                  value={form.material}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, material: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Khối lượng</span>
                <input
                  min="0"
                  type="number"
                  value={form.weight}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, weight: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Tồn kho khởi tạo</span>
                <input
                  disabled={isEditing}
                  min="0"
                  type="number"
                  value={form.stock}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, stock: event.target.value }))
                  }
                />
              </label>
            </div>

            <AdminImageField
              hint="Có thể thêm ảnh local qua upload route hiện có của backend."
              label="Bộ ảnh biến thể"
              required
              value={form.images}
              onChange={(value) => setForm((current) => ({ ...current, images: value }))}
            />

            {isEditing ? (
              <p className="admin-form-note">Stock chỉ được set ở route tạo mới theo backend hiện tại.</p>
            ) : null}

            {error ? (
              <p className="status-banner status-banner-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-form-actions">
              <button className="button button-primary" disabled={isSaving} type="submit">
                {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo variant'}
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
          description="Mỗi hàng là một variant phục vụ trực tiếp cho detail page và cart."
          title="Danh sách variant"
        >
          <div className="admin-toolbar">
            <label className="field">
              <span>Tìm nhanh</span>
              <input
                placeholder="SKU, màu, size hoặc tên product"
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
          ) : filteredVariants.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Variant</th>
                    <th>Product</th>
                    <th>Giá bán</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVariants.map((variant) => {
                    const productName =
                      variant.product?.title || productMap[extractEntityId(variant.product)]?.title

                    return (
                      <tr key={variant._id}>
                        <td>
                          <div className="admin-table-media">
                            <img alt={variant.sku} src={resolveImageUrl(variant.images?.[0])} />
                            <div className="admin-table-title">
                              <strong>{variant.sku}</strong>
                              <span className="admin-table-subtle">
                                {variant.size} / {variant.color}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{productName || 'Chưa có product'}</td>
                        <td>
                          <div className="admin-table-title">
                            <strong>{formatAdminCurrency(variant.price)}</strong>
                            <span className="admin-table-subtle">
                              Giảm còn {formatAdminCurrency(variant.discountPrice || 0)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <AdminStatusPill
                            tone={
                              variant.status === 'active'
                                ? 'success'
                                : variant.status === 'inactive'
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {variant.status}
                          </AdminStatusPill>
                        </td>
                        <td>{formatAdminDateTime(variant.updatedAt)}</td>
                        <td>
                          <div className="admin-table-actions">
                            <button
                              className="button button-secondary"
                              type="button"
                              onClick={() => handleEdit(variant)}
                            >
                              Sửa
                            </button>
                            <button
                              className="button button-ghost"
                              type="button"
                              onClick={() => handleDelete(variant)}
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
              message="Thử đổi từ khóa tìm kiếm hoặc tạo variant đầu tiên ở form bên trái."
              title="Không có variant phù hợp"
            />
          )}
        </AdminPanel>
      </section>
    </>
  )
}
