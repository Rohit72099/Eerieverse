import axios from 'axios';

// Configure your Express server URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string; name: string }) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },
};

// Story APIs
export const storyAPI = {
  createStory: async (storyData: { title: string; content: string; genre: string }) => {
    const response = await api.post('/save-story', storyData);
    return response.data;
  },
  
  getAllStories: async () => {
    const response = await api.get('/userhome');
    return response.data;
  },
  
  getUserStories: async () => {
    const response = await api.get('/user-story');
    return response.data;
  },
  
  getStoryById: async (storyId: string) => {
    const response = await api.get(`/story/${storyId}`);
    return response.data;
  },
  
  likeStory: async (storyId: string) => {
    const response = await api.put(`/${storyId}/like`);
    return response.data;
  },
  
  unlikeStory: async (storyId: string) => {
    const response = await api.put(`/${storyId}/unlike`);
    return response.data;
  },
  
  saveStory: async (storyId: string) => {
    const response = await api.put(`/${storyId}/save`);
    return response.data;
  },
  
  getLikedStories: async () => {
    const response = await api.get('/liked-stories');
    return response.data;
  },
  
  getSavedStories: async () => {
    const response = await api.get('/saved-stories');
    return response.data;
  },
};

// Comment APIs
export const commentAPI = {
  getStoryComments: async (storyId: string) => {
    const response = await api.get(`/story/${storyId}/comments`);
    return response.data;
  },

  createComment: async (storyId: string, content: string) => {
    const response = await api.post(`/story/${storyId}/comment`, { content });
    return response.data;
  },

  likeComment: async (commentId: string) => {
    const response = await api.put(`/comment/${commentId}/like`);
    return response.data;
  },

  dislikeComment: async (commentId: string) => {
    const response = await api.put(`/comment/${commentId}/dislike`);
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await api.delete(`/comment/${commentId}`);
    return response.data;
  },
};

// User Profile APIs
export const userAPI = {
  getUserProfile: async (username: string) => {
    const response = await api.get(`/user/${username}`);
    return response.data;
  },

  followUser: async (userId: string) => {
    const response = await api.post(`/user/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId: string) => {
    const response = await api.post(`/user/${userId}/unfollow`);
    return response.data;
  },

  getFollowers: async (username: string) => {
    const response = await api.get(`/user/${username}/followers`);
    return response.data;
  },

  getFollowing: async (username: string) => {
    const response = await api.get(`/user/${username}/following`);
    return response.data;
  },

  getUserStories: async (username: string) => {
    const response = await api.get(`/user/${username}/stories`);
    return response.data;
  },
};

// Search APIs
export const searchAPI = {
  searchStories: async (query: string) => {
    const response = await api.get(`/search/stories?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default api;
