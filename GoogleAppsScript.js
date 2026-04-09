// HƯỚNG DẪN TẠO API UPLOAD LÊN GOOGLE DRIVE MÀ KHÔNG CẦN LOGIN
// Vì Google Drive API không cho phép upload ẩn danh trực tiếp từ frontend.
// Bạn hãy làm theo các bước sau để tạo 1 link API Upload riêng cho bạn:
// 
// Bước 1: Truy cập https://script.google.com/ và tạo một dự án mới.
// Bước 2: Xóa hết code cũ, và dán toàn bộ đoạn code bên dưới vào.
// Bước 3: Nhấn nút Deploy (Triển khai) ở góc trên bên phải > New Deployment (Triển khai mới).
// Bước 4: Chọn loại là "Web App".
// Bước 5: Cấu hình:
//         - Execute as (Thực thi dưới quyền): Chọn "Me (Tài khoản của bạn)"
//         - Who has access (Ai có quyền truy cập): Chọn "Anyone (Bất kỳ ai)"
// Bước 6: Bấm Deploy, cấp quyền truy cập khi được hỏi.
// Bước 7: Copy lấy cái link "Web app URL" (nó có dạng https://script.google.com/macros/s/.../exec)
// Bước 8: Dán cái link đó vào file .env trong thư mục frontend của bạn: 
//         VITE_GOOGLE_APPS_SCRIPT_URL="link_ban_vua_copy"

function doPost(e) {
  // Bật CORS để web khác gọi được
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  try {
    var data = JSON.parse(e.postData.contents);

    // Chức năng xóa
    if (data.action === "delete" && data.fileId) {
      DriveApp.getFileById(data.fileId).setTrashed(true);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Xử lý upload mặc định
    var folderId = "1SSdtvJDAyYzYECGw9qj2eiprM7zVPL07";
    var folder = DriveApp.getFolderById(folderId);
    
    // Tạo file từ Base64
    var contentType = data.mimeType;
    var byteCharacters = Utilities.base64Decode(data.fileData);
    var blob = Utilities.newBlob(byteCharacters, contentType, data.fileName);
    var newFile = folder.createFile(blob);
    
    var response = {
      status: 'success',
      fileId: newFile.getId(),
      url: newFile.getUrl()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    var errResponse = {
      status: 'error',
      message: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  // Pre-flight request for CORS
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
