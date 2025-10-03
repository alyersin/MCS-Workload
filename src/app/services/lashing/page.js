// Updated `page.js` for Lashing (RaportAmaraj) - following pattern from Stripping/Stuffing

"use client";
import React from "react";
import SurveyForm from "@/components/SurveyForm";
import RoleProtectedRoute from "@/components/Auth/RoleProtectedRoute";
import { USER_ROLES } from "@/constants/roles";

const loadingLocationOptions = [
  "DB Schenker",
  "DP World",
  "Fast Freight",
  "Life Logistics",
  "Port Shipping & Engineering",
  "Romalexys",
  "Sea Container Services",
  "SOCEP",
];

const storagePriorOptions = ["Road trailer", "Terminal storage"];
const stowagePerformedByOptions = [
  "DB Schenker",
  "DP World SRL",
  "Fast Freight SRL",
  "Life Logistics SRL",
  "Port Shipping & Engineering SRL",
  "Romalexys SRL",
  "Sea Container Services SRL",
  "SOCEP SA",
];

const lashingPerformedByOptions = ["BACIOIU IMPORT EXPORT SRL", "Custom"];

const principalOptions = [
  "Eastship Projects & Logistics SRL",
  "Petroconst SA",
  "Life Logistics SRL",
  "MSC Romania SRL",
  "Top Expert DCE SRL",
  "Custom",
];

const fields = [
  {
    name: "reportNumber",
    label: "Report Number",
    type: "input",
    required: false,
    inputType: "number",
  },
  {
    name: "principalName",
    label: "Principal's Name",
    type: "select",
    required: true,
  },
  {
    name: "customPrincipal",
    label: "Custom Principal Name",
    type: "customPrincipal",
    required: false,
    placeholder: "Enter custom principal name",
  },
  {
    name: "oversize",
    label: "Oversize",
    type: "input",
    required: true,
    placeholder: "e.g. YES, 5 CM LEFT / 4 CM RIGHT",
  },
  {
    name: "cargoDescription",
    label: "Cargo Description",
    type: "input",
    required: true,
  },
  {
    name: "loadingLocation",
    label: "Loading Location",
    type: "select",
    required: true,
  },
  {
    name: "storagePrior",
    label: "Storage Prior",
    type: "select",
    required: true,
  },
  {
    name: "dateOfLoading",
    label: "Date of Loading",
    type: "input",
    inputType: "date",
    required: true,
  },
  {
    name: "stowagePerformedBy",
    label: "Stowage Performed By",
    type: "select",
    required: true,
  },
  {
    name: "lashingPerformedBy",
    label: "Lashing Performed By",
    type: "select",
    required: true,
  },
  {
    name: "customLashing",
    label: "Custom Lashing Name",
    type: "customLashing",
    required: false,
    placeholder: "Enter custom lashing name",
  },
  {
    name: "otherDetails",
    label: "Other Details",
    type: "textarea",
    required: false,
  },
  {
    name: "attachments",
    label: "Upload Documents / Images (ZIP files)",
    type: "file",
    required: false,
    accept: "image/*,application/pdf,application/zip,.zip",
  },
];

const dropdownOptions = {
  loadingLocation: loadingLocationOptions,
  storagePrior: storagePriorOptions,
  stowagePerformedBy: stowagePerformedByOptions,
  lashingPerformedBy: lashingPerformedByOptions,
  principalName: principalOptions,
};

export default function RaportAmaraj() {
  const handleLashingSubmit = (form) => {
    const mapped = {
      report: form.reportNumber,
      date: form.dateOfLoading,
      portArea: form.loadingLocation,
      operator: form.stowagePerformedBy,
      principalName:
        form.principalName === "Custom"
          ? form.customPrincipal
          : form.principalName,
      cargoDescription: form.cargoDescription,
      grossWeight: form.oversize,
      shipper: "",
      consignee: "",
      lashingBy:
        form.lashingPerformedBy === "Custom"
          ? form.customLashing
          : form.lashingPerformedBy,
      surveyFindings: form.otherDetails,
      _serviceName: "RaportAmaraj",
    };
    fetch("/api/send-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped),
    });
  };

  return (
    <RoleProtectedRoute allowedRoles={[USER_ROLES.SURVEYOR]}>
      <SurveyForm
        title="Lashing Report"
        fields={fields}
        dropdownOptions={dropdownOptions}
        secretAccess="RaportAmaraj"
        onSubmit={handleLashingSubmit}
      />
    </RoleProtectedRoute>
  );
}
