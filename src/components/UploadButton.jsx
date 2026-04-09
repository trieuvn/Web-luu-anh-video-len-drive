import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadMedia } from '../services/googleDrive';

export default function UploadButton({ onUploadComplete }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Direct upload passing via Google Apps Script (Webhook)
      await uploadMedia(file); 
      console.log("Upload successful!");
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload. See console for details.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file could be selected again
      event.target.value = null; 
    }
  };

  return (
    <div className="fab-container">
      <input 
        type="file" 
        accept="image/*,video/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden-input"
        capture="environment" // Encourages mobile to open camera straight away
      />
      <button className="fab-button" onClick={handleClick} disabled={isUploading} aria-label="Tải ảnh hoặc video lên">
        {isUploading ? (
          <Loader2 size={28} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} />
        ) : (
          <Upload size={28} />
        )}
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
