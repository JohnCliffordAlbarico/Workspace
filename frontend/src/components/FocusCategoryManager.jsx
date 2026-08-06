import { useState } from 'react'
import { X, Plus, Edit2, Trash2, CheckCircle, RotateCcw, Palette } from 'lucide-react'
import { useFocusCategories } from '../hooks/useFocusCategories'
import { useCompletedCategories } from '../hooks/useCompletedCategories'
import CompleteCategoryModal from './CompleteCategoryModal'

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6b7280'
]

const FocusCategoryManager = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('active')
  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [categoryToComplete, setCategoryToComplete] = useState(null)
  
  const { 
    categories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    completeCategory,
    loading: categoriesLoading 
  } = useFocusCategories()
  
  const { 
    completedCategories, 
    reopenCategory,
    loading: completedLoading 
  } = useCompletedCategories()

  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    daily_allocation_minutes: 60
  })

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    try {
      await createCategory(formData)
      setFormData({ name: '', color: '#6366f1', daily_allocation_minutes: 60 })
      setIsCreating(false)
    } catch (err) {
      console.error('Failed to create category:', err)
    }
  }

  const handleUpdate = async () => {
    if (!formData.name.trim() || !editingCategory) return
    try {
      await updateCategory(editingCategory.id, formData)
      setEditingCategory(null)
      setFormData({ name: '', color: '#6366f1', daily_allocation_minutes: 60 })
    } catch (err) {
      console.error('Failed to update category:', err)
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return
    try {
      await deleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
    } catch (err) {
      console.error('Failed to delete category:', err)
    }
  }

  const handleComplete = async (categoryId) => {
    // This is called from CompleteCategoryModal after successful completion
    // The category is already removed from active list by the modal
  }

  const handleReopen = async (category) => {
    try {
      await reopenCategory(category.id)
    } catch (err) {
      console.error('Failed to reopen category:', err)
    }
  }

  const startEditing = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      daily_allocation_minutes: category.daily_allocation_minutes
    })
    setIsCreating(false)
  }

  const cancelForm = () => {
    setIsCreating(false)
    setEditingCategory(null)
    setFormData({ name: '', color: '#6366f1', daily_allocation_minutes: 60 })
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div 
          className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(145deg, #2d1418 0%, #1a0d0d 100%)',
            border: '1px solid rgba(200, 80, 80, 0.3)'
          }}
        >
          {/* Header */}
          <div 
            className="p-6 flex justify-between items-center"
            style={{ borderBottom: '1px solid rgba(200, 80, 80, 0.2)' }}
          >
            <h2 
              className="text-2xl font-bold"
              style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
            >
              Manage Categories
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: '#a89080' }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div 
            className="flex px-6"
            style={{ borderBottom: '1px solid rgba(200, 80, 80, 0.2)' }}
          >
            <button
              onClick={() => setActiveTab('active')}
              className="px-4 py-3 text-sm font-semibold transition-all duration-300"
              style={{
                color: activeTab === 'active' ? '#f5e6d3' : '#a89080',
                borderBottom: activeTab === 'active' ? '2px solid #c85050' : '2px solid transparent'
              }}
            >
              Active ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className="px-4 py-3 text-sm font-semibold transition-all duration-300"
              style={{
                color: activeTab === 'completed' ? '#f5e6d3' : '#a89080',
                borderBottom: activeTab === 'completed' ? '2px solid #c85050' : '2px solid transparent'
              }}
            >
              Completed ({completedCategories.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'active' ? (
              <>
                {/* Active Categories */}
                {categoriesLoading ? (
                  <div className="text-center py-8" style={{ color: '#a89080' }}>
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8" style={{ color: '#a89080' }}>
                    No active categories yet. Create one to get started!
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {categories.map(category => (
                      <div
                        key={category.id}
                        className="rounded-xl p-4 transition-all duration-200"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(200, 80, 80, 0.2)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ background: category.color }}
                            />
                            <div>
                              <p className="font-semibold" style={{ color: '#f5e6d3' }}>
                                {category.name}
                              </p>
                              <p className="text-sm" style={{ color: '#a89080' }}>
                                {category.daily_allocation_minutes} min/day
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditing(category)}
                              className="p-2 rounded-lg transition-all duration-200"
                              style={{ color: '#a89080' }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent'
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCategoryToComplete(category)}
                              className="p-2 rounded-lg transition-all duration-200"
                              style={{ color: '#22c55e' }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent'
                              }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCategoryToDelete(category)}
                              className="p-2 rounded-lg transition-all duration-200"
                              style={{ color: '#ef4444' }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent'
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create/Edit Form */}
                {(isCreating || editingCategory) && (
                  <div 
                    className="rounded-xl p-4 mt-4"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(200, 80, 80, 0.3)'
                    }}
                  >
                    <h3 
                      className="text-sm uppercase tracking-widest mb-4"
                      style={{ fontFamily: "'Cinzel', serif", color: '#c85050' }}
                    >
                      {editingCategory ? 'Edit Category' : 'New Category'}
                    </h3>
                    
                    <input
                      type="text"
                      placeholder="Category name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg mb-3"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(200, 80, 80, 0.2)',
                        color: '#f5e6d3'
                      }}
                    />

                    <div className="mb-3">
                      <label className="block text-sm mb-2" style={{ color: '#a89080' }}>
                        Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                            className="w-8 h-8 rounded-full transition-all duration-200"
                            style={{
                              background: color,
                              border: formData.color === color ? '3px solid #f5e6d3' : '3px solid transparent',
                              transform: formData.color === color ? 'scale(1.1)' : 'scale(1)'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm mb-2" style={{ color: '#a89080' }}>
                        Daily Allocation (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={formData.daily_allocation_minutes}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          daily_allocation_minutes: parseInt(e.target.value) || 60 
                        }))}
                        className="w-full px-4 py-3 rounded-lg"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(200, 80, 80, 0.2)',
                          color: '#f5e6d3'
                        }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={cancelForm}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          color: '#a89080',
                          border: '1px solid rgba(200, 80, 80, 0.2)'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={editingCategory ? handleUpdate : handleCreate}
                        disabled={!formData.name.trim()}
                        className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #8b2942 0%, #c85050 100%)',
                          color: '#f5e6d3',
                          opacity: !formData.name.trim() ? 0.5 : 1
                        }}
                      >
                        {editingCategory ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Category Button */}
                {!isCreating && !editingCategory && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full mt-4 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#f5e6d3',
                      border: '1px dashed rgba(200, 80, 80, 0.4)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(200, 80, 80, 0.1)'
                      e.currentTarget.style.borderStyle = 'solid'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                      e.currentTarget.style.borderStyle = 'dashed'
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Category
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Completed Categories */}
                {completedLoading ? (
                  <div className="text-center py-8" style={{ color: '#a89080' }}>
                    Loading completed categories...
                  </div>
                ) : completedCategories.length === 0 ? (
                  <div className="text-center py-8" style={{ color: '#a89080' }}>
                    No completed categories yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedCategories.map(category => (
                      <div
                        key={category.id}
                        className="rounded-xl p-4"
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(200, 80, 80, 0.2)',
                          opacity: 0.8
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ background: category.color, opacity: 0.6 }}
                            />
                            <div>
                              <p className="font-semibold" style={{ color: '#f5e6d3' }}>
                                {category.name}
                              </p>
                              <p className="text-sm" style={{ color: '#a89080' }}>
                                Completed: {new Date(category.completed_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleReopen(category)}
                            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1"
                            style={{
                              background: 'rgba(200, 80, 80, 0.2)',
                              color: '#f5e6d3'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.4)'
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(200, 80, 80, 0.2)'
                            }}
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reopen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          onClick={(e) => e.target === e.currentTarget && setCategoryToDelete(null)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, #2d1418 0%, #1a0d0d 100%)',
              border: '1px solid rgba(200, 80, 80, 0.3)'
            }}
          >
            <h3 
              className="text-xl font-bold mb-2 text-center"
              style={{ fontFamily: "'Cinzel', serif", color: '#f5e6d3' }}
            >
              Delete Category
            </h3>
            <p className="text-center mb-6" style={{ color: '#a89080' }}>
              Are you sure you want to delete "{categoryToDelete.name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  color: '#a89080',
                  border: '1px solid rgba(200, 80, 80, 0.2)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Category Modal */}
      <CompleteCategoryModal
        isOpen={!!categoryToComplete}
        onClose={() => setCategoryToComplete(null)}
        category={categoryToComplete}
        onComplete={handleComplete}
      />
    </>
  )
}

export default FocusCategoryManager
