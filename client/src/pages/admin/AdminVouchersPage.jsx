import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
} from '../../components/admin/AdminShared.jsx'
import {
  VOUCHER_STATUSES,
  VOUCHER_TYPES,
  formatAdminCurrency,
  formatAdminDateTime,
  toDateTimeLocalValue,
  toNumber,
} from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'

const initialForm = {
  code: '',
  description: '',
  endDate: '',
  maxDiscount: '0',
  minOrder: '0',
  name: '',
  quantity: '0',
  startDate: '',
  status: 'inactive',
  type: 'percent',
  usedCount: '0',
  value: '0',
}

export function AdminVouchersPage() {
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [vouchers, setVouchers] = useState([])

  const isEditing = Boolean(selectedId)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const voucherData = await apiRequest('/vouchers')
      startTransition(() => {
        setVouchers(voucherData)
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

  const filteredVouchers = useMemo(() => {
    const keyword = filter.trim().toLowerCase()

    return [...vouchers]
      .filter((voucher) => {
        if (!keyword) {
          return true
        }

        return [voucher.code, voucher.name, voucher.status, voucher.type]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      })
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
  }, [filter, vouchers])

  function resetForm() {
    setSelectedId('')
    setForm(initialForm)
  }

  function handleEdit(voucher) {
    setSelectedId(voucher._id)
    setForm({
      code: voucher.code || '',
      description: voucher.description || '',
      endDate: toDateTimeLocalValue(voucher.endDate),
      maxDiscount: String(voucher.maxDiscount || 0),
      minOrder: String(voucher.minOrder || 0),
      name: voucher.name || '',
      quantity: String(voucher.quantity || 0),
      startDate: toDateTimeLocalValue(voucher.startDate),
      status: voucher.status || 'inactive',
      type: voucher.type || 'percent',
      usedCount: String(voucher.usedCount || 0),
      value: String(voucher.value || 0),
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        endDate: new Date(form.endDate).toISOString(),
        maxDiscount: toNumber(form.maxDiscount),
        minOrder: toNumber(form.minOrder),
        name: form.name.trim(),
        quantity: toNumber(form.quantity),
        startDate: new Date(form.startDate).toISOString(),
        status: form.status,
        type: form.type,
        usedCount: toNumber(form.usedCount),
        value: toNumber(form.value),
      }

      if (isEditing) {
        await apiRequest(`/vouchers/${selectedId}`, {
          body: payload,
          method: 'PUT',
        })
      } else {
        await apiRequest('/vouchers', {
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

  async function handleDelete(voucher) {
    if (!window.confirm(`Xóa mềm voucher "${voucher.code}"?`)) {
      return
    }

    try {
      await apiRequest(`/vouchers/${voucher._id}`, {
        method: 'DELETE',
      })
      await loadData()
      if (selectedId === voucher._id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <>
      <AdminPageHeader
        description="Voucher là lớp campaign nhanh để storefront có thể dùng lại mà không cần thêm cấu hình mới."
        eyebrow="Voucher"
        title="Mã ưu đãi và vòng đời khuyến mãi"
        actions={
          <button className="button button-secondary" type="button" onClick={resetForm}>
            {isEditing ? 'Tạo voucher mới' : 'Làm mới form'}
          </button>
        }
      />

      <section className="admin-grid">
        <AdminPanel
          description="Thiết lập mã, giá trị, điều kiện đơn hàng và khoảng thời gian áp dụng."
          title={isEditing ? 'Cập nhật voucher' : 'Tạo voucher mới'}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Mã voucher</span>
                <input
                  placeholder="NEWSEASON25"
                  required
                  type="text"
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, code: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Tên campaign</span>
                <input
                  placeholder="Opening season"
                  required
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Mô tả</span>
              <textarea
                rows="4"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Loại</span>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value }))
                  }
                >
                  {VOUCHER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                  {VOUCHER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Giá trị</span>
                <input
                  min="0"
                  required
                  type="number"
                  value={form.value}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, value: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Số lượng</span>
                <input
                  min="0"
                  required
                  type="number"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, quantity: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Đơn tối thiểu</span>
                <input
                  min="0"
                  type="number"
                  value={form.minOrder}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, minOrder: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Giảm tối đa</span>
                <input
                  min="0"
                  type="number"
                  value={form.maxDiscount}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, maxDiscount: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Bắt đầu</span>
                <input
                  required
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Kết thúc</span>
                <input
                  required
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </label>
            </div>

            <label className="field">
              <span>Đã dùng</span>
              <input
                min="0"
                type="number"
                value={form.usedCount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, usedCount: event.target.value }))
                }
              />
            </label>

            {error ? (
              <p className="status-banner status-banner-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-form-actions">
              <button className="button button-primary" disabled={isSaving} type="submit">
                {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo voucher'}
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
          description="Bảng voucher cho phép theo dõi mã, lượng dùng và khung thời gian áp dụng."
          title="Danh sách voucher"
        >
          <div className="admin-toolbar">
            <label className="field">
              <span>Tìm nhanh</span>
              <input
                placeholder="Code, tên hoặc trạng thái"
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
          ) : filteredVouchers.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Voucher</th>
                    <th>Giá trị</th>
                    <th>Điều kiện</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher._id}>
                      <td>
                        <div className="admin-table-title">
                          <strong>{voucher.code}</strong>
                          <span className="admin-table-subtle">{voucher.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-title">
                          <strong>
                            {voucher.type === 'percent'
                              ? `${voucher.value}%`
                              : formatAdminCurrency(voucher.value)}
                          </strong>
                          <span className="admin-table-subtle">
                            Đã dùng {voucher.usedCount}/{voucher.quantity}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-title">
                          <strong>Đơn từ {formatAdminCurrency(voucher.minOrder)}</strong>
                          <span className="admin-table-subtle">
                            Max {formatAdminCurrency(voucher.maxDiscount)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <AdminStatusPill
                          tone={
                            voucher.status === 'active'
                              ? 'success'
                              : voucher.status === 'inactive'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {voucher.status}
                        </AdminStatusPill>
                      </td>
                      <td>
                        <div className="admin-table-title">
                          <strong>{formatAdminDateTime(voucher.startDate)}</strong>
                          <span className="admin-table-subtle">
                            đến {formatAdminDateTime(voucher.endDate)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => handleEdit(voucher)}
                          >
                            Sửa
                          </button>
                          <button
                            className="button button-ghost"
                            type="button"
                            onClick={() => handleDelete(voucher)}
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
              message="Thử đổi từ khóa tìm kiếm hoặc tạo voucher đầu tiên ở form bên trái."
              title="Không có voucher phù hợp"
            />
          )}
        </AdminPanel>
      </section>
    </>
  )
}
