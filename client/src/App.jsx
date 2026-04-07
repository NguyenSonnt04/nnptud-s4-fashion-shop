import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { ScrollToTop } from './components/ScrollToTop.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { ProductDetailPage } from './pages/ProductDetailPage.jsx'
import { ProductsPage } from './pages/ProductsPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'

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

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
