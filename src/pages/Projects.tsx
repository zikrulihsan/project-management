import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { projectsApi, Project } from '../lib/api'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
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
    </div>
  )
}
