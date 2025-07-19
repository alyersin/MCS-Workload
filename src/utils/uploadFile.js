// UPLOAD FILE TO BACKEND WITH METADATA
export async function uploadFileWithMeta(file, formType, date) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("formType", formType);
  formData.append("date", date);

  // Use env variable for URL
  const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_SERVER_URL;

  // Optionally add password if needed
  const password = process.env.NEXT_PUBLIC_UPLOAD_SERVER_PASSWORD;
  if (password) {
    formData.append("password", password);
  }

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("FILE UPLOAD FAILED");
  return await res.json();
}
