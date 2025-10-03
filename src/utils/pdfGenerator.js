import jsPDF from "jspdf";

/**
 * Generate PDF for survey order
 * @param {Object} orderData - The survey order data
 * @param {Object} userData - User information
 * @returns {Buffer} - PDF buffer
 */
export function generateSurveyOrderPDF(orderData, userData) {
  const doc = new jsPDF();

  // Set up colors
  const primaryColor = "#319795"; // Teal
  const secondaryColor = "#2D3748"; // Dark gray
  const lightGray = "#F7FAFC";

  let yPosition = 20;

  // Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Survey Order Request", 20, 20);

  // Order ID and Timestamp
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Order ID: ${orderData.orderId}`, 20, 35);
  doc.text(
    `Submitted: ${new Date(orderData.createdAt).toLocaleString()}`,
    120,
    35
  );

  yPosition = 50;

  // Customer Information Section
  doc.setTextColor(secondaryColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 20, yPosition);

  yPosition += 10;
  doc.setFillColor(lightGray);
  doc.rect(20, yPosition - 5, 170, 25, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${orderData.surveyData.contactName}`, 25, yPosition);
  doc.text(`Email: ${orderData.surveyData.email}`, 25, yPosition + 5);
  doc.text(`Phone: ${orderData.surveyData.phone}`, 25, yPosition + 10);
  if (orderData.surveyData.company) {
    doc.text(`Company: ${orderData.surveyData.company}`, 25, yPosition + 15);
  }

  yPosition += 35;

  // Survey Details Section
  doc.setTextColor(secondaryColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Survey Details", 20, yPosition);

  yPosition += 10;
  doc.setFillColor(lightGray);
  doc.rect(20, yPosition - 5, 170, 40, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Survey Type: ${getSurveyTypeName(orderData.surveyData.surveyType)}`,
    25,
    yPosition
  );
  doc.text(
    `Urgency: ${
      orderData.surveyData.urgency.charAt(0).toUpperCase() +
      orderData.surveyData.urgency.slice(1)
    }`,
    25,
    yPosition + 5
  );
  doc.text(
    `Preferred Date: ${orderData.surveyData.preferredDate}`,
    25,
    yPosition + 10
  );
  if (orderData.surveyData.preferredTime) {
    doc.text(
      `Preferred Time: ${orderData.surveyData.preferredTime}`,
      25,
      yPosition + 15
    );
  }
  doc.text(`Location: ${orderData.surveyData.location}`, 25, yPosition + 20);
  if (orderData.surveyData.vesselName) {
    doc.text(
      `Vessel Name: ${orderData.surveyData.vesselName}`,
      25,
      yPosition + 25
    );
  }
  if (orderData.surveyData.vesselIMO) {
    doc.text(
      `Vessel IMO: ${orderData.surveyData.vesselIMO}`,
      25,
      yPosition + 30
    );
  }

  yPosition += 50;

  // Cargo Information Section
  doc.setTextColor(secondaryColor);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Cargo Information", 20, yPosition);

  yPosition += 10;
  doc.setFillColor(lightGray);
  const cargoHeight = Math.max(
    20,
    Math.ceil(orderData.surveyData.cargoDescription.length / 60) * 5
  );
  doc.rect(20, yPosition - 5, 170, cargoHeight + 10, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Description:`, 25, yPosition);
  const cargoLines = doc.splitTextToSize(
    orderData.surveyData.cargoDescription,
    160
  );
  doc.text(cargoLines, 25, yPosition + 5);

  if (orderData.surveyData.containerNumbers) {
    const containerY = yPosition + 5 + cargoLines.length * 5 + 5;
    doc.text(
      `Container Numbers: ${orderData.surveyData.containerNumbers}`,
      25,
      containerY
    );
  }

  yPosition += cargoHeight + 20;

  // Special Requirements Section
  if (orderData.surveyData.specialRequirements) {
    doc.setTextColor(secondaryColor);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Special Requirements", 20, yPosition);

    yPosition += 10;
    doc.setFillColor(lightGray);
    const requirementsHeight = Math.max(
      15,
      Math.ceil(orderData.surveyData.specialRequirements.length / 60) * 5
    );
    doc.rect(20, yPosition - 5, 170, requirementsHeight + 5, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const requirementsLines = doc.splitTextToSize(
      orderData.surveyData.specialRequirements,
      160
    );
    doc.text(requirementsLines, 25, yPosition);

    yPosition += requirementsHeight + 15;
  }

  // Additional Notes Section
  if (orderData.surveyData.additionalNotes) {
    doc.setTextColor(secondaryColor);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Additional Notes", 20, yPosition);

    yPosition += 10;
    doc.setFillColor(lightGray);
    const notesHeight = Math.max(
      15,
      Math.ceil(orderData.surveyData.additionalNotes.length / 60) * 5
    );
    doc.rect(20, yPosition - 5, 170, notesHeight + 5, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(
      orderData.surveyData.additionalNotes,
      160
    );
    doc.text(notesLines, 25, yPosition);

    yPosition += notesHeight + 15;
  }

  // Uploaded Files Section
  if (
    orderData.surveyData.uploadedFiles &&
    orderData.surveyData.uploadedFiles.length > 0
  ) {
    doc.setTextColor(secondaryColor);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Supporting Documents", 20, yPosition);

    yPosition += 10;
    doc.setFillColor(lightGray);
    const filesHeight = orderData.surveyData.uploadedFiles.length * 8 + 10;
    doc.rect(20, yPosition - 5, 170, filesHeight, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    orderData.surveyData.uploadedFiles.forEach((file, index) => {
      doc.text(
        `• ${file.name} (${formatFileSize(file.size)})`,
        25,
        yPosition + index * 8
      );
    });

    yPosition += filesHeight + 10;
  }

  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 285);
  doc.text(`Submitted by: ${userData.name || userData.email}`, 20, 290);

  // Return PDF as buffer
  return doc.output("arraybuffer");
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
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
