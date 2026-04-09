import React, { useState, useEffect } from 'react';
import { PlayCircle, Image as ImageIcon } from 'lucide-react';

export default function MediaCard({ file, onClick }) {
  const isVideo = file.mimeType.includes("video");

  // Format thumbnail properly (Drive sometimes returns small thumbnails, append sz=w600 to increase size if it's drive url)
  let initialThumbUrl = file.thumbnailLink;
  if (initialThumbUrl && initialThumbUrl.includes("googleusercontent.com")) {
      initialThumbUrl = initialThumbUrl.replace(/=s\d+/, "=s600");
  } else if (!initialThumbUrl && file.id) {
      // Dùng link ép buộc nếu API chưa trả về thumbnail
      initialThumbUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w600`;
  }

  const [imgSrc, setImgSrc] = useState(initialThumbUrl);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setImgSrc(initialThumbUrl);
    setIsProcessing(false);
  }, [initialThumbUrl]);

  const handleError = () => {
    setIsProcessing(true);
    // Lặp lại tự động reload ảnh mỗi 3 giây nếu file bị Google báo lỗi 403/404 vì chưa xử lý xong
    setTimeout(() => {
      const glue = initialThumbUrl.includes('?') ? '&' : '?';
      setImgSrc(`${initialThumbUrl}${glue}retry=${Date.now()}`);
      setIsProcessing(false); // reset để img tag load lại, nếu lỗi nó lại chạy hàm này
    }, 3000);
  };

  return (
    <div className="media-card glass" onClick={() => onClick(file)}>
      {imgSrc && !isProcessing ? (
        <img 
          src={imgSrc} 
          alt={file.name} 
          className="media-thumbnail"
          loading="lazy"
          onError={handleError}
        />
      ) : (
        <div className="media-thumbnail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#334155' }}>
          {isVideo ? <PlayCircle size={48} color="#94a3b8" /> : <ImageIcon size={48} color="#94a3b8" />}
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
            Đang xử lý ảnh...
          </div>
        </div>
      )}
      
      <div className="media-type-icon">
        {isVideo ? <PlayCircle size={24} /> : <ImageIcon size={24} />}
      </div>
    </div>
  );
}
