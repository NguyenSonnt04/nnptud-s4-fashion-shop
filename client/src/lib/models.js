import { API_BASE_URL } from './config.js'

const fallbackImage = 'https://placehold.co/900x1200/efe5d7/1f1b19?text=Maison+S4'

function normalizeCategoryId(category) {
  if (!category) {
    return ''
  }

  return typeof category === 'string' ? category : category._id || ''
}

function normalizeCategoryName(category) {
  if (!category) {
    return 'Danh mục'
  }

  return typeof category === 'string' ? category : category.name || 'Danh mục'
}

export function getDisplayPrice(item, fallback = 0) {
  const basePrice = Number(item?.price ?? fallback ?? 0)
  const discountPrice = Number(item?.discountPrice ?? 0)

  if (discountPrice > 0 && discountPrice < basePrice) {
    return {
      current: discountPrice,
      original: basePrice,
    }
  }

  return {
    current: basePrice,
    original: null,
  }
}

export function resolveImageUrl(value) {
  if (!value) {
    return fallbackImage
  }

  const normalized = String(value).replace(/\\/g, '/')

  if (/^(https?:|data:|blob:)/i.test(normalized)) {
    return normalized
  }

  if (normalized.startsWith('/api/')) {
    return normalized
  }

  const filename = normalized.split('/').pop()
  if (filename && /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(filename)) {
    return `${API_BASE_URL}/upload/${filename}`
  }

  return normalized
}

export function resolveImageList(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return [fallbackImage]
  }

  return images.map(resolveImageUrl)
}

export function buildVariantCountMap(variants) {
  return variants.reduce((map, variant) => {
    const productId = variant?.product?._id || variant?.product || ''
    map[productId] = (map[productId] || 0) + 1
    return map
  }, {})
}

export function normalizeProductSummary(product, variantCount = 0) {
  const price = getDisplayPrice(product)

  return {
    categoryId: normalizeCategoryId(product.category),
    categoryName: normalizeCategoryName(product.category),
    createdAt: product.createdAt || '',
    description:
      product.description || 'Thiết kế tối giản dành cho nhịp sống thành thị.',
    hasVariants: variantCount > 0,
    id: product._id,
    images: resolveImageList(product.images),
    originalPrice: price.original,
    price: price.current,
    sku: product.sku,
    title: product.title,
    variantCount,
  }
}

export function normalizeVariant(variant) {
  const price = getDisplayPrice(variant, variant?.product?.price)

  return {
    barcode: variant.barcode || '',
    color: variant.color,
    colorCode: variant.colorCode || '#d1c6b8',
    id: variant._id,
    images: resolveImageList(variant.images),
    material: variant.material || '',
    originalPrice: price.original,
    price: price.current,
    product: variant.product,
    productId: variant?.product?._id || variant.product,
    size: variant.size,
    sku: variant.sku,
    status: variant.status,
    title: variant?.product?.title || 'Biến thể sản phẩm',
    weight: variant.weight || 0,
  }
}

export function hydrateCartLine(item, detail, type = 'product') {
  if (type === 'variant') {
    const variant = normalizeVariant(detail)
    return {
      id: item.product,
      image: variant.images[0],
      lineType: 'variant',
      originalPrice: variant.originalPrice,
      price: variant.price,
      productId: variant.productId,
      quantity: item.quantity,
      sourceId: item.product,
      subtitle: `${variant.size} / ${variant.color}`,
      title: variant.title,
    }
  }

  const product = normalizeProductSummary(detail)
  return {
    id: item.product,
    image: product.images[0],
    lineType: 'product',
    originalPrice: product.originalPrice,
    price: product.price,
    productId: product.id,
    quantity: item.quantity,
    sourceId: item.product,
    subtitle: product.categoryName,
    title: product.title,
  }
}
