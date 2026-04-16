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

    // יצירת אלמנט זמני ל-PDF
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;left:-9999px;top:0;width:210mm;direction:rtl;font-family:Arial,sans-serif;color:#222;font-size:11px;line-height:1.35;padding:10mm 12mm'

    el.innerHTML = `
<div style="border-bottom:2px solid #D4A843;padding-bottom:8px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:flex-end">
  <div><div style="font-size:28px;font-weight:900;color:#D4A843;font-family:Arial">GX<span style="display:block;font-size:8px;font-weight:400;color:#999;letter-spacing:2px">GOLDEN X PROJECTS</span></div></div>
  <div style="text-align:left;font-size:10px;color:#777"><div style="font-size:12px;font-weight:700;color:#D4A843">הצעת מחיר ${quote.number}</div>${formatDate(quote.date)}<br>תוקף: 30 יום</div>
</div>

<div style="background:#faf7f0;padding:8px 12px;margin-bottom:10px;border-right:3px solid #D4A843;font-size:11px;color:#444">שלום רב <b style="color:#D4A843">${quote.clientName}</b>,<br>בהמשך לשיחתנו, מצורפת הצעתנו עבור <b style="color:#D4A843">${quote.address}</b>. להלן פירוט העבודות והתנאים:</div>

<div style="font-size:12px;color:#D4A843;margin:8px 0 4px;padding-bottom:2px;border-bottom:1px solid #ddd;font-weight:700">פירוט עבודות</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px">
<tr><th style="background:#f5f0e3;color:#8a7530;padding:4px 8px;font-size:10px;border-bottom:2px solid #D4A843;text-align:right">תחום</th><th style="background:#f5f0e3;color:#8a7530;padding:4px 8px;font-size:10px;border-bottom:2px solid #D4A843;text-align:left;width:100px">סכום</th></tr>
${categoryTotals.map(c => `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${c.category}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:left;font-weight:600">${c.total.toLocaleString()} ₪</td></tr>`).join('')}
<tr><td style="padding:4px 8px;background:#fdf8ec;font-weight:700;color:#D4A843;border-top:2px solid #D4A843">סה"כ</td><td style="padding:4px 8px;background:#fdf8ec;font-weight:700;color:#D4A843;border-top:2px solid #D4A843;text-align:left">${totals.totalSell.toLocaleString()} ₪</td></tr>
</table>

<div style="font-size:12px;color:#D4A843;margin:8px 0 4px;padding-bottom:2px;border-bottom:1px solid #ddd;font-weight:700">תנאי תשלום</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:8px">
<tr><th style="background:#f5f0e3;color:#8a7530;padding:4px 8px;font-size:10px;border-bottom:2px solid #D4A843;text-align:right;width:24px">#</th><th style="background:#f5f0e3;color:#8a7530;padding:4px 8px;font-size:10px;border-bottom:2px solid #D4A843;text-align:right">שלב</th><th style="background:#f5f0e3;color:#8a7530;padding:4px 8px;font-size:10px;border-bottom:2px solid #D4A843;text-align:right;width:40px">אחוז</th><th style="background:#f5f0e3;color:#8a7530;padding:4px 8px;font-size:10px;border-bottom:2px solid #D4A843;text-align:left;width:90px">סכום</th></tr>
${milestones.map((ms, i) => `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${i + 1}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${ms.name}</td><td style="padding:4px 8px;border-bottom:1px solid #eee">${ms.percentage}%</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:left;font-weight:600">${Math.round(totals.totalSell * ms.percentage / 100).toLocaleString()} ₪</td></tr>`).join('')}
<tr><td colspan="2" style="padding:4px 8px;background:#fdf8ec;font-weight:700;color:#D4A843;border-top:2px solid #D4A843">סה"כ</td><td style="padding:4px 8px;background:#fdf8ec;font-weight:700;color:#D4A843;border-top:2px solid #D4A843">100%</td><td style="padding:4px 8px;background:#fdf8ec;font-weight:700;color:#D4A843;border-top:2px solid #D4A843;text-align:left">${totals.totalSell.toLocaleString()} ₪</td></tr>
</table>

<table style="width:100%;border-collapse:collapse;margin:10px 0;background:#1a1a2e;color:#fff"><tr>
<td style="padding:8px;text-align:center;font-size:9px;color:#bbb;width:33.3%">לפני מע"מ<span style="display:block;font-size:15px;font-weight:700;color:#D4A843;margin-top:2px">${totals.totalSell.toLocaleString()} ₪</span></td>
<td style="padding:8px;text-align:center;font-size:9px;color:#bbb;width:33.3%;border-right:1px solid rgba(255,255,255,.15)">מע"מ 18%<span style="display:block;font-size:15px;font-weight:700;color:#D4A843;margin-top:2px">${vatAmount.toLocaleString()} ₪</span></td>
<td style="padding:8px;text-align:center;font-size:9px;color:#bbb;width:33.3%;border-right:1px solid rgba(255,255,255,.15)">סה"כ לתשלום<span style="display:block;font-size:17px;font-weight:700;color:#D4A843;margin-top:2px">${totalWithVat.toLocaleString()} ₪</span></td>
</tr></table>

<div style="background:#f7f7f7;padding:8px 12px;margin-bottom:8px;font-size:9px;color:#555">
<b style="color:#333;font-size:10px;display:block;margin-bottom:2px">תנאים והערות</b>
<ul style="padding-right:14px;margin:0">
<li>הצעה זו בתוקף ל-30 יום מתאריך ההנפקה</li>
<li>המחירים אינם כוללים מע"מ אלא אם צוין אחרת</li>
<li>לוח זמנים משוער ייקבע עם חתימת ההסכם ויותאם לתנאי השטח</li>
<li>שינויים ותוספות יתומחרו בנפרד ויאושרו מראש</li>
<li>ההצעה אינה כוללת: אגרות והיטלים, עבודות לא מפורטות לעיל, ריהוט ומוצרי חשמל</li>
<li>תשלומים בהתאם לאבני הדרך לעיל, בתוך 7 ימי עבודה מהשלמת כל שלב</li>
<li>אחריות: 12 חודשים על כלל העבודות מיום המסירה, בכפוף לשימוש סביר</li>
</ul>
</div>

<div style="margin-top:12px;padding-top:8px;border-top:1px solid #ddd;display:flex;justify-content:space-between">
<div style="width:42%;text-align:center"><div style="border-bottom:1px solid #bbb;height:26px;margin-bottom:3px"></div><div style="font-size:9px;color:#888">Golden X Projects</div></div>
<div style="width:42%;text-align:center"><div style="border-bottom:1px solid #bbb;height:26px;margin-bottom:3px"></div><div style="font-size:9px;color:#888">${quote.clientName}</div></div>
</div>

<div style="text-align:center;color:#ccc;font-size:8px;margin-top:8px;padding-top:4px;border-top:1px solid #eee">Golden X Projects | ${quote.number} | ${formatDate(quote.date)}</div>
`

    document.body.appendChild(el)

    html2pdf().set({
      margin: 0,
      filename: `הצעת_מחיר_${quote.number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    }).from(el).save().then(() => {
      document.body.removeChild(el)
    })
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
