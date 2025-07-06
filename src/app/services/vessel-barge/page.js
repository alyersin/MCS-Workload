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
const portAreaOptions = ["CONSTANTZA SOUTH PORT", "CONSTANTZA NORTH PORT"];

const fields = [
  { name: "report", label: "Report", type: "input", required: false },
  { name: "vesselName", label: "Vessel Name", type: "input", required: true },
  { name: "portArea", label: "Port Area", type: "select", required: true },
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
  {
    name: "shippers",
    label: "Shippers",
    type: "dynamicList",
    required: false,
    placeholder: "Enter shipper",
  },
  {
    name: "consignees",
    label: "Consignees",
    type: "dynamicList",
    required: false,
    placeholder: "Enter consignee",
  },
  {
    name: "surveyFindings",
    label: "Survey Findings",
    type: "textarea",
    required: true,
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
