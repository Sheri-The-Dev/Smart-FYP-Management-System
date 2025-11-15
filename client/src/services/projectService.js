import api from './api';

// ============================================
// SEARCH PROJECTS (All Roles)
// ============================================
export const searchProjects = async (filters) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.supervisor) params.append('supervisor', filters.supervisor);
    if (filters.year) params.append('year', filters.year);
    if (filters.department) params.append('department', filters.department);
    if (filters.technology) params.append('technology', filters.technology);
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.operator) params.append('operator', filters.operator);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get(`/projects/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search projects' };
  }
};

// ============================================
// GET PROJECT DETAILS (All Roles)
// ============================================
export const getProjectDetails = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get project details' };
  }
};

// ============================================
// GET FILTER OPTIONS (All Roles)
// ============================================
export const getFilterOptions = async () => {
  try {
    const response = await api.get('/projects/filters/options');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get filter options' };
  }
};

// ============================================
// ADMIN: CREATE PROJECT
// ============================================
export const createProject = async (projectData) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create project' };
  }
};

// ============================================
// ADMIN: UPDATE PROJECT
// ============================================
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update project' };
  }
};

// ============================================
// ADMIN: DELETE PROJECT
// ============================================
export const deleteProject = async (projectId) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete project' };
  }
};

// ============================================
// ADMIN: BULK IMPORT PROJECTS
// ============================================
export const bulkImportProjects = async (projects) => {
  try {
    const response = await api.post('/projects/bulk-import', { projects });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to import projects' };
  }
};

// ============================================
// ADMIN: GET PROJECT STATISTICS
// ============================================
export const getProjectStats = async () => {
  try {
    const response = await api.get('/projects/stats/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get project statistics' };
  }
};

// ============================================
// HELPER: Parse CSV File
// ============================================
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or has no data rows'));
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Required fields
        const requiredFields = ['title', 'year', 'abstract', 'department', 'supervisor_name'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          reject(new Error(`Missing required columns: ${missingFields.join(', ')}`));
          return;
        }

        // Parse data rows
        const projects = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length !== headers.length) {
            continue; // Skip malformed rows
          }

          const project = {};
          headers.forEach((header, index) => {
            project[header] = values[index] || null;
          });

          // Map to correct field names
          projects.push({
            title: project.title,
            year: project.year,
            abstract: project.abstract,
            department: project.department,
            supervisor_name: project.supervisor_name,
            supervisor_id: project.supervisor_id || null,
            technology_type: project.technology_type || project.technology || null,
            final_grade: project.final_grade || project.grade || null,
            keywords: project.keywords || null,
            student_names: project.student_names || project.students || null
          });
        }

        resolve(projects);
      } catch (error) {
        reject(new Error('Failed to parse CSV file: ' + error.message));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// ============================================
// HELPER: Parse Excel File
// ============================================
export const parseExcelFile = async (file) => {
  // This would require a library like xlsx
  // For now, return a promise that guides the user
  return new Promise((resolve, reject) => {
    reject(new Error('Excel parsing requires additional library. Please use CSV format or convert Excel to CSV first.'));
  });
};

// ============================================
// HELPER: Validate Project Data
// ============================================
export const validateProjectData = (project) => {
  const errors = [];

  if (!project.title || project.title.length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (!project.year || !/^\d{4}$/.test(project.year)) {
    errors.push('Year must be a valid 4-digit number');
  }

  if (!project.abstract || project.abstract.length < 50) {
    errors.push('Abstract must be at least 50 characters');
  }

  if (!project.department) {
    errors.push('Department is required');
  }

  if (!project.supervisor_name) {
    errors.push('Supervisor name is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};