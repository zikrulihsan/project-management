import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { projectsApi, notesApi, Note } from '../lib/api'

interface Project {
  id: string
  name: string
}

export default function Notes() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchNotes()
    }
  }, [projectId, user])

  const fetchProject = async () => {
    if (!user || !projectId) return

    const { data, error } = await projectsApi.getById(projectId)

    if (error) {
      setError('Project not found')
      navigate('/projects')
    } else {
      setProject(data || null)
    }
  }

  const fetchNotes = async () => {
    if (!user || !projectId) return

    setLoading(true)
    const { data, error } = await notesApi.getByProject(projectId)

    if (error) {
      setError(error)
    } else {
      setNotes(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !projectId) return

    setCreating(true)
    setError('')

    const { error } = await notesApi.create(projectId, content)

    if (error) {
      setError(error)
    } else {
      setContent('')
      fetchNotes()
    }
    setCreating(false)
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <button onClick={() => navigate('/projects')} className="btn-link">
            ← Back to Projects
          </button>
          <h1>{project?.name || 'Notes'}</h1>
        </div>
      </header>

      <div className="create-form">
        <h2>Add New Note</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="content">Note Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={creating}
              rows={4}
              placeholder="Write your note here..."
            />
          </div>
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Adding...' : 'Add Note'}
          </button>
        </form>
      </div>

      <div className="notes-list">
        <h2>Notes</h2>
        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="empty-state">No notes yet. Add your first note above!</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <p className="note-content">{note.content}</p>
                <span className="date">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
