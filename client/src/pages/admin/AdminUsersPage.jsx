import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
} from '../../components/admin/AdminShared.jsx'
import {
  extractEntityId,
  formatAdminDateTime,
  resolveRoleName,
  toBoolean,
} from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'
import { resolveImageUrl } from '../../lib/models.js'

const initialForm = {
  avatarUrl: '',
  email: '',
  fullName: '',
  password: '',
  role: '',
  status: 'true',
  username: '',
}

export function AdminUsersPage() {
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [roles, setRoles] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [users, setUsers] = useState([])

  const isEditing = Boolean(selectedId)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [userData, roleData] = await Promise.all([apiRequest('/users'), apiRequest('/roles')])

      startTransition(() => {
        setUsers(userData)
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

  const filteredUsers = useMemo(() => {
    const keyword = filter.trim().toLowerCase()

    return [...users]
      .filter((user) => {
        if (!keyword) {
          return true
        }

        return [user.username, user.email, user.fullName, resolveRoleName(user, roles)]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      })
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
  }, [filter, roles, users])

  function resetForm() {
    setSelectedId('')
    setForm(initialForm)
  }

  function handleEdit(user) {
    setSelectedId(user._id)
    setForm({
      avatarUrl: user.avatarUrl || '',
      email: user.email || '',
      fullName: user.fullName || '',
      password: '',
      role: extractEntityId(user.role),
      status: String(Boolean(user.status)),
      username: user.username || '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const payload = {
        avatarUrl: form.avatarUrl.trim(),
        fullName: form.fullName.trim(),
        role: form.role,
        status: toBoolean(form.status),
      }

      if (form.password.trim()) {
        payload.password = form.password.trim()
      }

      if (isEditing) {
        await apiRequest(`/users/${selectedId}`, {
          body: payload,
          method: 'PUT',
        })
      } else {
        await apiRequest('/users', {
          body: {
            ...payload,
            email: form.email.trim(),
            username: form.username.trim(),
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

  async function handleDelete(user) {
    if (!window.confirm(`Xóa mềm user "${user.username}"?`)) {
      return
    }

    try {
      await apiRequest(`/users/${user._id}`, {
        method: 'DELETE',
      })
      await loadData()
      if (selectedId === user._id) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <>
      <AdminPageHeader
        description="Panel này quản lý tài khoản bằng đúng role model đang có trong backend."
        eyebrow="Người dùng"
        title="Tài khoản, trạng thái và phân quyền"
        actions={
          <button className="button button-secondary" type="button" onClick={resetForm}>
            {isEditing ? 'Tạo tài khoản mới' : 'Làm mới form'}
          </button>
        }
      />

      <section className="admin-grid">
        <AdminPanel
          description="Khi chỉnh sửa, username và email được giữ cố định để khớp validator hiện có của backend."
          title={isEditing ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Username</span>
                <input
                  disabled={isEditing}
                  placeholder="maisonadmin"
                  required
                  type="text"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, username: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  disabled={isEditing}
                  placeholder="admin@maison-s4.com"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Họ tên</span>
                <input
                  placeholder="Nguyễn Văn A"
                  type="text"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Avatar URL</span>
                <input
                  placeholder="https://..."
                  type="url"
                  value={form.avatarUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="admin-form-grid admin-form-grid-2">
              <label className="field">
                <span>Role</span>
                <select
                  required
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, role: event.target.value }))
                  }
                >
                  <option value="">Chọn role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
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
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tạm ẩn</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>{isEditing ? 'Đổi mật khẩu (tùy chọn)' : 'Mật khẩu'}</span>
              <input
                placeholder="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
                required={!isEditing}
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
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
                {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
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
          description="Danh sách này lấy từ `/users`; tên role được resolve qua `/roles` để hiển thị dễ đọc hơn."
          title="Danh sách tài khoản"
        >
          <div className="admin-toolbar">
            <label className="field">
              <span>Tìm nhanh</span>
              <input
                placeholder="Username, email hoặc role"
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
          ) : filteredUsers.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Role</th>
                    <th>Trạng thái</th>
                    <th>Tạo lúc</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-table-media">
                          <img alt={user.username} src={resolveImageUrl(user.avatarUrl)} />
                          <div className="admin-table-title">
                            <strong>{user.fullName || user.username}</strong>
                            <span className="admin-table-subtle">
                              {user.username} • {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{resolveRoleName(user, roles)}</td>
                      <td>
                        <AdminStatusPill tone={user.status ? 'success' : 'warning'}>
                          {user.status ? 'active' : 'inactive'}
                        </AdminStatusPill>
                      </td>
                      <td>{formatAdminDateTime(user.createdAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => handleEdit(user)}
                          >
                            Sửa
                          </button>
                          <button
                            className="button button-ghost"
                            type="button"
                            onClick={() => handleDelete(user)}
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
              message="Thử đổi từ khóa tìm kiếm hoặc tạo user đầu tiên ở form bên trái."
              title="Không có tài khoản phù hợp"
            />
          )}
        </AdminPanel>
      </section>
    </>
  )
}
