class ApiService {
  constructor() {
    this.baseURL = 'https://hrm-backend-q7xc.onrender.com';
    this.endpoints = {
      login: '/login/users',
      getAllUsers: '/users/allusers',
      getProfile: '/users/user/profile',
      createUser: '/users/create/user',
      deleteUser: '/users/delete',
      updateUser: '/users/update',
      changePassword: '/users/change_password',
      getTeamLeads: '/users/team/leads',
      createJob: '/careers/create/job',
      getInternalJobs: '/careers/list/internal/jobs',
      getExternalJobs: '/careers/list/external/jobs',
      resetUserPassword: '/users/reset_password',
      // Leave Endpoints
      getYearlyStats: '/leaves/users',
      getMonthlyStats: '/leaves/users',
      applyLeave: '/leaves/apply',
      getAllApplications: '/leaves/all/applications',
      getLeaveDetails: '/leaves/get/leave_application/details/',
      getUserLeaveHistory: '/leaves/get/user/leaves/',
      reviewLeave: '/leaves/applications',
      // Permission Endpoints
      applyPermission: '/leaves/permission/apply/',
      reviewPermission: '/leaves/permission/review/',
      // Attendance
      checkIn: '/attendace/checkin',
      checkOut: '/attendace/checkout',
      getTodayAttendance: '/attendace/get_attendance',
      getTeamAttendanceAnalysis: '/attendace/hr/attendance/analysis/',
      updateAttendance: '/attendace/hr/attendance/update'
    };
  }

  getURL(endpointKey) {
    return `${this.baseURL}${this.endpoints[endpointKey]}`;
  }

  async request(endpointKey, options = {}) {
    // Determine the URL
    let url;
    if (options.urlOverride && options.urlOverride.startsWith('http')) {
      url = options.urlOverride;
    } else {
      url = options.urlOverride ? `${this.baseURL}${options.urlOverride}` : this.getURL(endpointKey);
    }

    // Get token
    let token = localStorage.getItem('access_token');
    if (token) token = token.replace(/^"|"$/g, '');

    const { urlOverride, ...fetchOptions } = options;
    const headers = { ...options.headers };

    // DON'T set Content-Type for FormData - browser will set it automatically with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
      ...fetchOptions,
      headers
    };

    console.log('API Request:', {
      url,
      method: config.method,
      hasToken: !!token,
      isFormData: options.body instanceof FormData
    });

    try {
      const response = await fetch(url, config);

      console.log('API Response Status:', response.status);

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      // CRITICAL FIX: Don't auto-logout on 401 for createUser endpoint
      if (response.status === 401) {
        // Check if this is a create user request
        if (url.includes('/users/create/user') || endpointKey === 'createUser') {
          const errorData = await response.json().catch(() => ({ detail: 'Unauthorized' }));
          console.error('Create User 401 Error:', errorData);
          return { success: false, error: errorData.detail || errorData.message || 'Unauthorized to create user' };
        }
        
        // For other endpoints, do the logout
        if (endpointKey !== 'login') {
          localStorage.clear();
          window.location.href = '/';
          return { success: false, error: 'Session Expired' };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.detail || data.message || 'Request failed');
      }

      console.log('API Success Response:', data);
      return { success: true, data };

    } catch (error) {
      console.error('API Request Failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const apiService = new ApiService();