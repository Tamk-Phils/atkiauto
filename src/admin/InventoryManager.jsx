import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, X, Check, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { adminSupabase } from '../lib/adminSupabase'

/* ─── Constants ─────────────────────────────────────── */
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
    <div className="sm:col-span-2 mt-4">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Car Photos</label>

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 hover:border-primary hover:bg-red-50 transition-all mb-4 group"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(Array.from(e.target.files))}
        />
        {uploading ? (
          <div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-3">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <p className="text-slate-500 text-sm font-bold">Uploading… {progress}%</p>
          </div>
        ) : (
          <>
            <Upload size={32} className="text-slate-300 mx-auto mb-3 group-hover:text-primary transition-colors" />
            <p className="text-slate-600 text-sm font-bold mb-1">
              Click or drag & drop images here
            </p>
            <p className="text-slate-400 text-xs font-medium">PNG, JPG, WEBP — multiple files supported</p>
          </>
        )}
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((url, idx) => (
            <div key={idx} className={`relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border ${idx === 0 ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200'}`}>
              <img src={url} alt={`Car photo ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[8px] font-black text-center py-0.5 uppercase tracking-widest">
                  Main Photo
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(idx) }}
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black text-white w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <X size={12} />
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
    setForm({ 
      make: car.make, 
      model: car.model, 
      year: car.year, 
      type: car.type || '', 
      price: car.price, 
      fuel: car.fuel || '', 
      mileage: car.mileage || '', 
      transmission: car.transmission || 'Automatic', 
      status: car.status || 'available', 
      reservation_fee: car.reservation_fee || '' 
    })
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
    <div className="relative max-w-full overflow-x-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-6 right-6 z-[9999] px-5 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-2xl max-w-[360px] border ${
              toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            <AlertCircle size={16} />{toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 sm:gap-6 min-w-0">
        <div className="min-w-0 max-w-full">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-1 truncate">
            Inventory <span className="text-primary">Manager</span>
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-sm font-medium truncate max-w-full">Add vehicles with photo uploads — changes are live.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 flex-shrink-0">
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">Live</span>
          </div>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap">
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center lg:p-6 overflow-hidden">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-none lg:rounded-3xl p-6 lg:p-10 w-full max-w-[800px] h-full lg:h-auto lg:max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-[#0a0a0b] tracking-tight italic uppercase">
                    {editId ? 'Edit' : 'New'} <span className="text-primary">Vehicle</span>
                  </h2>
                  <p className="text-text-muted text-xs font-medium">Fill in the details below to update inventory.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block leading-none">{label}</label>
                    <input required type={type || 'text'} placeholder={placeholder}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                      value={form[key] || ''}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block leading-none">Transmission</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-primary focus:bg-white cursor-pointer"
                    value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}>
                    <option>Automatic</option><option>Manual</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block leading-none">Status</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-primary focus:bg-white cursor-pointer"
                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <ImageUploader
                  existingImages={formImages}
                  onImagesChange={setFormImages}
                />

                <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-3 justify-end mt-8 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-8 py-3.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="px-8 py-3.5 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    <Check size={18} />
                    {saving ? 'Saving…' : editId ? 'Save Changes' : 'Confirm Vehicle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-w-0 w-full">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by make, model, year…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-slate-200 transition-all" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 italic">
            {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50">
                {['Vehicle', 'Photos', 'Status', 'Price / Fee', 'Specs', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">Loading inventory…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold text-sm italic">No vehicles matched your search.</td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map(car => {
                    const images = car.images?.length > 0 ? car.images : (car.image_url ? [car.image_url] : [])
                    return (
                      <motion.tr key={car.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {images[0]
                                ? <img src={images[0]} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={16} className="text-slate-300" /></div>
                              }
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{car.year} {car.make} {car.model}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">{car.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 items-center">
                            {images.slice(0, 3).map((img, idx) => (
                              <div key={idx} className="w-7 h-7 rounded-md overflow-hidden ring-1 ring-slate-200 shadow-sm shrink-0">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {images.length > 3 && (
                              <span className="text-[10px] font-black text-slate-400 ml-1">+{images.length - 3}</span>
                            )}
                            {images.length === 0 && <span className="text-[10px] font-black text-slate-300 uppercase italic">None</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            car.status === 'available' ? 'bg-green-50 border-green-100 text-green-600' :
                            car.status === 'reserved' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                            'bg-red-50 border-red-100 text-red-600'
                          }`}>
                            <div className={`w-1 h-1 rounded-full mr-1.5 ${
                              car.status === 'available' ? 'bg-green-500' :
                              car.status === 'reserved' ? 'bg-amber-500' :
                              'bg-red-500'
                            }`} />
                            {car.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-sm truncate tracking-tight">${parseInt(car.price || 0).toLocaleString()}</span>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5 whitespace-nowrap">Fee: ${parseInt(car.reservation_fee || 0).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                          <div className="truncate">Fuel: {car.fuel}</div>
                          <div className="truncate">Miles: {car.mileage}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(car)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(car.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                              <Trash2 size={16} />
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
