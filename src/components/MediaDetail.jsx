import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Trash } from 'lucide-react';

export default function MediaDetail({ file, onClose, onDelete }) {
  const isVideo = file.mimeType.includes("video");
  const [imgError, setImgError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // Trạng thái hiển thị Custom Popup
  
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

      {/* Button Xóa */}
      {onDelete && (
        <button 
          className="modal-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(true); // Hiện bảng Popup Mobile-Friendly
          }}
          title="Xóa ảnh/video"
        >
          <Trash size={22} />
        </button>
      )}

      {/* Button Mở rộng */}
      <a 
        href={file.webViewLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="modal-external-link"
        onClick={(e) => e.stopPropagation()}
        title="Mở trong thẻ mới"
      >
        <ExternalLink size={22} />
      </a>
      
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {isVideo ? (
          <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
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
                Bấm vào đây để xem ảnh nguyên bản
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

      {/* CUSTOM POPUP CONFIRMATION MOBILE FRIENDLY */}
      {showConfirm && (
        <div className="custom-confirm-overlay" onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}>
          <div className="custom-confirm-box glass" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa tệp</h3>
            <p>Tệp sẽ được chuyển vào thùng rác trên Google Drive của bạn. Thao tác này có thể kéo dài vài giây qua liên kết phụ.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowConfirm(false)}>Hủy</button>
              <button className="confirm-delete" onClick={() => {
                setShowConfirm(false);
                onDelete(file);
              }}>
                <Trash size={16} style={{ marginRight: '6px' }} />
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Icon đóng nằm ở default right: 1.5rem (trong index.css) */
        
        .modal-delete-btn {
          position: absolute;
          top: 1.5rem;
          right: 5rem;
          color: white;
          background: rgba(239, 68, 68, 0.7);
          border: none;
          padding: 0.6rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          z-index: 101;
          display: flex;
        }
        .modal-delete-btn:active { transform: scale(0.9); }

        .modal-external-link {
          position: absolute;
          top: 1.5rem;
          right: 8.5rem;
          color: white;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          padding: 0.6rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          z-index: 101;
          display: flex;
        }
        .modal-external-link:active { transform: scale(0.9); }

        /* Custom Popup Styles */
        .custom-confirm-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .custom-confirm-box {
          background: var(--bg-secondary); padding: 1.8rem;
          border-radius: var(--radius-md); text-align: center;
          width: 85%; max-width: 320px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: scaleIn 0.2s ease;
        }
        .custom-confirm-box h3 { 
          margin-bottom: 0.7rem; color: #fff; font-size: 1.2rem; 
        }
        .custom-confirm-box p { 
          color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.4; 
        }
        .confirm-actions { display: flex; gap: 0.8rem; justify-content: center; }
        .confirm-cancel { 
          flex: 1; padding: 0.6rem; border-radius: var(--radius-md); 
          border: 1px solid rgba(255,255,255,0.2); background: transparent; 
          color: white; cursor: pointer; font-family: var(--font-family);
        }
        .confirm-delete { 
          flex: 1; padding: 0.6rem; border-radius: var(--radius-md); 
          border: none; background: #ef4444; color: white; 
          cursor: pointer; font-family: var(--font-family); font-weight: 500;
          display: flex; align-items: center; justify-content: center;
        }
        .confirm-delete:active, .confirm-cancel:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
}
