import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/', // Replace with your actual API URL
  timeout: 10000, // Request timeout (optional)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
