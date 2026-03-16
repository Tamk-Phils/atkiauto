import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, X, Check, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { adminSupabase } from '../lib/adminSupabase'

/* ─── Styles ─────────────────────────────────────────── */
const th = { padding: '0.875rem 1.25rem', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#94a3b8', textAlign: 'left' }
const td = { padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#334155' }
const inputStyle = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', fontFamily: 'inherit', background: '#fff', color: '#0f172a', outline: 'none' }
const labelStyle = { fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.14em', display: 'block', marginBottom: '0.4rem' }

const EMPTY = { make: '', model: '', year: '', type: '', price: '', fuel: '', mileage: '', transmission: 'Automatic', status: 'available', reservation_fee: '' }

/* ─── Image Uploader Component ───────────────────────── */
const ImageUploader = ({ existingImages = [], onImagesChange }) => {
  const [previews, setPreviews] = useState(existingImages)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef()

  const handleFiles = async (files) => {
    if (!files.length) return
    setUploading(true)
    setProgress(0)
    const uploaded = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const path = `cars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await adminSupabase.storage
        .from('car-images')
        .upload(path, file, { upsert: false })

      if (!error) {
        const { data: urlData } = adminSupabase.storage.from('car-images').getPublicUrl(path)
        uploaded.push(urlData.publicUrl)
      } else {
        console.error('Upload error:', error)
      }
      setProgress(Math.round(((i + 1) / files.length) * 100))
    }

    const newPreviews = [...previews, ...uploaded]
    setPreviews(newPreviews)
    onImagesChange(newPreviews)
    setUploading(false)
    setProgress(0)
  }

  const removeImage = (idx) => {
    const updated = previews.filter((_, i) => i !== idx)
    setPreviews(updated)
    onImagesChange(updated)
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div style={{ gridColumn: '1/-1' }}>
      <label style={labelStyle}>Car Photos</label>

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #e2e8f0', borderRadius: '0.75rem',
          padding: '2rem', textAlign: 'center', cursor: 'pointer',
          background: '#f8fafc', transition: 'border-color 0.2s, background 0.2s',
          marginBottom: '1rem',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = '#fff5f5' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(Array.from(e.target.files))}
        />
        {uploading ? (
          <div>
            <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginBottom: '0.75rem' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                style={{ height: '100%', background: '#ef4444', borderRadius: 999 }}
              />
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Uploading… {progress}%</p>
          </div>
        ) : (
          <>
            <Upload size={28} style={{ color: '#cbd5e1', margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Click or drag & drop images here
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>PNG, JPG, WEBP — multiple files supported</p>
          </>
        )}
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {previews.map((url, idx) => (
            <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: '0.625rem', overflow: 'hidden', border: idx === 0 ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>
              <img src={url} alt={`Car photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {idx === 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#ef4444', color: '#fff', fontSize: '0.45rem', fontWeight: 800, textAlign: 'center', padding: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Main
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(idx) }}
                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────── */
const InventoryManager = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [formImages, setFormImages] = useState([])
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('created_at', { ascending: false })
    if (data) setCars(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCars()
    const channel = supabase.channel('rt-inventory-mgr')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cars' }, p => setCars(prev => [p.new, ...prev]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cars' }, p => setCars(prev => prev.map(c => c.id === p.new.id ? p.new : c)))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'cars' }, p => setCars(prev => prev.filter(c => c.id !== p.old.id)))
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const openAdd = () => {
    setForm(EMPTY)
    setFormImages([])
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (car) => {
    setForm({ make: car.make, model: car.model, year: car.year, type: car.type || '', price: car.price, fuel: car.fuel || '', mileage: car.mileage || '', transmission: car.transmission || 'Automatic', status: car.status || 'available', reservation_fee: car.reservation_fee || '' })
    setFormImages(car.images || (car.image_url ? [car.image_url] : []))
    setEditId(car.id)
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      year: parseInt(form.year),
      price: parseFloat(form.price),
      reservation_fee: parseFloat(form.reservation_fee || 0),
      images: formImages,
      image_url: formImages[0] || null,
    }
    let error
    if (editId) {
      const res = await adminSupabase.from('cars').update(payload).eq('id', editId)
      error = res.error
    } else {
      const res = await adminSupabase.from('cars').insert([payload])
      error = res.error
    }
    setSaving(false)
    if (error) {
      console.error('Save error:', error)
      showToast(`Error: ${error.message}`)
    } else {
      showToast('Vehicle saved successfully!', 'success')
      setShowForm(false)
      setForm(EMPTY)
      setFormImages([])
      setEditId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this vehicle from inventory?')) return
    const { error } = await adminSupabase.from('cars').delete().eq('id', id)
    if (error) showToast(`Delete failed: ${error.message}`)
  }

  const filtered = cars.filter(c =>
    `${c.make ?? ''} ${c.model ?? ''} ${c.year ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
              background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: toast.type === 'success' ? '#15803d' : '#dc2626',
              padding: '0.875rem 1.25rem', borderRadius: '0.75rem',
              fontWeight: 700, fontSize: '0.875rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              maxWidth: 360,
            }}>
            <AlertCircle size={16} />{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#0a0a0b', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Inventory <span style={{ color: '#ef4444' }}>Manager</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Add vehicles with photo uploads — changes are live.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', padding: '0.35rem 0.875rem' }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>Live</span>
          </div>
          <button onClick={openAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.625rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0' : '1.5rem' }}>
            <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              style={{ 
                background: '#fff', 
                borderRadius: isMobile ? '0' : '1.25rem', 
                padding: isMobile ? '1.5rem' : '2rem', 
                width: '100%', 
                maxWidth: 700, 
                height: isMobile ? '100vh' : 'auto',
                maxHeight: isMobile ? '100vh' : '90vh', 
                overflowY: 'auto' 
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0a0a0b' }}>
                  {editId ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: '1rem' 
              }}>
                {/* Fields */}
                {[
                  { key: 'make',   label: 'Make',         placeholder: 'Tesla' },
                  { key: 'model',  label: 'Model',        placeholder: 'Model S' },
                  { key: 'year',   label: 'Year',         placeholder: '2024', type: 'number' },
                  { key: 'price',  label: 'Price (USD)',  placeholder: '89900', type: 'number' },
                  { key: 'reservation_fee', label: 'Reservation Fee (USD)', placeholder: '500', type: 'number' },
                  { key: 'type',   label: 'Vehicle Type', placeholder: 'Electric Sedan' },
                  { key: 'fuel',   label: 'Fuel Type',    placeholder: 'Electric' },
                  { key: 'mileage',label: 'Mileage',      placeholder: '1,200 mi' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input required type={type || 'text'} placeholder={placeholder}
                      style={inputStyle} value={form[key] || ''}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      onFocus={e => e.target.style.borderColor = '#ef4444'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Transmission</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
                    <option>Automatic</option><option>Manual</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                {/* Multi-Image Uploader */}
                <ImageUploader
                  existingImages={formImages}
                  onImagesChange={setFormImages}
                />

                {/* Actions */}
                <div style={{ 
                  gridColumn: '1/-1', 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column-reverse' : 'row',
                  gap: '0.75rem', 
                  justifyContent: 'flex-end', 
                  marginTop: '1rem' 
                }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ width: isMobile ? '100%' : 'auto', padding: '0.75rem 1.5rem', border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    style={{ width: isMobile ? '100%' : 'auto', padding: '0.75rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}>
                    <Check size={16} />{saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search by make, model, year…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', color: '#0a0a0b', flex: 1, fontFamily: 'inherit', background: 'transparent' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Vehicle', 'Photos', 'Status', 'Price / Fee', 'Specs', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>Loading inventory…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No vehicles yet. Click "Add Vehicle" to start.</td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map(car => {
                    const allImages = car.images?.length > 0 ? car.images : (car.image_url ? [car.image_url] : [])
                    return (
                      <motion.tr key={car.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                            <div style={{ width: 60, height: 38, borderRadius: '0.5rem', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                              {allImages[0]
                                ? <img src={allImages[0]} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><ImageIcon size={16} color="#cbd5e1" /></div>
                              }
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, color: '#0a0a0b', fontSize: '0.875rem' }}>{car.year} {car.make} {car.model}</p>
                              <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{car.type}</p>
                            </div>
                          </div>
                        </td>
                        <td style={td}>
                          {/* Photo strip */}
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            {allImages.slice(0, 3).map((img, idx) => (
                              <div key={idx} style={{ width: 28, height: 28, borderRadius: '0.375rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                            {allImages.length > 3 && (
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>+{allImages.length - 3}</span>
                            )}
                            {allImages.length === 0 && <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>None</span>}
                          </div>
                        </td>
                        <td style={td}>
                          <span style={{
                            display: 'inline-block', padding: '0.25rem 0.6rem', borderRadius: '999px',
                            fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                            background: car.status === 'available' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                            color: car.status === 'available' ? '#16a34a' : '#ef4444',
                            border: `1px solid ${car.status === 'available' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                          }}>{car.status}</span>
                        </td>
                        <td style={td}>
                          <div style={{ fontWeight: 800 }}>${parseInt(car.price || 0).toLocaleString()}</div>
                          <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, marginTop: '0.25rem' }}>Fee: ${parseInt(car.reservation_fee || 0).toLocaleString()}</div>
                        </td>
                        <td style={td}>
                          <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                            <span><span style={{ color: '#94a3b8' }}>Fuel:</span> {car.fuel}</span>
                            <span><span style={{ color: '#94a3b8' }}>Miles:</span> {car.mileage}</span>
                          </div>
                        </td>
                        <td style={td}>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button onClick={() => openEdit(car)} title="Edit"
                              style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(car.id)} title="Delete"
                              style={{ width: 32, height: 32, borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default InventoryManager
