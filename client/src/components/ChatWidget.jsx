import { useEffect, useRef, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getStoredToken } from '../lib/storage.js'
import { ChatIcon, CloseIcon } from './Icons.jsx'
import { io } from 'socket.io-client'

export function ChatWidget() {
  const { isAuthenticated, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(function () {
    if (!open || !isAuthenticated || initialized) return
    let isActive = true

    async function init() {
      setLoading(true)
      try {
        const conversations = await apiRequest('/messages')
        if (!isActive) return

        if (conversations.length > 0) {
          const firstPartner = conversations[0].user
          setAdminUser(firstPartner)
          const msgs = await apiRequest('/messages/' + firstPartner)
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
        setInitialized(true)
      } catch {
        // silent
      } finally {
        if (isActive) setLoading(false)
      }
    }

    init()
    return function () { isActive = false }
  }, [open, isAuthenticated, initialized])

  useEffect(function () {
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

    return function () { socket.disconnect() }
  }, [adminUser])

  useEffect(function () {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function loadMessages() {
    if (!adminUser) return
    try {
      const targetId = typeof adminUser === 'string' ? adminUser : adminUser
      const msgs = await apiRequest('/messages/' + targetId)
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
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="chat-widget">
      {open ? (
        <div className="chat-widget-panel">
          <div className="chat-widget-header">
            <div>
              <strong>Maison S4</strong>
              <small>Ho tro truc tuyen</small>
            </div>
            <button
              className="chat-widget-close"
              type="button"
              onClick={function () { setOpen(false) }}
              aria-label="Dong chat"
            >
              <CloseIcon className="chat-widget-close-icon" />
            </button>
          </div>

          <div className="chat-widget-body">
            {loading ? (
              <p className="chat-widget-status">Dang tai...</p>
            ) : !adminUser ? (
              <p className="chat-widget-status">Chua co nhan vien ho tro.</p>
            ) : messages.length === 0 ? (
              <p className="chat-widget-status">Chua co tin nhan nao. Hay bat dau cuoc tro chuyen!</p>
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

          {adminUser ? (
            <form className="chat-widget-input" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Nhap tin nhan..."
                value={text}
                onChange={function (e) { setText(e.target.value) }}
                disabled={sending}
              />
              <button className="button button-primary" type="submit" disabled={sending || !text.trim()}>
                Gui
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      <button
        className="chat-widget-toggle"
        type="button"
        onClick={function () { setOpen(!open) }}
        aria-label={open ? 'Dong chat' : 'Mo chat ho tro'}
      >
        {open ? (
          <CloseIcon className="chat-widget-toggle-icon" />
        ) : (
          <ChatIcon className="chat-widget-toggle-icon" />
        )}
      </button>
    </div>
  )
}
