// Golden X Projects - מודל נתונים
// הפלו: מחירון → הצעת מחיר → פרויקט (אוטומטי)

// ===== מחירון מאסטר =====
// כל פריט: קטגוריה, תיאור, יחידה, סוג (חומר/עבודה), מחיר עלות
export const masterPriceList = [
  // עבודות שלד
  { id: 101, category: 'עבודות שלד', name: 'בטון', unit: 'מ"ק', type: 'material', costPrice: 450 },
  { id: 102, category: 'עבודות שלד', name: 'ברזל זיון', unit: 'טון', type: 'material', costPrice: 3200 },
  { id: 103, category: 'עבודות שלד', name: 'תבניות/קופסנות', unit: 'מ"ר', type: 'material', costPrice: 70 },
  { id: 104, category: 'עבודות שלד', name: 'בלוקים', unit: 'יח׳', type: 'material', costPrice: 5 },
  { id: 105, category: 'עבודות שלד', name: 'עבודת שלד', unit: 'יום', type: 'labor', costPrice: 3500 },
  { id: 106, category: 'עבודות שלד', name: 'קבלן שלד (פאושלי)', unit: 'פאושלי', type: 'subcontractor', costPrice: 350000 },

  // חשמל
  { id: 201, category: 'חשמל', name: 'נקודות חשמל', unit: 'נק׳', type: 'material', costPrice: 80 },
  { id: 202, category: 'חשמל', name: 'לוח חשמל ראשי', unit: 'יח׳', type: 'material', costPrice: 3500 },
  { id: 203, category: 'חשמל', name: 'גופי תאורה', unit: 'נק׳', type: 'material', costPrice: 120 },
  { id: 204, category: 'חשמל', name: 'מערכת חכמה', unit: 'פאושלי', type: 'material', costPrice: 5000 },
  { id: 205, category: 'חשמל', name: 'עבודת חשמלאי', unit: 'יום', type: 'labor', costPrice: 1800 },
  { id: 206, category: 'חשמל', name: 'קבלן חשמל (פאושלי)', unit: 'פאושלי', type: 'subcontractor', costPrice: 65000 },

  // אינסטלציה
  { id: 301, category: 'אינסטלציה', name: 'צנרת מים', unit: 'מ"א', type: 'material', costPrice: 35 },
  { id: 302, category: 'אינסטלציה', name: 'צנרת ביוב', unit: 'מ"א', type: 'material', costPrice: 45 },
  { id: 303, category: 'אינסטלציה', name: 'כלים סניטריים', unit: 'יח׳', type: 'material', costPrice: 900 },
  { id: 304, category: 'אינסטלציה', name: 'דוד שמש/חימום', unit: 'יח׳', type: 'material', costPrice: 5000 },
  { id: 305, category: 'אינסטלציה', name: 'עבודת אינסטלטור', unit: 'יום', type: 'labor', costPrice: 1600 },
  { id: 306, category: 'אינסטלציה', name: 'קבלן אינסטלציה (פאושלי)', unit: 'פאושלי', type: 'subcontractor', costPrice: 55000 },

  // אלומיניום
  { id: 401, category: 'אלומיניום', name: 'חלונות', unit: 'מ"ר', type: 'material', costPrice: 850 },
  { id: 402, category: 'אלומיניום', name: 'דלתות אלומיניום', unit: 'יח׳', type: 'material', costPrice: 3000 },
  { id: 403, category: 'אלומיניום', name: 'מעקות', unit: 'מ"א', type: 'material', costPrice: 500 },
  { id: 404, category: 'אלומיניום', name: 'התקנת אלומיניום', unit: 'יום', type: 'labor', costPrice: 1500 },
  { id: 405, category: 'אלומיניום', name: 'קבלן אלומיניום (פאושלי)', unit: 'פאושלי', type: 'subcontractor', costPrice: 80000 },

  // ריצוף וחיפוי
  { id: 501, category: 'ריצוף וחיפוי', name: 'אריחי ריצוף פנים', unit: 'מ"ר', type: 'material', costPrice: 80 },
  { id: 502, category: 'ריצוף וחיפוי', name: 'אריחי חיפוי', unit: 'מ"ר', type: 'material', costPrice: 90 },
  { id: 503, category: 'ריצוף וחיפוי', name: 'אריחי ריצוף חוץ', unit: 'מ"ר', type: 'material', costPrice: 70 },
  { id: 504, category: 'ריצוף וחיפוי', name: 'עבודת ריצוף', unit: 'מ"ר', type: 'labor', costPrice: 80 },

  // צבע וגבס
  { id: 601, category: 'צבע וגבס', name: 'לוחות גבס', unit: 'מ"ר', type: 'material', costPrice: 40 },
  { id: 602, category: 'צבע וגבס', name: 'חומרי צביעה', unit: 'מ"ר', type: 'material', costPrice: 10 },
  { id: 603, category: 'צבע וגבס', name: 'עבודת גבסן', unit: 'מ"ר', type: 'labor', costPrice: 50 },
  { id: 604, category: 'צבע וגבס', name: 'עבודת צבע', unit: 'מ"ר', type: 'labor', costPrice: 18 },

  // איטום
  { id: 701, category: 'איטום', name: 'חומרי איטום גג', unit: 'מ"ר', type: 'material', costPrice: 40 },
  { id: 702, category: 'איטום', name: 'חומרי איטום מרתף', unit: 'מ"ר', type: 'material', costPrice: 55 },
  { id: 703, category: 'איטום', name: 'חומרי איטום מקלחות', unit: 'יח׳', type: 'material', costPrice: 1200 },
  { id: 704, category: 'איטום', name: 'עבודת איטום', unit: 'מ"ר', type: 'labor', costPrice: 35 },

  // נגרות
  { id: 801, category: 'נגרות', name: 'דלתות פנים', unit: 'יח׳', type: 'material', costPrice: 1200 },
  { id: 802, category: 'נגרות', name: 'ארונות מטבח', unit: 'מ"א', type: 'material', costPrice: 2000 },
  { id: 803, category: 'נגרות', name: 'ארונות אמבטיה', unit: 'יח׳', type: 'material', costPrice: 2500 },
  { id: 804, category: 'נגרות', name: 'התקנת נגרות', unit: 'יום', type: 'labor', costPrice: 1200 },

  // מיזוג אוויר
  { id: 901, category: 'מיזוג אוויר', name: 'יחידות פנימיות', unit: 'יח׳', type: 'material', costPrice: 1400 },
  { id: 902, category: 'מיזוג אוויר', name: 'יחידה חיצונית', unit: 'יח׳', type: 'material', costPrice: 4000 },
  { id: 903, category: 'מיזוג אוויר', name: 'צנרת נחושת', unit: 'מ"א', type: 'material', costPrice: 35 },
  { id: 904, category: 'מיזוג אוויר', name: 'התקנת מיזוג', unit: 'יום', type: 'labor', costPrice: 1400 },

  // פיתוח חוץ
  { id: 1001, category: 'פיתוח חוץ', name: 'חומרי גינון', unit: 'מ"ר', type: 'material', costPrice: 30 },
  { id: 1002, category: 'פיתוח חוץ', name: 'חומרי חניה', unit: 'מ"ר', type: 'material', costPrice: 150 },
  { id: 1003, category: 'פיתוח חוץ', name: 'גדרות', unit: 'מ"א', type: 'material', costPrice: 200 },
  { id: 1004, category: 'פיתוח חוץ', name: 'שער חשמלי', unit: 'יח׳', type: 'material', costPrice: 5000 },
  { id: 1005, category: 'פיתוח חוץ', name: 'עבודת פיתוח', unit: 'יום', type: 'labor', costPrice: 2500 },

  // פח
  { id: 1101, category: 'עבודות פח', name: 'מרזבים', unit: 'מ"א', type: 'material', costPrice: 70 },
  { id: 1102, category: 'עבודות פח', name: 'שוליים', unit: 'מ"א', type: 'material', costPrice: 45 },
  { id: 1103, category: 'עבודות פח', name: 'עבודת פחח', unit: 'יום', type: 'labor', costPrice: 1200 },

  // מעלית
  { id: 1201, category: 'מעלית', name: 'מעלית פרטית (אספקה)', unit: 'יח׳', type: 'material', costPrice: 45000 },
  { id: 1202, category: 'מעלית', name: 'התקנת מעלית', unit: 'פאושלי', type: 'labor', costPrice: 17000 },
]

