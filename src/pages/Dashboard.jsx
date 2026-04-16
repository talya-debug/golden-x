import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FolderKanban, DollarSign, AlertTriangle, RotateCcw, Plus, FileText, ChevronLeft } from 'lucide-react'
import { getProjects, getQuotes, getMilestones, resetAllData } from '../data/store'
import { calcQuoteTotals, formatCurrency, formatDate, getStatusLabel, getStatusBadgeClass } from '../data/mockData'

export default function Dashboard() {
  const [, setRefresh] = useState(0)
  const projects = getProjects()
  const quotes = getQuotes()
  const milestones = getMilestones()

  const activeProjects = projects.filter(p => p.status === 'active')

  // חישוב סה"כ מכירות מכל ההצעות המאושרות
  const totalQuotesValue = quotes.reduce((sum, q) => {
    const totals = calcQuoteTotals(q.items || [])
    return sum + totals.totalSell
  }, 0)

  // גבייה ממתינה - אבני דרך שלא שולמו
  const pendingBilling = milestones
    .filter(m => m.billingStatus !== 'שולם')
    .reduce((sum, m) => sum + (m.amount - m.paidAmount), 0)

  // הצעות אחרונות
  const recentQuotes = [...quotes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  return (
    <div className="animate-in">
      {/* כותרת + כפתורים */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>שלום אור</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            if (confirm('לאפס הכל לנתוני דמו?')) { resetAllData(); setRefresh(n => n + 1) }
          }}>
            <RotateCcw size={14} />איפוס דמו
          </button>
          <Link to="/quotes" className="btn btn-primary">
            <Plus size={18} />הצעה חדשה
          </Link>
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {[
          { label: 'פרויקטים פעילים', value: activeProjects.length, icon: FolderKanban, color: 'var(--info)', bg: 'var(--info-bg)' },
          { label: 'סה"כ הצעות (מכירה)', value: formatCurrency(totalQuotesValue), icon: DollarSign, color: 'var(--gold)', bg: 'var(--gold-bg)' },
          { label: 'גבייה ממתינה', value: formatCurrency(pendingBilling), icon: AlertTriangle, color: pendingBilling > 100000 ? 'var(--danger)' : 'var(--warning)', bg: pendingBilling > 100000 ? 'var(--danger-bg)' : 'var(--warning-bg)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        {/* הצעות אחרונות */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold)' }}>הצעות מחיר אחרונות</h2>
            <Link to="/quotes" className="btn btn-secondary btn-sm">הכל</Link>
          </div>
          {recentQuotes.map(q => {
            const totals = calcQuoteTotals(q.items || [])
            return (
              <Link key={q.id} to={`/quote/${q.id}`} style={{
                display: 'block', padding: '14px', background: 'var(--dark)',
                borderRadius: '10px', marginBottom: '10px', textDecoration: 'none', color: 'inherit',
                border: '1px solid transparent', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{q.number}</span>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(q.status)}`}>{getStatusLabel(q.status)}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {q.clientName} | {q.address}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{formatDate(q.date)}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatCurrency(totals.totalSell)}</span>
                </div>
              </Link>
            )
          })}
          {recentQuotes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>אין הצעות מחיר</div>
          )}
        </div>

        {/* פרויקטים פעילים */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold)' }}>פרויקטים פעילים</h2>
            <Link to="/projects" className="btn btn-secondary btn-sm">הכל</Link>
          </div>
          {activeProjects.map(p => {
            const quote = quotes.find(q => q.id === p.quoteId)
            const totals = quote ? calcQuoteTotals(quote.items || []) : { totalSell: 0 }
            const projMilestones = milestones.filter(m => m.projectId === p.id)
            const paidCount = projMilestones.filter(m => m.billingStatus === 'שולם').length
            return (
              <Link key={p.id} to={`/project/${p.id}`} style={{
                display: 'block', padding: '14px', background: 'var(--dark)',
                borderRadius: '10px', marginBottom: '10px', textDecoration: 'none', color: 'inherit',
                border: '1px solid transparent', transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-border)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span className={`badge ${getStatusBadgeClass(p.status)}`}>{getStatusLabel(p.status)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{p.clientName}</span>
                  <span>אבני דרך: {paidCount}/{projMilestones.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{formatDate(p.startDate)}</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatCurrency(totals.totalSell)}</span>
                </div>
              </Link>
            )
          })}
          {activeProjects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              אין פרויקטים פעילים. אשר הצעת מחיר כדי ליצור פרויקט.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
