import { startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
} from '../../components/admin/AdminShared.jsx'
import {
  PAYMENT_STATUSES,
  buildPaymentStatusPatch,
  formatAdminCurrency,
  formatAdminDateTime,
  formatCompactNumber,
} from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'
import { resolveImageUrl } from '../../lib/models.js'

export function AdminPaymentsPage() {
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [payments, setPayments] = useState([])
  const [selectedPaymentId, setSelectedPaymentId] = useState('')
  const [statusForm, setStatusForm] = useState({
    status: 'pending',
    transactionID: '',
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const paymentData = await apiRequest('/payments')
      startTransition(() => {
        setPayments(paymentData)
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

  const filteredPayments = useMemo(() => {
    const keyword = filter.trim().toLowerCase()

    return [...payments]
      .filter((payment) => {
        if (!keyword) {
          return true
        }

        return [
          payment.status,
          payment.method,
          payment.transactionID,
          payment.user?.username,
          payment.user?.email,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      })
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
  }, [filter, payments])

  const selectedPayment =
    filteredPayments.find((payment) => payment._id === selectedPaymentId) ||
    payments.find((payment) => payment._id === selectedPaymentId) ||
    null

  useEffect(() => {
    if (!selectedPayment && payments.length > 0) {
      const firstPayment = payments[0]
      setSelectedPaymentId(firstPayment._id)
      setStatusForm({
        status: firstPayment.status || 'pending',
        transactionID: firstPayment.transactionID || '',
      })
      return
    }

    if (selectedPayment) {
      setStatusForm({
        status: selectedPayment.status || 'pending',
        transactionID: selectedPayment.transactionID || '',
      })
    }
  }, [payments, selectedPayment])

  const pendingCount = payments.filter((payment) => payment.status === 'pending').length
  const paidCount = payments.filter((payment) => payment.status === 'paid').length
  const failedCount = payments.filter((payment) => payment.status === 'failed').length
  const paidTotal = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  async function handleSave() {
    if (!selectedPayment) {
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await apiRequest(`/payments/${selectedPayment._id}`, {
        body: {
          ...buildPaymentStatusPatch(statusForm.status),
          transactionID: statusForm.transactionID.trim(),
        },
        method: 'PUT',
      })
      await loadData()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(payment) {
    if (!window.confirm(`Xóa mềm payment ${payment._id}?`)) {
      return
    }

    try {
      await apiRequest(`/payments/${payment._id}`, {
        method: 'DELETE',
      })
      await loadData()
      if (selectedPaymentId === payment._id) {
        setSelectedPaymentId('')
      }
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  return (
    <>
      <AdminPageHeader
        description="Backend hiện chưa có order panel riêng, nên payments là nơi gần nhất để vận hành giao dịch."
        eyebrow="Thanh toán"
        title="Theo dõi và chốt trạng thái giao dịch"
      />

      <section className="admin-metric-grid">
        <AdminMetricCard
          label="Đang pending"
          meta="Cần theo dõi vận hành"
          tone="accent"
          value={formatCompactNumber(pendingCount)}
        />
        <AdminMetricCard
          label="Đã paid"
          meta="Giao dịch xác nhận"
          value={formatCompactNumber(paidCount)}
        />
        <AdminMetricCard
          label="Đã failed"
          meta="Cần đối soát lại"
          value={formatCompactNumber(failedCount)}
        />
        <AdminMetricCard
          label="Tổng paid"
          meta="Tính theo status=paid"
          tone="dark"
          value={formatAdminCurrency(paidTotal)}
        />
      </section>

      <section className="admin-grid">
        <AdminPanel
          description="Chọn một payment để cập nhật trạng thái hoặc đối soát transaction ID."
          title="Danh sách payment"
        >
          <div className="admin-toolbar">
            <label className="field">
              <span>Tìm nhanh</span>
              <input
                placeholder="Status, method, transaction ID hoặc user"
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
          ) : filteredPayments.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Phương thức</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <div className="admin-payment-user">
                          <img
                            alt={payment.user?.username || 'User'}
                            src={resolveImageUrl(payment.user?.avatarUrl)}
                          />
                          <div className="admin-table-title">
                            <strong>{payment.user?.fullName || payment.user?.username || 'Ẩn danh'}</strong>
                            <span className="admin-table-subtle">
                              {payment.user?.email || payment.user?._id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-title">
                          <strong>{payment.method}</strong>
                          <span className="admin-table-subtle">
                            {payment.transactionID || 'Chưa có transaction ID'}
                          </span>
                        </div>
                      </td>
                      <td>{formatAdminCurrency(payment.amount)}</td>
                      <td>
                        <AdminStatusPill
                          tone={
                            payment.status === 'paid'
                              ? 'success'
                              : payment.status === 'pending'
                                ? 'warning'
                                : payment.status === 'failed'
                                  ? 'danger'
                                  : 'info'
                          }
                        >
                          {payment.status}
                        </AdminStatusPill>
                      </td>
                      <td>{formatAdminDateTime(payment.updatedAt)}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => setSelectedPaymentId(payment._id)}
                          >
                            Chọn
                          </button>
                          <button
                            className="button button-ghost"
                            type="button"
                            onClick={() => handleDelete(payment)}
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
              message="Khi có giao dịch chạy qua backend, danh sách này sẽ hiển thị ngay."
              title="Chưa có payment nào"
            />
          )}
        </AdminPanel>

        <AdminPanel
          description="Panel bên phải cho phép đổi status nhanh mà không phải rời khỏi danh sách."
          title="Chi tiết payment"
        >
          {selectedPayment ? (
            <div className="admin-form">
              <div className="admin-payment-user">
                <img
                  alt={selectedPayment.user?.username || 'User'}
                  src={resolveImageUrl(selectedPayment.user?.avatarUrl)}
                />
                <div className="admin-table-title">
                  <strong>
                    {selectedPayment.user?.fullName ||
                      selectedPayment.user?.username ||
                      'Ẩn danh'}
                  </strong>
                  <span className="admin-table-subtle">
                    {selectedPayment.user?.email || selectedPayment.user?._id}
                  </span>
                </div>
              </div>

              <div className="admin-insight-list">
                <article className="admin-insight-item">
                  <strong>{formatAdminCurrency(selectedPayment.amount)}</strong>
                  <span>{selectedPayment.currency || 'VND'} • {selectedPayment.method}</span>
                </article>
                <article className="admin-insight-item">
                  <strong>Khởi tạo</strong>
                  <span>{formatAdminDateTime(selectedPayment.createdAt)}</span>
                </article>
              </div>

              <label className="field">
                <span>Trạng thái</span>
                <select
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Transaction ID</span>
                <input
                  placeholder="Tùy chọn"
                  type="text"
                  value={statusForm.transactionID}
                  onChange={(event) =>
                    setStatusForm((current) => ({
                      ...current,
                      transactionID: event.target.value,
                    }))
                  }
                />
              </label>

              {error ? (
                <p className="status-banner status-banner-error" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="admin-status-actions">
                <button className="button button-primary" disabled={isSaving} type="button" onClick={handleSave}>
                  {isSaving ? 'Đang cập nhật...' : 'Lưu trạng thái'}
                </button>
              </div>
            </div>
          ) : (
            <AdminEmptyState
              message="Hãy chọn một payment từ bảng bên trái để xem và chỉnh trạng thái."
              title="Chưa chọn giao dịch"
            />
          )}
        </AdminPanel>
      </section>
    </>
  )
}
