import { useState, useRef, useEffect } from 'react'
import { X, BookOpen, Plus, Trash2, Edit2, ImagePlus, ChevronLeft, Save } from 'lucide-react'
import { useDiary } from '../hooks/useDiary'

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Entry Detail View ───────────────────────────────────────────────────────

const EntryDetail = ({ entry, onBack, onSave, onDelete, onUploadCover, onDeleteCover, uploading }) => {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  // Sync local state when the entry prop is updated from outside (e.g. after cover upload)
  useEffect(() => {
    // Only update text fields when NOT currently editing to avoid clobbering user input
    if (!editing) {
      setTitle(entry.title)
      setContent(entry.content || '')
    }
  }, [entry.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      await onSave(entry.id, { title: title.trim(), content })
      setEditing(false)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setTitle(entry.title)
    setContent(entry.content || '')
    setEditing(false)
    setError('')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = '' // reset so same file can be re-selected
    setError('')
    try {
      await onUploadCover(entry.id, file)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to upload image.')
    }
  }

  const handleDeleteCover = async () => {
    setError('')
    try {
      await onDeleteCover(entry.id)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to remove image.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(200,80,80,0.3)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
          style={{ color: '#c85050' }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded hover:bg-white/10 transition-all"
              style={{ color: '#ffa502' }}
              title="Edit entry"
            >
              <Edit2 size={15} />
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="p-1.5 rounded hover:bg-white/10 transition-all text-xs"
                style={{ color: '#a89080' }}
                title="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="p-1.5 rounded hover:bg-white/10 transition-all disabled:opacity-40"
                style={{ color: '#4caf50' }}
                title="Save"
              >
                <Save size={15} />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded hover:bg-white/10 transition-all"
            style={{ color: '#ff4757' }}
            title="Delete entry"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 mt-2 px-3 py-2 rounded-lg text-xs flex-shrink-0"
          style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)', color: '#ff6b6b' }}
        >
          {error}
        </div>
      )}

      {/* Cover image */}
      <div className="relative flex-shrink-0" style={{ height: '180px' }}>
        {entry.cover_image ? (
          <>
            <img
              src={entry.cover_image}
              alt="Entry cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-2 py-1 rounded text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'rgba(0,0,0,0.65)', color: '#f5e6d3' }}
              >
                {uploading ? 'Uploading…' : '📷 Change'}
              </button>
              <button
                onClick={handleDeleteCover}
                disabled={uploading}
                className="px-2 py-1 rounded text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'rgba(0,0,0,0.65)', color: '#ff6b6b' }}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={uploading}
            className="w-full h-full flex flex-col items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2d0f0f 0%, #6b2828 100%)', border: 'none' }}
            onClick={() => fileRef.current?.click()}
            aria-label="Add cover image"
          >
            <ImagePlus size={32} style={{ color: 'rgba(200,80,80,0.6)' }} />
            <p className="text-xs" style={{ color: 'rgba(245,230,211,0.5)' }}>
              {uploading ? 'Uploading…' : 'Add a cover image'}
            </p>
          </button>
        )}
        {/* Hidden file input — NOT inside the clickable area to avoid event bubbling */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs" style={{ color: '#a89080' }}>
          {formatDate(entry.created_at)}
          {entry.updated_at && entry.updated_at !== entry.created_at && (
            <span> · edited {formatDate(entry.updated_at)}</span>
          )}
        </p>

        {editing ? (
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent border-b text-lg font-bold outline-none pb-1"
            style={{ color: '#f5e6d3', borderColor: 'rgba(200,80,80,0.4)' }}
            placeholder="Entry title…"
            autoFocus
          />
        ) : (
          <h2 className="text-lg font-bold" style={{ color: '#f5e6d3' }}>
            {entry.title}
          </h2>
        )}

        {editing ? (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ color: '#d4b896' }}
            placeholder="Write your thoughts…"
          />
        ) : (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: entry.content ? '#d4b896' : 'rgba(168,144,128,0.5)' }}
          >
            {entry.content || 'No content yet. Click ✏️ to add your thoughts.'}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Entry List View ─────────────────────────────────────────────────────────

const EntryList = ({ entries, loading, error, onSelect, onNew }) => (
  <div className="flex flex-col h-full">
    <div
      className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
      style={{ borderColor: 'rgba(200,80,80,0.3)' }}
    >
      <h3
        className="text-lg font-bold"
        style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
      >
        📖 My Diary
      </h3>
      <button
        onClick={onNew}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)', color: '#f5e6d3' }}
      >
        <Plus size={13} /> New Entry
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: '#a89080' }}>Loading…</p>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: '#ff6b6b' }}>{error}</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={36} className="mx-auto mb-3" style={{ color: 'rgba(200,80,80,0.4)' }} />
          <p className="text-sm" style={{ color: '#a89080' }}>No entries yet.</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(168,144,128,0.6)' }}>
            Click "New Entry" to write your first one.
          </p>
        </div>
      ) : (
        entries.map(entry => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="w-full text-left rounded-xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] flex"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(200,80,80,0.25)'
            }}
          >
            <div className="flex-shrink-0 w-16 h-16">
              {entry.cover_image ? (
                <img src={entry.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #2d0f0f 0%, #6b2828 100%)' }}
                >
                  <BookOpen size={20} style={{ color: 'rgba(200,80,80,0.5)' }} />
                </div>
              )}
            </div>
            <div className="flex-1 p-2.5 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#f5e6d3' }}>
                {entry.title}
              </p>
              <p className="text-xs truncate mt-0.5" style={{ color: '#a89080' }}>
                {entry.content || 'No content'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(168,144,128,0.6)' }}>
                {formatDate(entry.created_at)}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  </div>
)

// ─── New Entry Form ───────────────────────────────────────────────────────────

const NewEntryForm = ({ onBack, onCreate, onUploadCover }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    // Validate on the client before even trying to upload
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.')
      return
    }
    setError('')
    setPendingFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const entry = await onCreate({ title: title.trim(), content })
      // Upload cover after entry is created — failure here is non-fatal
      if (pendingFile) {
        setUploading(true)
        try {
          await onUploadCover(entry.id, pendingFile)
        } catch (uploadErr) {
          // Entry was saved; just warn about the image
          console.error('Cover upload failed after entry creation:', uploadErr)
        } finally {
          setUploading(false)
        }
      }
      // onCreate navigates to detail view — nothing more needed here
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save entry. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(200,80,80,0.3)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
          style={{ color: '#c85050' }}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <h3 className="text-sm font-bold" style={{ color: '#f5e6d3' }}>
          New Entry
        </h3>
        <div style={{ width: 48 }} />
      </div>

      {error && (
        <div
          className="mx-4 mt-2 px-3 py-2 rounded-lg text-xs flex-shrink-0"
          style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)', color: '#ff6b6b' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        {/* Cover image picker */}
        <div className="relative flex-shrink-0" style={{ height: '160px' }}>
          {preview ? (
            <>
              <img src={preview} alt="Cover preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(0,0,0,0.65)', color: '#f5e6d3' }}
              >
                📷 Change
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2d0f0f 0%, #6b2828 100%)', border: 'none' }}
              aria-label="Add cover image"
            >
              <ImagePlus size={28} style={{ color: 'rgba(200,80,80,0.6)' }} />
              <p className="text-xs" style={{ color: 'rgba(245,230,211,0.5)' }}>
                Add a cover image (optional)
              </p>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Entry title…"
            required
            autoFocus
            className="w-full bg-transparent border-b text-lg font-bold outline-none pb-1"
            style={{ color: '#f5e6d3', borderColor: 'rgba(200,80,80,0.4)' }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your thoughts…"
            rows={7}
            className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
            style={{ color: '#d4b896' }}
          />
        </div>

        {/* Submit */}
        <div className="px-4 pb-4 flex-shrink-0">
          <button
            type="submit"
            disabled={saving || uploading || !title.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)', color: '#f5e6d3' }}
          >
            {saving ? 'Saving…' : uploading ? 'Uploading image…' : '✦ Save Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main DiaryModal component ───────────────────────────────────────────────

const DiaryModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('list') // 'list' | 'detail' | 'new'
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [actionError, setActionError] = useState('')

  const {
    entries,
    loading,
    error: fetchError,
    createEntry,
    updateEntry,
    deleteEntry,
    uploadCover,
    deleteCover
  } = useDiary()

  const handleOpen = () => {
    setView('list')
    setSelectedEntry(null)
    setActionError('')
    setIsOpen(true)
  }

  const handleClose = () => setIsOpen(false)

  const handleSelect = (entry) => {
    setSelectedEntry(entry)
    setActionError('')
    setView('detail')
  }

  const handleCreate = async (payload) => {
    const entry = await createEntry(payload)
    setSelectedEntry(entry)
    setView('detail')
    return entry
  }

  const handleSave = async (id, payload) => {
    const updated = await updateEntry(id, payload)
    setSelectedEntry(updated)
  }

  const handleDelete = async (id) => {
    try {
      await deleteEntry(id)
      setView('list')
      setSelectedEntry(null)
    } catch (err) {
      setActionError(err?.response?.data?.error || 'Failed to delete entry.')
    }
  }

  const handleUploadCover = async (id, file) => {
    setUploading(true)
    try {
      const result = await uploadCover(id, file)
      setSelectedEntry(prev => (prev?.id === id ? result.entry : prev))
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteCover = async (id) => {
    setUploading(true)
    try {
      const updated = await deleteCover(id)
      setSelectedEntry(prev => (prev?.id === id ? updated : prev))
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {/* Floating button — sits above the music button */}
      <button
        onClick={handleOpen}
        className="fixed right-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        style={{
          bottom: '5rem',
          background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
          border: '2px solid rgba(200,80,80,0.5)',
          zIndex: 9999,
          padding: '1rem'
        }}
        title="Open Diary"
        aria-label="Open diary"
      >
        <span className="text-2xl" role="img" aria-hidden="true">📖</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000]"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Modal — centered */}
      {isOpen && (
        <div
          className="fixed z-[10001] shadow-2xl rounded-2xl overflow-hidden"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '420px',
            height: '600px',
            background: 'linear-gradient(145deg, rgba(45,10,10,0.98) 0%, rgba(26,5,5,0.98) 100%)',
            border: '2px solid rgba(200,80,80,0.5)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column'
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Diary"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full transition-all"
            style={{ 
              color: '#ff6b6b',
              background: 'rgba(0,0,0,0.4)',
              zIndex: 50,
              border: '1px solid rgba(255,71,87,0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,71,87,0.2)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.4)'
            }}
            aria-label="Close diary"
          >
            <X size={18} />
          </button>

          {/* Global action error (e.g. delete failed) */}
          {actionError && (
            <div
              className="mx-4 mt-2 px-3 py-2 rounded-lg text-xs absolute top-10 left-0 right-0 z-20"
              style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)', color: '#ff6b6b' }}
            >
              {actionError}
              <button
                onClick={() => setActionError('')}
                className="ml-2 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col">
            {view === 'list' && (
              <EntryList
                entries={entries}
                loading={loading}
                error={fetchError}
                onSelect={handleSelect}
                onNew={() => setView('new')}
              />
            )}

            {view === 'new' && (
              <NewEntryForm
                onBack={() => setView('list')}
                onCreate={handleCreate}
                onUploadCover={handleUploadCover}
              />
            )}

            {view === 'detail' && selectedEntry && (
              <EntryDetail
                entry={selectedEntry}
                onBack={() => setView('list')}
                onSave={handleSave}
                onDelete={handleDelete}
                onUploadCover={handleUploadCover}
                onDeleteCover={handleDeleteCover}
                uploading={uploading}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default DiaryModal
