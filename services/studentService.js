// src/services/studentService.js
import api from './api';

export const studentService = {
  createStudent: async (data) => {
    try {
      const config = data instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      } : {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await api.post('/Alunos/Create', data, config);
      return response.data;
    } catch (error) {
      console.error('Erro no serviço:', error);
      throw error;
    }
  },

  getAllStudents: async () => {
    const response = await api.get('/Alunos/Get_all');
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await api.get(`/Alunos/Get_id?id_aluno=${id}`);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await api.put(`/Alunos/Update?id_aluno=${id}`, studentData);
    return response.data;
  }
};