import { useState, useEffect, useRef } from 'react'
import { Music, Youtube, Plus, X, Trash2, Play, Edit2 } from 'lucide-react'
import { useMusicPlayer } from '../hooks/useMusicPlayer'
import ConfirmationModal from '../pages/dashboard/modal/ConfirmationModal'
import FloatingMusicPlayer from './FloatingMusicPlayer'

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
  const [showFloatingPlayer, setShowFloatingPlayer] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
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

  // Load floating player state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('floatingPlayerState')
      if (savedState) {
        const { isOpen, playlistId, platform } = JSON.parse(savedState)
        if (isOpen && playlistId && platform) {
          // Wait for preferences to load
          if (!loading && currentPlaylist) {
            setShowFloatingPlayer(true)
          }
        }
      }
    } catch (err) {
      console.error('Error loading floating player state:', err)
      // Clear corrupted data
      localStorage.removeItem('floatingPlayerState')
    }
  }, [loading, currentPlaylist])

  // Save floating player state to localStorage
  useEffect(() => {
    try {
      if (showFloatingPlayer && currentPlaylist) {
        localStorage.setItem('floatingPlayerState', JSON.stringify({
          isOpen: true,
          playlistId: currentPlaylist.id,
          platform: currentPlatform
        }))
      } else {
        localStorage.removeItem('floatingPlayerState')
      }
    } catch (err) {
      console.error('Error saving floating player state:', err)
    }
  }, [showFloatingPlayer, currentPlaylist, currentPlatform])

  // Load volume from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('musicVolume')
    if (savedVolume) {
      setVolume(parseInt(savedVolume))
    }
  }, [])

  // Debug: Log showAddForm changes
  useEffect(() => {
    console.log('showAddForm changed to:', showAddForm)
  }, [showAddForm])

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
      
      // Handle playlist URLs
      // https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
      // to https://www.youtube.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
      if (url.includes('youtube.com/playlist')) {
        const listId = url.split('list=')[1]?.split('&')[0]
        if (listId) {
          return `https://www.youtube.com/embed/videoseries?list=${listId}`
        }
      }
      
      // Handle single video URLs (convert to embed)
      // https://www.youtube.com/watch?v=VIDEO_ID
      // to https://www.youtube.com/embed/VIDEO_ID
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0]
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }
      
      // Handle youtu.be short URLs
      // https://youtu.be/VIDEO_ID
      // to https://www.youtube.com/embed/VIDEO_ID
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0]
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
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
      if (editingPlaylist) {
        // Update existing playlist
        await updatePreference(editingPlaylist.id, {
          playlist_name: formData.playlist_name,
          playlist_url: formData.playlist_url
        })

        // Upload new cover if selected
        if (selectedFile) {
          await uploadCover(editingPlaylist.id, selectedFile)
        }

        setSuccess('Playlist updated successfully!')
        setEditingPlaylist(null)
      } else {
        // Create new playlist
        const existingPlaylists = getPlaylistsByPlatform(currentPlatform)
        const isFirstPlaylist = existingPlaylists.length === 0
        
        const newPref = await createPreference({
          playlist_name: formData.playlist_name,
          playlist_url: formData.playlist_url,
          platform: currentPlatform,
          is_active: isFirstPlaylist
        })

        // Upload cover if selected
        if (selectedFile && newPref.id) {
          await uploadCover(newPref.id, selectedFile)
        }

        setSuccess('Playlist added successfully!')
      }
      
      setTimeout(() => setSuccess(''), 3000)
      setShowAddForm(false)
      setFormData({ playlist_name: '', playlist_url: '', platform: currentPlatform })
      setSelectedFile(null)
      setImagePreview(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save playlist')
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
            <div className="h-full flex flex-col p-4 overflow-hidden" style={{ pointerEvents: 'auto' }}>
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
              <div 
                className="flex-1 overflow-y-auto" 
                style={{ 
                  position: 'relative',
                  pointerEvents: 'auto'
                }}
              >
                {/* Add Form - Show regardless of playlist state */}
                {showAddForm && (
                  <form onSubmit={handleSubmit} className="mb-3 p-3 rounded-lg space-y-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="text-xs mb-2" style={{ color: '#a89080' }}>
                      {editingPlaylist ? 'Editing' : 'Adding to'}: {currentPlatform === 'spotify' ? '🎵 Spotify' : '📺 YouTube'}
                    </div>
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
                        📷 {selectedFile ? selectedFile.name : 'Add Cover Image (Optional)'}
                      </button>
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-full h-20 object-cover rounded mt-2" />
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-2 py-1 rounded text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                        style={{
                          background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                          color: '#f5e6d3',
                          pointerEvents: 'auto'
                        }}
                      >
                        {editingPlaylist ? 'Update Playlist' : 'Add Playlist'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false)
                          setEditingPlaylist(null)
                          setFormData({ playlist_name: '', playlist_url: '', platform: currentPlatform })
                          setSelectedFile(null)
                          setImagePreview(null)
                        }}
                        className="px-3 py-1 rounded text-sm font-semibold cursor-pointer hover:opacity-80"
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(200, 80, 80, 0.3)',
                          color: '#f5e6d3'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

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
                      {/* Cover Image or Icon */}
                      {currentPlaylist.cover_image ? (
                        <img
                          src={currentPlaylist.cover_image}
                          alt={currentPlaylist.playlist_name}
                          className="w-full h-32 object-contain rounded-lg mb-2"
                          style={{ background: 'rgba(0,0,0,0.2)' }}
                        />
                      ) : (
                        <div
                          className="w-full h-32 rounded-lg mb-2 flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #c85050 0%, #ff6b6b 100%)'
                          }}
                        >
                          {currentPlatform === 'spotify' ? (
                            <Music size={48} style={{ color: '#f5e6d3', opacity: 0.8 }} />
                          ) : (
                            <Youtube size={48} style={{ color: '#f5e6d3', opacity: 0.8 }} />
                          )}
                        </div>
                      )}
                      
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: '#f5e6d3' }}
                      >
                        {currentPlaylist.playlist_name}
                      </p>
                      <p
                        className="text-xs mb-3 flex items-center gap-1"
                        style={{ color: '#a89080' }}
                      >
                        {currentPlatform === 'spotify' ? (
                          <>
                            <Music size={12} /> Spotify
                          </>
                        ) : (
                          <>
                            <Youtube size={12} /> YouTube
                          </>
                        )}
                      </p>
                      
                      {/* Play Button */}
                      <button
                        onClick={() => setShowFloatingPlayer(true)}
                        className="w-full py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                          color: '#f5e6d3'
                        }}
                      >
                        <Play size={16} fill="currentColor" />
                        Play in Floating Player
                      </button>
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
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Toggle add form clicked!')
                            setShowAddForm(!showAddForm)
                          }}
                          type="button"
                          className="text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80"
                          style={{
                            background: 'rgba(200, 80, 80, 0.2)',
                            color: '#c85050',
                            pointerEvents: 'auto',
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          {showAddForm ? '✕ Close' : '+ Add'}
                        </button>
                      </div>

                      {/* Playlist Items */}
                      <div className="space-y-2">
                        {getPlaylistsByPlatform(currentPlatform).length > 0 ? (
                          getPlaylistsByPlatform(currentPlatform).map((playlist) => (
                            <div
                              key={playlist.id}
                              className="p-2 rounded-lg flex justify-between items-center transition-all duration-200"
                              style={{
                                background: playlist.is_active
                                  ? 'rgba(200, 80, 80, 0.3)'
                                  : 'rgba(0,0,0,0.2)',
                                border: playlist.is_active
                                  ? '1px solid rgba(200, 80, 80, 0.5)'
                                  : '1px solid rgba(200, 80, 80, 0.2)'
                              }}
                            >
                              <button
                                onClick={() => setActivePlaylist(playlist.id, playlist.platform)}
                                className="flex-1 text-left text-xs hover:opacity-80 transition-opacity"
                                style={{ color: '#f5e6d3' }}
                              >
                                {playlist.is_active && '▶ '}
                                {playlist.playlist_name}
                              </button>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingPlaylist(playlist)
                                    setFormData({
                                      playlist_name: playlist.playlist_name,
                                      playlist_url: playlist.playlist_url,
                                      platform: playlist.platform
                                    })
                                    setShowAddForm(true)
                                  }}
                                  className="text-xs p-1 hover:opacity-80 transition-opacity"
                                  style={{ color: '#ffa502' }}
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget(playlist.id)
                                    setShowDeleteConfirm(true)
                                  }}
                                  className="text-xs p-1 hover:opacity-80 transition-opacity"
                                  style={{ color: '#ff4757' }}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p
                            className="text-xs text-center py-4"
                            style={{ color: '#a89080' }}
                          >
                            No playlists yet. Click "+ Add" to create one.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  !showAddForm && (
                    <div className="text-center py-8">
                      <p
                        className="text-sm mb-4"
                        style={{ color: '#a89080' }}
                      >
                        No {currentPlatform} playlist added yet
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Add Playlist button clicked!')
                          setShowAddForm(true)
                        }}
                        type="button"
                        className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-90"
                        style={{
                          background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                          color: '#f5e6d3',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        + Add Your First Playlist
                      </button>
                    </div>
                  )
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

      {/* Floating Music Player */}
      {showFloatingPlayer && currentPlaylist && (
        <FloatingMusicPlayer
          playlist={currentPlaylist}
          platform={currentPlatform}
          onClose={() => setShowFloatingPlayer(false)}
          onNext={() => {
            const playlists = getPlaylistsByPlatform(currentPlatform)
            const currentIndex = playlists.findIndex(p => p.id === currentPlaylist.id)
            if (currentIndex < playlists.length - 1) {
              setActivePlaylist(playlists[currentIndex + 1].id, currentPlatform)
            }
          }}
          onPrevious={() => {
            const playlists = getPlaylistsByPlatform(currentPlatform)
            const currentIndex = playlists.findIndex(p => p.id === currentPlaylist.id)
            if (currentIndex > 0) {
              setActivePlaylist(playlists[currentIndex - 1].id, currentPlatform)
            }
          }}
        />
      )}
    </>
  )
}

export default MusicPlayer
