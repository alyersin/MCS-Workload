"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Heading,
  VStack,
  Select,
  useToast,
  useColorModeValue,
  Container,
  Divider,
} from "@chakra-ui/react";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import SurveyForm from "@/components/SurveyForm";

// LASHING SERVICE PAGE
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

const fields = [
  {
    name: "reportNumber",
    label: "Report Number",
    type: "input",
    required: false,
    inputType: "number",
  },
  {
    name: "principal",
    label: "Principal's Name",
    type: "input",
    required: true,
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
    type: "input",
    required: true,
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
};

export default function RaportAmaraj() {
  // MAP LASHING FIELDS TO BACKEND EXPECTED FIELDS
  const handleLashingSubmit = (form) => {
    const mapped = {
      report: form.reportNumber,
      date: form.dateOfLoading,
      portArea: form.loadingLocation,
      operator: form.stowagePerformedBy,
      principalName: form.principal,
      cargoDescription: form.cargoDescription,
      grossWeight: form.oversize,
      shipper: "",
      consignee: "",
      surveyFindings: form.otherDetails,
      // ADD CUSTOM FIELDS IF NEEDED
      _serviceName: "RaportAmaraj",
    };
    fetch("/api/send-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped),
    });
  };
  return (
    <SurveyForm
      title="Lashing Report"
      fields={fields}
      dropdownOptions={dropdownOptions}
      secretAccess="RaportAmaraj"
      onSubmit={handleLashingSubmit}
    />
  );
}
