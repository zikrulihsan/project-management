import { supabase } from './supabase'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

interface ApiResponse<T> {
  data?: T
  error?: string
}

async function callFunction<T>(
  functionName: string,
  options: {
    method?: string
    body?: unknown
    params?: Record<string, string>
  } = {}
): Promise<ApiResponse<T>> {
  try {
    // Get current session for auth token
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: 'Not authenticated' }
    }

    // Build URL with query params
    let url = `${FUNCTIONS_URL}/${functionName}`
    if (options.params) {
      const searchParams = new URLSearchParams(options.params)
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'An error occurred' }
    }

    return { data: result.data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

// Projects API
export const projectsApi = {
  getAll: async () => {
    return callFunction<Project[]>('get-projects')
  },

  create: async (name: string, description?: string) => {
    return callFunction<Project>('create-project', {
      method: 'POST',
      body: { name, description },
    })
  },

  getById: async (id: string) => {
    return callFunction<{ id: string; name: string }>('get-project', {
      params: { id },
    })
  },

  update: async (id: string, name: string, description?: string) => {
    return callFunction<Project>('update-project', {
      method: 'POST',
      body: { id, name, description },
    })
  },

  delete: async (id: string) => {
    return callFunction<{ success: boolean }>('delete-project', {
      method: 'DELETE',
      params: { id },
    })
  },
}

// Notes API
export const notesApi = {
  getByProject: async (projectId: string) => {
    return callFunction<Note[]>('get-notes', {
      params: { project_id: projectId },
    })
  },

  create: async (projectId: string, content: string) => {
    return callFunction<Note>('create-note', {
      method: 'POST',
      body: { project_id: projectId, content },
    })
  },

  update: async (id: string, content: string) => {
    return callFunction<Note>('update-note', {
      method: 'POST',
      body: { id, content },
    })
  },

  delete: async (id: string) => {
    return callFunction<{ success: boolean }>('delete-note', {
      method: 'DELETE',
      params: { id },
    })
  },
}

// Types
export interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Note {
  id: string
  project_id: string
  content: string
  created_at: string
}
