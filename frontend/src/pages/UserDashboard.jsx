import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useOrderSocket } from '../hooks/useOrderSocket'
import { ordersApi } from '../api/orders'
import Topbar from '../components/Topbar'
import StatusBadge from '../components/StatusBadge'
import './UserDashboard.css'

const ACTIVE_STATUSES = ['pending', 'shipped']

export default function UserDashboard() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [productName, setProductName] = useState('')
  const [creating, setCreating] = useState(false)
  const [events, setEvents] = useState([])
  const eventsRef = useRef(null)

  const hasActive = orders.some(o => ACTIVE_STATUSES.includes(o.status))

  const fetchOrders = useCallback(async () => {
    try {
      const res = await ordersApi.list()
      setOrders(res.data)
    } catch {
      addToast('Failed to load orders.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [])

  // Scroll events to bottom
  useEffect(() => {
    if (eventsRef.current) eventsRef.current.scrollTop = eventsRef.current.scrollHeight
  }, [events])

  const onActiveOrders = useCallback((activeOrders) => {
    setOrders(prev => {
      const ids = new Set(prev.map(o => o.id))
      const merged = [...prev]
      for (const o of activeOrders) {
        if (!ids.has(o.id)) merged.push(o)
      }
      return merged
    })
    addToast(`WebSocket connected — ${activeOrders.length} active order(s).`, 'info')
  }, [])

  const onStatusUpdate = useCallback((data) => {
    const { order_id, status, product_name } = data
    setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status } : o))
    const msg = `Order #${order_id} (${product_name}) → ${status}`
    setEvents(prev => [...prev, { id: Date.now(), msg, status, ts: new Date().toLocaleTimeString() }])
    addToast(msg, status === 'cancelled' ? 'error' : 'success')
  }, [])

  const { connected, closedReason, reconnect } = useOrderSocket({
    enabled: hasActive,
    onActiveOrders,
    onStatusUpdate,
  })

  // When orders update (e.g. new order created), re-evaluate if we should connect
  useEffect(() => {
    if (hasActive && !connected) reconnect()
  }, [hasActive])

  const createOrder = async (e) => {
    e.preventDefault()
    if (!productName.trim()) return
    setCreating(true)
    try {
      await ordersApi.create(productName.trim())
      addToast('Order created!', 'success')
      setProductName('')
      await fetchOrders()
    } catch (err) {
      const msg = err?.response?.data?.product_name?.[0] || 'Failed to create order.'
      addToast(msg, 'error')
    } finally {
      setCreating(false)
    }
  }

  const deleteOrder = async (id) => {
    try {
      await ordersApi.delete(id)
      setOrders(prev => prev.filter(o => o.id !== id))
      addToast('Order deleted.', 'info')
    } catch {
      addToast('Failed to delete.', 'error')
    }
  }

  return (
    <div className="page-wrap">
      <Topbar />
      <main className="dashboard-main">
        {/* Left column */}
        <div className="dashboard-left">
          {/* Create order */}
          <div className="card fade-up">
            <div className="section-title">Place Order</div>
            <div className="section-sub">Create a new order for tracking</div>
            <form onSubmit={createOrder} className="create-form">
              <div className="field">
                <label>Product name</label>
                <input
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  placeholder="e.g. Mechanical Keyboard"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <><span className="spinner" /> Creating…</> : '+ New order'}
              </button>
            </form>
          </div>

          {/* Live updates panel */}
          <div className="card fade-up-1 ws-panel">
            <div className="ws-header">
              <div>
                <div className="section-title">Live Updates</div>
                <div className="section-sub">Real-time order status changes</div>
              </div>
              <div className="ws-status">
                {connected
                  ? <><span className="live-dot" /> Connected</>
                  : closedReason
                    ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{closedReason}</span>
                    : <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>Disconnected</span>
                }
              </div>
            </div>
            <div className="ws-events" ref={eventsRef}>
              {events.length === 0 ? (
                <div className="ws-empty">No events yet. Updates appear here when a reviewer changes your order status.</div>
              ) : events.map(ev => (
                <div key={ev.id} className="ws-event">
                  <span className="ws-event-time">{ev.ts}</span>
                  <span className="ws-event-msg">{ev.msg}</span>
                  <StatusBadge status={ev.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column – order list */}
        <div className="dashboard-right fade-up-2">
          <div className="orders-header">
            <div>
              <div className="section-title">My Orders</div>
              <div className="section-sub">{orders.length} total</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchOrders}>↻ Refresh</button>
          </div>

          {loading ? (
            <div className="empty-state"><span className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 3H8l-1 4h10l-1-4z"/></svg>
              No orders yet. Place your first order!
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, i) => (
                <div key={order.id} className="order-row fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="order-row-left">
                    <span className="order-id">#{order.id}</span>
                    <span className="order-name">{order.product_name}</span>
                  </div>
                  <div className="order-row-right">
                    <StatusBadge status={order.status} />
                    {(order.status === 'pending') && (
                      <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(order.id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
