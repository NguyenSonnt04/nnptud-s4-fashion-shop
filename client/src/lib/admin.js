import { apiRequest } from './api.js'
import { formatCurrency } from './format.js'

export const ADMIN_ROLE = 'ADMIN'
export const VARIANT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'FREESIZE']
export const VARIANT_STATUSES = ['active', 'inactive', 'out_of_stock']
export const VOUCHER_TYPES = ['percent', 'fixed']
export const VOUCHER_STATUSES = ['active', 'inactive', 'expired']
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

const compactNumberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 1,
  notation: 'compact',
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
})

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function isAdminUser(user) {
  return user?.role?.name === ADMIN_ROLE
}

export function extractEntityId(entity) {
  if (!entity) {
    return ''
  }

  return typeof entity === 'string' ? entity : entity._id || ''
}

export function parseListInput(value) {
  return String(value || '')
    .split(/[\n,]+/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function joinListInput(list) {
  return (Array.isArray(list) ? list : []).filter(Boolean).join('\n')
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function toBoolean(value) {
  return value === true || value === 'true'
}

export function formatAdminCurrency(value) {
  return formatCurrency(value)
}

export function formatCompactNumber(value) {
  return compactNumberFormatter.format(Number(value || 0))
}

export function formatAdminDate(value) {
  if (!value) {
    return 'Chưa cập nhật'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Chưa cập nhật'
  }

  return dateFormatter.format(parsed)
}

export function formatAdminDateTime(value) {
  if (!value) {
    return 'Chưa cập nhật'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Chưa cập nhật'
  }

  return dateTimeFormatter.format(parsed)
}

export function toDateTimeLocalValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (item) => String(item).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

export function resolveRoleName(user, roles) {
  if (user?.role?.name) {
    return user.role.name
  }

  const roleId = extractEntityId(user?.role)
  return roles.find((role) => role._id === roleId)?.name || 'USER'
}

export async function uploadAdminImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const result = await apiRequest('/upload/one_file', {
    body: formData,
    method: 'POST',
  })

  return result.path || result.filename || ''
}

export function buildPaymentStatusPatch(status) {
  const now = new Date().toISOString()
  const patch = { status }

  if (status === 'pending') {
    patch.pendingAt = now
    patch.paidAt = null
    patch.failedAt = null
    patch.refundAt = null
  }

  if (status === 'paid') {
    patch.paidAt = now
    patch.failedAt = null
    patch.refundAt = null
  }

  if (status === 'failed') {
    patch.failedAt = now
  }

  if (status === 'refunded') {
    patch.refundAt = now
  }

  return patch
}