// אייקון לכל קטגוריה
export const categoryIcons = {
  'עבודות שלד': '🏗️', 'חשמל': '⚡', 'אינסטלציה': '🔧', 'אלומיניום': '🪟',
  'ריצוף וחיפוי': '🧱', 'צבע וגבס': '🎨', 'איטום': '💧', 'נגרות': '🚪',
  'מיזוג אוויר': '❄️', 'פיתוח חוץ': '🌿', 'עבודות פח': '🔩', 'מעלית': '🛗',
}

// רשימת קטגוריות ייחודיות
export function getCategories() {
  return [...new Set(masterPriceList.map(i => i.category))]
}

// אבני דרך ברירת מחדל (אחוזים מתוך סה"כ מכירה)
export const defaultMilestones = [
  { name: 'מקדמה', percentage: 30 },
  { name: 'סיום שלד', percentage: 15 },
  { name: 'סיום אינסטלציה + חשמל', percentage: 15 },
  { name: 'סיום ריצוף', percentage: 10 },
  { name: 'סיום גבס + צבע', percentage: 10 },
  { name: 'סיום אלומיניום + נגרות', percentage: 10 },
  { name: 'גמר + פרוטוקול מסירה', percentage: 10 },
]

// ===== נתוני דמו =====

// הצעת מחיר דמו - הרצליה
export const demoQuotes = [
  {
    id: 1,
    number: 'Q-2026-001',
    clientName: 'משפחת כהן',
    clientPhone: '054-1234567',
    address: 'הרצליה פיתוח, רח׳ האלון 24',
    date: '2026-01-10',
    status: 'approved', // draft, sent, approved, rejected
    items: [
      // שלד
      { priceItemId: 101, quantity: 120, clientPrice: 850 },
      { priceItemId: 102, quantity: 8, clientPrice: 5200 },
      { priceItemId: 103, quantity: 300, clientPrice: 180 },
      { priceItemId: 104, quantity: 2000, clientPrice: 12 },
      { priceItemId: 105, quantity: 45, clientPrice: 4800 },
      // קבלן שלד
      { priceItemId: 106, quantity: 1, clientPrice: 450000 },
      // חשמל
      { priceItemId: 201, quantity: 80, clientPrice: 280 },
      { priceItemId: 202, quantity: 1, clientPrice: 8500 },
      { priceItemId: 203, quantity: 40, clientPrice: 350 },
      { priceItemId: 205, quantity: 20, clientPrice: 2800 },
      // קבלן חשמל
      { priceItemId: 206, quantity: 1, clientPrice: 85000 },
      // אינסטלציה
      { priceItemId: 301, quantity: 150, clientPrice: 95 },
      { priceItemId: 302, quantity: 80, clientPrice: 120 },
      { priceItemId: 303, quantity: 12, clientPrice: 2200 },
      { priceItemId: 304, quantity: 1, clientPrice: 12000 },
      { priceItemId: 305, quantity: 15, clientPrice: 2500 },
      // קבלן אינסטלציה
      { priceItemId: 306, quantity: 1, clientPrice: 72000 },
      // אלומיניום
      { priceItemId: 401, quantity: 45, clientPrice: 1800 },
      { priceItemId: 402, quantity: 4, clientPrice: 6500 },
      { priceItemId: 403, quantity: 20, clientPrice: 1200 },
      // ריצוף
      { priceItemId: 501, quantity: 180, clientPrice: 160 },
      { priceItemId: 502, quantity: 60, clientPrice: 170 },
      { priceItemId: 504, quantity: 240, clientPrice: 120 },
      // צבע וגבס
      { priceItemId: 601, quantity: 160, clientPrice: 75 },
      { priceItemId: 602, quantity: 450, clientPrice: 18 },
      { priceItemId: 603, quantity: 160, clientPrice: 65 },
      { priceItemId: 604, quantity: 450, clientPrice: 27 },
      // איטום
      { priceItemId: 701, quantity: 180, clientPrice: 70 },
      { priceItemId: 703, quantity: 4, clientPrice: 2000 },
      { priceItemId: 704, quantity: 180, clientPrice: 55 },
      // נגרות
      { priceItemId: 801, quantity: 10, clientPrice: 2800 },
      { priceItemId: 802, quantity: 6, clientPrice: 4500 },
      { priceItemId: 804, quantity: 8, clientPrice: 1800 },
      // מיזוג
      { priceItemId: 901, quantity: 6, clientPrice: 3200 },
      { priceItemId: 902, quantity: 2, clientPrice: 8500 },
      { priceItemId: 904, quantity: 5, clientPrice: 2200 },
      // פיתוח
      { priceItemId: 1001, quantity: 200, clientPrice: 55 },
      { priceItemId: 1002, quantity: 40, clientPrice: 250 },
      { priceItemId: 1005, quantity: 10, clientPrice: 3500 },
    ],
    milestones: [
      { name: 'מקדמה', percentage: 30 },
      { name: 'סיום שלד', percentage: 20 },
      { name: 'סיום אינסטלציה + חשמל', percentage: 15 },
      { name: 'סיום ריצוף + איטום', percentage: 10 },
      { name: 'סיום גבס + צבע + נגרות', percentage: 15 },
      { name: 'גמר + מסירה', percentage: 10 },
    ],
  },
]

