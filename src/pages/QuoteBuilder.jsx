import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, CheckCircle, X, FileDown } from 'lucide-react'
import html2pdf from 'html2pdf.js'
import { findPriceItem, calcQuoteTotals, formatCurrency, formatDate, getStatusLabel, getStatusBadgeClass, categoryIcons, getCategories, getTypeLabel, getTypeBadgeClass } from '../data/mockData'
import { getQuote, updateQuote, approveQuote, getPriceList } from '../data/store'

export default function QuoteBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(() => getQuote(Number(id)))
  const [priceList] = useState(getPriceList())
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const printRef = useRef()

  if (!quote) return <div className="animate-in"><div className="card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>הצעת מחיר לא נמצאה</div></div>

  const categories = [...new Set(priceList.map(i => i.category))]
  const categoryItems = selectedCategory ? priceList.filter(i => i.category === selectedCategory) : []
  const totals = calcQuoteTotals(quote.items || [])

  // פריטים מורחבים
  const enrichedItems = (quote.items || []).map(qi => {
    const pi = findPriceItem(qi.priceItemId)
    if (!pi) return null
    const totalCost = pi.costPrice * qi.quantity
    const totalSell = qi.clientPrice * qi.quantity
    return { ...qi, ...pi, totalCost, totalSell, profit: totalSell - totalCost }
  }).filter(Boolean)

  // קיבוץ לפי קטגוריה
  const groupedItems = {}
  enrichedItems.forEach(item => {
    if (!groupedItems[item.category]) groupedItems[item.category] = []
    groupedItems[item.category].push(item)
  })

  // קטגוריות שנבחרו בהצעה
  const selectedCategories = [...new Set(enrichedItems.map(i => i.category))]

  const saveQuote = (updates) => {
    const updated = { ...quote, ...updates }
    updateQuote(quote.id, updates)
    setQuote(updated)
  }

  const handleAddItem = () => {
    if (!selectedItemId) return
    const pi = findPriceItem(Number(selectedItemId))
    if (!pi) return
    if ((quote.items || []).find(qi => qi.priceItemId === pi.id)) return
    const newItems = [...(quote.items || []), { priceItemId: pi.id, quantity: 1, clientPrice: Math.round(pi.costPrice * 1.3) }]
    saveQuote({ items: newItems })
    setSelectedItemId('')
    // עדכון אבני דרך אוטומטי
    autoUpdateMilestones(newItems)
  }

  const handleRemoveItem = (priceItemId) => {
    const newItems = (quote.items || []).filter(qi => qi.priceItemId !== priceItemId)
    saveQuote({ items: newItems })
    autoUpdateMilestones(newItems)
  }

  const handleItemChange = (priceItemId, field, value) => {
    const newItems = (quote.items || []).map(qi =>
      qi.priceItemId === priceItemId ? { ...qi, [field]: Number(value) || 0 } : qi
    )
    saveQuote({ items: newItems })
  }

  // אבני דרך דינמיות - מקדמה + קטגוריות שנבחרו + גמר
  const autoUpdateMilestones = (items) => {
    const cats = [...new Set(items.map(qi => {
      const pi = findPriceItem(qi.priceItemId)
      return pi?.category
    }).filter(Boolean))]

    // מילוי מקדמה + קטגוריות + גמר
    const milestones = [{ name: 'מקדמה', percentage: 30, completionCriteria: 'חתימת חוזה' }]

    // חלוקת 60% בין הקטגוריות
    const perCat = cats.length > 0 ? Math.floor(60 / cats.length) : 0
    let remainder = 60 - (perCat * cats.length)

    cats.forEach((cat, i) => {
      milestones.push({
        name: `סיום ${cat}`,
        percentage: perCat + (i === 0 ? remainder : 0),
        completionCriteria: `כל משימות ${cat} הושלמו`,
      })
    })

    milestones.push({ name: 'גמר + פרוטוקול מסירה', percentage: 10, completionCriteria: 'פרוטוקול מסירה חתום' })

    saveQuote({ milestones })
  }

  // אבני דרך
  const milestones = quote.milestones || []
  const totalPercentage = milestones.reduce((s, m) => s + (m.percentage || 0), 0)

  const handleMilestoneChange = (index, field, value) => {
    const newMs = milestones.map((m, i) =>
      i === index ? { ...m, [field]: field === 'percentage' ? (Number(value) || 0) : value } : m
    )
    saveQuote({ milestones: newMs })
  }

  const addMilestone = () => saveQuote({ milestones: [...milestones, { name: '', percentage: 0, completionCriteria: '' }] })
  const removeMilestone = (index) => saveQuote({ milestones: milestones.filter((_, i) => i !== index) })

  const handleApprove = () => {
    if (totalPercentage !== 100) { alert('סה"כ אחוזי אבני דרך חייב להיות 100%'); return }
    if (!confirm('לאשר הצעה וליצור פרויקט?')) return
    const project = approveQuote(quote.id)
    if (project) navigate(`/project/${project.id}`)
  }

  // === הפקת PDF ללקוח ===
  const handleExportPDF = () => {
    const categoryTotals = Object.entries(groupedItems).map(([cat, items]) => {
      const catTotal = items.reduce((s, item) => s + (item.clientPrice * item.quantity), 0)
      return { category: cat, total: catTotal }
    })

    const totalWithVat = Math.round(totals.totalSell * 1.18)
    const vatAmount = totalWithVat - totals.totalSell

    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="he"><head><meta charset="UTF-8">
<title>הצעת מחיר ${quote.number}</title>
<style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,'Heebo',sans-serif;color:#222;font-size:10px;line-height:1.3;direction:rtl;padding:8mm 12mm;width:210mm;min-height:297mm}
.hdr{border-bottom:2px solid #D4A843;padding-bottom:6px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-end}
.logo{font-size:24px;font-weight:900;color:#D4A843;font-family:Arial}
.logo span{display:block;font-size:7px;font-weight:400;color:#999;letter-spacing:2px}
.hdr-l{text-align:left;font-size:9px;color:#777}
.dn{font-size:11px;font-weight:700;color:#D4A843}
.greet{background:#faf7f0;padding:6px 10px;margin-bottom:8px;border-right:3px solid #D4A843;font-size:10px;color:#444}
.greet b{color:#D4A843}
h2{font-size:11px;color:#D4A843;margin:6px 0 3px;padding-bottom:2px;border-bottom:1px solid #ddd;font-weight:700}
table.t{width:100%;border-collapse:collapse;margin-bottom:6px}
table.t th{background:#f5f0e3;color:#8a7530;padding:3px 6px;font-size:9px;border-bottom:2px solid #D4A843;text-align:right}
table.t th.l{text-align:left}
table.t td{padding:3px 6px;border-bottom:1px solid #eee;font-size:10px}
table.t td.l{text-align:left;font-weight:600}
table.t .tot td{background:#fdf8ec;font-weight:700;color:#D4A843;border-top:2px solid #D4A843}
.sum{width:100%;border-collapse:collapse;margin:8px 0;background:#1a1a2e;color:#fff}
.sum td{padding:7px;text-align:center;font-size:8px;color:#bbb;width:33.3%}
.sum .v{display:block;font-size:14px;font-weight:700;color:#D4A843;margin-top:1px}
.sum .vb{font-size:16px}
.sum td+td{border-right:1px solid rgba(255,255,255,.15)}
.terms{background:#f7f7f7;padding:6px 10px;margin-bottom:6px;font-size:8px;color:#555}
.terms b{color:#333;font-size:9px;display:block;margin-bottom:2px}
.terms ul{padding-right:12px;margin:0}
.terms li{margin-bottom:0}
.sigs{margin-top:10px;padding-top:6px;border-top:1px solid #ddd;display:flex;justify-content:space-between}
.sig{width:42%;text-align:center}
.sig .line{border-bottom:1px solid #bbb;height:22px;margin-bottom:2px}
.sig .name{font-size:8px;color:#888}
.ft{text-align:center;color:#ccc;font-size:7px;margin-top:6px;padding-top:4px;border-top:1px solid #eee}
@media print{body{padding:8mm 12mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>

<div class="hdr">
  <div><div class="logo">GX<span>GOLDEN X PROJECTS</span></div></div>
  <div class="hdr-l"><div class="dn">הצעת מחיר ${quote.number}</div>${formatDate(quote.date)}<br>תוקף: 30 יום</div>
</div>

<div class="greet">שלום רב <b>${quote.clientName}</b>,<br>בהמשך לשיחתנו, מצורפת הצעתנו עבור <b>${quote.address}</b>. להלן פירוט העבודות והתנאים:</div>

<h2>פירוט עבודות</h2>
<table class="t">
<tr><th>תחום</th><th class="l" style="width:100px">סכום</th></tr>
${categoryTotals.map(c => `<tr><td>${c.category}</td><td class="l">${c.total.toLocaleString()} ₪</td></tr>`).join('')}
<tr class="tot"><td>סה"כ</td><td class="l">${totals.totalSell.toLocaleString()} ₪</td></tr>
</table>

<h2>תנאי תשלום</h2>
<table class="t">
<tr><th style="width:24px">#</th><th>שלב</th><th style="width:40px">אחוז</th><th class="l" style="width:90px">סכום</th></tr>
${milestones.map((ms, i) => `<tr><td>${i + 1}</td><td>${ms.name}</td><td>${ms.percentage}%</td><td class="l">${Math.round(totals.totalSell * ms.percentage / 100).toLocaleString()} ₪</td></tr>`).join('')}
<tr class="tot"><td colspan="2">סה"כ</td><td>100%</td><td class="l">${totals.totalSell.toLocaleString()} ₪</td></tr>
</table>

<table class="sum"><tr>
<td>לפני מע"מ<span class="v">${totals.totalSell.toLocaleString()} ₪</span></td>
<td>מע"מ 18%<span class="v">${vatAmount.toLocaleString()} ₪</span></td>
<td>סה"כ לתשלום<span class="v vb">${totalWithVat.toLocaleString()} ₪</span></td>
</tr></table>

<div class="terms">
<b>תנאים והערות</b>
<ul>
<li>הצעה זו בתוקף ל-30 יום מתאריך ההנפקה</li>
<li>המחירים אינם כוללים מע"מ אלא אם צוין אחרת</li>
<li>לוח זמנים משוער ייקבע עם חתימת ההסכם ויותאם לתנאי השטח</li>
<li>שינויים ותוספות יתומחרו בנפרד ויאושרו מראש</li>
<li>ההצעה אינה כוללת: אגרות והיטלים, עבודות לא מפורטות לעיל, ריהוט ומוצרי חשמל</li>
<li>תשלומים בהתאם לאבני הדרך לעיל, בתוך 7 ימי עבודה מהשלמת כל שלב</li>
<li>אחריות: 12 חודשים על כלל העבודות מיום המסירה, בכפוף לשימוש סביר</li>
</ul>
</div>

<div class="sigs">
<div class="sig"><div class="line"></div><div class="name">Golden X Projects</div></div>
<div class="sig"><div class="line"></div><div class="name">${quote.clientName}</div></div>
</div>

<div class="ft">Golden X Projects | ${quote.number} | ${formatDate(quote.date)}</div>

</body></html>`

    // יצירת iframe מוסתר לרינדור ואז הורדה כ-PDF
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;left:0;top:0;width:210mm;height:297mm;opacity:0;pointer-events:none;z-index:-1'
    document.body.appendChild(iframe)

    iframe.contentDocument.open()
    iframe.contentDocument.write(htmlContent)
    iframe.contentDocument.close()

    // נותנים לתוכן להיטען ואז מצלמים עם html2pdf
    setTimeout(() => {
      html2pdf().set({
        margin: 0,
        filename: `הצעת_מחיר_${quote.number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      }).from(iframe.contentDocument.body).save().then(() => {
        document.body.removeChild(iframe)
      })
    }, 300)
  }

  return (
    <div className="animate-in">
      {/* כותרת */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{quote.number}</h1>
            <span className={`badge ${getStatusBadgeClass(quote.status)}`}>{getStatusLabel(quote.status)}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {quote.clientName} • {quote.address} • {formatDate(quote.date)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            <FileDown size={16} />הפק PDF ללקוח
          </button>
          <button className="btn btn-secondary" onClick={() => alert('נשמר!')}>
            <Save size={16} />שמור
          </button>
          {quote.status !== 'approved' && (
            <button className="btn btn-primary" onClick={handleApprove}>
              <CheckCircle size={16} />אשר הצעה → צור פרויקט
            </button>
          )}
        </div>
      </div>

      {/* סרגל סיכום - סדר: מכירה, עלות, רווח */}
      <div className="card" style={{
        position: 'sticky', top: '0', zIndex: 10,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px',
        marginBottom: '24px', background: 'var(--dark-card)', border: '1px solid var(--gold-border)',
      }}>
        {[
          { label: 'מכירה כוללת', value: formatCurrency(totals.totalSell), color: 'var(--gold)' },
          { label: 'עלות כוללת', value: formatCurrency(totals.totalCost), color: 'var(--danger)' },
          { label: 'רווח', value: formatCurrency(totals.profit), color: 'var(--success)' },
          { label: 'אחוז רווח', value: `${totals.profitMargin}%`, color: totals.profitMargin >= 25 ? 'var(--success)' : totals.profitMargin >= 15 ? 'var(--warning)' : 'var(--danger)' },
          { label: 'פריטים', value: (quote.items || []).length, color: 'var(--text-primary)' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* הוספת פריט */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold)', marginBottom: '12px' }}>
          <Plus size={16} style={{ verticalAlign: 'middle' }} /> הוספת פריט
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, flex: '1 1 200px' }}>
            <label style={{ fontSize: '12px' }}>קטגוריה</label>
            <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedItemId('') }}>
              <option value="">— בחר קטגוריה —</option>
              {categories.map(c => <option key={c} value={c}>{categoryIcons[c] || '📦'} {c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: '1 1 250px' }}>
            <label style={{ fontSize: '12px' }}>פריט</label>
            <select value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} disabled={!selectedCategory}>
              <option value="">— בחר פריט —</option>
              {categoryItems.map(ci => (
                <option key={ci.id} value={ci.id}>{ci.name} ({ci.unit}) - {formatCurrency(ci.costPrice)}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAddItem} disabled={!selectedItemId} style={{ height: '40px' }}>
            <Plus size={16} />הוסף
          </button>
        </div>
      </div>

      {/* טבלת פריטים - מיושרת */}
      <div className="card" style={{ marginBottom: '24px', padding: 0 }}>
        <div style={{ padding: '20px 20px 0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold)', marginBottom: '16px' }}>
            פריטים בהצעה ({(quote.items || []).length})
          </h3>
        </div>

        {Object.keys(groupedItems).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            אין פריטים. הוסף פריטים מהמחירון למעלה.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>שם</th>
                  <th>סוג</th>
                  <th>יחידה</th>
                  <th>עלות ליח׳</th>
                  <th style={{ width: '80px' }}>כמות</th>
                  <th style={{ width: '100px' }}>מחיר ללקוח</th>
                  <th>סה"כ עלות</th>
                  <th>סה"כ מכירה</th>
                  <th>רווח</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedItems).map(([cat, items]) => (
                  <>
                    <tr key={`cat-${cat}`}>
                      <td colSpan="10" style={{
                        background: 'rgba(212,168,67,0.06)', fontWeight: 600,
                        fontSize: '13px', color: 'var(--gold)', padding: '10px 16px',
                      }}>
                        {categoryIcons[cat] || '📦'} {cat}
                      </td>
                    </tr>
                    {items.map(item => (
                      <tr key={item.priceItemId}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td>
                          <span className={`badge ${getTypeBadgeClass(item.type)}`} style={{ fontSize: '11px' }}>
                            {getTypeLabel(item.type)}
                          </span>
                        </td>
                        <td>{item.unit}</td>
                        <td>{formatCurrency(item.costPrice)}</td>
                        <td>
                          <input type="number" min="0" value={item.quantity}
                            onChange={e => handleItemChange(item.priceItemId, 'quantity', e.target.value)}
                            style={{ width: '70px', textAlign: 'center', padding: '5px 8px', fontSize: '13px' }}
                          />
                        </td>
                        <td>
                          <input type="number" min="0" value={item.clientPrice}
                            onChange={e => handleItemChange(item.priceItemId, 'clientPrice', e.target.value)}
                            style={{ width: '90px', textAlign: 'center', padding: '5px 8px', fontSize: '13px' }}
                          />
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.totalCost)}</td>
                        <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatCurrency(item.totalSell)}</td>
                        <td style={{ color: item.profit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                          {formatCurrency(item.profit)}
                        </td>
                        <td>
                          <button onClick={() => handleRemoveItem(item.priceItemId)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* אבני דרך - דינמיות */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold)', margin: 0 }}>
            אבני דרך לגבייה
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: totalPercentage === 100 ? 'var(--success)' : 'var(--danger)',
            }}>
              סה"כ: {totalPercentage}% {totalPercentage !== 100 && '(חייב 100%)'}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={() => autoUpdateMilestones(quote.items || [])}>
              חישוב אוטומטי
            </button>
            <button className="btn btn-secondary btn-sm" onClick={addMilestone}>
              <Plus size={14} />הוסף
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>#</th><th>שם</th><th>תנאי סיום</th><th style={{ width: '80px' }}>אחוז</th><th>סכום</th><th style={{ width: '40px' }}></th></tr>
            </thead>
            <tbody>
              {milestones.map((ms, i) => {
                const amount = Math.round(totals.totalSell * (ms.percentage || 0) / 100)
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <input value={ms.name} onChange={e => handleMilestoneChange(i, 'name', e.target.value)}
                        style={{ width: '100%', minWidth: '150px', padding: '5px 8px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input value={ms.completionCriteria || ''} onChange={e => handleMilestoneChange(i, 'completionCriteria', e.target.value)}
                        placeholder="מה מגדיר סיום..."
                        style={{ width: '100%', minWidth: '150px', padding: '5px 8px', fontSize: '12px', color: 'var(--text-muted)' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input type="number" min="0" max="100" value={ms.percentage}
                          onChange={e => handleMilestoneChange(i, 'percentage', e.target.value)}
                          style={{ width: '55px', textAlign: 'center', padding: '5px', fontSize: '13px' }}
                        />
                        <span style={{ fontSize: '12px' }}>%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gold)', whiteSpace: 'nowrap' }}>{formatCurrency(amount)}</td>
                    <td>
                      <button onClick={() => removeMilestone(i)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
