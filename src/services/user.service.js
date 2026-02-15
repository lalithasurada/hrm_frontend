import { apiService } from './api.service';

class UserService {
  async getProfile() {
    return await apiService.request('getProfile', { method: 'GET' });
  }

  async getAllUsers() {
    return await apiService.request('getAllUsers', { method: 'GET' });
  }

  // CREATE - Uses FormData with SPECIFIC API URL
  async createUser(formData) {
    console.log('UserService: Creating user with FormData');
    return await apiService.request('createUser', {
      method: 'POST',
      body: formData,
      // Use the specific wapsend.in URL for user creation
      urlOverride: 'https://hrm-backend.wapsend.in/users/create/user'
    });
  }

  async deleteUser(userId) {
    return await apiService.request('deleteUser', {
      method: 'DELETE',
      urlOverride: `/users/delete/${userId}`
    });
  }

  // UPDATE - Uses JSON
  async updateUser(userId, updateData) {
    console.log('UserService: Updating user with JSON:', updateData);
    return await apiService.request('updateUser', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
      urlOverride: `/users/update/${userId}`
    });
  }

  async changePassword(userId, newPassword) {
    return await apiService.request('changePassword', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, new_password: newPassword })
    });
  }

  async getTeamLeads() {
    return await apiService.request('getTeamLeads', { method: 'GET' });
  }

  async resetUserPassword(userId) {
    return await apiService.request('resetUserPassword', {
      method: 'PUT',
      urlOverride: `/users/reset_password/${userId}`
    });
  }
}

export const userService = new UserService();