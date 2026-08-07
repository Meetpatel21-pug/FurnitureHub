import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { adminAPI, productsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ─── Inline Styles ─────────────────────────────────────────────────────────────
const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#000000',
    paddingTop: '70px',
    fontFamily: 'var(--font-sans, Inter, sans-serif)',
  },
  sidebar: {
    width: '240px',
    minWidth: '240px',
    background: '#0a0a0a',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 0',
    position: 'sticky',
    top: '70px',
    height: 'calc(100vh - 70px)',
    overflowY: 'auto',
  },
  sidebarBrand: {
    padding: '0 24px 28px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '16px',
  },
  sidebarLabel: {
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.28)',
    padding: '12px 24px 8px',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 24px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? '#ffffff' : 'rgba(255,255,255,0.52)',
    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
    borderLeft: active ? '2px solid #ffffff' : '2px solid transparent',
    transition: 'all 0.18s ease',
    userSelect: 'none',
  }),
  content: {
    flex: 1,
    padding: '44px 48px',
    overflowX: 'auto',
  },
  sectionHead: {
    marginBottom: '36px',
  },
  sectionTag: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    display: 'block',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-serif, Georgia, serif)',
    fontSize: '2rem',
    fontWeight: 400,
    color: '#ffffff',
    margin: 0,
  },
  card: {
    background: '#121212',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px',
    padding: '28px',
  },
  kpiCard: {
    background: '#121212',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px',
    padding: '24px',
    flex: '1 1 0',
    minWidth: '160px',
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1,
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  kpiLabel: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  kpiSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    marginTop: '10px',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.38)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.82)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    verticalAlign: 'middle',
  },
  btnPrimary: {
    background: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnDanger: {
    background: 'transparent',
    color: '#f87171',
    border: '1px solid rgba(248,113,113,0.35)',
    borderRadius: '7px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnSecondary: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.65)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '7px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  input: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.14)',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.14)',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: 'pointer',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '7px',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modal: {
    background: '#121212',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '36px',
    width: '100%',
    maxWidth: '580px',
    maxHeight: '88vh',
    overflowY: 'auto',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
    background: color + '20',
    color: color,
    border: `1px solid ${color}40`,
    textTransform: 'capitalize',
  }),
};

const statusColor = {
  pending:   '#facc15',
  confirmed: '#60a5fa',
  shipped:   '#a78bfa',
  delivered: '#4ade80',
  cancelled: '#f87171',
  completed: '#4ade80',
  failed:    '#f87171',
};

const fmt = (n) =>
  typeof n === 'number' && !isNaN(n)
    ? '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '—';

