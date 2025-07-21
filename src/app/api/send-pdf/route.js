import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import { getAuth, signInWithCustomToken } from "firebase/auth";

export async function signInFirebaseWithCustomToken() {
  const res = await fetch("/api/firebase-custom-token");
  const { token } = await res.json();
  const auth = getAuth();
  await signInWithCustomToken(auth, token);
}

// SEND PDF ROUTE
export async function POST(request) {
  const formData = await request.json();

  // 1. Generate PDF
  const doc = new jsPDF();
  // TEAL HEADER BAR
  doc.setFillColor(54, 162, 185);
  doc.roundedRect(5, 5, 200, 20, 4, 4, "F");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Survey Form Submission", 105, 13, { align: "center" });

  // SERVICE NAME SUBTITLE
  if (formData._serviceName) {
    const serviceName = String(formData._serviceName)
      .replace(/([A-Z])/g, " $1")
      .replace(/[-_]/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
    doc.setFontSize(13);
    doc.setFont("helvetica", "normal");
    doc.text(serviceName + " Form", 105, 21, { align: "center" });
  }

  // FORM CONTAINER
  doc.setDrawColor(220);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(10, 30, 190, 240, 6, 6, "F");

  let y = 45;
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.setFont("helvetica", "normal");

  // GROUP FIELDS
  const sections = [
    {
      title: "General Information",
      fields: ["report", "date"],
    },
    {
      title: "Port & Operator",
      fields: ["portArea", "operator", "customOperator"],
    },
    {
      title: "Principal",
      fields: ["principalName", "customPrincipal"],
    },
    {
      title: "Cargo Details",
      fields: ["cargoDescription", "grossWeight", "shipper", "consignee"],
    },
    {
      title: "Survey Findings",
      fields: ["surveyFindings"],
    },
  ];

  for (const section of sections) {
    // SECTION HEADER
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(54, 162, 185);
    doc.text(section.title, 20, y);
    y += 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(33, 37, 41);
    let sectionHasContent = false;
    for (const key of section.fields) {
      const value = formData[key];
      if (value && value !== "") {
        sectionHasContent = true;
        // FORMAT LABEL
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 25, y);
        doc.setFont("helvetica", "normal");
        // MULTILINE TEXTAREA
        if (key === "surveyFindings" && String(value).length > 60) {
          const lines = doc.splitTextToSize(String(value), 140);
          doc.text(lines, 60, y);
          y += lines.length * 7;
        } else {
          doc.text(String(value), 60, y);
          y += 7;
        }
      }
    }
    if (sectionHasContent) {
      y += 2;
      doc.setDrawColor(220);
      doc.line(22, y, 195, y);
      y += 5;
    }
    if (y > 260) {
      doc.addPage();
      // REDRAW HEADER
      doc.setFillColor(54, 162, 185);
      doc.roundedRect(5, 5, 200, 20, 4, 4, "F");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Survey Form Submission", 105, 17, { align: "center" });
      doc.setDrawColor(220);
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(10, 30, 190, 240, 6, 6, "F");
      y = 45;
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.setFont("helvetica", "normal");
    }
  }
  // ADD FILES SECTION IF FILES WERE UPLOADED
  if (
    Array.isArray(formData.uploadedFilesMeta) &&
    formData.uploadedFilesMeta.length > 0
  ) {
    // SECTION HEADER
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(54, 162, 185);
    doc.text("UPLOADED FILES", 20, y);
    y += 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(33, 37, 41);
    for (const file of formData.uploadedFilesMeta) {
      // FILE NAME AND SIZE
      const fileSizeKB = (file.size / 1024).toFixed(1);
      doc.text(`- ${file.name} (${fileSizeKB} KB)`, 25, y);
      y += 7;
      if (y > 260) {
        doc.addPage();
        // REDRAW HEADER
        doc.setFillColor(54, 162, 185);
        doc.roundedRect(5, 5, 200, 20, 4, 4, "F");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Survey Form Submission", 105, 17, { align: "center" });
        doc.setDrawColor(220);
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(10, 30, 190, 240, 6, 6, "F");
        y = 45;
        doc.setFontSize(12);
        doc.setTextColor(33, 37, 41);
        doc.setFont("helvetica", "normal");
      }
    }
    y += 2;
    doc.setDrawColor(220);
    doc.line(22, y, 195, y);
    y += 5;
  }
  const pdfBuffer = doc.output("arraybuffer");

  // 2. Send Email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    // RECIPIENTS FROM ENV
    to: process.env.PDF_EMAIL_RECIPIENTS,
    subject: "New Survey Form Submission",
    text: "See attached PDF for details.",
    attachments: [
      {
        filename: "submission.pdf",
        content: Buffer.from(pdfBuffer),
        contentType: "application/pdf",
      },
    ],
  });

  return NextResponse.json({ success: true });
}
