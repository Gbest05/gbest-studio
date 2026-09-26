const API_BASE = '/api';

export interface ProjectSummary {
  id: string;
  name: string;
  thumbnail_url?: string;
  aspect_ratio: string;
  updated_at: string;
  created_at: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  aspect_ratio: string;
  project_data?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoUploadResult {
  id: string;
  project_id?: string;
  filename: string;
  original_filename: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  file_size_bytes: number;
  thumbnail_url?: string;
  video_url: string;
}

export interface ExportStatus {
  id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  resolution: string;
  aspect_ratio: string;
  download_url?: string;
  error?: string;
  file_size_bytes?: number;
}

export const api = {
  // Projects
  async getProjects(): Promise<ProjectSummary[]> {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async createProject(name: string = "Untitled Project", aspect_ratio: string = "16:9"): Promise<ProjectDetail> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ name, aspect_ratio }),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async getProject(id: string): Promise<ProjectDetail> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async updateProject(id: string, data: Partial<ProjectDetail>): Promise<ProjectDetail> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async duplicateProject(id: string): Promise<ProjectDetail> {
    const res = await fetch(`${API_BASE}/projects/${id}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to duplicate project');
    return res.json();
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  // Videos
  async uploadVideo(file: File, projectId?: string, onProgress?: (percent: number) => void): Promise<VideoUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('project_id', projectId);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/videos/upload`);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.detail || 'Upload failed'));
          } catch {
            reject(new Error('Video upload failed'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during video upload'));
      xhr.send(formData);
    });
  },

  async deleteVideo(videoId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/videos/${videoId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete video' }));
      throw new Error(err.detail || 'Failed to delete video');
    }
    return res.json();
  },

  // Captions
  async generateCaptions(videoId: string, projectId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/captions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId, project_id: projectId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Caption generation failed' }));
      throw new Error(err.detail || 'Caption generation failed');
    }
    return res.json();
  },

  // Audio Upload & Extraction
  async uploadAudio(file: File, projectId?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('project_id', projectId);

    const res = await fetch(`${API_BASE}/audio/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Audio upload failed');
    return res.json();
  },

  async extractAudioFromVideo(videoId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/audio/extract-from-video/${videoId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to extract audio from video' }));
      throw new Error(err.detail || 'Failed to extract audio from video');
    }
    return res.json();
  },

  async deleteAudio(audioId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/audio/${audioId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete audio' }));
      throw new Error(err.detail || 'Failed to delete audio');
    }
    return res.json();
  },

  // Export
  async startExport(payload: {
    project_id: string;
    resolution: string;
    aspect_ratio: string;
    quality: string;
    fps: number;
    timeline_state?: any;
  }): Promise<ExportStatus> {
    const res = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Export failed' }));
      throw new Error(err.detail || 'Failed to start export');
    }
    return res.json();
  },

  async getExportStatus(jobId: string): Promise<ExportStatus> {
    const res = await fetch(`${API_BASE}/export/${jobId}/status`);
    if (!res.ok) throw new Error('Failed to get export status');
    return res.json();
  },

  // Authentication
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('gbest_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async getAuthConfig(): Promise<{ google_client_id: string; is_google_configured: boolean; redirect_uri: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/config`);
      if (!res.ok) return { google_client_id: '', is_google_configured: false, redirect_uri: '' };
      return res.json();
    } catch {
      return { google_client_id: '', is_google_configured: false, redirect_uri: '' };
    }
  },

  getGoogleLoginUrl(loginHint?: string): string {
    const query = loginHint ? `?login_hint=${encodeURIComponent(loginHint)}` : '';
    return `${API_BASE}/auth/google/login${query}`;
  },

  async saveGoogleCredentials(clientId: string, clientSecret?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/save-google-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret || '' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to save Google credentials' }));
      throw new Error(err.detail || 'Failed to save Google credentials');
    }
    return res.json();
  },

  async loginGoogle(payload: { email?: string; name?: string; avatar?: string; credential?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Google authentication failed' }));
      throw new Error(err.detail || 'Google authentication failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('gbest_token', data.token);
    }
    return data;
  },

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('gbest_token', data.token);
    }
    return data;
  },

  async signup(name: string, email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('gbest_token', data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('gbest_token');
    localStorage.removeItem('gbest_user');
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {}
  },

  async getMe(userId?: string): Promise<any> {
    const headers = this.getAuthHeaders();
    const res = await fetch(`${API_BASE}/auth/me?user_id=${userId || ''}`, { headers });
    if (!res.ok) return { user: null };
    return res.json();
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
      throw new Error(err.detail || 'Failed to update profile');
    }
    const result = await res.json();
    if (result.user) {
      localStorage.setItem('gbest_user', JSON.stringify(result.user));
    }
    return result;
  },

  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.getAuthHeaders();
    const res = await fetch(`${API_BASE}/auth/profile/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload profile image' }));
      throw new Error(err.detail || 'Failed to upload profile image');
    }
    const result = await res.json();
    if (result.user) {
      localStorage.setItem('gbest_user', JSON.stringify(result.user));
    }
    return result;
  },

  // Site Configuration & Admin Customization
  async getSiteConfig(): Promise<Record<string, any>> {
    try {
      const res = await fetch(`${API_BASE}/site-config`);
      if (!res.ok) return {};
      const data = await res.json();
      return data.config || {};
    } catch {
      return {};
    }
  },

  async updateSiteConfig(settings: Record<string, any>): Promise<any> {
    const res = await fetch(`${API_BASE}/site-config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update site configuration' }));
      throw new Error(err.detail || 'Failed to update site configuration');
    }
    return res.json();
  },

  async uploadSiteAsset(file: File): Promise<{ url: string; filename: string; media_type: 'video' | 'image' }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/site-config/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload asset' }));
      throw new Error(err.detail || 'Failed to upload asset');
    }
    return res.json();
  },

  // Password Management
  async changePassword(payload: { current_password?: string; new_password: string }): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to change password' }));
      throw new Error(err.detail || 'Failed to change password');
    }
    return res.json();
  },

  // Admin User Management
  async getAdminUsers(): Promise<{ users: any[]; total: number }> {
    const res = await fetch(`${API_BASE}/auth/admin/users`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch users' }));
      throw new Error(err.detail || 'Failed to fetch users');
    }
    return res.json();
  },

  async toggleUserSuspension(userId: string): Promise<{ status: string; message: string; is_suspended: boolean }> {
    const res = await fetch(`${API_BASE}/auth/admin/users/${userId}/suspend`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update user status' }));
      throw new Error(err.detail || 'Failed to update user status');
    }
    return res.json();
  },

  async deleteAdminUser(userId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete user' }));
      throw new Error(err.detail || 'Failed to delete user');
    }
    return res.json();
  },
};


