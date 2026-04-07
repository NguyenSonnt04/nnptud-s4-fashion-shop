import { startTransition, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AdminEmptyState,
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminStatusPill,
} from '../../components/admin/AdminShared.jsx'
import {
  formatAdminCurrency,
  formatAdminDateTime,
  formatCompactNumber,
  resolveRoleName,
} from '../../lib/admin.js'
import { apiRequest } from '../../lib/api.js'
import { resolveImageUrl } from '../../lib/models.js'

function getRecentItems(list, count = 4) {
  return [...list]
    .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
    .slice(0, count)
}

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [roles, users, categories, products, variants, vouchers, payments] =
        await Promise.all([
          apiRequest('/roles'),
          apiRequest('/users'),
          apiRequest('/categories'),
          apiRequest('/products'),
          apiRequest('/productVariants'),
          apiRequest('/vouchers'),
          apiRequest('/payments'),
        ])

      startTransition(() => {
        setDashboard({
          categories,
          payments,
          products,
          roles,
          users,
          variants,
          vouchers,
        })
      })
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (isLoading) {
    return (
      <>
        <AdminPageHeader
          description="Đang đồng bộ dữ liệu tổng quan từ các resource quản trị."
          eyebrow="Dashboard"
          title="Đang tải control room"
        />
        <div className="admin-metric-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="loading-card" key={index} />
          ))}
        </div>
      </>
    )
  }

  if (error || !dashboard) {
    return (
      <section className="admin-state">
        <p className="admin-state-eyebrow">Dashboard</p>
        <h1>Chưa tải được dữ liệu tổng quan.</h1>
        <p>{error || 'Backend chưa phản hồi dữ liệu cho khu quản trị.'}</p>
        <div className="state-actions">
          <button className="button button-primary" type="button" onClick={loadDashboard}>
            Thử lại
          </button>
        </div>
      </section>
    )
  }

  const adminCount = dashboard.users.filter(
    (user) => resolveRoleName(user, dashboard.roles) === 'ADMIN',
  ).length
  const activeVoucherCount = dashboard.vouchers.filter((voucher) => voucher.status === 'active').length
  const paidPayments = dashboard.payments.filter((payment) => payment.status === 'paid')
  const pendingPayments = dashboard.payments.filter((payment) => payment.status === 'pending')
  const totalPaidAmount = paidPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  )
  const recentProducts = getRecentItems(dashboard.products)
  const recentUsers = getRecentItems(dashboard.users)
  const recentPayments = [...dashboard.payments]
    .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
    .slice(0, 5)

  return (
    <>
      <AdminPageHeader
        description="Một lớp điều phối gọn cho catalog, khách hàng, ưu đãi và giao dịch đang chạy trên backend hiện có."
        eyebrow="Dashboard"
        title="Nhịp vận hành trong hôm nay"
        actions={
          <>
            <Link className="button button-primary" to="/admin/products">
              Mở catalog
            </Link>
            <Link className="button button-secondary" to="/admin/payments">
              Xem giao dịch
            </Link>
          </>
        }
      />

      <section className="admin-metric-grid">
        <AdminMetricCard
          label="Sản phẩm gốc"
          meta={`${formatCompactNumber(dashboard.variants.length)} biến thể đang hoạt động`}
          tone="accent"
          value={formatCompactNumber(dashboard.products.length)}
        />
        <AdminMetricCard
          label="Người dùng"
          meta={`${formatCompactNumber(adminCount)} tài khoản admin`}
          value={formatCompactNumber(dashboard.users.length)}
        />
        <AdminMetricCard
          label="Doanh thu đã paid"
          meta={`${formatCompactNumber(paidPayments.length)} giao dịch đã xác nhận`}
          tone="dark"
          value={formatAdminCurrency(totalPaidAmount)}
        />
        <AdminMetricCard
          label="Voucher hoạt động"
          meta={`${formatCompactNumber(pendingPayments.length)} giao dịch đang pending`}
          value={formatCompactNumber(activeVoucherCount)}
        />
      </section>

      <section className="admin-dashboard-grid">
        <div className="admin-dashboard-list">
          <AdminPanel
            description="Những chỉ số nhanh để bạn biết nên ưu tiên catalog, người dùng hay giao dịch."
            title="Ưu tiên vận hành"
          >
            <div className="admin-insight-list">
              <article className="admin-insight-item">
                <strong>{dashboard.categories.length} danh mục đang hiển thị</strong>
                <span>Giữ taxonomy gọn giúp storefront lọc và điều hướng dễ hơn.</span>
              </article>
              <article className="admin-insight-item">
                <strong>{dashboard.variants.length} biến thể đang neo theo product</strong>
                <span>Detail page và giỏ hàng mới đang phụ thuộc flow chọn variant ở đây.</span>
              </article>
              <article className="admin-insight-item">
                <strong>{pendingPayments.length} giao dịch cần theo dõi</strong>
                <span>Hãy ưu tiên đồng bộ trạng thái thanh toán để tránh tồn đơn treo.</span>
              </article>
            </div>
          </AdminPanel>

          <AdminPanel
            description="Các sản phẩm mới cập nhật gần đây nhất trong catalog gốc."
            title="Sản phẩm vừa cập nhật"
          >
            {recentProducts.length > 0 ? (
              <div className="admin-activity-list">
                {recentProducts.map((product) => (
                  <article className="admin-activity-item" key={product._id}>
                    <div className="admin-table-media">
                      <img alt={product.title} src={resolveImageUrl(product.images?.[0])} />
                      <div className="admin-table-title">
                        <strong>{product.title}</strong>
                        <span className="admin-list-meta">{product.sku}</span>
                      </div>
                    </div>
                    <span className="admin-list-meta">
                      {formatAdminCurrency(product.price)} • {formatAdminDateTime(product.updatedAt)}
                    </span>
                  </article>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                message="Hãy tạo sản phẩm đầu tiên để dashboard bắt đầu có nhịp dữ liệu."
                title="Catalog còn trống"
              />
            )}
          </AdminPanel>
        </div>

        <div className="admin-dashboard-list">
          <AdminPanel description="Những tài khoản mới nhất vừa xuất hiện trong hệ thống." title="Người dùng mới">
            {recentUsers.length > 0 ? (
              <div className="admin-activity-list">
                {recentUsers.map((user) => (
                  <article className="admin-activity-item" key={user._id}>
                    <strong>{user.fullName || user.username}</strong>
                    <span className="admin-list-meta">
                      {user.email} • {resolveRoleName(user, dashboard.roles)}
                    </span>
                    <span className="admin-list-meta">{formatAdminDateTime(user.createdAt)}</span>
                  </article>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                message="Chưa có user nào được đồng bộ về panel."
                title="Chưa có tài khoản"
              />
            )}
          </AdminPanel>

          <AdminPanel
            description="Danh sách giao dịch cập nhật gần đây để đội vận hành chốt trạng thái nhanh."
            title="Thanh toán gần nhất"
          >
            {recentPayments.length > 0 ? (
              <div className="admin-activity-list">
                {recentPayments.map((payment) => (
                  <article className="admin-activity-item" key={payment._id}>
                    <div className="admin-kpi-inline">
                      <strong>{formatAdminCurrency(payment.amount)}</strong>
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
                    </div>
                    <span className="admin-list-meta">
                      {payment.user?.username || payment.user?.email || 'Không rõ user'} • {payment.method}
                    </span>
                    <span className="admin-list-meta">{formatAdminDateTime(payment.updatedAt)}</span>
                  </article>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                message="Khi có payment chạy qua backend, khu này sẽ hiển thị trạng thái mới nhất."
                title="Chưa có giao dịch"
              />
            )}
          </AdminPanel>
        </div>
      </section>
    </>
  )
}