// פרויקט דמו - נוצר מהצעה 1
export const demoProjects = [
  {
    id: 1,
    quoteId: 1,
    name: 'פרויקט הרצליה - וילה פרטית',
    clientName: 'משפחת כהן',
    address: 'הרצליה פיתוח, רח׳ האלון 24',
    status: 'active',
    startDate: '2026-01-15',
    expectedEnd: '2026-06-30',
    laborCostPerWorker: 600,
  },
]

// אבני דרך דמו (נוצרו אוטומטית מההצעה)
export const demoMilestones = [
  { id: 1, projectId: 1, name: 'מקדמה', percentage: 30, amount: 0, status: 'paid', billingStatus: 'שולם', paidAmount: 0, paidDate: '2026-01-20' },
  { id: 2, projectId: 1, name: 'סיום שלד', percentage: 20, amount: 0, status: 'in_progress', billingStatus: 'גבייה עתידית', paidAmount: 0, paidDate: null },
  { id: 3, projectId: 1, name: 'סיום אינסטלציה + חשמל', percentage: 15, amount: 0, status: 'pending', billingStatus: 'גבייה עתידית', paidAmount: 0, paidDate: null },
  { id: 4, projectId: 1, name: 'סיום ריצוף + איטום', percentage: 10, amount: 0, status: 'pending', billingStatus: 'גבייה עתידית', paidAmount: 0, paidDate: null },
  { id: 5, projectId: 1, name: 'סיום גבס + צבע + נגרות', percentage: 15, amount: 0, status: 'pending', billingStatus: 'גבייה עתידית', paidAmount: 0, paidDate: null },
  { id: 6, projectId: 1, name: 'גמר + מסירה', percentage: 10, amount: 0, status: 'pending', billingStatus: 'גבייה עתידית', paidAmount: 0, paidDate: null },
]