// ─── Shared Chart Defaults ─────────────────────────────────────────────────────
const chartBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: 'rgba(255,255,255,0.55)', font: { size: 11 }, boxWidth: 10 },
    },
    tooltip: {
      backgroundColor: '#1e1e1e',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.65)',
    },
  },
  scales: {
    x: {
      ticks: { color: 'rgba(255,255,255,0.38)', font: { size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
    y: {
      ticks: { color: 'rgba(255,255,255,0.38)', font: { size: 10 } },
      grid:  { color: 'rgba(255,255,255,0.05)' },
    },
  },
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.4rem', fontWeight: 400, color: '#fff', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={{ ...S.modal, maxWidth: '380px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px' }}><i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', color: '#f87171' }}></i></div>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.65 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onCancel} style={S.btnSecondary}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{ ...S.btnDanger, background: '#f87171', color: '#000', fontWeight: 700, border: 'none' }}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ products, orders, users }) {
  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const pending    = orders.filter(o => o.status === 'pending').length;
  const delivered  = orders.filter(o => o.status === 'delivered').length;
  const cancelled  = orders.filter(o => o.status === 'cancelled').length;

  const kpis = [
    { label: 'Total Revenue',  value: fmt(totalRevenue), icon: <i className="fas fa-rupee-sign" style={{ color: '#fff', fontSize: '1.4rem' }}></i>, sub: `Avg ${fmt(orders.length ? totalRevenue / orders.length : 0)} / order` },
    { label: 'Total Orders',   value: orders.length,     icon: <i className="fas fa-box" style={{ color: '#fff', fontSize: '1.4rem' }}></i>, sub: `${pending} pending · ${delivered} delivered` },
    { label: 'Products',       value: products.length,   icon: <i className="fas fa-couch" style={{ color: '#fff', fontSize: '1.4rem' }}></i>, sub: `${products.filter(p => (p.stock || 0) <= 5).length} low stock` },
    { label: 'Users',          value: users.length,      icon: <i className="fas fa-users" style={{ color: '#fff', fontSize: '1.4rem' }}></i>, sub: `${users.filter(u => u.is_banned).length} banned` },
  ];

  const recentOrders = [...orders].slice(0, 6);

  return (
    <div>
      <div style={S.sectionHead}>
        <span style={S.sectionTag}>FurnitureHub Admin</span>
        <h2 style={S.sectionTitle}>Overview</h2>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={S.kpiCard}>
            <div style={{ fontSize: '1.5rem', marginBottom: '14px' }}>{k.icon}</div>
            <div style={S.kpiValue}>{k.value}</div>
            <div style={S.kpiLabel}>{k.label}</div>
            <div style={S.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-column stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={S.card}>
          <h5 style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px', margin: '0 0 20px 0' }}>
            Order Status Breakdown
          </h5>
          {['pending','confirmed','shipped','delivered','cancelled'].map(status => {
            const count = orders.filter(o => o.status === status).length;
            const pct   = orders.length ? Math.round((count / orders.length) * 100) : 0;
            return (
              <div key={status} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{status}</span>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{count}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '4px', height: '4px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: statusColor[status] || '#fff', borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={S.card}>
          <h5 style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
            Quick Stats
          </h5>
          {[
            { label: 'Confirmed Orders',   value: orders.filter(o => o.status === 'confirmed').length },
            { label: 'Shipped Orders',     value: orders.filter(o => o.status === 'shipped').length },
            { label: 'Cancelled Orders',   value: cancelled },
            { label: 'Out of Stock',       value: products.filter(p => (p.stock || 0) === 0).length },
            { label: 'Unavailable Items',  value: products.filter(p => !p.available).length },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={S.card}>
        <h5 style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px 0' }}>
          Recent Orders
        </h5>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Order ID','Customer','Amount','Status','Payment','Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recentOrders.length === 0
                ? <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: '36px' }}>No orders yet</td></tr>
                : recentOrders.map(o => (
                    <tr key={o.id}>
                      <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>#{(o.order_id || o.id + '').slice(-10)}</span></td>
                      <td style={{ ...S.td, fontWeight: 500 }}>{o.user?.username || o.user_name || '—'}</td>
                      <td style={S.td}>{fmt(parseFloat(o.total_amount))}</td>
                      <td style={S.td}><span style={S.badge(statusColor[o.status] || '#fff')}>{o.status}</span></td>
                      <td style={S.td}><span style={S.badge(statusColor[o.payment_status] || '#facc15')}>{o.payment_status}</span></td>
                      <td style={S.td}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsTab({ orders, products }) {
  // Monthly revenue — last 6 months
  const monthlyRevenue = (() => {
    const m = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      m[d.toLocaleString('default', { month: 'short', year: '2-digit' })] = 0;
    }
    orders.forEach(o => {
      const key = new Date(o.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (m[key] !== undefined) m[key] += parseFloat(o.total_amount || 0);
    });
    return m;
  })();

  // Daily orders — last 14 days
  const dailyOrders = (() => {
    const d = {};
    for (let i = 13; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      d[dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })] = 0;
    }
    orders.forEach(o => {
      const key = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      if (d[key] !== undefined) d[key]++;
    });
    return d;
  })();

  const statusCounts = ['pending','confirmed','shipped','delivered','cancelled'].map(s => ({
    label: s,
    count: orders.filter(o => o.status === s).length,
  }));

  const barData = {
    labels: Object.keys(monthlyRevenue),
    datasets: [{
      label: 'Revenue (₹)',
      data:  Object.values(monthlyRevenue),
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderColor:     'rgba(255,255,255,0.65)',
      borderWidth: 1.5,
      borderRadius: 5,
    }],
  };

  const donutData = {
    labels: statusCounts.map(s => s.label),
    datasets: [{
      data: statusCounts.map(s => s.count),
      backgroundColor: ['#facc15','#60a5fa','#a78bfa','#4ade80','#f87171'],
      borderWidth: 0,
    }],
  };

  const lineData = {
    labels: Object.keys(dailyOrders),
    datasets: [{
      label: 'Orders',
      data:  Object.values(dailyOrders),
      borderColor: '#fff',
      backgroundColor: 'rgba(255,255,255,0.04)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointRadius: 3,
    }],
  };

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.55)', font: { size: 11 }, boxWidth: 10, padding: 14 } },
      tooltip: chartBase.plugins.tooltip,
    },
  };

  const topProducts = [...products].sort((a,b) => parseFloat(b.price||0) - parseFloat(a.price||0)).slice(0, 8);

  return (
    <div>
      <div style={S.sectionHead}>
        <span style={S.sectionTag}>FurnitureHub Admin</span>
        <h2 style={S.sectionTitle}>Analytics</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={S.card}>
          <h5 style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px 0' }}>Monthly Revenue</h5>
          <div style={{ height: '240px' }}><Bar data={barData} options={chartBase} /></div>
        </div>
        <div style={S.card}>
          <h5 style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px 0' }}>Orders by Status</h5>
          <div style={{ height: '240px' }}><Doughnut data={donutData} options={donutOpts} /></div>
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: '20px' }}>
        <h5 style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px 0' }}>Daily Orders — Last 14 Days</h5>
        <div style={{ height: '200px' }}>
          <Line data={lineData} options={{ ...chartBase, plugins: { ...chartBase.plugins, legend: { display: false } } }} />
        </div>
      </div>

      <div style={S.card}>
        <h5 style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 20px 0' }}>Top Products by Price</h5>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Rank','Product','Category','Price','Stock','Status'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ ...S.td, color: 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: '11px' }}>#{i+1}</td>
                  <td style={{ ...S.td, fontWeight: 500 }}>{p.name}</td>
                  <td style={S.td}>{p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || '—'}</td>
                  <td style={S.td}>{fmt(parseFloat(p.price))}</td>
                  <td style={S.td}>
                    <span style={{ color: (p.stock||0) <= 5 ? '#f87171' : 'inherit', fontWeight: (p.stock||0) <= 5 ? 700 : 400 }}>{p.stock ?? '—'}</span>
                  </td>
                  <td style={S.td}><span style={S.badge(p.available ? '#4ade80' : '#f87171')}>{p.available ? 'Active' : 'Hidden'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Form Field Helper (Defined outside component to prevent focus loss on typing) ───
const AdminFormField = ({ label, k, form, setForm, type = 'text', opts }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={S.label}>{label}</label>
    {type === 'select'
      ? <select style={S.select} value={form[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}>
          {(opts || []).map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      : type === 'textarea'
        ? <textarea style={{ ...S.input, minHeight: '80px', resize: 'vertical' }} value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
        : <input style={S.input} type={type} value={form[k] ?? ''} onChange={e => setForm(f => ({ ...f, [k]: type === 'number' ? e.target.value : e.target.value }))} />
    }
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function ProductsTab({ products, categories, onRefresh }) {
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || '').toLowerCase().includes(search.toLowerCase())
  );

  const defaultForm = { name:'', slug:'', description:'', price:'', stock:10, available:true, image_url:'', room_category:'', category: categories[0]?.id || '' };

  const openCreate = () => { setForm(defaultForm); setModal({ mode:'create' }); };
  const openEdit   = (p) => { setForm({ ...p, category: p.category_id || (typeof p.category === 'object' ? p.category?.id : p.category) || categories[0]?.id || '' }); setModal({ mode:'edit', product: p }); };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      let payload;
      if (form.model_file instanceof File) {
        payload = new FormData();
        Object.keys(form).forEach(k => {
          if (form[k] !== null && form[k] !== undefined && k !== 'model_file') {
            payload.append(k, typeof form[k] === 'object' ? (form[k].id || JSON.stringify(form[k])) : form[k]);
          }
        });
        payload.append('model_file', form.model_file);
        if (!form.slug) {
          payload.append('slug', form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''));
        }
      } else {
        payload = { ...form };
        if (typeof payload.model_file === 'string') {
          delete payload.model_file;
        }
        if (typeof payload.category === 'object') {
          payload.category = payload.category.id;
        }
        if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
      }

      if (modal.mode === 'create') {
        await adminAPI.createProduct(payload);
        toast.success('Product created!');
      } else {
        await adminAPI.updateProduct(modal.product.id, payload);
        toast.success('Product updated!');
      }
      setModal(null);
      onRefresh();
    } catch (e) {
      const errData = e.response?.data;
      const errMsg = errData?.error || errData?.detail || (typeof errData === 'string' ? errData : null) || 'Failed to save product';
      toast.error(errMsg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      onRefresh();
    } catch { toast.error('Failed to delete product'); }
  };

  return (
    <div>
      <div style={{ ...S.sectionHead, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <span style={S.sectionTag}>FurnitureHub Admin</span>
          <h2 style={S.sectionTitle}>Products</h2>
        </div>
        <button style={S.btnPrimary} onClick={openCreate}>+ Add Product</button>
      </div>

      <input style={{ ...S.input, maxWidth:'320px', marginBottom:'20px' }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />

      <div style={S.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['ID','Img','Name','Category','Price','Stock','3D Model','Available','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9} style={{ ...S.td, textAlign:'center', color:'rgba(255,255,255,0.25)', padding:'40px' }}>No products found</td></tr>
                : filtered.map(p => (
                    <tr key={p.id}>
                      <td style={{ ...S.td, color:'rgba(255,255,255,0.3)', fontSize:'11px' }}>{p.id}</td>
                      <td style={S.td}>
                        {(p.image_url || p.image)
                          ? <img src={p.image_url||p.image} alt={p.name} style={{ width:'44px', height:'34px', objectFit:'cover', borderRadius:'6px', background:'#1a1a1a' }} onError={e => e.target.style.display='none'} />
                          : <div style={{ width:'44px', height:'34px', background:'#1a1a1a', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>🛋️</div>
                        }
                      </td>
                      <td style={{ ...S.td, fontWeight:500, maxWidth:'180px' }}>{p.name}</td>
                      <td style={S.td}>{p.category_name || (typeof p.category === 'object' ? p.category?.name : p.category) || '—'}</td>
                      <td style={S.td}>{fmt(parseFloat(p.price))}</td>
                      <td style={S.td}><span style={{ color:(p.stock||0)<=5?'#f87171':'inherit', fontWeight:(p.stock||0)<=5?700:400 }}>{p.stock??0}</span></td>
                      <td style={S.td}><span style={S.badge(p.model_file ? '#a78bfa':'rgba(255,255,255,0.2)')}>{p.model_file ? '📦 3D .glb' : 'None'}</span></td>
                      <td style={S.td}><span style={S.badge(p.available ? '#4ade80':'#f87171')}>{p.available?'Yes':'No'}</span></td>
                      <td style={S.td}>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button style={S.btnSecondary} onClick={() => openEdit(p)}>Edit</button>
                          <button style={S.btnDanger}    onClick={() => setDeleteTarget(p)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal.mode==='create' ? 'Add New Product' : 'Edit Product'} onClose={() => setModal(null)}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <AdminFormField label="Product Name *" k="name" form={form} setForm={setForm} />
            <AdminFormField label="Slug (auto-generated)" k="slug" form={form} setForm={setForm} />
          </div>
          <AdminFormField label="Description" k="description" type="textarea" form={form} setForm={setForm} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <AdminFormField label="Price (₹) *" k="price" type="number" form={form} setForm={setForm} />
            <AdminFormField label="Stock" k="stock" type="number" form={form} setForm={setForm} />
          </div>
          {categories.length > 0 && <AdminFormField label="Category" k="category" type="select" opts={categories.map(c => ({ v: c.id, l: c.name }))} form={form} setForm={setForm} />}
          <AdminFormField label="Room Category" k="room_category" form={form} setForm={setForm} />
          <AdminFormField label="Image URL" k="image_url" form={form} setForm={setForm} />

          {/* 3D Model File Upload (.glb) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={S.label}>3D Model (.glb File)</label>
            <input
              type="file"
              accept=".glb"
              style={{ ...S.input, padding: '8px 12px' }}
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  if (!file.name.toLowerCase().endsWith('.glb')) {
                    toast.error('Please upload a valid .glb 3D model file');
                    return;
                  }
                  setForm(f => ({ ...f, model_file: file }));
                }
              }}
            />
            {form.model_file && typeof form.model_file === 'string' && (
              <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '5px' }}>
                Current 3D Model: {form.model_file}
              </div>
            )}
            {form.model_file && form.model_file instanceof File && (
              <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '5px' }}>
                Selected: {form.model_file.name} ({(form.model_file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>

          <AdminFormField label="Available" k="available" type="select" opts={[{ v:true, l:'Yes' }, { v:false, l:'No' }]} form={form} setForm={setForm} />
          <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', marginTop:'8px' }}>
            <button style={S.btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button style={S.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function OrdersTab({ orders, onRefresh }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updating, setUpdating] = useState(null);

  const filtered = orders.filter(o =>
    (o.order_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.user?.username || o.user_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (order, status) => {
    setUpdating(order.id);
    try {
      await adminAPI.updateOrderStatus(order.id, status, order.payment_status);
      toast.success('Order status updated');
      onRefresh();
    } catch { toast.error('Failed to update order'); }
    finally { setUpdating(null); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteOrder(deleteTarget.id);
      toast.success('Order deleted');
      setDeleteTarget(null);
      onRefresh();
    } catch { toast.error('Failed to delete order'); }
  };

  return (
    <div>
      <div style={S.sectionHead}>
        <span style={S.sectionTag}>FurnitureHub Admin</span>
        <h2 style={S.sectionTitle}>Orders</h2>
      </div>

      <input style={{ ...S.input, maxWidth:'340px', marginBottom:'20px' }} placeholder="Search by Order ID or customer…" value={search} onChange={e => setSearch(e.target.value)} />

      <div style={S.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Order ID','Customer','Amount','Payment','Status','Date','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'rgba(255,255,255,0.25)', padding:'40px' }}>No orders found</td></tr>
                : filtered.map(o => (
                    <tr key={o.id}>
                      <td style={S.td}><span style={{ fontFamily:'monospace', fontSize:'11px', color:'rgba(255,255,255,0.45)' }}>#{(o.order_id||String(o.id)).slice(-10)}</span></td>
                      <td style={{ ...S.td, fontWeight:500 }}>{o.user?.username || o.user_name || '—'}</td>
                      <td style={S.td}>{fmt(parseFloat(o.total_amount))}</td>
                      <td style={S.td}><span style={S.badge(statusColor[o.payment_status]||'#facc15')}>{o.payment_status}</span></td>
                      <td style={S.td}>
                        <select
                          style={{ ...S.select, width:'auto', padding:'5px 10px', fontSize:'11px' }}
                          value={o.status}
                          disabled={updating === o.id}
                          onChange={e => handleStatusChange(o, e.target.value)}
                        >
                          {['pending','confirmed','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={S.td}>{new Date(o.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' })}</td>
                      <td style={S.td}><button style={S.btnDanger} onClick={() => setDeleteTarget(o)}>Delete</button></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete order #${(deleteTarget.order_id||String(deleteTarget.id)).slice(-8)}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function UsersTab({ users, onRefresh }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = users.filter(u =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email    || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = async (u) => {
    try {
      await adminAPI.banUser(u.id);
      toast.success(`User ${u.is_banned ? 'unbanned' : 'banned'}`);
      onRefresh();
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      onRefresh();
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div>
      <div style={S.sectionHead}>
        <span style={S.sectionTag}>FurnitureHub Admin</span>
        <h2 style={S.sectionTitle}>Users</h2>
      </div>

      <input style={{ ...S.input, maxWidth:'340px', marginBottom:'20px' }} placeholder="Search by username or email…" value={search} onChange={e => setSearch(e.target.value)} />

      <div style={S.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['ID','Username','Email','Full Name','Role','Status','Joined','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ ...S.td, textAlign:'center', color:'rgba(255,255,255,0.25)', padding:'40px' }}>No users found</td></tr>
                : filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{ ...S.td, color:'rgba(255,255,255,0.3)', fontSize:'11px' }}>{u.id}</td>
                      <td style={{ ...S.td, fontWeight:500 }}>{u.username}</td>
                      <td style={S.td}>{u.email || '—'}</td>
                      <td style={S.td}>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                      <td style={S.td}><span style={S.badge(u.is_staff ? '#60a5fa':'rgba(255,255,255,0.3)')}>{u.is_staff ? 'Staff':'User'}</span></td>
                      <td style={S.td}><span style={S.badge(u.is_banned ? '#f87171':'#4ade80')}>{u.is_banned ? 'Banned':'Active'}</span></td>
                      <td style={S.td}>{u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' }) : '—'}</td>
                      <td style={S.td}>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <button
                            style={{ ...S.btnSecondary, color: u.is_banned ? '#4ade80':'#facc15', borderColor: u.is_banned ? 'rgba(74,222,128,0.4)':'rgba(250,204,21,0.4)' }}
                            onClick={() => handleBan(u)}
                          >{u.is_banned ? 'Unban':'Ban'}</button>
                          <button style={S.btnDanger} onClick={() => setDeleteTarget(u)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete user "${deleteTarget.username}"? All their data will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WISHLISTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function WishlistsTab({ wishlists, onRefresh }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = wishlists.filter(w =>
    (w.user?.username || w.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.product?.name  || w.product_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await adminAPI.removeWishlist(deleteTarget.id);
      toast.success('Wishlist entry removed');
      setDeleteTarget(null);
      onRefresh();
    } catch { toast.error('Failed to remove entry'); }
  };

  return (
    <div>
      <div style={S.sectionHead}>
        <span style={S.sectionTag}>FurnitureHub Admin</span>
        <h2 style={S.sectionTitle}>Wishlists</h2>
      </div>

      <input style={{ ...S.input, maxWidth:'340px', marginBottom:'20px' }} placeholder="Search by user or product…" value={search} onChange={e => setSearch(e.target.value)} />

      <div style={S.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['ID','User','Product','Price','Added On','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', color:'rgba(255,255,255,0.25)', padding:'40px' }}>No wishlist entries</td></tr>
                : filtered.map(w => (
                    <tr key={w.id}>
                      <td style={{ ...S.td, color:'rgba(255,255,255,0.3)', fontSize:'11px' }}>{w.id}</td>
                      <td style={{ ...S.td, fontWeight:500 }}>{w.user?.username || w.username || '—'}</td>
                      <td style={S.td}>{w.product?.name || w.product_name || '—'}</td>
                      <td style={S.td}>{w.product?.price ? fmt(parseFloat(w.product.price)) : '—'}</td>
                      <td style={S.td}>{w.added_at ? new Date(w.added_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'2-digit' }) : '—'}</td>
                      <td style={S.td}><button style={S.btnDanger} onClick={() => setDeleteTarget(w)}>Remove</button></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`Remove "${deleteTarget.product?.name || 'this item'}" from ${deleteTarget.user?.username || 'user'}'s wishlist?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function AdminLoginScreen({ onSuccess }) {
  const { login } = useAuth();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!creds.username || !creds.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await login(creds);
      if (result.success) {
        toast.success('Welcome to Admin Panel!');
        onSuccess();
        window.location.reload();
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px' }}>
            FurnitureHub
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '2.2rem', fontWeight: 400, color: '#ffffff', margin: 0, lineHeight: 1.1 }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>
            Sign in with your admin credentials
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: '#121212',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '40px 36px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.9)',
          }}
        >
          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Username</label>
              <input
                type="text"
                style={S.input}
                value={creds.username}
                onChange={e => setCreds(c => ({ ...c, username: e.target.value }))}
                placeholder="Enter admin username"
                autoComplete="username"
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={S.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  style={{ ...S.input, paddingRight: '44px' }}
                  value={creds.password}
                  onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...S.btnPrimary,
                width: '100%',
                padding: '14px',
                fontSize: '12px',
                letterSpacing: '0.12em',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Signing in…
                </>
              ) : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a
              href="/"
              style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.06em' }}
            >
              ← Back to FurnitureHub
            </a>
          </div>
        </div>

        {/* Hint */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '20px', letterSpacing: '0.05em' }}>
          Admin access only. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VENDORS TAB (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
function VendorsTab({ vendors, onRefresh }) {
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  const filtered = vendors.filter(v =>
    (v.store_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.username   || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = async (vendor, newStatus) => {
    setUpdating(vendor.id);
    try {
      await adminAPI.approveVendor(vendor.id, newStatus);
      toast.success(`Vendor ${newStatus}`);
      onRefresh();
    } catch { toast.error('Failed to update vendor status'); }
    finally { setUpdating(null); }
  };

  const vendorStatusColor = { pending: '#facc15', approved: '#4ade80', rejected: '#f87171' };

  return (
    <div>
      <div style={S.sectionHead}>
        <span style={S.sectionTag}>FurnitureHub Admin</span>
        <h2 style={S.sectionTitle}>Vendors</h2>
      </div>

      <input
        style={{ ...S.input, maxWidth: '340px', marginBottom: '20px' }}
        placeholder="Search by store name or username…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div style={S.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Store', 'Username', 'City/State', 'Products', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: 'rgba(255,255,255,0.22)', padding: '40px' }}>No vendor applications yet</td></tr>
                : filtered.map(v => (
                    <tr key={v.id}>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {v.logo_url
                            ? <img src={v.logo_url} alt="logo" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                            : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}><i className="fas fa-store"></i></div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{v.store_name}</div>
                            {v.store_description && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.store_description}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>{v.username}</td>
                      <td style={S.td}>{[v.city, v.state].filter(Boolean).join(', ') || '—'}</td>
                      <td style={S.td}>{v.product_count ?? 0}</td>
                      <td style={S.td}><span style={S.badge(vendorStatusColor[v.status] || '#fff')}>{v.status}</span></td>
                      <td style={S.td}>{v.created_at ? new Date(v.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {v.status !== 'approved' && (
                            <button
                              style={{ ...S.btnSecondary, color: '#4ade80', borderColor: 'rgba(74,222,128,0.4)', fontSize: '10px', padding: '5px 10px' }}
                              disabled={updating === v.id}
                              onClick={() => handleStatus(v, 'approved')}
                            >Approve</button>
                          )}
                          {v.status !== 'rejected' && (
                            <button
                              style={{ ...S.btnDanger, fontSize: '10px', padding: '5px 10px' }}
                              disabled={updating === v.id}
                              onClick={() => handleStatus(v, 'rejected')}
                            >Reject</button>
                          )}
                          {v.status !== 'pending' && (
                            <button
                              style={{ ...S.btnSecondary, fontSize: '10px', padding: '5px 10px' }}
                              disabled={updating === v.id}
                              onClick={() => handleStatus(v, 'pending')}
                            >Reset</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:'overview',   label:'Overview',   icon:<i className="fas fa-chart-pie" style={{ fontSize: '13px' }}></i> },
  { id:'analytics',  label:'Analytics',  icon:<i className="fas fa-chart-line" style={{ fontSize: '13px' }}></i> },
  { id:'products',   label:'Products',   icon:<i className="fas fa-box" style={{ fontSize: '13px' }}></i> },
  { id:'orders',     label:'Orders',     icon:<i className="fas fa-shopping-cart" style={{ fontSize: '13px' }}></i> },
  { id:'users',      label:'Users',      icon:<i className="fas fa-users" style={{ fontSize: '13px' }}></i> },
  { id:'wishlists',  label:'Wishlists',  icon:<i className="fas fa-heart" style={{ fontSize: '13px' }}></i> },
  { id:'vendors',    label:'Vendors',    icon:<i className="fas fa-store" style={{ fontSize: '13px' }}></i> },
];


const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab,  setActiveTab]  = useState('overview');
  const [loading,    setLoading]    = useState(true);
  const [products,   setProducts]   = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [users,      setUsers]      = useState([]);
  const [wishlists,  setWishlists]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors,    setVendors]    = useState([]);
  const [hovered,    setHovered]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pR, oR, uR, wR, cR, vR] = await Promise.allSettled([
        adminAPI.getProducts(),
        adminAPI.getOrders(),
        adminAPI.getUsers(),
        adminAPI.getWishlists(),
        productsAPI.getCategories(),
        adminAPI.getVendors(),
      ]);

      const extract = (r, key) => {
        if (r.status !== 'fulfilled') return [];
        const d = r.value.data;
        return Array.isArray(d) ? d : (d[key] || d.results || []);
      };

      setProducts(extract(pR, 'products'));
      setOrders(extract(oR, 'orders'));
      setUsers(extract(uR, 'users'));
      setWishlists(extract(wR, 'wishlists'));
      setCategories(extract(cR, 'categories'));
      setVendors(Array.isArray(vR.value?.data) ? vR.value.data : []);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Admin Login Screen ────────────────────────────────────────────────────
  if (!user) {
    return <AdminLoginScreen onSuccess={fetchAll} />;
  }

  if (loading) {
    return (
      <div style={{ ...S.page, alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
        <div className="spinner-border text-light" role="status" style={{ width:'2rem', height:'2rem' }} />
        <p style={{ color:'rgba(255,255,255,0.35)', marginTop:'20px', fontSize:'12px', letterSpacing:'0.12em', textTransform:'uppercase' }}>Loading admin data…</p>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarBrand}>
          <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:'6px' }}>FurnitureHub</div>
          <div style={{ fontFamily:'var(--font-serif, Georgia, serif)', fontSize:'1.1rem', color:'#ffffff', fontWeight:400 }}>Admin Panel</div>
        </div>

        <div style={S.sidebarLabel}>Navigation</div>

        {TABS.map(tab => (
          <div
            key={tab.id}
            style={{ ...S.navItem(activeTab === tab.id), color: hovered === tab.id ? '#fff' : (activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.52)') }}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => setHovered(tab.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ fontSize:'13px', width:'18px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span style={{ marginLeft:'auto', background:'rgba(255,255,255,0.15)', borderRadius:'10px', padding:'2px 8px', fontSize:'10px', fontWeight:700 }}>
                {tab.id === 'products' ? products.length
                  : tab.id === 'orders'   ? orders.length
                  : tab.id === 'users'    ? users.length
                  : tab.id === 'wishlists'? wishlists.length
                  : ''}
              </span>
            )}
          </div>
        ))}

        <div style={{ flex:1 }} />

        {/* Back to site + Logout */}
        <div style={{ padding:'0 24px', borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:'20px', marginTop:'20px' }}>
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.28)', marginBottom:'5px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Logged in as</div>
          <div style={{ fontSize:'13px', color:'#fff', fontWeight:500 }}>{user.username}</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'2px', marginBottom:'16px' }}>{user.email || 'Administrator'}</div>
          <Link
            to="/"
            style={{ display:'block', fontSize:'11px', color:'rgba(255,255,255,0.5)', textDecoration:'none', marginBottom:'8px', letterSpacing:'0.06em' }}
          >
            ← Back to Site
          </Link>
          <button
            onClick={() => { authAPI.logout(); window.location.href = '/admin-panel'; }}
            style={{ background:'transparent', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', borderRadius:'7px', padding:'7px 14px', fontSize:'11px', fontWeight:600, cursor:'pointer', width:'100%' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={S.content}>
        {activeTab === 'overview'  && <OverviewTab   products={products} orders={orders} users={users} />}
        {activeTab === 'analytics' && <AnalyticsTab  orders={orders} products={products} />}
        {activeTab === 'products'  && <ProductsTab   products={products} categories={categories} onRefresh={fetchAll} />}
        {activeTab === 'orders'    && <OrdersTab     orders={orders} onRefresh={fetchAll} />}
        {activeTab === 'users'     && <UsersTab      users={users} onRefresh={fetchAll} />}
        {activeTab === 'wishlists' && <WishlistsTab  wishlists={wishlists} onRefresh={fetchAll} />}
        {activeTab === 'vendors'   && <VendorsTab    vendors={vendors} onRefresh={fetchAll} />}
      </main>
    </div>
  );
};

export default AdminPanel;
