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
  const [documentMode, setDocumentMode] = useState<"text" | "file">("text");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Parse documents dari string JSON jika dalam format file
  useEffect(() => {
    if (documentMode === "file" && requiredDocuments) {
      try {
        // Coba parse sebagai JSON
        const parsedDocs = JSON.parse(requiredDocuments);
        if (Array.isArray(parsedDocs)) {
          setDocuments(parsedDocs);
        }
      } catch (e) {
        // Jika gagal parse, abaikan saja
        console.log("Dokumen bukan dalam format JSON");
      }
    }
  }, [requiredDocuments, documentMode]);

  // Deteksi format dokumen saat komponen dimount
  useEffect(() => {
    if (requiredDocuments) {
      try {
        // Coba parse sebagai JSON
        JSON.parse(requiredDocuments);
        // Jika berhasil parse, berarti ini dalam format file
        setDocumentMode("file");
      } catch (e) {
        // Jika gagal parse, ini format teks
        setDocumentMode("text");
      }
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequiredDocuments(e.target.value);
  };

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
    
    // Jika tidak ada dokumen tersisa, set ke string kosong
    if (updatedDocuments.length === 0) {
      setRequiredDocuments('');
      setDocumentMode("text");
    } else {
      setRequiredDocuments(JSON.stringify(updatedDocuments));
    }
  };
  
  const switchToTextMode = () => {
    setDocumentMode("text");
    // Reset file list
    setDocuments([]);
    // Reset ke empty string jika dari mode file
    if (documents.length > 0) {
      setRequiredDocuments('');
    }
  };
  
  const switchToFileMode = () => {
    setDocumentMode("file");
    // Init dengan array kosong
    setDocuments([]);
    setRequiredDocuments('[]');
  };

  return (
    <div>
      <label
        htmlFor="requiredDocuments"
        className="block text-sm font-medium text-gray-700"
      >
        Dokumen yang Dibutuhkan (opsional)
      </label>
      
      {/* Toggle untuk switch mode */}
      <div className="mt-2 mb-2 flex space-x-4">
        <button
          type="button"
          onClick={switchToTextMode}
          className={`px-3 py-1 text-sm rounded ${
            documentMode === "text" ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Mode Teks
        </button>
        <button
          type="button"
          onClick={switchToFileMode}
          className={`px-3 py-1 text-sm rounded ${
            documentMode === "file" ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Mode File
        </button>
      </div>
      
      {documentMode === "text" ? (
        // Mode teks
        <div className="mt-1">
          <textarea
            id="requiredDocuments"
            rows={3}
            value={requiredDocuments}
            onChange={handleTextChange}
            className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Masukkan daftar dokumen yang dibutuhkan"
          />
          <p className="mt-2 text-xs text-gray-500">
            Daftar dokumen yang diperlukan, pisahkan dengan baris baru.
          </p>
        </div>
      ) : (
        // Mode file
        <div className="mt-1">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {uploading ? 'Mengupload...' : 'Upload Dokumen'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf"
              multiple
            />
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          
          {documents.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Dokumen yang Diupload:</h4>
              <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
                {documents.map((doc, index) => (
                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      {doc.type.includes('image/') ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                      <span className="ml-2 flex-1 w-0 truncate">
                        {doc.name}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-500 mr-4">
                        Lihat
                      </a>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="mt-2 text-xs text-gray-500">
            Upload gambar atau file PDF untuk dokumen yang diperlukan.
          </p>
        </div>
      )}
    </div>
  );
};

export default RequiredDocumentsInput;