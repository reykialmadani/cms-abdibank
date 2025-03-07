import React, { useState, useRef, useEffect } from "react";

interface DocumentFile {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface RequiredDocumentsInputProps {
  requiredDocuments: string;
  setRequiredDocuments: (value: string) => void;
}

const RequiredDocumentsInput: React.FC<RequiredDocumentsInputProps> = ({
  requiredDocuments,
  setRequiredDocuments,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Parse documents dari string JSON
  useEffect(() => {
    if (requiredDocuments) {
      try {
        // Coba parse sebagai JSON
        const parsedDocs = JSON.parse(requiredDocuments);
        if (Array.isArray(parsedDocs)) {
          setDocuments(parsedDocs);
        }
      } catch (e) {
        // Jika gagal parse, inisialisasi dengan array kosong
        setRequiredDocuments('[]');
        setDocuments([]);
      }
    } else {
      // Jika kosong, inisialisasi dengan array kosong
      setRequiredDocuments('[]');
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError(null);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validasi tipe file
      if (!file.type.includes('image/') && file.type !== 'application/pdf') {
        setError('Hanya file gambar dan PDF yang diperbolehkan');
        setUploading(false);
        return;
      }
      
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        setUploading(false);
        return;
      }
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        console.log("Uploading file:", file.name);
        
        // Gunakan URL absolut untuk API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        console.log("Upload response status:", response.status);
        
        // Check if response is OK
        if (!response.ok) {
          // Try to read response as text first
          const responseText = await response.text();
          console.error("Error response:", responseText);
          
          try {
            // Try to parse as JSON if possible
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.error || 'Gagal mengupload file');
          } catch (jsonError) {
            // If not valid JSON, use text or default message
            throw new Error(
              responseText.includes('<!DOCTYPE') 
                ? 'Server error: Cek console untuk detail' 
                : responseText || 'Gagal mengupload file'
            );
          }
        }
        
        // Parse successful response
        const resultText = await response.text();
        let result;
        
        try {
          result = JSON.parse(resultText);
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", resultText);
          throw new Error('Format response tidak valid');
        }
        
        if (!result.data || !result.data.url) {
          throw new Error('Response tidak mengandung data file yang valid');
        }
        
        // Update state dokumen
        const newDocument: DocumentFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          url: result.data.url,
        };
        
        const newDocuments = [...documents, newDocument];
        setDocuments(newDocuments);
        
        // Update requiredDocuments dengan JSON string
        setRequiredDocuments(JSON.stringify(newDocuments));
      } catch (error: any) {
        console.error('Error uploading file:', error);
        setError(error.message || 'Gagal mengupload file. Silakan coba lagi.');
      }
    }
    
    setUploading(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeDocument = (index: number) => {
    const updatedDocuments = [...documents];
    updatedDocuments.splice(index, 1);
    setDocuments(updatedDocuments);
    
    // Update required documents
    setRequiredDocuments(JSON.stringify(updatedDocuments));
  };

  // Fungsi untuk mendapatkan ukuran file dalam format yang mudah dibaca
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <label
          htmlFor="requiredDocuments"
          className="text-lg font-semibold text-gray-800"
        >
          Dokumen yang Dibutuhkan
        </label>
        <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
          Opsional
        </span>
      </div>
      
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-200"
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengupload...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Dokumen
              </>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf"
            multiple
          />
          
          <div className="text-sm text-gray-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Max 5MB (PDF, JPG, PNG)</span>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 bg-red-50 text-red-700 px-4 py-3 rounded-md flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
      
      {documents.length > 0 ? (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Dokumen yang Diupload ({documents.length})
          </h4>
          <div className="bg-gray-50 rounded-lg border border-gray-200">
            {documents.map((doc, index) => (
              <div 
                key={index} 
                className={`px-4 py-3 flex items-center justify-between text-sm ${
                  index !== documents.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center bg-gray-100">
                    {doc.type.includes('image/') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 ml-4">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat
                  </a>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="flex items-center font-medium text-red-600 hover:text-red-500 hover:underline transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h5 className="text-gray-700 font-medium mb-1">Belum ada dokumen</h5>
          <p className="text-gray-500 text-sm mb-3">Upload gambar atau PDF untuk dokumen yang diperlukan</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Pilih file
          </button>
        </div>
      )}
    </div>
  );
};

export default RequiredDocumentsInput;