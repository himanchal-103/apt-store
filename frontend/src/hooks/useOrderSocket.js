import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = 'ws://localhost:8000/ws/orders/'

export function useOrderSocket({ onStatusUpdate, onActiveOrders, enabled = true }) {
  const ws = useRef(null)
  const [connected, setConnected] = useState(false)
  const [closedReason, setClosedReason] = useState(null)

  const connect = useCallback(() => {
    if (!enabled) return
    if (ws.current && ws.current.readyState <= 1) return // already open/connecting

    setClosedReason(null)
    const socket = new WebSocket(WS_URL)
    ws.current = socket

    socket.onopen = () => setConnected(true)

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'active_orders') {
          onActiveOrders?.(data.orders)
        } else if (data.type === 'order.status') {
          onStatusUpdate?.(data)
        } else if (data.type === 'connection.closing') {
          setClosedReason(data.reason)
        }
      } catch (_) {}
    }

    socket.onclose = (e) => {
      setConnected(false)
      if (e.code === 4001) setClosedReason('Not authenticated')
    }

    socket.onerror = () => setConnected(false)
  }, [enabled, onActiveOrders, onStatusUpdate])

  const disconnect = useCallback(() => {
    ws.current?.close()
    ws.current = null
    setConnected(false)
  }, [])

  useEffect(() => {
    if (enabled) connect()
    return () => disconnect()
  }, [enabled])

  return { connected, closedReason, reconnect: connect, disconnect }
}