// משימות פרויקט דמו (נוצרו אוטומטית - כל פריט מהצעה = משימה)
// status: 'pending' | 'in_progress' | 'done'
export const demoProjectTasks = (() => {
  // יצירה אוטומטית מכל פריטי ההצעה
  let id = 1
  return demoQuotes[0].items.map(qi => {
    const pi = masterPriceList.find(p => p.id === qi.priceItemId)
    if (!pi) return null
    return {
      id: id++, projectId: 1, priceItemId: qi.priceItemId,
      name: pi.name, category: pi.category, type: pi.type, unit: pi.unit,
      budgetQty: qi.quantity, budgetCost: pi.costPrice, clientPrice: qi.clientPrice,
      status: pi.category === 'עבודות שלד' ? 'in_progress' : 'pending',
    }
  }).filter(Boolean)
})()

// רכישות דמו (נוצרו אוטומטית מפריטי חומר בהצעה)
export const demoPurchases = (() => {
  let id = 1
  const materialItems = demoQuotes[0].items.filter(qi => {
    const pi = masterPriceList.find(p => p.id === qi.priceItemId)
    return pi && pi.type === 'material'
  })

  // כמה הזמנות דמו לפריטים ראשונים
  const demoOrders = {
    101: [{ id: 901, date: '2026-02-20', supplier: 'רדימיקס', quantity: 45, unitCost: 460, total: 20700, status: 'delivered' }],
    102: [{ id: 902, date: '2026-02-18', supplier: 'פלדות ישראל', quantity: 3, unitCost: 3300, total: 9900, status: 'delivered' }],
    202: [{ id: 903, date: '2026-03-10', supplier: 'חשמל הצפון', quantity: 1, unitCost: 3500, total: 3500, status: 'delivered' }],
    // תשלומים לקבלני משנה
    106: [
      { id: 910, date: '2026-02-01', supplier: 'אבי מלכה - קבלן שלד', quantity: 1, unitCost: 140000, total: 140000, status: 'delivered' },
      { id: 911, date: '2026-03-15', supplier: 'אבי מלכה - קבלן שלד', quantity: 1, unitCost: 90000, total: 90000, status: 'delivered' },
    ],
    206: [
      { id: 912, date: '2026-03-01', supplier: 'חשמל פלוס בע"מ', quantity: 1, unitCost: 34000, total: 34000, status: 'delivered' },
    ],
    306: [
      { id: 913, date: '2026-03-10', supplier: 'יוסי אינסטלציה', quantity: 1, unitCost: 25000, total: 25000, status: 'delivered' },
    ],
  }

  return materialItems.map(qi => {
    const pi = masterPriceList.find(p => p.id === qi.priceItemId)
    const task = demoProjectTasks.find(t => t.priceItemId === qi.priceItemId)
    const orders = demoOrders[qi.priceItemId] || []
    const orderedQty = orders.reduce((s, o) => s + o.quantity, 0)
    const actualTotal = orders.reduce((s, o) => s + o.total, 0)

    return {
      id: id++, projectId: 1, taskId: task?.id || id,
      name: pi.name, category: pi.category,
      supplier: orders[0]?.supplier || '',
      budgetQty: qi.quantity, budgetUnitCost: pi.costPrice, budgetTotal: pi.costPrice * qi.quantity,
      orderedQty, actualUnitCost: orderedQty > 0 ? Math.round(actualTotal / orderedQty) : 0,
      actualTotal,
      orderStatus: orders.length > 0 ? (orders.every(o => o.status === 'delivered') ? 'delivered' : 'ordered') : 'not_ordered',
      orders,
      date: orders[0]?.date || null,
    }
  })
})()

