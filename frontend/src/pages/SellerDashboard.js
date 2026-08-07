import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { vendorAPI, productsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { display: 'flex', minHeight: '100vh', background: '#000', fontFamily: 'var(--font-sans, Inter, sans-serif)' },
  sidebar: { width: '230px', minWidth: '230px', background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarBrand: { padding: '0 22px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '12px' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: '11px', padding: '10px 22px', cursor: 'pointer',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    color: active ? '#ffffff' : 'rgba(255,255,255,0.48)',
    background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
    borderLeft: active ? '2px solid #ffffff' : '2px solid transparent',
    transition: 'all 0.15s ease', userSelect: 'none',
  }),
  content: { flex: 1, padding: '44px 48px', overflowX: 'auto' },
  card: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' },
  kpiCard: { background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '22px', flex: '1 1 0', minWidth: '150px' },
  kpiValue: { fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.02em' },
  kpiLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' },
  td: { padding: '13px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
  btnPrimary: { background: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  btnDanger: { background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.35)', borderRadius: '7px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  btnSecondary: { background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '7px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  input: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.13)', color: '#fff', borderRadius: '8px', padding: '10px 13px', fontSize: '13px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  select: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.13)', color: '#fff', borderRadius: '8px', padding: '10px 13px', fontSize: '13px', width: '100%', boxSizing: 'border-box', outline: 'none', cursor: 'pointer' },
  label: { display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '7px' },
  sectionTag: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '8px' },
  sectionTitle: { fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '2rem', fontWeight: 400, color: '#fff', margin: 0 },
  badge: (color) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: color + '20', color: color, border: `1px solid ${color}40`, textTransform: 'capitalize' }),
};

const fmt = (n) => typeof n === 'number' && !isNaN(n) ? '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : (n ? '₹' + parseFloat(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '₹0');

const statusColor = { pending: '#facc15', confirmed: '#60a5fa', shipped: '#a78bfa', delivered: '#4ade80', cancelled: '#f87171' };

const chartBase = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.65)' } },
  scales: {
    x: { ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '560px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1.35rem', fontWeight: 400, color: '#fff', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Confirm ──────────────────────────────────────────────────────────────────
// ─── Confirm ──────────────────────────────────────────────────────────────────
function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '14px', padding: '36px', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px' }}><i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', color: '#f87171' }}></i></div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onCancel} style={S.btnSecondary}>Cancel</button>
          <button onClick={onConfirm} style={{ ...S.btnDanger, background: '#f87171', color: '#000', border: 'none' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Pending / Not a Vendor screen ────────────────────────────────────────────
function PendingScreen({ status }) {
  const icons = {
    pending: <i className="fas fa-hourglass-half" style={{ fontSize: '3.5rem', color: '#facc15', marginBottom: '20px' }}></i>,
    rejected: <i className="fas fa-times-circle" style={{ fontSize: '3.5rem', color: '#f87171', marginBottom: '20px' }}></i>
  };
  const msgs = {
    pending: { title: 'Application Under Review', sub: 'Your seller application is pending admin approval. You\'ll be notified when it\'s approved.' },
    rejected: { title: 'Application Rejected', sub: 'Your vendor application was not approved. Please contact support for more information.' },
  };
  const info = msgs[status] || msgs.pending;
  return (
    <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
      {icons[status] || icons.pending}
      <span style={S.sectionTag}>FurnitureHub Seller</span>
      <h2 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '2rem', fontWeight: 400, color: '#fff', marginBottom: '14px' }}>{info.title}</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '420px', lineHeight: 1.7, marginBottom: '32px' }}>{info.sub}</p>
      <Link to="/" style={{ ...S.btnPrimary, textDecoration: 'none', padding: '12px 28px' }}>← Back to Home</Link>
    </div>
  );
}

