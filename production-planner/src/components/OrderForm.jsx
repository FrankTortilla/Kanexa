'use client';
import { useState, useEffect } from 'react';
import { ORDER_STATUSES, COATING_TYPES_BY_ORDER_TYPE } from '../lib/constants';

const today = () => new Date().toISOString().slice(0, 10);

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#2a2a2a',
  border: '1px solid #333333',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '4px',
};

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: 'var(--accent-danger)', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange, activeColor = '#FF8C00', activeLabel, inactiveLabel }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: '42px', height: '24px', borderRadius: '12px',
          background: value ? activeColor : '#333',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'absolute', top: '3px',
          left: value ? '21px' : '3px',
          width: '18px', height: '18px',
          borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </div>
      <span style={{ fontSize: '13px', color: value ? activeColor : 'var(--text-secondary)', fontWeight: value ? 700 : 400 }}>
        {value ? activeLabel : inactiveLabel}
      </span>
    </label>
  );
}

const emptyForm = () => ({
  order_type: 'Baskets',
  start_date: today(),
  due_date: '',
  customer: '',
  po_number: '',
  quantity: '',
  pvg: '',
  dowel_size: '',
  oc: '',
  coating: 'Plain',
  coating_other: '',
  num_dowels: '',
  total_lf: '',
  status: 'In Production',
  cpu_asap: false,
  // EpoxyFab-specific
  bar_size: '',
  bar_length: '',
  weight: '',
  fabrication: '',
  tolling_only: false,
  // Baskets-specific
  description: '',
});

const ADD_TITLE = {
  'Baskets':      'Add Basket Order',
  'Loose Dowels': 'Add Loose Dowels Order',
  'EpoxyFab':     'Add EpoxyFab Order',
  'Accessories':  'Add Accessories Order',
};