// יומני עבודה דמו
export const demoWorkLogs = [
  { id: 1, projectId: 1, date: '2026-04-13', managerName: 'מוחמד חסן', workersCount: 8, categories: ['עבודות שלד', 'אינסטלציה'], description: 'יציקת תקרה קומה א\' + התחלת צנרת ביוב', issues: 'עיכוב באספקת ברזל', photos: 3, signature: true, laborCost: 4800 },
  { id: 2, projectId: 1, date: '2026-04-12', managerName: 'מוחמד חסן', workersCount: 6, categories: ['עבודות שלד'], description: 'הכנות ליציקה - הרכבת תבניות וברזל', issues: '', photos: 5, signature: true, laborCost: 3600 },
  { id: 3, projectId: 1, date: '2026-04-10', managerName: 'מוחמד חסן', workersCount: 10, categories: ['עבודות שלד', 'חשמל'], description: 'סיום קירות קומת קרקע + הנחת תשתיות חשמל', issues: 'המפקח ביקש שינוי במיקום לוח החשמל', photos: 8, signature: true, laborCost: 6000 },
]

// קבלני משנה דמו
export const demoSubcontractors = [
  { id: 1, name: 'אבי מלכה', phone: '050-1234567', specialty: 'עבודות שלד', projectId: 1, contractAmount: 450000, paid: 180000, pending: 90000, hasContract: true },
  { id: 2, name: 'חשמל פלוס בע"מ', phone: '052-9876543', specialty: 'חשמל', projectId: 1, contractAmount: 85000, paid: 34000, pending: 17000, hasContract: true },
  { id: 3, name: 'יוסי אינסטלציה', phone: '054-5551234', specialty: 'אינסטלציה', projectId: 1, contractAmount: 72000, paid: 36000, pending: 18000, hasContract: true },
]

