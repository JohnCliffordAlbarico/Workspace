import { useState, useRef, useEffect } from 'react'
import { Music, Youtube, GripHorizontal, Minimize2, Maximize2, X, Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from 'lucide-react'

const FloatingMusicPlayer = ({ playlist, platform, onClose, onNext, onPrevious }) => {
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage
    try {
      const saved = localStorage.getItem('floatingPlayerPosition')
      if (saved) {
        const { x, y } = JSON.parse(saved)
        return { x, y }
      }
    } catch (err) {
      console.error('Error loading player position:', err)
    }
    return { x: window.innerWidth - 450, y: 100 }
  })
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const [isExpanded, setIsExpanded] = useState(() => {
    // Load saved expanded state from localStorage
    try {
      const saved = localStorage.getItem('floatingPlayerExpanded')
      return saved ? JSON.parse(saved) : true
    } catch (err) {
      console.error('Error loading player expanded state:', err)
      return true
    }
  })
  
  const [isPlaying, setIsPlaying] = useState(true)
  const playerRef = useRef(null)
  const iframeRef = useRef(null)
  const youtubePlayerRef = useRef(null)
  const playerContainerRef = useRef(null)

  // Save position to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('floatingPlayerPosition', JSON.stringify(position))
    } catch (err) {
      console.error('Error saving player position:', err)
    }
  }, [position])

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('floatingPlayerExpanded', JSON.stringify(isExpanded))
    } catch (err) {
      console.error('Error saving player expanded state:', err)
    }
  }, [isExpanded])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy()
        } catch (err) {
          console.error('Error destroying YouTube player:', err)
        }
      }
    }
  }, [])

  // Load YouTube IFrame API
  useEffect(() => {
    if (platform !== 'youtube') return

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initYouTubePlayer()
      return
    }

    // Load the API
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    // API will call this function when ready
    window.onYouTubeIframeAPIReady = () => {
      initYouTubePlayer()
    }
  }, [platform, playlist.id])

  const initYouTubePlayer = () => {
    if (!playerContainerRef.current || platform !== 'youtube') return

    const videoId = extractYouTubeVideoId(playlist.playlist_url)
    const playlistId = extractYouTubePlaylistId(playlist.playlist_url)

    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy()
    }

    const playerVars = {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0
    }

    if (playlistId) {
      playerVars.list = playlistId
      playerVars.listType = 'playlist'
    } else if (videoId) {
      // Single video
    }

    youtubePlayerRef.current = new window.YT.Player(playerContainerRef.current, {
      height: '100',
      width: '100%',
      videoId: videoId || '',
      playerVars: playerVars,
      events: {
        onReady: (event) => {
          setIsPlaying(true)
        },
        onStateChange: (event) => {
          // YT.PlayerState.PLAYING = 1, PAUSED = 2
          setIsPlaying(event.data === 1)
        }
      }
    })
  }

  const extractYouTubeVideoId = (url) => {
    if (url.includes('youtube.com/watch')) {
      return url.split('v=')[1]?.split('&')[0]
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0]
    }
    return null
  }

  const extractYouTubePlaylistId = (url) => {
    if (url.includes('list=')) {
      return url.split('list=')[1]?.split('&')[0]
    }
    return null
  }

  const handlePlayPause = () => {
    if (platform === 'youtube' && youtubePlayerRef.current) {
      const playerState = youtubePlayerRef.current.getPlayerState()
      if (playerState === 1) { // Playing
        youtubePlayerRef.current.pauseVideo()
      } else {
        youtubePlayerRef.current.playVideo()
      }
    } else if (platform === 'spotify') {
      // Spotify doesn't support external control via iframe
      setIsPlaying(!isPlaying)
    }
  }

  // Reload iframe when playlist changes (for Spotify)
  useEffect(() => {
    if (platform === 'spotify' && iframeRef.current && isPlaying) {
      iframeRef.current.src = getEmbedUrl(playlist.playlist_url, platform)
    }
  }, [playlist.id])

  const getEmbedUrl = (url, platform) => {
    if (platform === 'spotify') {
      if (url.includes('open.spotify.com')) {
        return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
      }
      return url
    } else if (platform === 'youtube') {
      if (url.includes('youtube.com/playlist')) {
        const listId = url.split('list=')[1]?.split('&')[0]
        if (listId) {
          return `https://www.youtube.com/embed/videoseries?list=${listId}`
        }
      }
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0]
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }
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

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return

      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y

      // Keep within viewport bounds with padding
      const width = isExpanded ? 350 : 250
      const height = isExpanded ? 300 : 70
      const maxX = window.innerWidth - width - 20
      const maxY = window.innerHeight - height - 20

      setPosition({
        x: Math.max(20, Math.min(newX, maxX)),
        y: Math.max(20, Math.min(newY, maxY))
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, dragStart, isExpanded])

  if (!playlist) return null

  return (
    <div
      ref={playerRef}
      className="fixed shadow-2xl rounded-xl overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isExpanded ? '350px' : '250px',
        background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.98) 0%, rgba(26, 10, 10, 0.98) 100%)',
        border: '2px solid rgba(200, 80, 80, 0.5)',
        zIndex: 10001,
        transition: isDragging ? 'none' : 'width 0.3s ease, box-shadow 0.3s ease',
        boxShadow: isDragging 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
          : '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{
          borderColor: 'rgba(200, 80, 80, 0.3)',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripHorizontal 
            size={16} 
            style={{ color: '#a89080', flexShrink: 0 }} 
          />
          {platform === 'spotify' ? (
            <Music size={18} style={{ color: '#1DB954', flexShrink: 0 }} />
          ) : (
            <Youtube size={18} style={{ color: '#FF0000', flexShrink: 0 }} />
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: '#f5e6d3' }}
            >
              {playlist.playlist_name}
            </p>
          </div>
        </div>
        <div className="flex gap-1 no-drag">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-white/10 transition-all"
            style={{ color: '#c85050' }}
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            onClick={() => {
              // Clear localStorage state when closing
              try {
                localStorage.removeItem('floatingPlayerState')
              } catch (err) {
                console.error('Error clearing player state:', err)
              }
              onClose()
            }}
            className="p-1.5 rounded hover:bg-white/10 transition-all"
            style={{ color: '#ff4757' }}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Minimized View - Show cover image */}
      {!isExpanded && (
        <div className="p-2 flex items-center gap-2 no-drag">
          {playlist.cover_image ? (
            <img
              src={playlist.cover_image}
              alt={playlist.playlist_name}
              className="w-12 h-12 object-contain rounded"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            />
          ) : (
            <div
              className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #c85050 0%, #ff6b6b 100%)'
              }}
            >
              {platform === 'spotify' ? (
                <Music size={24} style={{ color: '#f5e6d3', opacity: 0.8 }} />
              ) : (
                <Youtube size={24} style={{ color: '#f5e6d3', opacity: 0.8 }} />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#f5e6d3' }}>
              {playlist.playlist_name}
            </p>
            <p className="text-xs" style={{ color: '#a89080' }}>
              {isPlaying ? '▶ Playing' : '⏸ Paused'}
            </p>
          </div>
        </div>
      )}

      {/* Player Content - Always mounted but hidden when minimized */}
      <div 
        className="p-2 no-drag"
        style={{ display: isExpanded ? 'block' : 'none' }}
      >
        {/* Playback Controls */}
        <div 
          className="flex items-center justify-center gap-2 mb-2 p-1.5 rounded-lg"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(200, 80, 80, 0.2)'
          }}
        >
          <button
            onClick={onPrevious}
            disabled={!onPrevious}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: '#f5e6d3' }}
            title="Previous Playlist"
          >
            <SkipBack size={14} fill="currentColor" />
          </button>
          <button
            onClick={() => {
              if (platform === 'youtube' && youtubePlayerRef.current) {
                youtubePlayerRef.current.seekTo(0)
                youtubePlayerRef.current.playVideo()
              } else if (iframeRef.current) {
                const currentSrc = iframeRef.current.src
                iframeRef.current.src = 'about:blank'
                setTimeout(() => {
                  if (iframeRef.current) {
                    iframeRef.current.src = currentSrc
                  }
                }, 100)
              }
            }}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all"
            style={{ color: '#f5e6d3' }}
            title="Restart"
          >
            <Rewind size={14} />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-full hover:opacity-90 transition-all"
            style={{
              background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
              color: '#f5e6d3'
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={16} fill="currentColor" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
          </button>
          <button
            onClick={() => {
              if (platform === 'youtube' && youtubePlayerRef.current) {
                const currentSrc = youtubePlayerRef.current.getVideoUrl()
                youtubePlayerRef.current.loadVideoById(extractYouTubeVideoId(currentSrc))
              } else if (iframeRef.current) {
                const currentSrc = iframeRef.current.src
                iframeRef.current.src = currentSrc
              }
            }}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all"
            style={{ color: '#f5e6d3' }}
            title="Refresh"
          >
            <FastForward size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={!onNext}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: '#f5e6d3' }}
            title="Next Playlist"
          >
            <SkipForward size={14} fill="currentColor" />
          </button>
        </div>
        
        {/* Embedded Player - Small and compact */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '1px solid rgba(200, 80, 80, 0.3)'
          }}
        >
          {platform === 'youtube' ? (
            <div ref={playerContainerRef} style={{ width: '100%', height: '100px' }} />
          ) : (
            <iframe
              ref={iframeRef}
              src={getEmbedUrl(playlist.playlist_url, platform)}
              width="100%"
              height="100"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={playlist.playlist_name}
              style={{ display: 'block' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default FloatingMusicPlayer
