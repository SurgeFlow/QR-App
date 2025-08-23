import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

const navStyle: React.CSSProperties = { display:'flex', gap:'1rem', alignItems:'center' }
const headerStyle: React.CSSProperties = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:'1px solid #eee' }

export default function App() {
  const loc = useLocation();
  return (
    <div>
      <header style={headerStyle}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <img src="/kodiak-logo.png" alt="Kodiak" style={{height:40}}/>
          <strong>Kodiak Equipment Services, Inc.</strong>
        </div>
        <nav style={navStyle}>
          <Link to="/">Create & Print</Link>
          <Link to="/reports">Reports</Link>
        </nav>
      </header>
      <div style={{ padding: 16 }}>
        <Outlet />
      </div>
    </div>
  )
}