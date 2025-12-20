import { apiService } from './api.service';

class CareerService {
  // =============================================================
  // EXISTING CODE (AS IT IS - DO NOT CHANGE)
  // =============================================================

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

  // =============================================================
  // NEW REQUIREMENTS ADDED BELOW
  // =============================================================

  // 6. Post Job (Updates posted_date & status)
  // URL: /careers/update/job/{type}/{id}
  async postJob(jobId, jobType, date) {
    const type = jobType.toLowerCase();
    return await apiService.request('updateJob', { // Reusing 'updateJob' key context
      method: 'PATCH',
      body: JSON.stringify({ posted_date: date, job_status: 'open' }),
      urlOverride: `/careers/update/job/${type}/${jobId}`
    });
  }

  // 7. Get Job Details (For Public Apply Page)
  // URL: /careers/job/details/{type}/{id}
  async getJobDetails(jobId, jobType) {
    const type = jobType.toLowerCase();
    return await apiService.request('getJobDetails', { // New context key (handled via override)
      method: 'GET',
      urlOverride: `/careers/job/details/${type}/${jobId}`
    });
  }

  // 8. Submit Application (Candidate Form Submit)
  // URL: /careers/applications/{type}/{id}
  // NOTE: formData automatically handles Content-Type: multipart/form-data
  async submitApplication(jobId, jobType, formData) {
    const type = jobType.toLowerCase();
    return await apiService.request('submitApplication', { 
      method: 'POST',
      body: formData, 
      urlOverride: `/careers/applications/${type}/${jobId}`
    });
  }

  // 9. Get Applied Applications (For HR/Recruiter View)
  // URL: /careers/job/applications/{type}/{id}
  async getJobApplications(jobId, jobType) {
    const type = jobType.toLowerCase();
    return await apiService.request('getJobApplications', {
      method: 'GET',
      urlOverride: `/careers/job/applications/${type}/${jobId}`
    });
  }
}

export const careerService = new CareerService();