import { Link } from 'react-router-dom'
import { formatCurrency } from '../lib/format.js'
import { ArrowRightIcon } from './Icons.jsx'

export function ProductCard({ product }) {
  const secondaryImage = product.images[1]

  return (
    <article className="product-card">
      <Link className="product-card-link" to={`/products/${product.id}`}>
        <div className="product-card-media">
          <img
            alt={`${product.title} - ảnh chính`}
            className="product-card-image"
            src={product.images[0]}
          />
          {secondaryImage ? (
            <img
              aria-hidden="true"
              alt=""
              className="product-card-image product-card-image-secondary"
              src={secondaryImage}
            />
          ) : null}
          <span className="product-card-tag">
            {product.hasVariants ? 'Nhiều lựa chọn' : 'Exclusive'}
          </span>
        </div>

        <div className="product-card-body">
          <div className="product-card-heading">
            <p className="product-card-category">{product.categoryName}</p>
            <h3>{product.title}</h3>
          </div>

          <p className="product-card-description">{product.description}</p>

          <div className="product-card-footer">
            <div className="price-block">
              <strong>{formatCurrency(product.price)}</strong>
              {product.originalPrice ? (
                <span>{formatCurrency(product.originalPrice)}</span>
              ) : null}
            </div>

            <span className="product-card-cta">
              Xem chi tiết
              <ArrowRightIcon className="inline-icon" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
