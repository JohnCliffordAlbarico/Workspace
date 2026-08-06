import { useState, useRef } from 'react'
import { ImagePlus } from 'lucide-react'

const DiaryEntryEditor = ({ entry, onSave, onCancel, onUploadCover, uploading }) => {
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
            const response = await fetch(preview)
            const blob = await response.blob()
            const file = new File([blob], 'cover.jpg', { type: blob.type })
            await onUploadCover(saved.id, file)
          } catch (uploadErr) {
            console.error('Default cover upload failed:', uploadErr)
          }
        }
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to save. Please try again.')
      setSaving(false)
      return
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div
          className="mx-4 mt-2 px-3 py-2 rounded-lg text-xs flex-shrink-0"
          style={{ background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)', color: '#ff6b6b' }}
        >
          {error}
        </div>
      )}

      {/* Cover Image Area */}
      <div className="relative flex-shrink-0" style={{ height: '160px' }}>
        {preview ? (
          <>
            <img src={preview} alt="Cover preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(0,0,0,0.65)', color: '#f5e6d3' }}
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveCover}
                className="px-2 py-1 rounded text-xs"
                style={{ background: 'rgba(255,71,87,0.65)', color: '#f5e6d3' }}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2d0f0f 0%, #6b2828 100%)', border: 'none' }}
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2"
              aria-label="Add cover image"
            >
              <ImagePlus size={28} style={{ color: 'rgba(200,80,80,0.6)' }} />
              <p className="text-xs" style={{ color: 'rgba(245,230,211,0.5)' }}>
                Add a cover image (optional)
              </p>
            </button>
            {localStorage.getItem('diary_default_cover') && (
              <button
                type="button"
                onClick={handleUseDefaultCover}
                className="text-xs px-3 py-1 rounded"
                style={{ background: 'rgba(200,80,80,0.3)', color: '#f5e6d3' }}
              >
                Use last cover image
              </button>
            )}
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

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Entry title..."
          required
          autoFocus
          className="w-full bg-transparent border-b text-lg font-bold outline-none pb-1"
          style={{ color: '#f5e6d3', borderColor: 'rgba(200,80,80,0.4)' }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your thoughts..."
          rows={8}
          className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
          style={{ color: '#d4b896' }}
        />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2 flex-shrink-0">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: 'rgba(200, 80, 80, 0.2)',
            border: '1px solid rgba(200, 80, 80, 0.3)',
            color: '#f5e6d3'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || uploading || !title.trim()}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)', color: '#f5e6d3' }}
        >
          {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Entry'}
        </button>
      </div>
    </div>
  )
}

export default DiaryEntryEditor
