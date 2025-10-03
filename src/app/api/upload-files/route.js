import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    const orderId = formData.get("orderId");

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "No order ID provided" },
        { status: 400 }
      );
    }

    // Forward the upload to your server
    const serverFormData = new FormData();

    // Add files to the server form data
    files.forEach((file) => {
      serverFormData.append("file", file);
    });

    // Add required fields for your server
    serverFormData.append("userId", session.user.uid);
    serverFormData.append("formType", "survey-order");
    serverFormData.append("orderId", orderId);

    // Upload to your server
    const serverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_UPLOAD_SERVER_URL}`,
      {
        method: "POST",
        body: serverFormData,
      }
    );

    if (!serverResponse.ok) {
      throw new Error("Failed to upload files to server");
    }

    const serverResult = await serverResponse.json();

    if (!serverResult.success) {
      throw new Error(serverResult.message || "Upload failed");
    }

    // Process the uploaded files and return metadata
    const uploadedFiles = files.map((file, index) => ({
      originalName: file.name,
      fileName: `${Date.now()}_${file.name}`,
      filePath:
        serverResult.folder ||
        `/uploads/${session.user.uid}/survey-order/${
          new Date().toISOString().split("T")[0]
        }`,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      orderId: orderId,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
