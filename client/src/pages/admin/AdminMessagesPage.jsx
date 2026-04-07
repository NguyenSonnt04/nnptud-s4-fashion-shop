import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../../lib/api.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { getStoredToken } from '../../lib/storage.js'
import { AdminPageHeader, AdminEmptyState } from '../../components/admin/AdminShared.jsx'
import { io } from 'socket.io-client'

export function AdminMessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeUserId, setActiveUserId] = useState(null)
  const [activeUserName, setActiveUserName] = useState('')
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usersMap, setUsersMap] = useState({})
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    const token = getStoredToken()
    if (!token) return

    const socket = io({ auth: { token } })
    socketRef.current = socket

    socket.on('connect', function () {
      socket.emit('user', user._id)
    })

    socket.on('newMessage', function () {
      loadConversations()
      if (activeUserId) {
        loadMessages(activeUserId)
      }
    })

    return () => { socket.disconnect() }
  }, [activeUserId])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function loadConversations() {
    try {
      setLoading(true)
      const [convos, users] = await Promise.all([
        apiRequest('/messages'),
        apiRequest('/users')
      ])
      const map = {}
      users.forEach(function (u) { map[u._id] = u })
      setUsersMap(map)
      setConversations(convos)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(userId) {
    try {
      const msgs = await apiRequest(`/messages/${userId}`)
      setMessages(msgs.reverse())
    } catch {
      // silent
    }
  }

  function selectConversation(userId) {
    setActiveUserId(userId)
    const u = usersMap[userId]
    setActiveUserName(u?.fullName || u?.username || userId)
    loadMessages(userId)
  }

  async function handleSend(event) {
    event.preventDefault()
    if (!text.trim() || !activeUserId || sending) return

    setSending(true)
    try {
      await apiRequest('/messages', {
        method: 'POST',
        body: { to: activeUserId, text: text.trim() }
      })

      if (socketRef.current) {
        socketRef.current.emit('newMessage', { from: user._id, to: activeUserId })
      }

      setText('')
      await loadMessages(activeUserId)
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Giao tiếp"
        title="Tin nhắn"
        description="Xem và trả lời tin nhắn từ khách hàng."
      />

      <div className="admin-grid">
        <div className="admin-panel-card" style={{ minHeight: 500 }}>
          {!activeUserId ? (
            <AdminEmptyState
              title="Chọn cuộc trò chuyện"
              message="Chọn một khách hàng từ danh sách bên cạnh để xem tin nhắn."
            />
          ) : (
            <>
              <div className="admin-panel-head">
                <h3>{activeUserName}</h3>
                <p>Cuộc trò chuyện với khách hàng</p>
              </div>

              <div className="admin-chat-messages">
                {messages.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
                    Chưa có tin nhắn nào.
                  </p>
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

              <form className="admin-chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={text}
                  onChange={function (e) { setText(e.target.value) }}
                  disabled={sending}
                />
                <button className="button button-primary button-small" type="submit" disabled={sending || !text.trim()}>
                  Gửi
                </button>
              </form>
            </>
          )}
        </div>

        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <h3>Cuộc trò chuyện</h3>
            <p>{conversations.length} cuộc hội thoại</p>
          </div>

          {loading ? (
            <div className="loading-block" style={{ minHeight: 200 }} />
          ) : conversations.length === 0 ? (
            <AdminEmptyState
              title="Chưa có tin nhắn"
              message="Khi khách hàng gửi tin nhắn, chúng sẽ hiển thị ở đây."
            />
          ) : (
            <div className="admin-activity-list">
              {conversations.map(function (convo) {
                const u = usersMap[convo.user]
                const isActive = activeUserId === convo.user
                return (
                  <button
                    key={convo.user}
                    type="button"
                    className={isActive ? 'admin-activity-item admin-convo-active' : 'admin-activity-item'}
                    onClick={function () { selectConversation(convo.user) }}
                    style={{ cursor: 'pointer', textAlign: 'left', border: isActive ? '1px solid var(--text)' : undefined }}
                  >
                    <strong>{u?.fullName || u?.username || convo.user}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {convo.message?.messageContent?.text
                        ? convo.message.messageContent.text.substring(0, 50)
                        : 'File đính kèm'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(convo.message?.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
