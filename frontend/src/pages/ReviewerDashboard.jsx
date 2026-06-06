import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import { ordersApi } from '../api/orders'
import Topbar from '../components/Topbar'
import StatusBadge from '../components/StatusBadge'
import './ReviewerDashboard.css'

const STATUSES = ['pending', 'shipped', 'delivered', 'cancelled']

export default function ReviewerDashboard() {
  const { addToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)  // order being edited
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [filter, setFilter] = useState('active')  // 'active' | 'all'

  const fetchOrders = useCallback(async () => {
    setLoading(true)
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

  const openEditor = (order) => {
    setSelected(order)
    setNewStatus(order.status)
  }

  const closeEditor = () => { setSelected(null); setNewStatus('') }

  const submitUpdate = async () => {
    if (!selected || !newStatus || newStatus === selected.status) return
    setUpdating(true)
    try {
      await ordersApi.updateStatus(selected.id, newStatus)
      setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, status: newStatus } : o))
      addToast(`Order #${selected.id} updated to "${newStatus}".`, 'success')
      closeEditor()
    } catch (err) {
      const msg = err?.response?.data?.status?.[0] || err?.response?.data?.error || 'Failed to update.'
      addToast(msg, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const displayed = filter === 'active'
    ? orders.filter(o => o.status === 'pending' || o.status === 'shipped')
    : orders

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="page-wrap">
      <Topbar />
      <main className="reviewer-main">
        {/* Stats bar */}
        <div className="stats-row fade-up">
          {STATUSES.map(s => (
            <div key={s} className={`stat-card stat-${s}`}>
              <span className="stat-count">{counts[s]}</span>
              <span className="stat-label">{s}</span>
            </div>
          ))}
        </div>

        {/* Header + filter */}
        <div className="reviewer-header fade-up-1">
          <div>
            <div className="section-title">Order Management</div>
            <div className="section-sub">Click an order to update its status</div>
          </div>
          <div className="filter-tabs">
            <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active only</button>
            <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All orders</button>
            <button className="btn btn-ghost btn-sm" onClick={fetchOrders}>↻ Refresh</button>
          </div>
        </div>

        {/* Order grid */}
        {loading ? (
          <div className="empty-state"><span className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            No orders to show.
          </div>
        ) : (
          <div className="order-grid fade-up-2">
            {displayed.map((order, i) => (
              <button
                key={order.id}
                className={`order-card ${selected?.id === order.id ? 'selected' : ''}`}
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => selected?.id === order.id ? closeEditor() : openEditor(order)}
              >
                <div className="order-card-top">
                  <span className="order-card-id">#{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="order-card-name">{order.product_name}</div>
                <div className="order-card-user">user #{order.user}</div>
                {selected?.id === order.id && (
                  <div className="order-inline-editor" onClick={e => e.stopPropagation()}>
                    <div className="status-options">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          className={`status-option status-option-${s} ${newStatus === s ? 'chosen' : ''}`}
                          onClick={() => setNewStatus(s)}
                        >{s}</button>
                      ))}
                    </div>
                    <div className="editor-actions">
                      <button className="btn btn-ghost btn-sm" onClick={closeEditor}>Cancel</button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={submitUpdate}
                        disabled={updating || newStatus === order.status}
                      >
                        {updating ? <><span className="spinner" />Saving…</> : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
