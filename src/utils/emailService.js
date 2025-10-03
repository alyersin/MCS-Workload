import nodemailer from "nodemailer";

/**
 * Create email transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Send survey order PDF via email
 * @param {Object} orderData - The survey order data
 * @param {Object} userData - User information
 * @param {Buffer} pdfBuffer - PDF buffer
 * @returns {Promise<Object>} - Email send result
 */
export async function sendSurveyOrderEmail(orderData, userData, pdfBuffer) {
  try {
    const transporter = createTransporter();

    // Get email recipients from environment variable
    const recipients = process.env.PDF_EMAIL_RECIPIENTS;
    if (!recipients) {
      throw new Error("No email recipients configured");
    }

    const recipientList = recipients.split(",").map((email) => email.trim());

    const mailOptions = {
      from: {
        name: "MCS Workload System",
        address: process.env.EMAIL_USER,
      },
      to: recipientList,
      subject: `New Survey Order Request - ${orderData.orderId}`,
      html: generateEmailHTML(orderData, userData),
      attachments: [
        {
          filename: `Survey_Order_${orderData.orderId}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Survey order email sent successfully:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
      recipients: recipientList,
    };
  } catch (error) {
    console.error("Error sending survey order email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(orderData, userData) {
  const surveyTypeName = getSurveyTypeName(orderData.surveyData.surveyType);
  const submittedTime = new Date(orderData.createdAt).toLocaleString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Survey Order Request</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #319795;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f7fafc;
          padding: 20px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e2e8f0;
        }
        .section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: white;
          border-radius: 6px;
          border-left: 4px solid #319795;
        }
        .section h3 {
          margin-top: 0;
          color: #2d3748;
          font-size: 16px;
        }
        .info-row {
          display: flex;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          width: 120px;
          color: #4a5568;
        }
        .info-value {
          flex: 1;
          color: #2d3748;
        }
        .urgency-high {
          color: #e53e3e;
          font-weight: bold;
        }
        .urgency-urgent {
          color: #c53030;
          font-weight: bold;
          background-color: #fed7d7;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #718096;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Survey Order Request</h1>
        <p>Order ID: ${orderData.orderId}</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h3>📋 Order Summary</h3>
          <div class="info-row">
            <span class="info-label">Order ID:</span>
            <span class="info-value">${orderData.orderId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Submitted:</span>
            <span class="info-value">${submittedTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Submitted by:</span>
            <span class="info-value">${userData.name || userData.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">${orderData.status.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>👤 Customer Information</h3>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${orderData.surveyData.contactName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${orderData.surveyData.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${orderData.surveyData.phone}</span>
          </div>
          ${
            orderData.surveyData.company
              ? `
          <div class="info-row">
            <span class="info-label">Company:</span>
            <span class="info-value">${orderData.surveyData.company}</span>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="section">
          <h3>🔍 Survey Details</h3>
          <div class="info-row">
            <span class="info-label">Survey Type:</span>
            <span class="info-value">${surveyTypeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Urgency:</span>
            <span class="info-value ${getUrgencyClass(
              orderData.surveyData.urgency
            )}">${orderData.surveyData.urgency.toUpperCase()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Preferred Date:</span>
            <span class="info-value">${
              orderData.surveyData.preferredDate
            }</span>
          </div>
          ${
            orderData.surveyData.preferredTime
              ? `
          <div class="info-row">
            <span class="info-label">Preferred Time:</span>
            <span class="info-value">${orderData.surveyData.preferredTime}</span>
          </div>
          `
              : ""
          }
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">${orderData.surveyData.location}</span>
          </div>
          ${
            orderData.surveyData.vesselName
              ? `
          <div class="info-row">
            <span class="info-label">Vessel Name:</span>
            <span class="info-value">${orderData.surveyData.vesselName}</span>
          </div>
          `
              : ""
          }
          ${
            orderData.surveyData.vesselIMO
              ? `
          <div class="info-row">
            <span class="info-label">Vessel IMO:</span>
            <span class="info-value">${orderData.surveyData.vesselIMO}</span>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="section">
          <h3>📦 Cargo Information</h3>
          <div class="info-row">
            <span class="info-label">Description:</span>
            <span class="info-value">${
              orderData.surveyData.cargoDescription
            }</span>
          </div>
          ${
            orderData.surveyData.containerNumbers
              ? `
          <div class="info-row">
            <span class="info-label">Container Numbers:</span>
            <span class="info-value">${orderData.surveyData.containerNumbers}</span>
          </div>
          `
              : ""
          }
        </div>
        
        ${
          orderData.surveyData.specialRequirements
            ? `
        <div class="section">
          <h3>⚠️ Special Requirements</h3>
          <p>${orderData.surveyData.specialRequirements}</p>
        </div>
        `
            : ""
        }
        
        ${
          orderData.surveyData.additionalNotes
            ? `
        <div class="section">
          <h3>📝 Additional Notes</h3>
          <p>${orderData.surveyData.additionalNotes}</p>
        </div>
        `
            : ""
        }
        
        ${
          orderData.surveyData.uploadedFiles &&
          orderData.surveyData.uploadedFiles.length > 0
            ? `
        <div class="section">
          <h3>📎 Supporting Documents</h3>
          <p>The following files have been attached to this order:</p>
          <ul>
            ${orderData.surveyData.uploadedFiles
              .map(
                (file) => `
              <li>${file.name} (${formatFileSize(file.size)})</li>
            `
              )
              .join("")}
          </ul>
        </div>
        `
            : ""
        }
      </div>
      
      <div class="footer">
        <p>This email was automatically generated by the MCS Workload System.</p>
        <p>Please review the attached PDF for complete order details.</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get human-readable survey type name
 */
function getSurveyTypeName(surveyType) {
  const surveyTypes = {
    transloading_container_truck: "Transloading: Container → Truck",
    transloading_truck_container: "Transloading: Truck → Container",
    stripping: "Container Stripping",
    stuffing: "Container Stuffing",
    stripping_restuffing: "Stripping & Restuffing",
    transshipment_c2c: "Transshipment C2C",
    vessel_barge: "Vessel/Barge Survey",
    lashing: "Lashing Report",
  };
  return surveyTypes[surveyType] || surveyType;
}

/**
 * Get urgency CSS class
 */
function getUrgencyClass(urgency) {
  switch (urgency.toLowerCase()) {
    case "urgent":
    case "critical":
      return "urgency-urgent";
    case "high":
      return "urgency-high";
    default:
      return "";
  }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
