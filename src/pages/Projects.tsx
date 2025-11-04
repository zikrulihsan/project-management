import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { projectsApi, Project } from '../lib/api'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [updating, setUpdating] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await projectsApi.getAll()

    if (error) {
      setError(error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    setCreating(true)
    setError('')

    const { error } = await projectsApi.create(name, description)

    if (error) {
      setError(error)
    } else {
      setName('')
      setDescription('')
      fetchProjects()
    }
    setCreating(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProject(project)
    setEditName(project.name)
    setEditDescription(project.description || '')
    setError('')
  }

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!editingProject) return

    setUpdating(true)
    setError('')

    const { error } = await projectsApi.update(editingProject.id, editName, editDescription)

    if (error) {
      setError(error)
    } else {
      setEditingProject(null)
      fetchProjects()
    }
    setUpdating(false)
  }

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this project? All notes will also be deleted.')) {
      return
    }

    setError('')
    const { error } = await projectsApi.delete(projectId)

    if (error) {
      setError(error)
    } else {
      fetchProjects()
    }
  }

  const handleCancelEdit = () => {
    setEditingProject(null)
    setEditName('')
    setEditDescription('')
    setError('')
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Projects</h1>
        <button onClick={handleSignOut} className="btn-secondary">
          Sign Out
        </button>
      </header>

      <div className="create-form">
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={creating}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
              rows={3}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>

      <div className="projects-list">
        <h2>Your Projects</h2>
        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="empty-state">No projects yet. Create your first project above!</p>
        ) : (
          <div className="grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="card"
                onClick={() => navigate(`/projects/${project.id}/notes`)}
              >
                <div className="card-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => handleEdit(project, e)}
                    title="Edit project"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn icon-btn-danger"
                    onClick={(e) => handleDelete(project.id, e)}
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3>{project.name}</h3>
                {project.description && <p>{project.description}</p>}
                <span className="date">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingProject && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <form onSubmit={handleUpdate}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="edit-name">Project Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  disabled={updating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">Description (optional)</label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={updating}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
