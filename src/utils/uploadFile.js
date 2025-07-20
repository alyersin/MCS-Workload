// UPLOAD FILE TO BACKEND WITH METADATA
export async function uploadFileWithMeta(file, formType, date, userId) {
  const fallbackUid = "unknown-user";
  const fallbackForm = "unknown-form";
  const fallbackDate = new Date().toISOString().slice(0, 10);

  console.log("uploadFileWithMeta():", {
    file,
    formType,
    date,
    userId,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("formType", formType || fallbackForm);
  formData.append("date", date || fallbackDate);
  formData.append("userId", userId || fallbackUid);

  const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_SERVER_URL;

  const password = process.env.NEXT_PUBLIC_UPLOAD_SERVER_PASSWORD;
  if (password) {
    formData.append("password", password);
  }

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("UPLOAD FAILED:", errorText);
    throw new Error("FILE UPLOAD FAILED");
  }

  const response = await res.json();
  console.log("Upload response:", response);
  return response;
}

// UPLOAD MULTIPLE FILES WITH PROGRESS CALLBACK
export async function uploadFilesWithMeta(
  files,
  formType,
  date,
  userId,
  onProgress,
  meta = {}
) {
  const fallbackUid = "unknown-user";
  const fallbackForm = "unknown-form";
  const fallbackDate = new Date().toISOString().slice(0, 10);
  const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_SERVER_URL;
  const password = process.env.NEXT_PUBLIC_UPLOAD_SERVER_PASSWORD;

  let totalSize = 0;
  let uploadedSize = 0;
  files.forEach((f) => {
    totalSize += f.size;
  });

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("formType", formType || fallbackForm);
      formData.append("date", date || fallbackDate);
      formData.append("userId", userId || fallbackUid);
      if (password) formData.append("password", password);
      // APPEND EXTRA META FIELDS
      Object.entries(meta).forEach(([key, value]) =>
        formData.append(key, value)
      );
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          uploadedSize =
            files.slice(0, i).reduce((sum, f) => sum + f.size, 0) +
            event.loaded;
          const percent = Math.round((uploadedSize / totalSize) * 100);
          if (onProgress) onProgress(percent, uploadedSize, totalSize, i, file);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            results.push(JSON.parse(xhr.responseText));
            resolve();
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error("FILE UPLOAD FAILED: " + xhr.statusText));
        }
      };
      xhr.onerror = () => reject(new Error("NETWORK ERROR DURING UPLOAD"));
      xhr.send(formData);
    });
  }
  return results;
}
