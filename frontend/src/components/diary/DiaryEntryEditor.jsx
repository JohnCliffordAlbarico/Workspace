import { useState, useRef } from 'react'
import { ImagePlus } from 'lucide-react'

const DiaryEntryEditor = ({ entry, onSave, onCancel, onUploadCover, onSetCoverReference, uploading }) => {
  const [title, setTitle] = useState(entry?.title || '')
  const [content, setContent] = useState(entry?.content || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [pendingFile, setPendingFile] = useState(null)
  const [preview, setPreview] = useState(entry?.cover_image || localStorage.getItem('diary_default_cover') || null)
  const [useDefaultCover, setUseDefaultCover] = useState(!entry?.cover_image && !!localStorage.getItem('diary_default_cover'))
  const fileRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
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
    setUseDefaultCover(false)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemoveCover = () => {
    setPendingFile(null)
    setPreview(null)
    setUseDefaultCover(false)
  }

  const handleUseDefaultCover = () => {
    const defaultCover = localStorage.getItem('diary_default_cover')
    if (defaultCover) {
      setPreview(defaultCover)
      setPendingFile(null)
      setUseDefaultCover(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const saved = await onSave({ title: title.trim(), content })
      if (saved?.id) {
        if (pendingFile) {
          try {
            await onUploadCover(saved.id, pendingFile)
          } catch (uploadErr) {
            console.error('Cover upload failed:', uploadErr)
          }
        } else if (useDefaultCover && preview) {
          try {
            // Reference the existing image by URL instead of re-uploading
            if (onSetCoverReference) {
              await onSetCoverReference(saved.id, preview)
            } else {
              // Fallback: fetch and re-upload if reference endpoint not available
              const response = await fetch(preview)
              const blob = await response.blob()
              const file = new File([blob], 'cover.jpg', { type: blob.type })
              await onUploadCover(saved.id, file)
            }
          } catch (uploadErr) {
            console.error('Default cover assignment failed:', uploadErr)
          }
        }
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save. Please try again.')
      setSaving(false)
      return
    }
    setSaving(false)
    onCancel?.()
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — Cover image (40%) */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ width: '40%', background: 'linear-gradient(135deg, #1a0808 0%, #3d1515 50%, #1a0808 100%)' }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(26,5,5,0.5) 70%, rgba(26,5,5,0.95) 100%)' }} />
            {/* Cover controls */}
            <div className="absolute bottom-3 right-3 flex gap-1.5 z-20">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#f5e6d3', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {uploading ? 'Uploading...' : 'Change'}
              </button>
              <button
                type="button"
                onClick={handleRemoveCover}
                disabled={uploading}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#ff6b6b', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
              aria-label="Add cover image"
            >
              <ImagePlus size={32} style={{ color: 'rgba(200,80,80,0.4)' }} />
              <p className="text-xs" style={{ color: 'rgba(245,230,211,0.4)' }}>
                Add a cover image
              </p>
            </button>
            {localStorage.getItem('diary_default_cover') && (
              <button
                type="button"
                onClick={handleUseDefaultCover}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                style={{ background: 'rgba(200,80,80,0.2)', color: 'rgba(245,230,211,0.6)', border: '1px solid rgba(200,80,80,0.2)' }}
              >
                Use last cover image
              </button>
            )}
            <span className="text-5xl opacity-10 mt-2">📖</span>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Right panel — Content (60%) */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden" style={{ background: 'rgba(26,5,5,0.6)' }}>
        {error && (
          <div
            className="mx-6 mt-4 px-4 py-2.5 rounded-xl text-xs flex-shrink-0"
            style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.25)', color: '#ff6b6b' }}
          >
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Entry title..."
            required
            autoFocus
            className="w-full bg-transparent outline-none pb-3"
            style={{
              color: '#f5e6d3',
              fontFamily: "'Cinzel', serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              borderBottom: '1px solid rgba(200,80,80,0.15)',
              letterSpacing: '0.01em'
            }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your thoughts..."
            className="w-full bg-transparent outline-none resize-none"
            style={{
              color: '#c4a882',
              fontFamily: "'Crimson Text', serif",
              fontSize: '1.1rem',
              lineHeight: '2',
              letterSpacing: '0.005em',
              minHeight: '300px'
            }}
          />
        </div>

        {/* Save / Cancel bar */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(200,80,80,0.2)' }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
            style={{
              color: '#a89080',
              border: '1px solid rgba(200,80,80,0.2)'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="px-5 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
              color: '#f5e6d3'
            }}
          >
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DiaryEntryEditor
