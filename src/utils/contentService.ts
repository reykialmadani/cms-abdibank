import axios from 'axios';

interface ContentServiceResponse {
  success: boolean;
  message: string;
}

/**
 * Delete a content item by ID
 * @param contentId - The ID of the content to delete
 * @returns Promise that resolves with the response data
 */
export async function deleteContent(contentId: number): Promise<ContentServiceResponse> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  try {
    const response = await axios.delete(`/api/content/${contentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      message: response.data.message || 'Content berhasil dihapus'
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menghapus content';
      throw new Error(errorMessage);
    } else {
      throw new Error('Terjadi kesalahan pada server');
    }
  }
}