// ─── No Vendor screen ─────────────────────────────────────────────────────────
function NotAVendorScreen() {
  return (
    <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
      <i className="fas fa-store" style={{ fontSize: '3.5rem', color: '#fff', marginBottom: '20px' }}></i>
      <span style={S.sectionTag}>FurnitureHub Marketplace</span>
      <h2 style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '2rem', fontWeight: 400, color: '#fff', marginBottom: '14px' }}>Become a Seller</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', maxWidth: '420px', lineHeight: 1.7, marginBottom: '32px' }}>
        You don't have a seller account yet. Register your store to start selling your furniture on FurnitureHub.
      </p>
      <Link to="/become-a-seller" style={{ ...S.btnPrimary, textDecoration: 'none', padding: '13px 30px' }}>Start Selling →</Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function OverviewTab({ stats, products, orders }) {
  const kpis = [
    { label: 'Total Revenue',  value: fmt(stats?.total_revenue), icon: <i className="fas fa-rupee-sign" style={{ color: '#fff', fontSize: '1.4rem' }}></i> },
    { label: 'Total Orders',   value: stats?.total_orders ?? 0,  icon: <i className="fas fa-box" style={{ color: '#fff', fontSize: '1.4rem' }}></i> },
    { label: 'Products Listed', value: stats?.total_products ?? 0, icon: <i className="fas fa-couch" style={{ color: '#fff', fontSize: '1.4rem' }}></i> },
    { label: 'Pending Orders', value: stats?.pending_orders ?? 0, icon: <i className="fas fa-hourglass-half" style={{ color: '#fff', fontSize: '1.4rem' }}></i> },
  ];

  const recent = [...orders].slice(0, 6);

  return (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <span style={S.sectionTag}>Seller Dashboard</span>
        <h2 style={S.sectionTitle}>Overview</h2>
      </div>

      {stats?.status === 'approved' ? null : (
        <div style={{ background: '#1a1200', border: '1px solid rgba(250,204,21,0.3)', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', fontSize: '13px', color: '#facc15' }}>
          <i className="fas fa-exclamation-triangle me-2"></i>Your store is <strong>{stats?.status}</strong>. Products cannot be listed until your account is approved.
        </div>
      )}

      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={S.kpiCard}>
            <div style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{k.icon}</div>
            <div style={S.kpiValue}>{k.value}</div>
            <div style={S.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <h5 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '0 0 18px 0' }}>Recent Orders</h5>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Order ID', 'Customer', 'Revenue', 'Status', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recent.length === 0
                ? <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '36px' }}>No orders yet</td></tr>
                : recent.map(o => (
                    <tr key={o.id}>
                      <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>#{(o.order_id || String(o.id)).slice(-8)}</span></td>
                      <td style={{ ...S.td, fontWeight: 500 }}>{o.customer}</td>
                      <td style={S.td}>{fmt(o.vendor_revenue)}</td>
                      <td style={S.td}><span style={S.badge(statusColor[o.status] || '#fff')}>{o.status}</span></td>
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

// ─── Form Field Helper (Defined outside component to prevent focus loss on typing) ───
const FormField = ({ label, k, form, setForm, type = 'text', opts }) => (
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
// MY PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════
function ProductsTab({ products, categories, onRefresh, isApproved }) {
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', stock: 10, available: true, image_url: '', room_category: '', category: categories[0]?.id || '' });
    setModal('create');
  };
  const openEdit = (p) => {
    setForm({ ...p, category: (typeof p.category === 'object' ? p.category?.id : p.category) || categories[0]?.id || '' });
    setModal(p);
  };

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
      } else {
        payload = { ...form };
        if (typeof payload.model_file === 'string') {
          delete payload.model_file;
        }
        if (typeof payload.category === 'object') {
          payload.category = payload.category.id;
        }
      }

      if (modal === 'create') {
        await vendorAPI.createProduct(payload);
        toast.success('Product created!');
      } else {
        await vendorAPI.updateProduct(modal.id, payload);
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
      await vendorAPI.deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      onRefresh();
    } catch { toast.error('Failed to delete product'); }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={S.sectionTag}>Seller Dashboard</span>
          <h2 style={S.sectionTitle}>My Products</h2>
        </div>
        {isApproved && <button style={S.btnPrimary} onClick={openCreate}>+ Add Product</button>}
      </div>
      {!isApproved && (
        <div style={{ background: '#111', border: '1px solid rgba(250,204,21,0.25)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: '#facc15' }}>
          ⚠️ Your account must be approved before you can add products.
        </div>
      )}
      <input style={{ ...S.input, maxWidth: '300px', marginBottom: '18px' }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
      <div style={S.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Img', 'Name', 'Price', 'Stock', '3D Model', 'Available', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '40px' }}>No products yet</td></tr>
                : filtered.map(p => (
                    <tr key={p.id}>
                      <td style={S.td}>
                        {(p.image_url || p.image)
                          ? <img src={p.image_url || p.image} alt={p.name} style={{ width: '44px', height: '34px', objectFit: 'cover', borderRadius: '6px' }} onError={e => e.target.style.display = 'none'} />
                          : <div style={{ width: '44px', height: '34px', background: '#1a1a1a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛋️</div>}
                      </td>
                      <td style={{ ...S.td, fontWeight: 500, maxWidth: '180px' }}>{p.name}</td>
                      <td style={S.td}>{fmt(parseFloat(p.price))}</td>
                      <td style={S.td}><span style={{ color: (p.stock || 0) <= 5 ? '#f87171' : 'inherit', fontWeight: (p.stock || 0) <= 5 ? 700 : 400 }}>{p.stock ?? 0}</span></td>
                      <td style={S.td}><span style={S.badge(p.model_file ? '#a78bfa' : 'rgba(255,255,255,0.2)')}>{p.model_file ? '📦 3D .glb' : 'None'}</span></td>
                      <td style={S.td}><span style={S.badge(p.available ? '#4ade80' : '#f87171')}>{p.available ? 'Yes' : 'No'}</span></td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={S.btnSecondary} onClick={() => openEdit(p)}>Edit</button>
                          <button style={S.btnDanger} onClick={() => setDeleteTarget(p)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <Modal title={modal === 'create' ? 'Add New Product' : 'Edit Product'} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <FormField label="Product Name *" k="name" form={form} setForm={setForm} />
            <FormField label="Price (₹) *" k="price" type="number" form={form} setForm={setForm} />
          </div>
          <FormField label="Description" k="description" type="textarea" form={form} setForm={setForm} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <FormField label="Stock" k="stock" type="number" form={form} setForm={setForm} />
            <FormField label="Category" k="category" type="select" opts={categories.map(c => ({ v: c.id, l: c.name }))} form={form} setForm={setForm} />
          </div>
          <FormField label="Room Category" k="room_category" form={form} setForm={setForm} />
          <FormField label="Image URL" k="image_url" form={form} setForm={setForm} />

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

          <FormField label="Available" k="available" type="select" opts={[{ v: true, l: 'Yes' }, { v: false, l: 'No' }]} form={form} setForm={setForm} />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button style={S.btnSecondary} onClick={() => setModal(null)}>Cancel</button>
            <button style={S.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
          </div>
        </Modal>
      )}

      {deleteTarget && <Confirm message={`Delete "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MY ORDERS
// ═══════════════════════════════════════════════════════════════════════════════
function OrdersTab({ orders }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = orders.filter(o =>
    (o.order_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <span style={S.sectionTag}>Seller Dashboard</span>
        <h2 style={S.sectionTitle}>My Orders</h2>
      </div>
      <input style={{ ...S.input, maxWidth: '320px', marginBottom: '18px' }} placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} />
      <div style={S.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Order ID', 'Customer', 'My Revenue', 'Status', 'Date', 'Items'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '40px' }}>No orders yet</td></tr>
                : filtered.map(o => (
                    <React.Fragment key={o.id}>
                      <tr onClick={() => setExpanded(expanded === o.id ? null : o.id)} style={{ cursor: 'pointer' }}>
                        <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>#{(o.order_id || String(o.id)).slice(-8)}</span></td>
                        <td style={{ ...S.td, fontWeight: 500 }}>{o.customer}</td>
                        <td style={{ ...S.td, fontWeight: 600, color: '#4ade80' }}>{fmt(o.vendor_revenue)}</td>
                        <td style={S.td}><span style={S.badge(statusColor[o.status] || '#fff')}>{o.status}</span></td>
                        <td style={S.td}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                        <td style={S.td}><span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{expanded === o.id ? '▲' : '▼'} {o.items?.length || 0}</span></td>
                      </tr>
                      {expanded === o.id && (o.items || []).map((item, i) => (
                        <tr key={i} style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <td colSpan={6} style={{ ...S.td, paddingLeft: '32px', color: 'rgba(255,255,255,0.5)' }}>
                            {item.product_name} × {item.quantity} — {fmt(item.price)} each
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
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
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsTab({ orders, products }) {
  const statusCounts = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => ({
    label: s, count: orders.filter(o => o.status === s).length,
  }));

  const revenueByMonth = (() => {
    const m = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      m[d.toLocaleString('default', { month: 'short', year: '2-digit' })] = 0;
    }
    orders.forEach(o => {
      const key = new Date(o.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (m[key] !== undefined) m[key] += parseFloat(o.vendor_revenue || 0);
    });
    return m;
  })();

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

  const barData = {
    labels: Object.keys(revenueByMonth),
    datasets: [{ label: 'Revenue (₹)', data: Object.values(revenueByMonth), backgroundColor: 'rgba(255,255,255,0.09)', borderColor: 'rgba(255,255,255,0.6)', borderWidth: 1.5, borderRadius: 5 }],
  };

  const lineData = {
    labels: Object.keys(dailyOrders),
    datasets: [{ label: 'Orders', data: Object.values(dailyOrders), borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.04)', fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointRadius: 3 }],
  };

  const lineOpts = { ...chartBase, plugins: { ...chartBase.plugins, legend: { display: false } } };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <span style={S.sectionTag}>Seller Dashboard</span>
        <h2 style={S.sectionTitle}>Analytics</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
        <div style={S.card}>
          <h5 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 18px 0' }}>My Revenue — Last 6 Months</h5>
          <div style={{ height: '220px' }}><Bar data={barData} options={chartBase} /></div>
        </div>
        <div style={S.card}>
          <h5 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 18px 0' }}>Order Status Breakdown</h5>
          {statusCounts.map(s => {
            const pct = orders.length ? Math.round((s.count / orders.length) * 100) : 0;
            return (
              <div key={s.label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>{s.label}</span>
                  <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{s.count}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '4px', height: '3px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: statusColor[s.label] || '#fff', borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...S.card, marginBottom: '18px' }}>
        <h5 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 18px 0' }}>Daily Orders — Last 14 Days</h5>
        <div style={{ height: '180px' }}><Line data={lineData} options={lineOpts} /></div>
      </div>

      <div style={S.card}>
        <h5 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 18px 0' }}>My Products</h5>
        <table style={S.table}>
          <thead>
            <tr>{['Name', 'Price', 'Stock', 'Status'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.length === 0
              ? <tr><td colSpan={4} style={{ ...S.td, textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '28px' }}>No products</td></tr>
              : products.map(p => (
                  <tr key={p.id}>
                    <td style={{ ...S.td, fontWeight: 500 }}>{p.name}</td>
                    <td style={S.td}>{fmt(parseFloat(p.price))}</td>
                    <td style={S.td}><span style={{ color: (p.stock || 0) <= 5 ? '#f87171' : 'inherit' }}>{p.stock ?? 0}</span></td>
                    <td style={S.td}><span style={S.badge(p.available ? '#4ade80' : '#f87171')}>{p.available ? 'Active' : 'Hidden'}</span></td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORE PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileTab({ profile, onRefresh }) {
  const [form, setForm] = useState({
    store_name: profile?.store_name || '',
    store_description: profile?.store_description || '',
    logo_url: profile?.logo_url || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await vendorAPI.updateProfile(form);
      toast.success('Store profile updated!');
      onRefresh();
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const F = ({ label, k, type = 'text' }) => (
    <div style={{ marginBottom: '18px' }}>
      <label style={S.label}>{label}</label>
      {type === 'textarea'
        ? <textarea style={{ ...S.input, minHeight: '90px', resize: 'vertical' }} value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
        : <input style={S.input} type={type} value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
      }
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <span style={S.sectionTag}>Seller Dashboard</span>
        <h2 style={S.sectionTitle}>Store Profile</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={S.card}>
          <h5 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 22px 0' }}>Store Information</h5>
          <F label="Store Name" k="store_name" />
          <F label="Store Description" k="store_description" type="textarea" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <F label="Phone" k="phone" type="tel" />
            <F label="Logo URL" k="logo_url" type="url" />
          </div>
          <F label="Address" k="address" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <F label="City" k="city" />
            <F label="State" k="state" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button style={S.btnPrimary} onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>

        <div>
          {/* Store card preview */}
          <div style={{ ...S.card, marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              {form.logo_url
                ? <img src={form.logo_url} alt="logo" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                : <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏪</div>
              }
              <div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{form.store_name || 'Your Store'}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{form.city || '—'}, {form.state || '—'}</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0 }}>{form.store_description || 'No description yet.'}</p>
          </div>

          <div style={S.card}>
            <h5 style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 14px 0' }}>Account Status</h5>
            <span style={S.badge(profile?.status === 'approved' ? '#4ade80' : profile?.status === 'rejected' ? '#f87171' : '#facc15')}>
              {profile?.status || 'pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SELLER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'overview',  label: 'Overview',  icon: <i className="fas fa-chart-pie" style={{ fontSize: '13px' }}></i> },
  { id: 'products',  label: 'Products',  icon: <i className="fas fa-box" style={{ fontSize: '13px' }}></i> },
  { id: 'orders',    label: 'Orders',    icon: <i className="fas fa-shopping-cart" style={{ fontSize: '13px' }}></i> },
  { id: 'analytics', label: 'Analytics', icon: <i className="fas fa-chart-line" style={{ fontSize: '13px' }}></i> },
  { id: 'profile',   label: 'Store Profile', icon: <i className="fas fa-store" style={{ fontSize: '13px' }}></i> },
];

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]  = useState('overview');
  const [loading, setLoading]      = useState(true);
  const [profile, setProfile]      = useState(null);
  const [products, setProducts]    = useState([]);
  const [orders, setOrders]        = useState([]);
  const [stats, setStats]          = useState(null);
  const [categories, setCategories] = useState([]);
  const [hovered, setHovered]      = useState(null);
  const [vendorStatus, setVendorStatus] = useState(null); // null=no vendor, 'pending'/'approved'/'rejected'

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Check if user is a vendor
      const profileRes = await vendorAPI.getProfile();
      const vProfile = profileRes.data;
      setProfile(vProfile);
      setVendorStatus(vProfile.status);

      const [pRes, oRes, sRes, cRes] = await Promise.allSettled([
        vendorAPI.getProducts(),
        vendorAPI.getOrders(),
        vendorAPI.getStats(),
        productsAPI.getCategories(),
      ]);

      const ex = (r, key) => { if (r.status !== 'fulfilled') return []; const d = r.value.data; return Array.isArray(d) ? d : (d[key] || d.results || []); };
      setProducts(ex(pRes, 'products'));
      setOrders(Array.isArray(oRes.value?.data) ? oRes.value.data : []);
      setStats(sRes.status === 'fulfilled' ? sRes.value.data : null);
      setCategories(ex(cRes, 'categories'));
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setVendorStatus(null); // Not a vendor yet
      } else {
        toast.error('Failed to load seller data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) fetchAll(); else setLoading(false); }, [user, fetchAll]);

  if (!user) {
    return (
      <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ color: '#fff', fontWeight: 400, marginBottom: '8px' }}>Please log in</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>You need to be logged in to access the seller dashboard.</p>
        <Link to="/login" style={{ ...S.btnPrimary, textDecoration: 'none', padding: '12px 28px' }}>Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ ...S.page, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', minHeight: '100vh' }}>
        <div className="spinner-border text-light" style={{ width: '2rem', height: '2rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: '20px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (vendorStatus === null) return <NotAVendorScreen />;
  if (vendorStatus === 'pending' || vendorStatus === 'rejected') return <PendingScreen status={vendorStatus} />;

  const isApproved = vendorStatus === 'approved';

  return (
    <div style={S.page}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarBrand}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '5px' }}>FurnitureHub</div>
          <div style={{ fontFamily: 'var(--font-serif, Georgia, serif)', fontSize: '1rem', color: '#fff' }}>Seller Dashboard</div>
        </div>

        <div style={{ padding: '8px 22px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Navigation</div>

        {TABS.map(tab => (
          <div
            key={tab.id}
            style={{ ...S.navItem(activeTab === tab.id), color: hovered === tab.id ? '#fff' : (activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.48)') }}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => setHovered(tab.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ fontSize: '13px', width: '16px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 22px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '18px', marginTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            {profile?.logo_url
              ? <img src={profile.logo_url} alt="logo" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
              : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🏪</div>
            }
            <div>
              <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{profile?.store_name}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{user.username}</div>
            </div>
          </div>
          <Link to="/" style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '8px', letterSpacing: '0.05em' }}>← Back to Site</Link>
          <button
            onClick={() => { authAPI.logout(); window.location.href = '/seller-dashboard'; }}
            style={{ background: 'transparent', border: '1px solid rgba(248,113,113,0.28)', color: '#f87171', borderRadius: '7px', padding: '7px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
          >Sign Out</button>
        </div>
      </aside>

      {/* Content */}
      <main style={S.content}>
        {activeTab === 'overview'  && <OverviewTab stats={stats} products={products} orders={orders} />}
        {activeTab === 'products'  && <ProductsTab products={products} categories={categories} onRefresh={fetchAll} isApproved={isApproved} />}
        {activeTab === 'orders'    && <OrdersTab orders={orders} />}
        {activeTab === 'analytics' && <AnalyticsTab orders={orders} products={products} />}
        {activeTab === 'profile'   && <ProfileTab profile={profile} onRefresh={fetchAll} />}
      </main>
    </div>
  );
};

export default SellerDashboard;
