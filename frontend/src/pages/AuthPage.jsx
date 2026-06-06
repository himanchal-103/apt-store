import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import './AuthPage.css'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  return (
    <div className="auth-bg">
      <div className="auth-grid-overlay" />
      <div className="auth-container fade-up">
        <div className="auth-brand">
          <span className="auth-logo">apt<span>.</span>orders</span>
          <p className="auth-tagline">Order management &amp; tracking</p>
        </div>
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => setTab('login')}
            >Sign in</button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => setTab('register')}
            >Register</button>
          </div>
          {tab === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => setTab('login')} />}
        </div>
      </div>
    </div>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      addToast(`Welcome back, ${user.name}!`, 'success')
      if (user.role === 'admin') {
        window.location.href = 'http://localhost:8000/admin'
      } else if (user.role === 'reviewer') {
        navigate('/reviewer')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const data = err?.response?.data
      if (data?.error) setErrors({ _: data.error })
      else if (data) setErrors(data)
      else setErrors({ _: 'Network error. Is the backend running?' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      {errors._ && <div className="error-banner">{errors._}</div>}
      <div className="field">
        <label>Email</label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="alice@example.com" required />
        {errors.email && <span className="field-error">{errors.email[0]}</span>}
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
        {errors.password && <span className="field-error">{errors.password[0]}</span>}
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
        {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in'}
      </button>
    </form>
  )
}

function RegisterForm({ onSuccess }) {
  const { register } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      addToast('Account created! Please sign in.', 'success')
      onSuccess()
    } catch (err) {
      const data = err?.response?.data
      if (data) setErrors(data)
      else setErrors({ _: 'Network error.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      {errors._ && <div className="error-banner">{errors._}</div>}
      <div className="field">
        <label>Name</label>
        <input value={form.name} onChange={set('name')} placeholder="Alice" required />
        {errors.name && <span className="field-error">{errors.name[0]}</span>}
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="alice@example.com" required />
        {errors.email && <span className="field-error">{errors.email[0]}</span>}
      </div>
      <div className="field">
        <label>Phone</label>
        <input value={form.phone} onChange={set('phone')} placeholder="9876543210" />
        {errors.phone && <span className="field-error">{errors.phone[0]}</span>}
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
        {errors.password && <span className="field-error">{errors.password[0]}</span>}
      </div>
      <div className="field">
        <label>Role</label>
        <select value={form.role} onChange={set('role')}>
          <option value="user">User</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
        {loading ? <><span className="spinner" /> Creating account…</> : 'Create account'}
      </button>
    </form>
  )
}
