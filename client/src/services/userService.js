import api from './api';

export const userService = {
  getAllUsers: async () => {
    const { data } = await api.get('/users');
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data?.user;
  },

  updateProfile: async (payload) => {
    const { data } = await api.patch('/users/profile', payload);
    return data;
  },

  updateUserRole: async (id, role) => {
    const { data } = await api.patch(`/users/${id}/role`, { role });
    return data;
  }
};

export default userService;
