import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getStoredToken } from '../lib/storage.js'
import { PageFeedback } from '../components/PageFeedback.jsx'
import { io } from 'socket.io-client'

export function ChatPage() {
  const { user } = useAuth()
  const [adminUser, setAdminUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    let isActive = true

    async function init() {
      setLoading(true)
      try {
        const conversations = await apiRequest('/messages')
        if (!isActive) return

        if (conversations.length > 0) {
          const firstPartner = conversations[0].user
          setAdminUser(firstPartner)
          const msgs = await apiRequest(`/messages/${firstPartner}`)
          if (!isActive) return
          setMessages(msgs.reverse())
        } else {
          const roles = await apiRequest('/roles')
          const adminRole = roles.find(function (r) { return r.name === 'ADMIN' })
          if (adminRole) {
            const users = await apiRequest('/users')
            if (!isActive) return
            const admin = users.find(function (u) {
              return (u.role === adminRole._id || u.role?._id === adminRole._id) && !u.isDeleted
            })
            if (admin) {
              setAdminUser(admin._id)
            }
          }
        }
      } catch (err) {
        if (!isActive) return
        if (!err.message?.includes('chua dang nhap') && !err.message?.includes('khong co quyen')) {
          setError(err.message)
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    init()
    return () => { isActive = false }
  }, [])

  useEffect(() => {
    const token = getStoredToken()
    if (!token || !adminUser) return

    const socket = io({ auth: { token } })
    socketRef.current = socket

    socket.on('connect', function () {
      socket.emit('user', user._id)
    })

    socket.on('newMessage', function () {
      loadMessages()
    })

    return () => { socket.disconnect() }
  }, [adminUser])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function loadMessages() {
    if (!adminUser) return
    try {
      const targetId = typeof adminUser === 'string' ? adminUser : adminUser
      const msgs = await apiRequest(`/messages/${targetId}`)
      setMessages(msgs.reverse())
    } catch {
      // silent
    }
  }

  async function handleSend(event) {
    event.preventDefault()
    if (!text.trim() || !adminUser || sending) return

    setSending(true)
    try {
      const targetId = typeof adminUser === 'string' ? adminUser : adminUser
      await apiRequest('/messages', {
        method: 'POST',
        body: { to: targetId, text: text.trim() }
      })

      if (socketRef.current) {
        socketRef.current.emit('newMessage', { from: user._id, to: targetId })
      }

      setText('')
      await loadMessages()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <section className="page-section">
        <div className="loading-block" style={{ minHeight: 400 }} />
      </section>
    )
  }

  if (error && !adminUser) {
    return (
      <PageFeedback
        eyebrow="Chat"
        title="Không thể kết nối hỗ trợ."
        message={error}
        tone="error"
        actions={
          <Link className="button button-primary" to="/">Trang chủ</Link>
        }
      />
    )
  }

  if (!adminUser) {
    return (
      <PageFeedback
        eyebrow="Hỗ trợ"
        title="Chưa có nhân viên hỗ trợ."
        message="Hiện tại chưa có admin nào trong hệ thống để hỗ trợ bạn."
        actions={
          <Link className="button button-primary" to="/">Trang chủ</Link>
        }
      />
    )
  }

  return (
    <section className="page-section chat-page">
      <div className="chat-header">
        <div>
          <p className="section-kicker">Hỗ trợ trực tuyến</p>
          <h2>Chat với Maison S4</h2>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
        ) : (
          messages.map(function (msg) {
            const isMe = msg.from?._id === user._id || msg.from === user._id
            return (
              <div key={msg._id} className={isMe ? 'chat-bubble chat-bubble-me' : 'chat-bubble chat-bubble-them'}>
                <p>{msg.messageContent?.text}</p>
                <span className="chat-time">
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={function (e) { setText(e.target.value) }}
          disabled={sending}
        />
        <button className="button button-primary" type="submit" disabled={sending || !text.trim()}>
          Gửi
        </button>
      </form>

      {error ? <p className="status-banner status-banner-error">{error}</p> : null}
    </section>
  )
}
