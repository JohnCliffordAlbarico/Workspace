import { useState, useRef } from 'react'
import { ChevronLeft, Edit2, Trash2, Save, ImagePlus, BookOpen } from 'lucide-react'

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const DiaryEntryDetail = ({ entry, onBack, onUpdate, onDelete, onUploadCover, onDeleteCover, uploading }) => {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  if (!entry) return null

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      await onUpdate(entry.id, { title: title.trim(), content })
      setEditing(false)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(entry.id)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete.')
    }
  }

  const handleCoverFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) { setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return }
    setError('')
    try { await onUploadCover(entry.id, file) } catch (err) { setError(err?.response?.data?.error || 'Failed.') }
  }

  const handleDeleteCover = async () => {
    try { await onDeleteCover(entry.id) } catch (err) { setError(err?.response?.data?.error || 'Failed.') }
  }

  const hasImage = !!entry.cover_image

  return (
    <div className="flex h-full overflow-hidden book-entry">
      {/* ═══ LEFT PANEL — Image ═══ */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ width: '45%', background: 'linear-gradient(135deg, #1a0808 0%, #3d1515 50%, #1a0808 100%)' }}
      >
        {hasImage ? (
          <>
            <img src={entry.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(26,5,5,0.5) 70%, rgba(26,5,5,0.95) 100%)' }} />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-6xl opacity-20">📖</span>
            {!editing && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all hover:opacity-80"
                style={{ color: 'rgba(245,230,211,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ImagePlus size={13} /> Add cover
              </button>
            )}
          </div>
        )}

        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm transition-all hover:opacity-80 px-4 py-2 rounded-full"
            style={{ color: '#f5e6d3', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)} className="p-2 rounded-full transition-all hover:opacity-80" style={{ color: '#f5e6d3', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Edit2 size={16} />
                </button>
                <button onClick={handleDelete} className="p-2 rounded-full transition-all hover:opacity-80" style={{ color: '#f5e6d3', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving || !title.trim()} className="p-2 rounded-full transition-all hover:opacity-80 disabled:opacity-40" style={{ color: '#7bed9f', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Save size={16} />
                </button>
                <button onClick={() => { setEditing(false); setError(''); setTitle(entry.title); setContent(entry.content || '') }} className="px-3 py-1.5 rounded-full text-xs transition-all hover:opacity-80" style={{ color: '#a89080', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom: title + date on gradient */}
        {hasImage && (
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-5 z-10">
            <p className="text-xs tracking-[0.18em] uppercase mb-2" style={{ color: 'rgba(245,230,211,0.5)', fontFamily: "'Crimson Text', serif" }}>
              {formatDate(entry.created_at)}
              {entry.updated_at && entry.updated_at !== entry.created_at && <span> — edited</span>}
            </p>
            <h1 style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3', fontSize: '1.35rem', fontWeight: 700, lineHeight: '1.3', letterSpacing: '0.015em', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              {entry.title}
            </h1>
          </div>
        )}

        {/* Edit mode: cover controls */}
        {editing && (
          <div className="absolute bottom-3 right-3 flex gap-1.5 z-20">
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50" style={{ background: 'rgba(0,0,0,0.55)', color: '#f5e6d3', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {uploading ? 'Uploading...' : 'Change'}
            </button>
            {hasImage && (
              <button onClick={handleDeleteCover} disabled={uploading} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50" style={{ background: 'rgba(0,0,0,0.55)', color: '#ff6b6b', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Remove
              </button>
            )}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleCoverFileChange} />
      </div>

      {/* ═══ RIGHT PANEL — Content ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'rgba(26,5,5,0.6)' }}>
        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl text-xs flex-shrink-0" style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.25)', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-8">
          {!hasImage && (
            <p className="text-xs tracking-[0.18em] uppercase mb-5" style={{ color: 'rgba(168,144,128,0.45)', fontFamily: "'Crimson Text', serif" }}>
              {formatDate(entry.created_at)}
              {entry.updated_at && entry.updated_at !== entry.created_at && <span> — edited</span>}
            </p>
          )}

          {/* Decorative divider */}
          {!hasImage && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,80,80,0.2), transparent)' }} />
              <span className="text-xs opacity-30">✦</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,80,80,0.2), transparent)' }} />
            </div>
          )}

          {editing ? (
            <div className="space-y-6">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent outline-none pb-3"
                style={{ color: '#f5e6d3', fontFamily: "'Cinzel', serif", fontSize: '1.8rem', fontWeight: 700, borderBottom: '1px solid rgba(200,80,80,0.15)', letterSpacing: '0.01em' }}
                placeholder="Title"
                autoFocus
              />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-transparent outline-none resize-none"
                style={{ color: '#c4a882', fontFamily: "'Crimson Text', serif", fontSize: '1.1rem', lineHeight: '2', letterSpacing: '0.005em', minHeight: '350px' }}
                placeholder="Write your thoughts..."
              />
            </div>
          ) : (
            <div>
              <h1 style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3', fontSize: '1.8rem', fontWeight: 700, lineHeight: '1.35', letterSpacing: '0.01em', marginBottom: '1.5rem' }}>
                {entry.title}
              </h1>
              {entry.content ? (
                <div className="whitespace-pre-wrap" style={{ color: '#c4a882', fontFamily: "'Crimson Text', serif", fontSize: '1.1rem', lineHeight: '2', letterSpacing: '0.005em' }}>
                  {entry.content}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <BookOpen size={32} style={{ color: 'rgba(168,144,128,0.2)' }} />
                  <p style={{ color: 'rgba(168,144,128,0.3)', fontFamily: "'Crimson Text', serif", fontSize: '1rem', fontStyle: 'italic' }}>
                    No words yet...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiaryEntryDetail
