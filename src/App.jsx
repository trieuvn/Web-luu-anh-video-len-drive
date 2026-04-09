import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import MediaCard from './components/MediaCard';
import MediaDetail from './components/MediaDetail';
import UploadButton from './components/UploadButton';
import { fetchMedia, deleteMedia } from './services/googleDrive';
import './index.css';

function App() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [historyTokens, setHistoryTokens] = useState([]); // to go back
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    loadFiles("");
  }, []);

  const loadFiles = async (token) => {
    setLoading(true);
    const { files, nextPageToken: newToken } = await fetchMedia(token);
    setMediaList(files);
    setNextPageToken(newToken);
    setLoading(false);
  };

  const handleNextPage = () => {
    if (!nextPageToken) return;
    setHistoryTokens([...historyTokens, ""]);
    loadFiles(nextPageToken);
  };

  const handleRefresh = () => {
    setNextPageToken(null);
    setHistoryTokens([]);
    loadFiles("");
  };

  const handleDeleteMedia = async (file) => {
    setSelectedMedia(null); // Đóng modal ngay lập tức
    // Cập nhật giao diện xóa file ngay để tăng tốc độ UX (Optimistic Update)
    setMediaList((prev) => prev.filter(f => f.id !== file.id));
    
    // Gọi API xóa ẩn danh qua Webhook
    try {
      await deleteMedia(file.id);
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header glass">
        <h1 className="app-title">Thư Viện Ảnh</h1>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <Loader2 size={48} className="lucide-spin" color="#3b82f6" style={{ animation: 'spin 2s linear infinite' }} />
        </div>
      ) : (
        <>
          {mediaList.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
              <p>Không tìm thấy tệp nào.</p>
              <p>Hãy là người đầu tiên tải lên!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {mediaList.map((file) => (
                <MediaCard 
                  key={file.id} 
                  file={file} 
                  onClick={setSelectedMedia} 
                />
              ))}
            </div>
          )}

          <div className="pagination">
            <button className="btn-page" onClick={handleRefresh}>
              Làm mới trang
            </button>
            <button 
              className="btn-page" 
              onClick={handleNextPage} 
              disabled={!nextPageToken}
            >
              Trang tiếp
            </button>
          </div>
        </>
      )}

      <UploadButton onUploadComplete={handleRefresh} />

      {selectedMedia && (
        <MediaDetail 
          file={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
          onDelete={handleDeleteMedia}
        />
      )}
    </div>
  );
}

export default App;
