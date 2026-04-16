import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { formatCurrency, calcQuoteTotals, findPriceItem, getStatusLabel, getStatusBadgeClass, categoryIcons } from '../data/mockData'
import { getProject, getQuote, getMilestones, getSubcontractors, getWorkLogs, getPurchases, getProjectTasks } from '../data/store'

// חישוב אחוזים
const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0

export default function ProjectOverview() {
  const { id } = useParams()
  const pid = Number(id)
  const project = getProject(pid)

  if (!project) return <div className="animate-in"><div className="card" style={{ textAlign: 'center', padding: '40px' }}>פרויקט לא נמצא</div></div>

  const quote = project.quoteId ? getQuote(project.quoteId) : null
  const quoteItems = quote?.items || []
  const quoteTotals = quote ? calcQuoteTotals(quoteItems) : { totalCost: 0, totalSell: 0, materialCost: 0, laborCost: 0, profit: 0, profitMargin: 0 }

  const milestones = getMilestones().filter(m => m.projectId === pid)
  const subs = getSubcontractors().filter(s => s.projectId === pid)
  const logs = getWorkLogs().filter(l => l.projectId === pid)
  const purchases = getPurchases().filter(p => p.projectId === pid)
  const tasks = getProjectTasks().filter(t => t.projectId === pid)

  // === חישובים כלליים ===
  const contractValue = quoteTotals.totalSell
  const collected = milestones.filter(m => m.billingStatus === 'שולם').reduce((s, m) => s + (m.paidAmount || 0), 0)

  // הוצאות בפועל
  const materialActual = purchases.reduce((s, p) => {
    const orders = p.orders || []
    return s + orders.reduce((os, o) => os + (o.quantity * o.unitCost), 0)
  }, 0)
  const laborActual = logs.reduce((s, l) => s + (l.actualLaborCost || l.laborCost || 0), 0)
  const laborClientCost = logs.reduce((s, l) => s + (l.laborCost || 0), 0)
  const subPaid = subs.reduce((s, sub) => s + sub.paid, 0)
  const totalExpenses = materialActual + laborActual + subPaid

  const profitLoss = collected - totalExpenses

  // פער גבייה
  const approvedNotPaid = milestones
    .filter(m => ['מאושר לגבייה', 'ממתין לתשלום'].includes(m.billingStatus))
    .reduce((s, m) => s + (m.amount - (m.paidAmount || 0)), 0)
  const hasCollectionProblem = approvedNotPaid > 0

  // === תכנון מול ביצוע - לפי קטגוריה ===
  const categoryBreakdown = useMemo(() => {
    // קטגוריות ייחודיות מהפרויקט
    const cats = [...new Set(tasks.map(t => t.category))].sort()

    return cats.map(cat => {
      const catTasks = tasks.filter(t => t.category === cat)

      // תכנון: עלות חומרים + עלות עבודה + קבלני משנה מהצעת המחיר
      const plannedMaterial = catTasks.filter(t => t.type === 'material')
        .reduce((s, t) => s + (t.budgetCost * t.budgetQty), 0)
      const plannedLabor = catTasks.filter(t => t.type === 'labor')
        .reduce((s, t) => s + (t.budgetCost * t.budgetQty), 0)
      const plannedSub = catTasks.filter(t => t.type === 'subcontractor')
        .reduce((s, t) => s + (t.budgetCost * t.budgetQty), 0)
      const plannedClientLabor = catTasks.filter(t => t.type === 'labor')
        .reduce((s, t) => s + (t.clientPrice * t.budgetQty), 0)
      const plannedClientMaterial = catTasks.filter(t => t.type === 'material')
        .reduce((s, t) => s + (t.clientPrice * t.budgetQty), 0)
      const plannedTotal = plannedMaterial + plannedLabor + plannedSub
      const plannedClientTotal = plannedClientLabor + plannedClientMaterial

      // ביצוע: חומרים + קבלני משנה מהרכש
      const catPurchases = purchases.filter(p => p.category === cat)
      // חומרים רגילים
      const materialPurchases = catPurchases.filter(p => {
        const task = tasks.find(t => t.id === p.taskId)
        return !task || task.type !== 'subcontractor'
      })
      const actualMaterial = materialPurchases.reduce((s, p) => {
        const orders = p.orders || []
        return s + orders.reduce((os, o) => os + (o.quantity * o.unitCost), 0)
      }, 0)
      // קבלני משנה
      const subPurchases = catPurchases.filter(p => {
        const task = tasks.find(t => t.id === p.taskId)
        return task && task.type === 'subcontractor'
      })
      const actualSub = subPurchases.reduce((s, p) => {
        const orders = p.orders || []
        return s + orders.reduce((os, o) => os + (o.quantity * o.unitCost), 0)
      }, 0)

      // ביצוע: עבודה מהיומנים (entries חדש או categories ישן)
      let actualLabor = 0
      let clientLabor = 0
      logs.forEach(log => {
        if (log.entries && log.entries.length > 0) {
          // פורמט חדש - entries עם עלות לכל קטגוריה
          log.entries.forEach(entry => {
            if (entry.category === cat) {
              actualLabor += entry.actualCost || 0
              clientLabor += entry.clientCost || 0
            }
          })
        } else if (log.categories && log.categories.includes(cat)) {
          // פורמט ישן - חלוקה שווה בין הקטגוריות
          const share = log.categories.length > 0 ? 1 / log.categories.length : 0
          actualLabor += (log.actualLaborCost || log.laborCost || 0) * share
          clientLabor += (log.laborCost || 0) * share
        }
      })

      const actualTotal = actualMaterial + actualLabor + actualSub

      // קבלני משנה מהמודול הישן
      const catSubs = subs.filter(s => s.specialty === cat)
      const subModuleAmount = catSubs.reduce((s, sub) => s + sub.paid, 0)

      return {
        category: cat,
        icon: categoryIcons[cat] || '📦',
        plannedMaterial, plannedLabor, plannedSub, plannedTotal,
        plannedClientLabor, plannedClientMaterial, plannedClientTotal,
        actualMaterial, actualLabor, actualSub, actualTotal,
        clientLabor,
        subAmount: subModuleAmount,
        materialPct: pct(actualMaterial, plannedMaterial),
        laborPct: pct(actualLabor, plannedLabor),
        totalPct: pct(actualTotal, plannedTotal),
        isOverBudget: actualTotal > plannedTotal && plannedTotal > 0,
      }
    })
  }, [tasks, purchases, logs, subs])

  // סיכומים מתכנון מול ביצוע
  const totalPlannedCost = categoryBreakdown.reduce((s, c) => s + c.plannedTotal, 0)
  const totalActualCost = categoryBreakdown.reduce((s, c) => s + c.actualTotal + c.subAmount, 0)
  const totalPlannedClient = categoryBreakdown.reduce((s, c) => s + c.plannedClientTotal, 0)

  // ימי עבודה
  const uniqueWorkDays = new Set(logs.map(l => l.date)).size
  const totalPlannedLaborDays = tasks.filter(t => t.type === 'labor')
    .reduce((s, t) => s + t.budgetQty, 0)

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>סקירה כספית</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{project.name}</p>
      </div>

      {/* התראת גבייה */}
      {hasCollectionProblem && (
        <div style={{
          background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
          borderRadius: 'var(--radius)', padding: '18px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={22} color="var(--danger)" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '2px' }}>
              נורה אדומה - פער גבייה!
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              מאושר לגבייה ולא שולם: {formatCurrency(approvedNotPaid)} | נגבה: {formatCurrency(collected)}
            </div>
          </div>
        </div>
      )}

      {/* כרטיסי סיכום ראשיים */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px', marginBottom: '28px'
      }}>
        {[
          { label: 'ערך חוזה (מכירה)', value: formatCurrency(contractValue), icon: DollarSign, color: 'var(--gold)', bg: 'var(--gold-bg)' },
          { label: 'נגבה בפועל', value: formatCurrency(collected), icon: TrendingUp, color: 'var(--success)', bg: 'var(--success-bg)' },
          { label: 'הוצאות בפועל', value: formatCurrency(totalExpenses), icon: TrendingDown, color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { label: 'רווח/הפסד', value: formatCurrency(profitLoss), icon: profitLoss >= 0 ? TrendingUp : TrendingDown, color: profitLoss >= 0 ? 'var(--success)' : 'var(--danger)', bg: profitLoss >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '11px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* סיכום כללי - תכנון מול ביצוע */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* פירוט הוצאות */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold)', marginBottom: '18px' }}>
            פירוט הוצאות
          </h2>
          {[
            { label: 'רכש חומרים בפועל', value: materialActual, color: 'var(--info)' },
            { label: 'כוח אדם (יומנים)', value: laborActual, color: 'var(--warning)' },
            { label: 'קבלני משנה (שולם)', value: subPaid, color: 'var(--gold)' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px', background: 'var(--dark)', borderRadius: '8px', marginBottom: '8px'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: item.color }}>{formatCurrency(item.value)}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px', background: 'var(--gold-bg)', borderRadius: '8px',
            marginTop: '4px', border: '1px solid var(--gold-border)'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>סה"כ הוצאות</span>
            <span style={{ fontWeight: 700, color: 'var(--gold)', fontSize: '18px' }}>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        {/* סיכום תכנון מול ביצוע */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold)', marginBottom: '18px' }}>
            <BarChart3 size={18} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />
            תכנון מול ביצוע - סה"כ
          </h2>
          {[
            { label: 'כמה תכננתי לשלם (עלות שלי)', estimated: totalPlannedCost, actual: totalActualCost },
            { label: 'כמה הלקוח משלם לי', estimated: totalPlannedClient, actual: laborClientCost + materialActual },
          ].map((item, i) => {
            const overBudget = item.actual > item.estimated && item.estimated > 0
            const usagePercent = pct(item.actual, item.estimated)
            return (
              <div key={i} style={{
                padding: '14px', background: 'var(--dark)', borderRadius: '8px', marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                  <span style={{ color: overBudget ? 'var(--danger)' : 'var(--success)', fontWeight: 600, fontSize: '12px' }}>
                    {usagePercent}% ניצול
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>תכנון: {formatCurrency(item.estimated)}</span>
                  <span style={{ color: overBudget ? 'var(--danger)' : 'var(--text-secondary)' }}>ביצוע: {formatCurrency(item.actual)}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(usagePercent, 100)}%`,
                    borderRadius: '3px',
                    background: overBudget ? 'var(--danger)' : 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
                  }} />
                </div>
              </div>
            )
          })}

          {/* ימי עבודה */}
          <div style={{
            padding: '14px', background: 'var(--dark)', borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ fontWeight: 500 }}>ימי עבודה</span>
              <span style={{ color: 'var(--info)', fontWeight: 600, fontSize: '12px' }}>
                {pct(uniqueWorkDays, totalPlannedLaborDays)}% ניצול
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>תכנון: {totalPlannedLaborDays} ימים</span>
              <span style={{ color: 'var(--text-secondary)' }}>ביצוע: {uniqueWorkDays} ימים</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(pct(uniqueWorkDays, totalPlannedLaborDays), 100)}%`,
                borderRadius: '3px',
                background: 'linear-gradient(90deg, var(--info), #60a5fa)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* === פירוט לפי קטגוריה - כרטיסים ברורים === */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold)', marginBottom: '14px' }}>
        <BarChart3 size={18} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />
        מה תכננתי מול מה שילמתי - לפי תחום
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {categoryBreakdown.map(cat => (
          <div key={cat.category} className="card" style={{
            borderRight: cat.isOverBudget ? '3px solid var(--danger)' : '3px solid var(--gold)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                {cat.icon} {cat.category}
              </h3>
              <span style={{
                fontSize: '13px', fontWeight: 700,
                color: cat.isOverBudget ? 'var(--danger)' : cat.totalPct >= 80 ? 'var(--warning)' : 'var(--success)',
              }}>
                {cat.totalPct}% נוצל
              </span>
            </div>

            {/* פרוגרס כללי */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{
                height: '100%', width: `${Math.min(cat.totalPct, 100)}%`, borderRadius: '3px',
                background: cat.isOverBudget ? 'var(--danger)' : 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
              }} />
            </div>

            {/* שורות: חומרים, עבודה, קבלנים */}
            {[
              { label: 'חומרים', planned: cat.plannedMaterial, actual: cat.actualMaterial, show: cat.plannedMaterial > 0 },
              { label: 'עבודה', planned: cat.plannedLabor, actual: cat.actualLabor, show: cat.plannedLabor > 0 },
              { label: 'קב"מ', planned: cat.plannedSub || 0, actual: cat.actualSub || 0, show: (cat.plannedSub || 0) > 0 },
            ].filter(r => r.show).map((row, i) => {
              const over = row.actual > row.planned && row.planned > 0
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px', background: 'var(--dark)', borderRadius: '6px', marginBottom: '4px', fontSize: '13px',
                }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: '50px' }}>{row.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>תכנון: {formatCurrency(row.planned)}</span>
                  <span style={{ fontWeight: 600, color: over ? 'var(--danger)' : 'var(--success)' }}>
                    ביצוע: {formatCurrency(row.actual)}
                  </span>
                </div>
              )
            })}

            {/* סיכום */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px', marginTop: '6px',
              background: cat.isOverBudget ? 'var(--danger-bg)' : 'var(--gold-bg)', borderRadius: '8px', fontSize: '13px',
            }}>
              <span style={{ fontWeight: 600, color: cat.isOverBudget ? 'var(--danger)' : 'var(--gold)' }}>
                תכנון: {formatCurrency(cat.plannedTotal)}
              </span>
              <span style={{ fontWeight: 700, color: cat.isOverBudget ? 'var(--danger)' : 'var(--gold)' }}>
                ביצוע: {formatCurrency(cat.actualTotal)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* טבלת אבני דרך */}
      {milestones.length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold)', marginBottom: '14px' }}>
            סטטוס אבני דרך
          </h2>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>אבן דרך</th><th>אחוז</th><th>סכום</th><th>סטטוס</th><th>גבייה</th><th>שולם</th></tr>
                </thead>
                <tbody>
                  {milestones.map(ms => {
                    const amount = ms.amount > 0 ? ms.amount : Math.round(contractValue * ms.percentage / 100)
                    return (
                      <tr key={ms.id}>
                        <td style={{ fontWeight: 500 }}>{ms.name}</td>
                        <td>{ms.percentage}%</td>
                        <td style={{ color: 'var(--gold)' }}>{formatCurrency(amount)}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(ms.status)}`}>{getStatusLabel(ms.status)}</span>
                        </td>
                        <td>
                          <span style={{ color: ms.billingStatus === 'שולם' ? 'var(--success)' : 'var(--text-muted)', fontSize: '13px' }}>
                            {ms.billingStatus}
                          </span>
                        </td>
                        <td style={{ color: (ms.paidAmount || 0) > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                          {formatCurrency(ms.paidAmount || 0)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* קבלני משנה */}
      {subs.length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gold)', marginTop: '28px', marginBottom: '14px' }}>
            סטטוס קבלני משנה
          </h2>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>קבלן</th><th>תחום</th><th>סכום הסכם</th><th>שולם</th><th>ממתין</th><th>יתרה</th></tr>
                </thead>
                <tbody>
                  {subs.map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 500 }}>{sub.name}</td>
                      <td>{sub.specialty}</td>
                      <td>{formatCurrency(sub.contractAmount)}</td>
                      <td style={{ color: 'var(--success)' }}>{formatCurrency(sub.paid)}</td>
                      <td style={{ color: 'var(--warning)' }}>{formatCurrency(sub.pending)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(sub.contractAmount - sub.paid - sub.pending)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
