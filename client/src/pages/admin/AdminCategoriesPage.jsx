import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
  AdminImageField,
} from '../../components/admin/AdminShared.jsx'
import { extractEntityId, parseListInput } from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'
import { resolveImageUrl } from '../../lib/models.js'

const initialForm = {
  image: '',
  name: '',
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedId, setSelectedId] = useState('')

  const isEditing = Boolean(selectedId)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [categoryData, productData] = await Promise.all([
        apiRequest('/categories'),
        apiRequest('/products'),
      ])

      startTransition(() => {
        setCategories(categoryData)
        setProducts(productData)
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

  const productCountMap = useMemo(() => {
    return products.reduce((map, product) => {
      const categoryId = extractEntityId(product.category)
      map[categoryId] = (map[categoryId] || 0) + 1
      return map
    }, {})
  }, [products])

  const filteredCategories = useMemo(() => {
    const keyword = filter.trim().toLowerCase()

    return [...categories]
      .filter((category) => {
        if (!keyword) {
          return true
        }

        return (
          category.name?.toLowerCase().includes(keyword) ||
          category.slug?.toLowerCase().includes(keyword)
        )
      })
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
  }, [categories, filter])

  function resetForm() {
    setSelectedId('')
    setForm(initialForm)
  }

  function handleEdit(category) {
    setSelectedId(category._id)
    setForm({
      image: category.image || '',
      name: category.name || '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        image: parseListInput(form.image)[0] || '',
        name: form.name.trim(),
      }

      if (isEditing) {
        await apiRequest(`/categories/${selectedId}`, {
          body: payload,
          method: 'PUT',
        })
      } else {
        await apiRequest('/categories', {
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

  async function handleDelete(category) {
    if (!window.confirm(`Xóa mềm danh mục "${category.name}"?`)) {
      return
    }

    try {
      await apiRequest(`/categories/${category._id}`, {
        method: 'DELETE',
      })
      await loadData()
      if (selectedId === category._id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <>
      <AdminPageHeader
        description="Quản lý tên, ảnh và nhịp phân loại của catalog từ cùng một màn."
        eyebrow="Danh mục"
        title="Giữ taxonomy gọn và rõ"
        actions={
          <button className="button button-secondary" type="button" onClick={resetForm}>
            {isEditing ? 'Tạo danh mục mới' : 'Làm mới form'}
          </button>
        }
      />

      <section className="admin-grid">
        <AdminPanel
          description="Tạo nhanh danh mục mới hoặc cập nhật ảnh và tên của danh mục hiện có."
          title={isEditing ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Tên danh mục</span>
              <input
                placeholder="Ví dụ: Áo sơ mi"
                required
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>

            <AdminImageField
              hint="Backend schema category hiện dùng một ảnh duy nhất, nên panel sẽ lấy dòng đầu tiên."
              label="Ảnh đại diện"
              value={form.image}
              onChange={(value) => setForm((current) => ({ ...current, image: value }))}
            />

            {error ? (
              <p className="status-banner status-banner-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-form-actions">
              <button className="button button-primary" disabled={isSaving} type="submit">
                {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo danh mục'}
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
          description="Số lượng sản phẩm bên cạnh giúp bạn thấy danh mục nào đang được dùng nhiều."
          title="Danh sách danh mục"
        >
          <div className="admin-toolbar">
            <label className="field">
              <span>Tìm nhanh</span>
              <input
                placeholder="Tên hoặc slug"
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
          ) : filteredCategories.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Slug</th>
                    <th>Sản phẩm</th>
                    <th>Cập nhật</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category._id}>
                      <td>
                        <div className="admin-table-media">
                          <img alt={category.name} src={resolveImageUrl(category.image)} />
                          <div className="admin-table-title">
                            <strong>{category.name}</strong>
                            <span className="admin-table-subtle">ID: {category._id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{category.slug}</td>
                      <td>
                        <AdminStatusPill tone="info">
                          {productCountMap[category._id] || 0} sản phẩm
                        </AdminStatusPill>
                      </td>
                      <td>{new Date(category.updatedAt || category.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => handleEdit(category)}
                          >
                            Sửa
                          </button>
                          <button
                            className="button button-ghost"
                            type="button"
                            onClick={() => handleDelete(category)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState
              message="Thử đổi từ khóa tìm kiếm hoặc tạo danh mục đầu tiên ở form bên trái."
              title="Không có danh mục phù hợp"
            />
          )}
        </AdminPanel>
      </section>
    </>
  )
}
