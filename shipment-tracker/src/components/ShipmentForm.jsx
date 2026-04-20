'use client';
import { useState, useEffect } from 'react';
import { US_STATES } from '../lib/constants';
import { todayISO } from '../utils/formatters';

const TRAILER_TYPES = ['Flatbed', 'Stepdeck', 'Hotshot', 'Box Truck', 'Sprinter Van', 'LTL', 'FOB'];

const REQUIRED_FIELDS = ['ship_date', 'customer_name', 'city', 'state', 'po_number', 'loading_building'];

const BUILDINGS = ['Building A', 'Building B', 'Building C'];

const INITIAL = {
  ship_date: '',
  delivery_date: '',
  customer_name: '',
  city: '',
  state: '',
  po_number: '',
  carrier_name: '',
  tracking_number: '',
  trailer_type: '',
  loading_building: '',
  weight: '',
  total_mileage: '',
  special_instructions: '',
  status: 'Pending',
};

const BLANK_MATERIAL = { quantity: '', material_name: '' };

export default function ShipmentForm({ isOpen, onClose, onSave, editingShipment, onDelete, checkDuplicatePO }) {
  const [form, setForm] = useState(INITIAL);
  const [materials, setMaterials] = useState([{ ...BLANK_MATERIAL }]);
  const [deliveryTBD, setDeliveryTBD] = useState(false);
  const [errors, setErrors] = useState({});
  const [duplicatePO, setDuplicatePO] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingShipment;

  useEffect(() => {
    if (isOpen) {
      if (editingShipment) {
        const isTBD = !editingShipment.delivery_date;
        setDeliveryTBD(isTBD);
        setForm({
          ship_date: editingShipment.ship_date || '',
          delivery_date: editingShipment.delivery_date || '',
          customer_name: editingShipment.customer_name || '',
          city: editingShipment.city || '',
          state: editingShipment.state || '',
          po_number: editingShipment.po_number || '',
          carrier_name: editingShipment.carrier_name || '',
          tracking_number: editingShipment.tracking_number || '',
          trailer_type: editingShipment.trailer_type || '',
          loading_building: editingShipment.loading_building || 'Building A',
          weight: editingShipment.weight ?? '',
          total_mileage: editingShipment.total_mileage ?? '',
          special_instructions: editingShipment.special_instructions || '',
          status: editingShipment.status || 'Pending',
        });
        // Populate materials from shipment_materials, or fall back to legacy material/quantity
        if (editingShipment.shipment_materials && editingShipment.shipment_materials.length > 0) {
          setMaterials(editingShipment.shipment_materials.map(m => ({
            quantity: m.quantity || '',
            material_name: m.material_name || '',
          })));
        } else if (editingShipment.material) {
          setMaterials([{ quantity: String(editingShipment.quantity || ''), material_name: editingShipment.material }]);
        } else {
          setMaterials([{ ...BLANK_MATERIAL }]);
        }
      } else {
        setForm({ ...INITIAL, ship_date: todayISO() });
        setMaterials([{ ...BLANK_MATERIAL }]);
        setDeliveryTBD(false);
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

  const setMaterial = (index, field, value) => {
    setMaterials(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
    if (errors[`material_${index}_${field}`]) {
      setErrors(prev => { const n = { ...prev }; delete n[`material_${index}_${field}`]; return n; });
    }
  };

  const addMaterial = () => setMaterials(prev => [...prev, { ...BLANK_MATERIAL }]);

  const removeMaterial = (index) => {
    if (materials.length === 1) return;
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    for (const f of REQUIRED_FIELDS) {
      const v = form[f];
      if (v === '' || v === null || v === undefined) errs[f] = 'Required';
    }
    // Validate each material row
    materials.forEach((m, i) => {
      if (!m.material_name.trim()) errs[`material_${i}_material_name`] = 'Required';
    });
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
        weight: form.weight !== '' ? Number(form.weight) : null,
        total_mileage: form.total_mileage !== '' ? Number(form.total_mileage) : null,
        delivery_date: deliveryTBD ? null : (form.delivery_date || null),
        carrier_name: form.carrier_name || null,
        tracking_number: form.tracking_number || null,
        trailer_type: form.trailer_type || null,
        special_instructions: form.special_instructions || null,
        materials: materials.filter(m => m.material_name.trim()),
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
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={form.delivery_date}
                  onChange={e => set('delivery_date', e.target.value)}
                  disabled={deliveryTBD}
                  style={{ ...inputStyle, flex: 1, opacity: deliveryTBD ? 0.4 : 1, cursor: deliveryTBD ? 'not-allowed' : 'auto' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={deliveryTBD}
                    onChange={e => {
                      setDeliveryTBD(e.target.checked);
                      if (e.target.checked) set('delivery_date', '');
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-shipped)' }}
                  />
                  TBD
                </label>
              </div>
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
            <Field label="PO# *" error={errors.po_number}>
              <input type="text" value={form.po_number} onChange={e => set('po_number', e.target.value)} onBlur={handlePOBlur} style={inputStyle} />
            </Field>

            <Field label="Loading at Building *" error={errors.loading_building}>
              <select value={form.loading_building} onChange={e => set('loading_building', e.target.value)} style={inputStyle}>
                <option value="">Select building</option>
                {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>

            {/* Dynamic Materials List */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Materials *
              </label>
              {materials.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <div style={{ flex: '0 0 100px' }}>
                    <input
                      type="text"
                      placeholder="Qty (e.g. 600ea)"
                      value={m.quantity}
                      onChange={e => setMaterial(i, 'quantity', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Material name *"
                      value={m.material_name}
                      onChange={e => setMaterial(i, 'material_name', e.target.value)}
                      style={{ ...inputStyle, borderColor: errors[`material_${i}_material_name`] ? 'var(--accent-danger)' : undefined }}
                    />
                    {errors[`material_${i}_material_name`] && (
                      <span style={{ fontSize: '12px', color: 'var(--accent-danger)', marginTop: '2px', display: 'block' }}>Required</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMaterial(i)}
                    disabled={materials.length === 1}
                    style={{
                      background: 'none', border: 'none', cursor: materials.length === 1 ? 'default' : 'pointer',
                      color: materials.length === 1 ? 'var(--border)' : 'var(--accent-danger)',
                      fontSize: '18px', padding: '10px 4px', lineHeight: 1,
                    }}
                    title="Remove row"
                  >
                    🗑
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMaterial}
                style={{
                  background: 'none', border: '1px dashed var(--border)', borderRadius: '6px',
                  color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px',
                  padding: '6px 12px', width: '100%', textAlign: 'center',
                }}
              >
                + Add material
              </button>
            </div>

            <Field label="Trailer Type" error={errors.trailer_type}>
              <select value={form.trailer_type} onChange={e => set('trailer_type', e.target.value)} style={inputStyle}>
                <option value="">Select type</option>
                {TRAILER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Carrier Name" error={errors.carrier_name}>
              <input type="text" value={form.carrier_name} onChange={e => set('carrier_name', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Tracking#" error={errors.tracking_number}>
              <input type="text" value={form.tracking_number} onChange={e => set('tracking_number', e.target.value)} style={inputStyle} />
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