// ===== פונקציות עזר =====

export function findPriceItem(id) {
  return masterPriceList.find(i => i.id === id)
}

// חישובי הצעת מחיר
export function calcQuoteTotals(quoteItems) {
  let totalCost = 0, totalSell = 0, materialCost = 0, laborCost = 0
  quoteItems.forEach(qi => {
    const pi = findPriceItem(qi.priceItemId)
    if (!pi) return
    const cost = pi.costPrice * qi.quantity
    const sell = qi.clientPrice * qi.quantity
    totalCost += cost
    totalSell += sell
    if (pi.type === 'material') materialCost += cost
    else laborCost += cost
  })
  return {
    totalCost, totalSell, materialCost, laborCost,
    profit: totalSell - totalCost,
    profitMargin: totalSell > 0 ? Math.round(((totalSell - totalCost) / totalSell) * 100) : 0,
  }
}

// פורמטים
export function formatCurrency(amount) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}
export function formatNumber(num) { return new Intl.NumberFormat('he-IL').format(num) }
export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('he-IL')
}
// תוויות סוג פריט
export function getTypeLabel(type) {
  return { material: 'חומר', labor: 'עבודה', subcontractor: 'קבלן משנה' }[type] || type
}
export function getTypeBadgeClass(type) {
  return { material: 'badge-info', labor: 'badge-warning', subcontractor: 'badge-success' }[type] || 'badge-info'
}

export function getStatusLabel(status) {
  return { active: 'פעיל', planning: 'בתכנון', completed: 'הושלם', draft: 'טיוטה', sent: 'נשלח', approved: 'מאושר', rejected: 'נדחה', pending: 'ממתין', in_progress: 'בתהליך', done: 'בוצע', delivered: 'סופק', ordered: 'הוזמן', paid: 'שולם' }[status] || status
}
export function getStatusBadgeClass(status) {
  return { active: 'badge-success', completed: 'badge-gold', draft: 'badge-info', sent: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', pending: 'badge-info', in_progress: 'badge-warning', done: 'badge-success', delivered: 'badge-success', ordered: 'badge-warning', paid: 'badge-success' }[status] || 'badge-info'
}
