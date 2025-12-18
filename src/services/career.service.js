import { apiService } from './api.service';

class CareerService {
  // 1. Create Job
  async createJob(jobData) {
    return await apiService.request('createJob', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  // 2. Get Internal Jobs
  async getInternalJobs() {
    return await apiService.request('getInternalJobs', { method: 'GET' });
  }

  // 3. Get External Jobs
  async getExternalJobs() {
    return await apiService.request('getExternalJobs', { method: 'GET' });
  }

  // 4. Update Job (Dynamic URL based on type)
  async updateJob(jobId, jobType, jobData) {
    // jobType usually 'internal' or 'external'
    const type = jobType.toLowerCase(); 
    return await apiService.request('updateJob', {
      method: 'PATCH',
      body: JSON.stringify(jobData),
      urlOverride: `/careers/update/job/${type}/${jobId}`
    });
  }

  // 5. Delete Job (Dynamic URL based on type)
  async deleteJob(jobId, jobType) {
    const type = jobType.toLowerCase();
    return await apiService.request('deleteJob', {
      method: 'DELETE',
      urlOverride: `/careers/delete/job/${type}/${jobId}`
    });
  }
}

export const careerService = new CareerService();