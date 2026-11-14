'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, role })
    })

    if (res.ok) {
      const data = await res.json()
      router.push(data.role === 'admin' ? '/admin' : '/products')
    } else {
      const data = await res.json()
      setError(data.error || '로그인에 실패했습니다')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fbfbfa' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        <h1 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '0.18em', paddingLeft: '0.18em', marginBottom: 12 }}>
          글로벌득템
        </h1>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#a3a29e', letterSpacing: '0.08em', marginBottom: 40 }}>
          ENTER PASSWORD TO CONTINUE
        </p>
        <div style={{ display: 'flex', borderBottom: '1px solid #ecebe8', marginBottom: 24 }}>
          {(['user', 'admin'] as const).map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setError('') }}
              style={{
                flex: 1, padding: '14px 0', background: 'none', border: 'none',
                borderBottom: role === r ? '2px solid #141413' : '2px solid transparent',
                fontSize: 14, fontWeight: role === r ? 600 : 400,
                color: role === r ? '#141413' : '#a3a29e',
                cursor: 'pointer', letterSpacing: '0.06em'
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••"
            style={{
              width: '100%', padding: '16px', fontSize: 16,
              border: '1px solid #ecebe8', outline: 'none', background: '#fff',
              marginBottom: 16
            }}
          />
          {error && <p style={{ color: '#b3261e', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            style={{
              width: '100%', padding: '16px', fontSize: 15, fontWeight: 600,
              background: '#141413', color: '#fbfbfa', border: 'none', cursor: 'pointer'
            }}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}
