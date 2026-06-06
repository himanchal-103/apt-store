import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onLogout }) {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    addToast('Logged out.', 'info')
    if (onLogout) onLogout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-logo">apt<span>.</span>orders</div>
      <div className="topbar-right">
        {user && (
          <span className="topbar-user">
            <strong>{user.name}</strong> &mdash; {user.role}
          </span>
        )}
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign out</button>
      </div>
    </header>
  )
}
