import { useState, useRef, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'
import ConfirmationModal from './ConfirmationModal'

const ProfileModal = ({ isOpen, onClose }) => {
  const { profile, uploading, uploadProgress, updateProfile, uploadImage, deleteImage } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.email?.split('@')[0] || '')
    }
  }, [profile])

  if (!isOpen || !profile) return null

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB')
      return
    }

    setError('')
    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      await uploadImage(selectedFile)
      setSelectedFile(null)
      setImagePreview(null)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image')
    }
  }

  const handleCancelUpload = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    try {
      await updateProfile({ display_name: displayName })
      setIsEditing(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    }
  }

  const handleDeleteImage = async () => {
    try {
      await deleteImage()
      setShowDeleteConfirm(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete image')
    }
  }

  const getProfileImage = () => {
    if (imagePreview) return imagePreview
    if (profile.profile_img) return profile.profile_img
    return null
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, rgba(45, 20, 25, 0.95) 0%, rgba(26, 10, 10, 0.98) 100%)',
          border: '2px solid rgba(200, 80, 80, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-3xl font-bold"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#f5e6d3',
              textShadow: '0 2px 10px rgba(200, 80, 80, 0.3)'
            }}
          >
            👻 Profile
          </h2>
          <button
            onClick={onClose}
            className="text-2xl transition-all duration-200"
            style={{ color: '#c85050' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-4 p-3 rounded-lg"
            style={{
              background: 'rgba(255, 71, 87, 0.2)',
              border: '1px solid rgba(255, 71, 87, 0.5)',
              color: '#ff4757'
            }}
          >
            {error}
          </div>
        )}

        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-6">
          <div 
            className="relative group"
            style={{
              width: '150px',
              height: '150px'
            }}
          >
            {/* Image or Ghost Avatar */}
            <div 
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: getProfileImage() 
                  ? 'transparent' 
                  : 'linear-gradient(135deg, #c85050 0%, #ff6b6b 100%)',
                boxShadow: '0 4px 20px rgba(200, 80, 80, 0.4)',
                border: '3px solid rgba(200, 80, 80, 0.3)'
              }}
            >
              {getProfileImage() ? (
                <img 
                  src={getProfileImage()} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">👻</span>
              )}
            </div>

            {/* Upload Overlay */}
            {!uploading && (
              <div 
                className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <span style={{ color: '#f5e6d3', fontSize: '0.875rem' }}>
                  📷 Change
                </span>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div 
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.8)'
                }}
              >
                <div className="text-center">
                  <div 
                    className="text-sm font-bold mb-2"
                    style={{ color: '#f5e6d3' }}
                  >
                    {uploadProgress}%
                  </div>
                  <div 
                    className="w-20 h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(90deg, #ffa502 0%, #ff6348 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Image Action Buttons */}
          {selectedFile && !uploading && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleUpload}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)',
                  color: '#1a0a0a'
                }}
              >
                ✓ Upload
              </button>
              <button
                onClick={handleCancelUpload}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{
                  background: 'rgba(255, 71, 87, 0.2)',
                  border: '1px solid rgba(255, 71, 87, 0.5)',
                  color: '#ff4757'
                }}
              >
                ✕ Cancel
              </button>
            </div>
          )}

          {profile.profile_img && !selectedFile && !uploading && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-3 text-sm"
              style={{ color: '#ff4757' }}
            >
              🗑️ Remove Image
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
                placeholder="Enter your display name"
              />
            ) : (
              <p 
                className="text-lg"
                style={{ color: '#f5e6d3' }}
              >
                {profile.display_name || profile.email?.split('@')[0] || 'Not set'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Email
            </label>
            <p style={{ color: '#a89080' }}>{profile.email}</p>
          </div>

          {/* Role */}
          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Role
            </label>
            <span
              className="inline-block px-3 py-1 rounded-lg text-sm"
              style={{
                background: 'rgba(200, 80, 80, 0.2)',
                border: '1px solid rgba(200, 80, 80, 0.3)',
                color: '#c85050'
              }}
            >
              {profile.role === 'admin' ? '👑 Administrator' : '👤 User'}
            </span>
          </div>

          {/* Member Since */}
          <div>
            <label 
              className="block mb-2 text-sm font-semibold"
              style={{ color: '#f5e6d3' }}
            >
              Member Since
            </label>
            <p style={{ color: '#a89080' }}>
              {formatDate(profile.created_at)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 rounded-xl font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                  color: '#f5e6d3'
                }}
              >
                💾 Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setDisplayName(profile.display_name || profile.email?.split('@')[0] || '')
                  setError('')
                }}
                className="flex-1 px-6 py-3 rounded-xl font-semibold"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(200, 80, 80, 0.3)',
                  color: '#f5e6d3'
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-6 py-3 rounded-xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                color: '#f5e6d3'
              }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Delete Image Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={handleDeleteImage}
        onCancel={() => setShowDeleteConfirm(false)}
        title="🗑️ Remove Profile Image?"
        message="Are you sure you want to remove your profile image? Your default ghost avatar will be shown instead."
        confirmText="Yes, Remove"
        cancelText="Cancel"
      />
    </div>
  )
}

export default ProfileModal
