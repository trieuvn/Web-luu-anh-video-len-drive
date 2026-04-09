import React, { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function MediaDetail({ file, onClose }) {
  const isVideo = file.mimeType.includes("video");
  const [imgError, setImgError] = useState(false);
  
  // Dùng thumbnail 2048 nếu có, nếu không thì dùng webContentLink hoặc link cố định
  const hqImageUrl = file.thumbnailLink 
      ? file.thumbnailLink.replace(/=s\d+/, "=s2048") 
      : (file.webContentLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w2048`);

  // Xây dựng iframe preview URL tuyệt đối từ file.id thay vì replace Regex không ổn định
  const videoIframeUrl = `https://drive.google.com/file/d/${file.id}/preview`;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="modal-close" onClick={onClose} aria-label="Đóng">
        <X size={28} />
      </button>

      {/* Button mở tab mới đề phòng iframe / ảnh bị Google chặn hiển thị nhúng */}
      <a 
        href={file.webViewLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="modal-external-link"
        onClick={(e) => e.stopPropagation()}
        title="Mở trong thẻ mới"
      >
        <ExternalLink size={24} />
      </a>
      
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
            {/* Vài trường hợp mạng delay iframe trắng, dòng chữ Loading sẽ hiển thị bên dưới */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', zIndex: -1 }}>Đang tải Video từ Google Drive...</div>
            <iframe 
              src={videoIframeUrl} 
              className="modal-media"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-md)', background: 'transparent' }}
              allow="autoplay"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          imgError ? (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <p>Ảnh không thể nhúng trực tiếp do chính sách bảo mật của Google.</p>
              <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                Bấm vào đây để xem ảnh
              </a>
            </div>
          ) : (
            <img 
              src={hqImageUrl} 
              alt={file.name} 
              className="modal-media" 
              onError={() => setImgError(true)}
            />
          )
        )}
      </div>

      <style>{`
        .modal-external-link {
          position: absolute;
          top: 1.5rem;
          right: 5rem;
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 0.5rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background 0.2s;
          z-index: 101;
        }
        .modal-external-link:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
