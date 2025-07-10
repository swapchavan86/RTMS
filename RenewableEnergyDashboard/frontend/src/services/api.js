import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee and Leaderboard Endpoints
export const getEmployees = (skip = 0, limit = 100) => {
  return apiClient.get(`/employees/?skip=${skip}&limit=${limit}`);
};

export const getEmployeeById = (employeeId) => {
  return apiClient.get(`/employees/${employeeId}`);
};

export const getLeaderboard = (limit = 10) => {
  return apiClient.get(`/employees/leaderboard/?limit=${limit}`);
};

// Energy Endpoints
export const getLaptopUsage = () => {
  return apiClient.get('/energy/laptop-usage/');
};

export const getLightingStatus = () => {
  return apiClient.get('/energy/lighting/');
};

export const getHvacStatus = () => {
  return apiClient.get('/energy/hvac/');
};

// Seating Endpoints
export const getSeatingArrangement = () => {
  return apiClient.get('/seating/arrangement/');
};

export const getSeatingSuggestions = () => {
  return apiClient.get('/seating/suggestions/');
};

// Example of how to handle potential errors (optional, can be done in components)
// export const getLeaderboardWithErrorHandling = async (limit = 10) => {
//   try {
//     const response = await apiClient.get(`/employees/leaderboard/?limit=${limit}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching leaderboard:', error);
//     // You could throw the error, return a default value, or an error object
//     throw error;
//   }
// };

export default apiClient;
