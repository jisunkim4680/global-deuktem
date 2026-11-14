'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [userPw, setUserPw] = useState('')
  const [adminCurrentPw, setAdminCurrentPw] = useState('')
  const [adminNewPw, setAdminNewPw] = useState('')
  const [msg, setMsg] = useState('')

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', fontSize: 14, border: '1px solid #ecebe8', outline: 'none' }

  async function changeUserPw(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/settings/user-password', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: userPw })
    })
    const data = await res.json()
    setMsg(res.ok ? '유저 비밀번호가 변경되었습니다' : data.error)
    if (res.ok) setUserPw('')
  }

  async function changeAdminPw(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/settings/admin-password', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: adminCurrentPw, newPassword: adminNewPw })
    })
    const data = await res.json()
    setMsg(res.ok ? '관리자 비밀번호가 변경되었습니다' : data.error)
    if (res.ok) { setAdminCurrentPw(''); setAdminNewPw('') }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 40, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32 }}>설정</h1>
      {msg && <p style={{ padding: 12, background: '#f1f0ed', fontSize: 13, marginBottom: 24 }}>{msg}</p>}

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>유저 비밀번호 변경</h2>
        <form onSubmit={changeUserPw} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inputStyle} type="password" placeholder="새 비밀번호 (4자 이상)" value={userPw} onChange={e => setUserPw(e.target.value)} />
          <button type="submit" style={{ padding: '12px', background: '#141413', color: '#fbfbfa', border: 'none', fontSize: 14, cursor: 'pointer' }}>변경</button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>관리자 비밀번호 변경</h2>
        <form onSubmit={changeAdminPw} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inputStyle} type="password" placeholder="현재 비밀번호" value={adminCurrentPw} onChange={e => setAdminCurrentPw(e.target.value)} />
          <input style={inputStyle} type="password" placeholder="새 비밀번호 (4자 이상)" value={adminNewPw} onChange={e => setAdminNewPw(e.target.value)} />
          <button type="submit" style={{ padding: '12px', background: '#141413', color: '#fbfbfa', border: 'none', fontSize: 14, cursor: 'pointer' }}>변경</button>
        </form>
      </section>
    </div>
  )
}
