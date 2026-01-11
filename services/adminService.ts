
const API_URL = 'http://localhost:3001/api/admin';

export interface CreateUserData {
  email: string;
  password?: string; // Opcional, si volem que la generi el servidor o s'enviï un enllaç
  fullName: string;
  role: string;
}

export const adminService = {
  /**
   * Crea un nou usuari mitjançant el servidor backend
   */
  createUser: async (userData: CreateUserData) => {
    try {
      const response = await fetch(`${API_URL}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Aquí podries afegir un token d'autorització si en el futur
          // vols verificar que qui fa la petició és un admin loguejat al frontend
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconegut creant l\'usuari');
      }

      return data;
    } catch (error) {
      console.error('Error al servei adminService.createUser:', error);
      throw error;
    }
  },

  /**
   * Elimina un usuari mitjançant el servidor backend
   */
  deleteUser: async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/delete-user/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconegut eliminant l\'usuari');
      }

      return data;
    } catch (error) {
      console.error('Error al servei adminService.deleteUser:', error);
      throw error;
    }
  }
};
