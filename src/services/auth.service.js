import { apiService } from './api.service';

class AuthService {
  // 1. LOGIN
  async login(email, password) {
    const result = await apiService.request('login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (result.success) {
      const { user, access_token } = result.data;
      
      // Store Token
      if (access_token) {
        localStorage.setItem('access_token', access_token);
      }

      // Store User Info & Role Logic
      if (user) {
        localStorage.setItem('user', JSON.stringify(user)); 
        localStorage.setItem('user_role', user.role); // Role: superadmin/admin/hr
        localStorage.setItem('employee_id', user.employ_id); // EMP001
      }
      
      return { success: true, user };
    }
    
    return result;
  }

  // 2. LOGOUT
  logout() {
    localStorage.clear(); // Clear all data
  }

  // 3. GET CURRENT USER OBJECT
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 4. CHECK IF LOGGED IN (This was missing!)
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token; // Returns true if token exists, false otherwise
  }

  // 5. GET TOKEN
  getToken() {
    return localStorage.getItem('access_token');
  }

  // 6. GET ROLE (Helper)
  getRole() {
    return localStorage.getItem('user_role');
  }

  // 7. GET EMPLOYEE ID (Helper)
  getEmployeeId() {
    return localStorage.getItem('employee_id');
  }
}

export const authService = new AuthService();