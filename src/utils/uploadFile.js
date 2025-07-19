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
