import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
} from '../../components/admin/AdminShared.jsx'
import { formatAdminDate } from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'

const initialForm = {
  description: '',
  name: '',
}

export function AdminRolesPage() {
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [roles, setRoles] = useState([])
  const [selectedId, setSelectedId] = useState('')

  const isEditing = Boolean(selectedId)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const roleData = await apiRequest('/roles')
      startTransition(() => {
        setRoles(roleData)
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

  const filteredRoles = useMemo(() => {
    const keyword = filter.trim().toLowerCase()

    return [...roles]
      .filter((role) => {
        if (!keyword) {
          return true
        }

        return (
          role.name?.toLowerCase().includes(keyword) ||
          role.description?.toLowerCase().includes(keyword)
        )
      })
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
  }, [filter, roles])

  function resetForm() {
    setSelectedId('')
    setForm(initialForm)
  }

  function handleEdit(role) {
    setSelectedId(role._id)
    setForm({
      description: role.description || '',
      name: role.name || '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        description: form.description.trim(),
        name: form.name.trim(),
      }

      if (isEditing) {
        await apiRequest(`/roles/${selectedId}`, {
          body: payload,
          method: 'PUT',
        })
      } else {
        await apiRequest('/roles', {
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

  async function handleDelete(role) {
    if (!window.confirm(`Xoá mềm role "${role.name}"?`)) {
      return
    }

    try {
      await apiRequest(`/roles/${role._id}`, {
        method: 'DELETE',
      })
      await loadData()
      if (selectedId === role._id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <>
      <AdminPageHeader
        description="Quản lý các vai trò trong hệ thống."
        eyebrow="Quản lý"
        title="Roles"
        actions={
          <button className="button button-secondary" type="button" onClick={resetForm}>
            {isEditing ? 'Tạo role mới' : 'Làm mới form'}
          </button>
        }
      />

      <section className="admin-grid">
        <AdminPanel
          description="Tạo mới hoặc cập nhật vai trò trong hệ thống."
          title={isEditing ? 'Cập nhật role' : 'Tạo role mới'}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Tên role</span>
              <input
                placeholder="Ví dụ: ADMIN"
                required
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>

            <label className="field">
              <span>Mô tả</span>
              <input
                placeholder="Ví dụ: Quản trị viên hệ thống"
                type="text"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
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
                {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo role'}
              </button>
              {isEditing ? (
                <button className="button button-secondary" type="button" onClick={resetForm}>
                  Huỷ chỉnh sửa
                </button>
              ) : null}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel
          description="Danh sách các vai trò hiện có trong hệ thống."
          title="Danh sách role"
        >
          <div className="admin-toolbar">
            <label className="field">
              <span>Tìm nhanh</span>
              <input
                placeholder="Tên hoặc mô tả"
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
          ) : filteredRoles.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Mô tả</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role._id}>
                      <td>
                        <div className="admin-table-title">
                          <strong>{role.name}</strong>
                          <span className="admin-table-subtle">ID: {role._id}</span>
                        </div>
                      </td>
                      <td>{role.description || '—'}</td>
                      <td>{formatAdminDate(role.createdAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => handleEdit(role)}
                          >
                            Sửa
                          </button>
                          <button
                            className="button button-ghost"
                            type="button"
                            onClick={() => handleDelete(role)}
                          >
                            Xoá
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
              message="Thử đổi từ khoá tìm kiếm hoặc tạo role đầu tiên ở form bên trái."
              title="Không có role phù hợp"
            />
          )}
        </AdminPanel>
      </section>
    </>
  )
}
