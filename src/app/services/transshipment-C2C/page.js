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
  Textarea,
  useToast,
  useColorModeValue,
  Container,
  Divider,
} from "@chakra-ui/react";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import SurveyForm from "@/components/SurveyForm";

// TRANSSHIPMENT C2C SERVICE PAGE

const operatorOptions = [
  "DB Schenker",
  "DPS World",
  "Fast Freight",
  "Life Logistics",
  "Port Shipping & Engineering",
  "Romalexys",
  "Sea Container Services",
  "SOCEP",
  "Custom",
];
const portAreaOptions = [
  "CONSTANTZA SOUTH PORT",
  "CONSTANTZA NORTH PORT",
  "MIDIA PORT",
  "MANGALIA PORT",
  "Custom Location",
];
const principalOptions = [
  "Eastship Projects & Logistics SRL",
  "Life Logistics SRL",
  "Custom",
];

const fields = [
  { name: "report", label: "Report no.", type: "input", required: false },
  { name: "portArea", label: "Port Area", type: "select", required: true },
  {
    name: "customPortArea",
    label: "Custom Location Details",
    type: "customPortArea",
    required: false,
    placeholder: "Enter custom location details",
  },
  { name: "operator", label: "Operator", type: "select", required: true },
  {
    name: "customOperator",
    label: "Custom Operator Name",
    type: "customOperator",
    required: false,
    placeholder: "Enter custom operator name",
  },
  {
    name: "date",
    label: "Date",
    type: "input",
    inputType: "date",
    required: true,
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
    name: "cargoDescription",
    label: "Cargo Description",
    type: "input",
    required: false,
  },
  {
    name: "grossWeight",
    label: "Gross Weight",
    type: "input",
    required: false,
  },
  { name: "shipper", label: "Shipper", type: "input", required: false },
  { name: "consignee", label: "Consignee", type: "input", required: false },
  {
    name: "surveyFindings",
    label: "Survey Findings",
    type: "textarea",
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
  portArea: portAreaOptions,
  operator: operatorOptions,
  principalName: principalOptions,
};

export default function TransshipmentC2C() {
  return (
    <SurveyForm
      title="Transshipment C2C Survey"
      fields={fields}
      dropdownOptions={dropdownOptions}
      secretAccess="TransshipmentC2C"
    />
  );
}
