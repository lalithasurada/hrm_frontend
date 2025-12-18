class ApiService {
  constructor() {
    this.baseURL = 'http://72.61.233.104:9000';
    this.endpoints = {
      login: '/login/users',
      getAllUsers: '/users/allusers',
      getProfile: '/users/user/profile',
      createUser: '/users/create/user',
      deleteUser: '/users/delete',
      updateUser: '/users/update',
      changePassword: '/users/change_password',
      getTeamLeads: '/users/team/leads',
      
      // --- CAREERS ENDPOINTS ---
      createJob: '/careers/create/job',
      getInternalJobs: '/careers/list/internal/jobs',
      getExternalJobs: '/careers/list/external/jobs'
      // Update & Delete are dynamic, handled in service
    };
  }

  getURL(endpointKey) {
    return `${this.baseURL}${this.endpoints[endpointKey]}`;
  }

  async request(endpointKey, options = {}) {
    const url = options.urlOverride 
      ? `${this.baseURL}${options.urlOverride}` 
      : this.getURL(endpointKey);

    let token = localStorage.getItem('access_token');
    if (token) token = token.replace(/^"|"$/g, '');

    const { urlOverride, ...fetchOptions } = options;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { ...fetchOptions, headers };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Request failed');
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const apiService = new ApiService();