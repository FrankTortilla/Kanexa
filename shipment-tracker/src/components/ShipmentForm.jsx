'use client';
import { useState, useEffect } from 'react';
import { US_STATES } from '../lib/constants';
import { todayISO } from '../utils/formatters';

const REQUIRED_FIELDS = ['ship_date', 'customer_name', 'city', 'state', 'material', 'po_number', 'quantity'];

const INITIAL = {
  ship_date: '',
  delivery_date: '',
  customer_name: '',
  city: '',
  state: '',
  material: '',
  po_number: '',
  carrier_name: '',
  tracking_number: '',
  quantity: '',
  weight: '',
  total_mileage: '',
  special_instructions: '',
  status: 'Pending',
};

export default function ShipmentForm({ isOpen, onClose, onSave, editingShipment, onDelete, checkDuplicatePO }) {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [duplicatePO, setDuplicatePO] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingShipment;

  useEffect(() => {
    if (isOpen) {
      if (editingShipment) {
        setForm({
          ship_date: editingShipment.ship_date || '',
          delivery_date: editingShipment.delivery_date || '',
          customer_name: editingShipment.customer_name || '',
          city: editingShipment.city || '',
          state: editingShipment.state || '',
          material: editingShipment.material || '',
          po_number: editingShipment.po_number || '',
          carrier_name: editingShipment.carrier_name || '',
          tracking_number: editingShipment.tracking_number || '',
          quantity: editingShipment.quantity ?? '',
          weight: editingShipment.weight ?? '',
          total_mileage: editingShipment.total_mileage ?? '',
          special_instructions: editingShipment.special_instructions || '',
          status: editingShipment.status || 'Pending',
        });
      } else {
        setForm({ ...INITIAL, ship_date: todayISO() });
      }
      setErrors({});
      setDuplicatePO(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, editingShipment]);

  // Check duplicate PO on blur
  const handlePOBlur = async () => {
    if (!form.po_number.trim() || !checkDuplicatePO) return;
    const isDup = await checkDuplicatePO(form.po_number, editingShipment?.id);
    setDuplicatePO(isDup);
  };

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const errs = {};
    for (const f of REQUIRED_FIELDS) {
      const v = form[f];
      if (v === '' || v === null || v === undefined) errs[f] = 'Required';
    }
    if (form.quantity !== '' && (isNaN(Number(form.quantity)) || Number(form.quantity) < 0)) {
      errs.quantity = 'Must be a positive number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        weight: form.weight !== '' ? Number(form.weight) : null,
        total_mileage: form.total_mileage !== '' ? Number(form.total_mileage) : null,
        delivery_date: form.delivery_date || null,
        carrier_name: form.carrier_name || null,
        tracking_number: form.tracking_number || null,
        special_instructions: form.special_instructions || null,
      };
      await onSave(payload, editingShipment?.id);
      onClose();
    } catch (err) {
      setErrors({ _form: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(editingShipment);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50,
        transition: 'opacity 300ms ease', opacity: 1,
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100vw',
        background: 'var(--bg-surface)', zIndex: 51, overflowY: 'auto',
        borderLeft: '1px solid var(--border)',
        animation: 'slideIn 300ms ease',
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading), Oswald, sans-serif',
              fontSize: '24px', fontWeight: 700, margin: 0,
            }}>
              {isEdit ? 'Edit Shipment' : 'Add Shipment'}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}>✕</button>
          </div>

          {errors._form && <div style={errorBannerStyle}>{errors._form}</div>}
          {duplicatePO && (
            <div style={{ ...errorBannerStyle, background: 'rgba(255,176,32,0.15)', borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }}>
              A shipment with this PO# already exists
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Ship Date *" error={errors.ship_date}>
              <input type="date" value={form.ship_date} onChange={e => set('ship_date', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Delivery Date" error={errors.delivery_date}>
              <input type="date" value={form.delivery_date} onChange={e => set('delivery_date', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Customer Name *" error={errors.customer_name}>
              <input type="text" value={form.customer_name} onChange={e => set('customer_name', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="City *" error={errors.city}>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="State *" error={errors.state}>
              <select value={form.state} onChange={e => set('state', e.target.value)} style={inputStyle}>
                <option value="">Select state</option>
                {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </Field>
            <Field label="Material *" error={errors.material}>
              <input type="text" value={form.material} onChange={e => set('material', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="PO# *" error={errors.po_number}>
              <input type="text" value={form.po_number} onChange={e => set('po_number', e.target.value)} onBlur={handlePOBlur} style={inputStyle} />
            </Field>
            <Field label="Carrier Name" error={errors.carrier_name}>
              <input type="text" value={form.carrier_name} onChange={e => set('carrier_name', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Tracking#" error={errors.tracking_number}>
              <input type="text" value={form.tracking_number} onChange={e => set('tracking_number', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Quantity *" error={errors.quantity}>
              <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Weight (lbs)" error={errors.weight}>
              <input type="number" min="0" step="any" value={form.weight} onChange={e => set('weight', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Total Mileage" error={errors.total_mileage}>
              <input type="number" min="0" step="any" value={form.total_mileage} onChange={e => set('total_mileage', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Special Instructions" error={errors.special_instructions}>
              <textarea value={form.special_instructions} onChange={e => set('special_instructions', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: '12px', borderRadius: '6px', border: 'none',
                background: 'var(--accent-green)', color: '#fff',
                fontWeight: 700, fontSize: '15px', cursor: saving ? 'wait' : 'pointer',
                fontFamily: 'var(--font-heading), Oswald, sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
              </button>

              {isEdit && (
                <button type="button" onClick={handleDelete} style={{
                  padding: '12px 20px', borderRadius: '6px',
                  border: showDeleteConfirm ? 'none' : '1px solid var(--accent-danger)',
                  background: showDeleteConfirm ? 'var(--accent-danger)' : 'transparent',
                  color: showDeleteConfirm ? '#fff' : 'var(--accent-danger)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}>
                  {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '12px', color: 'var(--accent-danger)', marginTop: '2px', display: 'block' }}>{error}</span>}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '15px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
};

const errorBannerStyle = {
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid var(--accent-danger)',
  background: 'rgba(255,61,61,0.1)',
  color: 'var(--accent-danger)',
  fontSize: '14px',
  marginBottom: '16px',
};
