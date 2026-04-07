import { Link, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout.jsx'
import { AdminRoute } from './components/admin/AdminRoute.jsx'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { ScrollToTop } from './components/ScrollToTop.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'
import { ProductsPage } from './pages/ProductsPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { AccountPage } from './pages/AccountPage.jsx'
import { AddressesPage } from './pages/AddressesPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { OrdersPage } from './pages/OrdersPage.jsx'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx'
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.jsx'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx'
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage.jsx'
import { AdminProductsPage } from './pages/admin/AdminProductsPage.jsx'
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx'
import { AdminVariantsPage } from './pages/admin/AdminVariantsPage.jsx'
import { AdminVouchersPage } from './pages/admin/AdminVouchersPage.jsx'
import { AdminRolesPage } from './pages/admin/AdminRolesPage.jsx'
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage.jsx'

function NotFoundPage() {
  return (
    <section className="state-panel">
      <p className="state-eyebrow">404</p>
      <h1 className="state-title">Không tìm thấy trang bạn đang tìm.</h1>
      <p className="state-message">
        Hãy quay lại trang chủ hoặc tiếp tục khám phá bộ sưu tập mới nhất.
      </p>
    </section>
  )
}

function AdminNotFoundPage() {
  return (
    <section className="admin-state">
      <p className="admin-state-eyebrow">404 / Admin</p>
      <h1>Trang quản trị này chưa tồn tại.</h1>
      <p>
        Hãy quay lại dashboard hoặc chọn một khu quản lý khác trong sidebar để tiếp tục
        làm việc.
      </p>
      <div className="state-actions">
        <Link className="button button-primary" to="/admin">
          Về dashboard
        </Link>
        <Link className="button button-secondary" to="/">
          Mở storefront
        </Link>
      </div>
    </section>
  )
}

export default function RootApp() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="variants" element={<AdminVariantsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="*" element={<AdminNotFoundPage />} />
        </Route>

        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route
            path="cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/addresses"
            element={
              <ProtectedRoute>
                <AddressesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="account/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
