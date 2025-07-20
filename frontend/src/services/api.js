const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to handle fetch with JSON
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API error');
  }
  return data;
}

export const api = {
  async login({ emailOrPhone, password }) {
    return fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });
  },
  async register(form) {
    return fetchJson(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        profile: {
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: '2000-01-01', // Placeholder, add to form if needed
          gender: 'other', // Placeholder, add to form if needed
          address: { city: 'Lagos', state: 'Lagos', country: 'Nigeria' }, // Placeholder
        },
      }),
    });
  },
  async verifyPhone({ phone, code }) {
    return fetchJson(`${API_BASE}/auth/verify-phone`, {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    });
  },
  async getProfile(token) {
    return fetchJson(`${API_BASE}/users/profile`, {
      method: 'GET',
      token,
    });
  },
  async updateProfile(token, profile) {
    return fetchJson(`${API_BASE}/users/profile`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ profile }),
    });
  },
  async forgotPassword(email) {
    return fetchJson(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async resetPassword({ token, password }) {
    return fetchJson(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
  async refreshToken(refreshToken) {
    return fetchJson(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  // Add more API methods as needed
}; 