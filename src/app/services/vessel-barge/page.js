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
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useSecretAccess } from "@/hooks/useSecretAccess";
import SurveyForm from "@/components/SurveyForm";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// VESSEL-BARGE SERVICE PAGE
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

const fields = [
  { name: "report", label: "Report no.", type: "input", required: false },
  { name: "vesselName", label: "Vessel Name", type: "input", required: true },
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
    type: "input",
    required: true,
  },
  {
    name: "cargoGroups",
    label: "Cargoes (Description, Packages, Gross Weight, Shipper, Consignee)",
    type: "dynamicCargoGroup",
    required: false,
    descriptionPlaceholder: "Cargo Description",
    packagesPlaceholder: "Packages",
    weightPlaceholder: "Gross Weight",
    shipperPlaceholder: "Shipper",
    consigneePlaceholder: "Consignee",
  },
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
};

export default function VesselBarge() {
  return (
    <SurveyForm
      title="Vessel/Barge Survey"
      fields={fields}
      dropdownOptions={dropdownOptions}
      secretAccess="VesselBarge"
    />
  );
}
