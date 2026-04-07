import { startTransition, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'
import { PageFeedback } from '../components/PageFeedback.jsx'

const EMPTY_FORM = {
  detail: '',
  district: '',
  fullName: '',
  isDefault: false,
  phone: '',
  province: '',
  ward: '',
}

export function AddressesPage() {
  const { isAuthenticated, isHydrating } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reloadSeed, setReloadSeed] = useState(0)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isActive = true

    async function run() {
      setIsLoading(true)
      setError('')

      try {
        const data = await apiRequest('/addresses')

        if (!isActive) {
          return
        }

        startTransition(() => {
          setAddresses(data)
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

    return () => {
      isActive = false
    }
  }, [reloadSeed])

  if (isHydrating) {
    return (
      <PageFeedback
        eyebrow="Đang tải"
        message="Mình đang kiểm tra phiên đăng nhập trước khi mở danh sách địa chỉ."
        title="Xin chờ một chút."
      />
    )
  }

  if (!isAuthenticated) {
    return (
      <PageFeedback
        actions={
          <>
            <Link className="button button-primary" state={{ from: '/account/addresses' }} to="/login">
              Đăng nhập
            </Link>
            <Link className="button button-secondary" to="/products">
              Tiếp tục xem sản phẩm
            </Link>
          </>
        }
        eyebrow="Địa chỉ giao hàng"
        message="Bạn cần đăng nhập để quản lý địa chỉ giao hàng."
        title="Đăng nhập để xem địa chỉ của bạn."
      />
    )
  }

  function openAddForm() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setIsFormVisible(true)
    setError('')
    setSuccess('')
  }

  function openEditForm(address) {
    setEditingId(address._id)
    setForm({
      detail: address.detail || '',
      district: address.district || '',
      fullName: address.fullName || '',
      isDefault: address.isDefault || false,
      phone: address.phone || '',
      province: address.province || '',
      ward: address.ward || '',
    })
    setIsFormVisible(true)
    setError('')
    setSuccess('')
  }

  function cancelForm() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setIsFormVisible(false)
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.fullName.trim()) {
      setError('Họ tên không được để trống.')
      return
    }

    if (!form.phone.trim()) {
      setError('Số điện thoại không được để trống.')
      return
    }

    if (!form.province.trim()) {
      setError('Tỉnh/Thành phố không được để trống.')
      return
    }

    if (!form.district.trim()) {
      setError('Quận/Huyện không được để trống.')
      return
    }

    if (!form.ward.trim()) {
      setError('Phường/Xã không được để trống.')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingId) {
        await apiRequest(`/addresses/${editingId}`, {
          body: {
            detail: form.detail,
            district: form.district,
            fullName: form.fullName,
            isDefault: form.isDefault,
            phone: form.phone,
            province: form.province,
            ward: form.ward,
          },
          method: 'PUT',
        })
        setSuccess('Địa chỉ đã được cập nhật thành công.')
      } else {
        await apiRequest('/addresses', {
          body: {
            detail: form.detail,
            district: form.district,
            fullName: form.fullName,
            isDefault: form.isDefault,
            phone: form.phone,
            province: form.province,
            ward: form.ward,
          },
          method: 'POST',
        })
        setSuccess('Địa chỉ mới đã được thêm thành công.')
      }

      setEditingId(null)
      setForm({ ...EMPTY_FORM })
      setIsFormVisible(false)
      setReloadSeed((seed) => seed + 1)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(addressId) {
    if (!window.confirm('Bạn có chắc muốn xoá địa chỉ này?')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      await apiRequest(`/addresses/${addressId}`, {
        method: 'DELETE',
      })
      setSuccess('Địa chỉ đã được xoá.')
      setReloadSeed((seed) => seed + 1)
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  async function handleSetDefault(addressId) {
    setError('')
    setSuccess('')

    try {
      await apiRequest(`/addresses/${addressId}`, {
        body: { isDefault: true },
        method: 'PUT',
      })
      setSuccess('Đã đặt địa chỉ mặc định.')
      setReloadSeed((seed) => seed + 1)
    } catch (defaultError) {
      setError(defaultError.message)
    }
  }

  return (
    <>
      <section className="page-section page-hero">
        <p className="section-kicker">Địa chỉ giao hàng</p>
        <h1>Quản lý địa chỉ giao hàng của bạn để checkout nhanh hơn.</h1>
        <p className="hero-copy">
          <Link className="text-link" to="/account">
            Quay lại tài khoản
          </Link>
        </p>
      </section>

      <section className="page-section">
        {success ? (
          <p className="status-banner status-banner-success" role="status">
            {success}
          </p>
        ) : null}

        {error && !isFormVisible ? (
          <p className="status-banner status-banner-error" role="alert">
            {error}
          </p>
        ) : null}

        {!isFormVisible ? (
          <button className="button button-primary" type="button" onClick={openAddForm}>
            Thêm địa chỉ mới
          </button>
        ) : null}

        {isFormVisible ? (
          <div className="auth-card">
            <div className="auth-card-head">
              <p>{editingId ? 'Chỉnh sửa' : 'Thêm mới'}</p>
              <h2>{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h2>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Họ tên người nhận</span>
                <input
                  placeholder="Nhập họ tên người nhận"
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Số điện thoại</span>
                <input
                  placeholder="Nhập số điện thoại"
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Tỉnh / Thành phố</span>
                <input
                  placeholder="Nhập tỉnh hoặc thành phố"
                  required
                  type="text"
                  value={form.province}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, province: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Quận / Huyện</span>
                <input
                  placeholder="Nhập quận hoặc huyện"
                  required
                  type="text"
                  value={form.district}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, district: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Phường / Xã</span>
                <input
                  placeholder="Nhập phường hoặc xã"
                  required
                  type="text"
                  value={form.ward}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, ward: event.target.value }))
                  }
                />
              </label>

              <label className="field">
                <span>Địa chỉ chi tiết</span>
                <input
                  placeholder="Số nhà, tên đường, toà nhà... (không bắt buộc)"
                  type="text"
                  value={form.detail}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, detail: event.target.value }))
                  }
                />
              </label>

              <label className="field field-checkbox">
                <input
                  checked={form.isDefault}
                  type="checkbox"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isDefault: event.target.checked }))
                  }
                />
                <span>Đặt làm địa chỉ mặc định</span>
              </label>

              {error ? (
                <p className="status-banner status-banner-error" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="auth-form-actions">
                <button className="button button-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting
                    ? 'Đang xử lý...'
                    : editingId
                      ? 'Cập nhật địa chỉ'
                      : 'Thêm địa chỉ'}
                </button>
                <button className="button button-secondary" disabled={isSubmitting} type="button" onClick={cancelForm}>
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </section>

      <section className="page-section">
        {isLoading ? (
          <div className="loading-grid">
            <div className="loading-card" />
            <div className="loading-card" />
          </div>
        ) : null}

        {!isLoading && !error && addresses.length === 0 && !isFormVisible ? (
          <PageFeedback
            actions={
              <button className="button button-primary" type="button" onClick={openAddForm}>
                Thêm địa chỉ đầu tiên
              </button>
            }
            eyebrow="Chưa có địa chỉ"
            message="Thêm địa chỉ giao hàng để việc checkout nhanh hơn và tiện lợi hơn."
            title="Bạn chưa có địa chỉ giao hàng nào."
          />
        ) : null}

        {!isLoading && addresses.length > 0 ? (
          <div className="address-grid">
            {addresses.map(function (address) {
              return (
                <article className="address-card" key={address._id}>
                  {address.isDefault ? (
                    <span className="address-badge">Mặc định</span>
                  ) : null}

                  <div className="address-card-body">
                    <h3>{address.fullName}</h3>
                    <p>{address.phone}</p>
                    <p>
                      {address.detail ? `${address.detail}, ` : ''}
                      {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>

                  <div className="address-card-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={function () {
                        openEditForm(address)
                      }}
                    >
                      Chỉnh sửa
                    </button>

                    {!address.isDefault ? (
                      <button
                        className="button button-ghost"
                        type="button"
                        onClick={function () {
                          handleSetDefault(address._id)
                        }}
                      >
                        Đặt mặc định
                      </button>
                    ) : null}

                    <button
                      className="button button-ghost"
                      type="button"
                      onClick={function () {
                        handleDelete(address._id)
                      }}
                    >
                      Xoá
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </>
  )
}
