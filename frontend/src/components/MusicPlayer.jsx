import { useState, useEffect, useRef } from 'react'
import { useMusicPlayer } from '../hooks/useMusicPlayer'
import ConfirmationModal from '../pages/dashboard/modal/ConfirmationModal'

const MusicPlayer = () => {
  const {
    currentPlatform,
    currentPlaylist,
    activeSpotify,
    activeYoutube,
    loading,
    uploading,
    uploadProgress,
    switchPlatform,
    getPlaylistsByPlatform,
    createPreference,
    updatePreference,
    deletePreference,
    uploadCover,
    deleteCover,
    setActivePlaylist
  } = useMusicPlayer()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [volume, setVolume] = useState(50)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    playlist_name: '',
    playlist_url: '',
    platform: 'spotify'
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  // Load volume from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('musicVolume')
    if (savedVolume) {
      setVolume(parseInt(savedVolume))
    }
  }, [])

  // Save volume to localStorage
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume)
    localStorage.setItem('musicVolume', newVolume.toString())
    if (currentPlaylist) {
      updatePreference(currentPlaylist.id, { volume: newVolume })
    }
  }

  const getEmbedUrl = (url, platform) => {
    if (platform === 'spotify') {
      // Convert Spotify URL to embed URL
      // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
      // to https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M
      if (url.includes('open.spotify.com')) {
        return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
      }
      return url
    } else if (platform === 'youtube') {
      // Convert YouTube URL to embed URL
      // https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
      // to https://www.youtube.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
      if (url.includes('youtube.com/playlist')) {
        const listId = url.split('list=')[1]?.split('&')[0]
        return `https://www.youtube.com/embed/videoseries?list=${listId}`
      }
      return url
    }
    return url
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB')
      return
    }

    setError('')
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const newPref = await createPreference({
        ...formData,
        is_active: true
      })

      // Upload cover if selected
      if (selectedFile && newPref.id) {
        await uploadCover(newPref.id, selectedFile)
      }

      setSuccess('Playlist added successfully!')
      setTimeout(() => setSuccess(''), 3000)
      setShowAddForm(false)
      setFormData({ playlist_name: '', playlist_url: '', platform: 'spotify' })
      setSelectedFile(null)
      setImagePreview(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add playlist')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    
    try {
      await deletePreference(deleteTarget)
      setSuccess('Playlist removed successfully!')
      setTimeout(() => setSuccess(''), 3000)
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete playlist')
    }
  }

  if (loading) return null

  return (
    <>
      {/* Minimized Button */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed right-4 bottom-4 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
            border: '2px solid rgba(200, 80, 80, 0.5)',
            zIndex: 9999
          }}
          title="Open Music Player"
        >
          <span className="text-2xl">🎵</span>
        </button>
      )}

      {/* Music Player Panel */}
      {!isMinimized && (
        <div
          className="fixed right-0 top-0 h-full shadow-2xl transition-all duration-300"
          style={{
            width: isExpanded ? '400px' : '80px',
            background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.98) 0%, rgba(26, 10, 10, 0.98) 100%)',
            borderLeft: '2px solid rgba(200, 80, 80, 0.3)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
          }}
        >
          {/* Collapsed View */}
          {!isExpanded && (
            <div className="flex flex-col items-center py-4 space-y-4">
              <button
                onClick={() => setIsExpanded(true)}
                className="p-3 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  background: 'rgba(200, 80, 80, 0.2)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
                title="Expand Player"
              >
                <span className="text-2xl">🎵</span>
              </button>
              
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: '#c85050' }}
                title="Minimize"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
          )}

          {/* Expanded View */}
          {isExpanded && (
            <div className="h-full flex flex-col p-4 overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#f5e6d3'
                  }}
                >
                  🎵 Music
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-lg transition-all duration-200"
                    style={{ color: '#c85050' }}
                    title="Collapse"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="text-lg transition-all duration-200"
                    style={{ color: '#c85050' }}
                    title="Minimize"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div
                  className="mb-3 p-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 71, 87, 0.2)',
                    border: '1px solid rgba(255, 71, 87, 0.5)',
                    color: '#ff4757'
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="mb-3 p-2 rounded-lg text-sm"
                  style={{
                    background: 'rgba(255, 165, 2, 0.2)',
                    border: '1px solid rgba(255, 165, 2, 0.5)',
                    color: '#ffa502'
                  }}
                >
                  ✓ {success}
                </div>
              )}

              {/* Platform Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => switchPlatform('spotify')}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    background: currentPlatform === 'spotify'
                      ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
                      : 'rgba(0,0,0,0.3)',
                    color: '#f5e6d3',
                    border: currentPlatform === 'spotify'
                      ? '1px solid rgba(200, 80, 80, 0.5)'
                      : '1px solid rgba(200, 80, 80, 0.2)'
                  }}
                >
                  Spotify
                </button>
                <button
                  onClick={() => switchPlatform('youtube')}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    background: currentPlatform === 'youtube'
                      ? 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)'
                      : 'rgba(0,0,0,0.3)',
                    color: '#f5e6d3',
                    border: currentPlatform === 'youtube'
                      ? '1px solid rgba(200, 80, 80, 0.5)'
                      : '1px solid rgba(200, 80, 80, 0.2)'
                  }}
                >
                  YouTube
                </button>
              </div>

              {/* Player Content */}
              <div className="flex-1 overflow-y-auto">
                {currentPlaylist ? (
                  <div className="space-y-4">
                    {/* Current Playlist Info */}
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(200, 80, 80, 0.3)'
                      }}
                    >
                      {currentPlaylist.cover_image && (
                        <img
                          src={currentPlaylist.cover_image}
                          alt={currentPlaylist.playlist_name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: '#f5e6d3' }}
                      >
                        {currentPlaylist.playlist_name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: '#a89080' }}
                      >
                        {currentPlatform === 'spotify' ? '🎵 Spotify' : '📺 YouTube'}
                      </p>
                    </div>

                    {/* Embed Player */}
                    <div
                      className="rounded-lg overflow-hidden"
                      style={{
                        border: '1px solid rgba(200, 80, 80, 0.3)'
                      }}
                    >
                      <iframe
                        src={getEmbedUrl(currentPlaylist.playlist_url, currentPlatform)}
                        width="100%"
                        height="300"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title={currentPlaylist.playlist_name}
                      />
                    </div>

                    {/* Volume Control */}
                    <div>
                      <label
                        className="block text-xs mb-2"
                        style={{ color: '#f5e6d3' }}
                      >
                        🔊 Volume: {volume}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                        className="w-full"
                        style={{
                          accentColor: '#c85050'
                        }}
                      />
                    </div>

                    {/* Playlist List */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: '#f5e6d3' }}
                        >
                          {currentPlatform === 'spotify' ? 'Spotify' : 'YouTube'} Playlists
                        </p>
                        <button
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="text-xs px-2 py-1 rounded cursor-pointer"
                          style={{
                            background: 'rgba(200, 80, 80, 0.2)',
                            color: '#c85050',
                            pointerEvents: 'auto'
                          }}
                        >
                          {showAddForm ? '✕' : '+ Add'}
                        </button>
                      </div>

                      {/* Add Form */}
                      {showAddForm && (
                        <form onSubmit={handleSubmit} className="mb-3 p-3 rounded-lg space-y-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <input
                            type="text"
                            placeholder="Playlist Name"
                            value={formData.playlist_name}
                            onChange={(e) => setFormData({ ...formData, playlist_name: e.target.value })}
                            required
                            className="w-full px-2 py-1 rounded text-sm outline-none"
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              border: '1px solid rgba(200, 80, 80, 0.3)',
                              color: '#f5e6d3'
                            }}
                          />
                          <input
                            type="url"
                            placeholder="Playlist URL"
                            value={formData.playlist_url}
                            onChange={(e) => setFormData({ ...formData, playlist_url: e.target.value })}
                            required
                            className="w-full px-2 py-1 rounded text-sm outline-none"
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              border: '1px solid rgba(200, 80, 80, 0.3)',
                              color: '#f5e6d3'
                            }}
                          />
                          <select
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                            className="w-full px-2 py-1 rounded text-sm outline-none"
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              border: '1px solid rgba(200, 80, 80, 0.3)',
                              color: '#f5e6d3'
                            }}
                          >
                            <option value="spotify">Spotify</option>
                            <option value="youtube">YouTube</option>
                          </select>
                          
                          {/* Cover Image Upload */}
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full px-2 py-1 rounded text-xs"
                              style={{
                                background: 'rgba(200, 80, 80, 0.2)',
                                border: '1px solid rgba(200, 80, 80, 0.3)',
                                color: '#f5e6d3'
                              }}
                            >
                              📷 {selectedFile ? selectedFile.name : 'Add Cover Image'}
                            </button>
                            {imagePreview && (
                              <img src={imagePreview} alt="Preview" className="w-full h-20 object-cover rounded mt-2" />
                            )}
                          </div>

                          <button
                            type="submit"
                            className="w-full px-2 py-1 rounded text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                              color: '#f5e6d3',
                              pointerEvents: 'auto'
                            }}
                          >
                            Add Playlist
                          </button>
                        </form>
                      )}

                      {/* Playlist Items */}
                      <div className="space-y-2">
                        {getPlaylistsByPlatform(currentPlatform).map((playlist) => (
                          <div
                            key={playlist.id}
                            className="p-2 rounded-lg flex justify-between items-center"
                            style={{
                              background: playlist.is_active
                                ? 'rgba(200, 80, 80, 0.2)'
                                : 'rgba(0,0,0,0.2)',
                              border: '1px solid rgba(200, 80, 80, 0.3)'
                            }}
                          >
                            <button
                              onClick={() => setActivePlaylist(playlist.id, playlist.platform)}
                              className="flex-1 text-left text-xs"
                              style={{ color: '#f5e6d3' }}
                            >
                              {playlist.is_active && '▶ '}
                              {playlist.playlist_name}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(playlist.id)
                                setShowDeleteConfirm(true)
                              }}
                              className="text-xs ml-2"
                              style={{ color: '#ff4757' }}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p
                      className="text-sm mb-4"
                      style={{ color: '#a89080' }}
                    >
                      No {currentPlatform} playlist added yet
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                        color: '#f5e6d3',
                        pointerEvents: 'auto'
                      }}
                    >
                      + Add Playlist
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setDeleteTarget(null)
        }}
        title="🗑️ Remove Playlist?"
        message="Are you sure you want to remove this playlist? This action cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Cancel"
      />
    </>
  )
}

export default MusicPlayer
