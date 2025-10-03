import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateSurveyOrderPDF } from "@/utils/pdfGenerator";
import { sendSurveyOrderEmail } from "@/utils/emailService";

export async function POST(request) {
  try {
    // Get the session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const orderData = await request.json();

    // Validate required fields
    if (
      !orderData.surveyType ||
      !orderData.location ||
      !orderData.preferredDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `SRV-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;

    // Prepare order data for PostgreSQL
    const orderDetails = {
      contactName: orderData.contactName,
      email: orderData.email,
      phone: orderData.phone,
      company: orderData.company,
      surveyType: orderData.surveyType,
      urgency: orderData.urgency,
      preferredDate: orderData.preferredDate,
      preferredTime: orderData.preferredTime,
      location: orderData.location,
      vesselName: orderData.vesselName,
      vesselIMO: orderData.vesselIMO,
      cargoDescription: orderData.cargoDescription,
      containerNumbers: orderData.containerNumbers,
      specialRequirements: orderData.specialRequirements,
      additionalNotes: orderData.additionalNotes,
      uploadedFiles: orderData.uploadedFiles || [],
      userEmail: session.user.email,
      userName: session.user.name,
      createdAt: new Date().toISOString(),
    };

    // Send order to your PostgreSQL server
    const serverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_ORDER_API_URL}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.uid,
          orderType: "SurveyRequest",
          details: orderDetails,
        }),
      }
    );

    if (!serverResponse.ok) {
      throw new Error("Failed to create order in database");
    }

    const serverResult = await serverResponse.json();
    const finalOrderId = serverResult.order?.order_id || orderId;

    // Create order document for PDF generation and email
    const orderDoc = {
      orderId: finalOrderId,
      userId: session.user.uid,
      userEmail: session.user.email,
      userName: session.user.name,
      orderType: "SurveyRequest",
      status: "In Progress",
      createdAt: new Date().toISOString(),
      surveyData: orderDetails,
    };

    console.log("Survey order created:", finalOrderId);

    // Generate PDF and send email
    try {
      // Prepare user data for PDF generation
      const userData = {
        name: session.user.name,
        email: session.user.email,
        uid: session.user.uid,
      };

      // Generate PDF
      console.log("Generating PDF for order:", orderId);
      const pdfBuffer = generateSurveyOrderPDF(orderDoc, userData);

      // Send email with PDF attachment
      console.log("Sending email for order:", orderId);
      const emailResult = await sendSurveyOrderEmail(
        orderDoc,
        userData,
        pdfBuffer
      );

      if (emailResult.success) {
        console.log("Email sent successfully to:", emailResult.recipients);
      } else {
        console.error("Failed to send email:", emailResult.error);
      }
    } catch (emailError) {
      console.error("Error in PDF generation or email sending:", emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
      message: "Survey order submitted successfully",
    });
  } catch (error) {
    console.error("Error creating survey order:", error);
    return NextResponse.json(
      { error: "Failed to submit survey order" },
      { status: 500 }
    );
  }
}
