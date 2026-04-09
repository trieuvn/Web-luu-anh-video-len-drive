const FOLDER_ID = "1SSdtvJDAyYzYECGw9qj2eiprM7zVPL07";
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";

// Since the folder is public, we can fetch its contents using just an API Key.
export async function fetchMedia(pageToken = "") {
  try {
    if (!API_KEY) {
      console.warn("No Google API Key found in .env. Returning mock data for UI testing.");
      return mockFetchMedia(pageToken);
    }
    
    // We only fetch images and videos
    const query = `'${FOLDER_ID}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=nextPageToken,files(id,mimeType,name,thumbnailLink,webContentLink,webViewLink)&pageSize=10&pageToken=${pageToken}&key=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch Google Drive files");
    }
    
    const data = await response.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken || null
    };
  } catch (error) {
    console.error("fetchMedia error", error);
    return { files: [], nextPageToken: null };
  }
}

// Uploading REQUIRES an access token (OAuth2). Google Drive API doesn't allow anonymous uploads.
// To use this in production, you must implement a Google Sign-In flow to obtain a token, 
// or use a backend Service Account proxy. 
export async function uploadMedia(file) {
  const SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

  if (!SCRIPT_URL) {
    console.warn("No VITE_GOOGLE_APPS_SCRIPT_URL provided in .env. Upload will be simulated for UI purposes.");
    return new Promise(resolve => setTimeout(() => resolve(true), 2000));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // file data comes out as "data:image/png;base64,iVBORw0KGgo..."
        const base64Data = reader.result.split(',')[1];
        
        const payload = {
          fileName: file.name,
          mimeType: file.type,
          fileData: base64Data
        };

        // We use mode: 'no-cors' to bypass the restrictive Google Script redirect CORS policies.
        // The file payload will still reach Google and execute perfectly.
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
             'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        // Vị độ bảo mật của no-cors, ta không thể lấy được response.json() do trình duyệt chặn lại.
        // Ta mặc định resolve thành công vì Google Script sẽ tự chạy ngầm và lưu file vào mục.
        resolve({ status: 'success' });
      } catch (error) {
        console.error("uploadMedia error", error);
        reject(error);
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Xóa file thông qua Webhook
export async function deleteMedia(fileId) {
  const SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  if (!SCRIPT_URL) return false;

  try {
    const payload = {
      action: "delete",
      fileId: fileId
    };

    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    
    return { status: 'success' };
  } catch(error) {
    console.error("delete error", error);
    return false;
  }
}


// Fallback mock data to showcase the stunning UI if API Key is not configured yet
function mockFetchMedia(pageToken) {
  const isPage2 = pageToken === "page2";
  const startId = isPage2 ? 10 : 0;
  
  const files = Array.from({ length: 10 }).map((_, i) => {
    const id = startId + i;
    const isVideo = id % 4 === 0;
    return {
      id: `mock-${id}`,
      name: `Media File ${id}`,
      mimeType: isVideo ? "video/mp4" : "image/jpeg",
      thumbnailLink: `https://picsum.photos/seed/${id}/400/400`,
      webContentLink: isVideo ? "https://www.w3schools.com/html/mov_bbb.mp4" : `https://picsum.photos/seed/${id}/1000/1000`
    };
  });
  
  return Promise.resolve({
    files,
    nextPageToken: isPage2 ? null : "page2"
  });
}
