import { API_BASE_URL } from './config.js'
import { getStoredToken } from './storage.js'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function extractMessage(data, fallback = 'Đã có lỗi xảy ra. Vui lòng thử lại.') {
  if (typeof data === 'string') {
    return data
  }

  if (Array.isArray(data)) {
    return data
      .flatMap((item) => Object.values(item || {}))
      .filter(Boolean)
      .join(', ')
  }

  if (data && typeof data === 'object' && 'message' in data) {
    return data.message
  }

  return fallback
}

function isUnauthorized(status, data) {
  const message = extractMessage(data, '').toLowerCase()
  return status === 401 || (status === 404 && message.includes('chua dang nhap'))
}

async function parsePayload(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const method = options.method || 'GET'
  const token = options.token ?? getStoredToken()
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let body = options.body
  if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, {
      body,
      credentials: 'include',
      headers,
      method,
    })
  } catch {
    throw new ApiError(
      'Không thể kết nối tới backend. Hãy kiểm tra server đang chạy ở cổng 5000.',
      0,
      null,
    )
  }

  const data = await parsePayload(response)

  if (!response.ok) {
    if (isUnauthorized(response.status, data)) {
      window.dispatchEvent(new CustomEvent('app:unauthorized'))
    }

    throw new ApiError(extractMessage(data), response.status, data)
  }

  return data
}