export default function OrderForm({ isOpen, onClose, onSave, editingOrder, activeTab }) {
  const isEdit = !!editingOrder;

  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [cancelWarning, setCancelWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingOrder) {
        setForm({
          order_type: editingOrder.order_type,
          start_date: editingOrder.start_date || today(),
          due_date: editingOrder.due_date || '',
          customer: editingOrder.customer || '',
          po_number: editingOrder.po_number || '',
          quantity: editingOrder.quantity ?? '',
          pvg: editingOrder.pvg || '',
          dowel_size: editingOrder.dowel_size || '',
          oc: editingOrder.oc || '',
          coating: editingOrder.coating || 'Plain',
          coating_other: editingOrder.coating_other || '',
          num_dowels: editingOrder.num_dowels ?? '',
          total_lf: editingOrder.total_lf ?? '',
          status: editingOrder.status || 'In Production',
          cpu_asap: editingOrder.cpu_asap || false,
          bar_size: editingOrder.bar_size || '',
          bar_length: editingOrder.bar_length || '',
          weight: editingOrder.weight ?? '',
          fabrication: editingOrder.fabrication || '',
          tolling_only: editingOrder.tolling_only || false,
          description: editingOrder.description || '',
        });
        setCancelWarning(editingOrder.status === 'Cancelled');
      } else {
        setForm({ ...emptyForm(), order_type: activeTab || 'Baskets' });
        setCancelWarning(false);
      }
      setErrors({});
    }
  }, [isOpen, editingOrder]);

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (field === 'status') setCancelWarning(value === 'Cancelled');
  };

  const isLooseDowels  = form.order_type === 'Loose Dowels';
  const isEpoxyFab     = form.order_type === 'EpoxyFab';
  const isBaskets      = form.order_type === 'Baskets';
  const isAccessories  = form.order_type === 'Accessories';
  // Pvg, O.C., # Dowels, # Total LF are hidden for Loose Dowels, EpoxyFab, and Accessories
  const hideBasketFields = isLooseDowels || isEpoxyFab || isAccessories;

  const availableCoatings = COATING_TYPES_BY_ORDER_TYPE[form.order_type] ?? COATING_TYPES_BY_ORDER_TYPE['Baskets'];

  const validate = () => {
    const e = {};
    if (!form.order_type) e.order_type = 'Required';
    if (!form.start_date) e.start_date = 'Required';
    if (!form.due_date) e.due_date = 'Required';
    if (form.start_date && form.due_date && form.due_date < form.start_date) {
      e.due_date = 'Due Date must be on or after Start Date';
    }
    if (!form.customer.trim()) e.customer = 'Required';
    if (form.quantity === '' || form.quantity === null) e.quantity = 'Required';
    if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = 'Must be a positive number';
    if (!isAccessories && !form.coating) e.coating = 'Required';
    if (!isAccessories && form.coating === 'Other' && !form.coating_other.trim()) e.coating_other = 'Please describe the coating';
    if (!form.status) e.status = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setErrors({});
    try {
      const payload = {
        order_type: form.order_type,
        start_date: form.start_date,
        due_date: form.due_date,
        customer: form.customer.trim(),
        po_number: form.po_number.trim() || null,
        quantity: Number(form.quantity),
        // Pvg, O.C., # Dowels hidden for everything except Baskets
        pvg:        isBaskets ? (form.pvg.trim() || null) : null,
        oc:         isBaskets ? (form.oc.trim() || null) : null,
        num_dowels: isBaskets ? (form.num_dowels !== '' ? Number(form.num_dowels) : null) : null,
        // total_lf: Baskets = "# Total LF", Accessories = "LF (Linear Feet)", others = null
        total_lf: (isBaskets || isAccessories) ? (form.total_lf !== '' ? Number(form.total_lf) : null) : null,
        // Dowel Size — Baskets and Loose Dowels only
        dowel_size: (isEpoxyFab || isAccessories) ? null : (form.dowel_size.trim() || null),
        // Coating — not used by Accessories
        coating: isAccessories ? null : form.coating,
        coating_other: isAccessories ? null : (form.coating === 'Other' ? form.coating_other.trim() : null),
        status: form.status,
        cpu_asap: form.cpu_asap,
        // EpoxyFab-specific — null for all other types
        bar_size:     isEpoxyFab ? (form.bar_size.trim() || null)                        : null,
        bar_length:   isEpoxyFab ? (form.bar_length.trim() || null)                      : null,
        weight:       isEpoxyFab ? (form.weight !== '' ? Number(form.weight) : null)      : null,
        fabrication:  isEpoxyFab ? (form.fabrication.trim() || null)                     : null,
        tolling_only: isEpoxyFab ? form.tolling_only                                     : false,
        // Baskets = Description, Accessories = Notes — both use description column
        description: (isBaskets || isAccessories) ? (form.description.trim() || null) : null,
        // Auto-archive if Cancelled
        ...(form.status === 'Cancelled' ? { archived: true } : {}),
      };
      await onSave(payload, isEdit ? editingOrder.id : null, editingOrder);
      onClose();
    } catch (err) {
      console.error('Order save failed:', err);
      setErrors({ _form: err.message || 'Failed to save order. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200 }}
      />

      {/* Panel */}
      <div
        className="animate-slide-in"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '480px', maxWidth: '96vw',
          background: '#222222',
          borderLeft: '1px solid #333333',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading), Oswald, sans-serif' }}>
            {isEdit ? 'Edit Order' : (ADD_TITLE[activeTab] || 'Add Production Order')}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Start Date" required>
              <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} style={inputStyle} />
              {errors.start_date && <ErrMsg>{errors.start_date}</ErrMsg>}
            </Field>
            <Field label="Due Date" required>
              <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} style={inputStyle} />
              {errors.due_date && <ErrMsg>{errors.due_date}</ErrMsg>}
            </Field>
          </div>

          {/* Customer */}
          <Field label="Customer" required>
            <input type="text" value={form.customer} onChange={e => set('customer', e.target.value)} placeholder="Customer name" style={inputStyle} />
            {errors.customer && <ErrMsg>{errors.customer}</ErrMsg>}
          </Field>

          {/* PO# */}
          <Field label="PO#">
            <input type="text" value={form.po_number} onChange={e => set('po_number', e.target.value)} placeholder="Optional" style={inputStyle} />
          </Field>

          {/* Qty */}
          <Field label="Qty (ea)" required>
            <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" style={inputStyle} />
            {errors.quantity && <ErrMsg>{errors.quantity}</ErrMsg>}
          </Field>

          {/* Weight — EpoxyFab only, directly below Qty */}
          {isEpoxyFab && (
            <Field label="Weight (lbs)">
              <input type="number" min="0" step="any" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="0" style={inputStyle} />
            </Field>
          )}

          {/* Pvg / Dowel Size / O.C. — 3-col for Baskets only */}
          {isBaskets && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Field label='Pvg"'>
                <input type="text" value={form.pvg} onChange={e => set('pvg', e.target.value)} placeholder='e.g. 1"' style={inputStyle} />
              </Field>
              <Field label="Dowel Size">
                <input type="text" value={form.dowel_size} onChange={e => set('dowel_size', e.target.value)} placeholder='e.g. 1"' style={inputStyle} />
              </Field>
              <Field label="O.C.">
                <input type="text" value={form.oc} onChange={e => set('oc', e.target.value)} placeholder='e.g. 12"' style={inputStyle} />
              </Field>
            </div>
          )}

          {/* Dowel Size alone for Loose Dowels only — EpoxyFab has no Dowel Size */}
          {isLooseDowels && (
            <Field label="Dowel Size">
              <input type="text" value={form.dowel_size} onChange={e => set('dowel_size', e.target.value)} placeholder='e.g. 1"' style={inputStyle} />
            </Field>
          )}

          {/* LF — Accessories only */}
          {isAccessories && (
            <Field label="LF (Linear Feet)">
              <input type="number" min="0" step="any" value={form.total_lf} onChange={e => set('total_lf', e.target.value)} placeholder="0" style={inputStyle} />
            </Field>
          )}

          {/* Notes — Accessories only */}
          {isAccessories && (
            <Field label="Notes">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Optional notes"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </Field>
          )}

          {/* Coating — hidden for Accessories */}
          {!isAccessories && (
            <>
              <Field label="Coating" required>
                <select value={form.coating} onChange={e => set('coating', e.target.value)} style={inputStyle}>
                  {availableCoatings.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.coating && <ErrMsg>{errors.coating}</ErrMsg>}
              </Field>
              {form.coating === 'Other' && (
                <Field label="Coating Description" required>
                  <input
                    type="text"
                    value={form.coating_other}
                    onChange={e => set('coating_other', e.target.value)}
                    placeholder="Describe the coating"
                    style={inputStyle}
                  />
                  {errors.coating_other && <ErrMsg>{errors.coating_other}</ErrMsg>}
                </Field>
              )}
            </>
          )}

          {/* Description — Baskets only (Accessories uses description for Notes above) */}
          {isBaskets && (
            <Field label="Description">
              <input type="text" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional" style={inputStyle} />
            </Field>
          )}

          {/* # Dowels / Total LF — Baskets only */}
          {!hideBasketFields && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="# of Dowels">
                <input type="number" min="0" value={form.num_dowels} onChange={e => set('num_dowels', e.target.value)} placeholder="0" style={inputStyle} />
              </Field>
              <Field label="# Total LF">
                <input type="number" min="0" value={form.total_lf} onChange={e => set('total_lf', e.target.value)} placeholder="0" style={inputStyle} />
              </Field>
            </div>
          )}

          {/* Bar Size / Bar Length — EpoxyFab only */}
          {isEpoxyFab && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Bar Size">
                <input type="text" value={form.bar_size} onChange={e => set('bar_size', e.target.value)} placeholder='e.g. #5' style={inputStyle} />
              </Field>
              <Field label="Bar Length">
                <input type="text" value={form.bar_length} onChange={e => set('bar_length', e.target.value)} placeholder='e.g. 20 ft' style={inputStyle} />
              </Field>
            </div>
          )}

          {/* Fabrication — EpoxyFab only */}
          {isEpoxyFab && (
            <Field label="Fabrication">
              <textarea
                value={form.fabrication}
                onChange={e => set('fabrication', e.target.value)}
                placeholder="Fabrication details"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </Field>
          )}

          {/* Status */}
          <Field label="Status" required>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ORDER_STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: `1px solid ${form.status === s ? 'var(--accent-green)' : 'var(--border)'}`,
                    background: form.status === s ? 'var(--accent-green)' : 'transparent',
                    color: form.status === s ? '#fff' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    minWidth: '110px',
                    textAlign: 'center',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.status && <ErrMsg>{errors.status}</ErrMsg>}
          </Field>

          {/* Cancel warning */}
          {cancelWarning && (
            <div style={{
              background: 'rgba(255,23,68,0.08)',
              border: '1px solid rgba(255,23,68,0.4)',
              borderRadius: '7px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#FF6B6B',
              lineHeight: 1.5,
            }}>
              ⚠️ Cancelled orders will be automatically archived.
            </div>
          )}

          {/* CPU ASAP */}
          <Field label="CPU ASAP">
            <Toggle
              value={form.cpu_asap}
              onChange={v => set('cpu_asap', v)}
              activeColor="#FF8C00"
              activeLabel="ASAP — Pinned to top"
              inactiveLabel="Off"
            />
          </Field>

          {/* Tolling Only — EpoxyFab only, same toggle style as CPU ASAP */}
          {isEpoxyFab && (
            <Field label="Tolling Only">
              <Toggle
                value={form.tolling_only}
                onChange={v => set('tolling_only', v)}
                activeColor="var(--accent-green)"
                activeLabel="Tolling Only — On"
                inactiveLabel="Off"
              />
            </Field>
          )}

          <div style={{ height: '80px' }} />
        </form>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #333333',
          background: '#222222',
          flexShrink: 0,
        }}>
          {errors._form && (
            <div style={{
              background: 'rgba(255,23,68,0.1)',
              border: '1px solid var(--accent-danger)',
              borderRadius: '7px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '13px',
              color: '#FF6B6B',
            }}>
              {errors._form}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: '7px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '12px 24px', borderRadius: '6px',
                border: 'none', background: saving ? '#333' : 'var(--accent-green)',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-heading), Oswald, sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ErrMsg({ children }) {
  return (
    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--accent-danger)' }}>{children}</p>
  );
}
