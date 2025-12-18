import { apiService } from './api.service';

class UserService {
  async getProfile() {
    return await apiService.request('getProfile', { method: 'GET' });
  }

  async getAllUsers() {
    return await apiService.request('getAllUsers', { method: 'GET' });
  }

  async createUser(userData) {
    return await apiService.request('createUser', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId) {
    return await apiService.request('deleteUser', {
      method: 'DELETE',
      urlOverride: `/users/delete/${userId}`
    });
  }

  async updateUser(userId, userData) {
    return await apiService.request('updateUser', {
      method: 'PUT',
      body: JSON.stringify(userData),
      urlOverride: `/users/update/${userId}`
    });
  }

  async changePassword(userId, newPassword) {
    return await apiService.request('changePassword', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, new_password: newPassword })
    });
  }

  // --- NEW: Get Team Leads ---
  async getTeamLeads() {
    return await apiService.request('getTeamLeads', { method: 'GET' });
  }
}

export const userService = new UserService();