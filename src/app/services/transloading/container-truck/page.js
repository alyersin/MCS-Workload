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

// TRANSLOADING CONTAINER-TRUCK SERVICE PAGE

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
const principalOptions = [
  "Eastship Projects & Logistics SRL",
  "Life Logistics SRL",
  "Custom",
];

const fields = [
  { name: "report", label: "Report", type: "input", required: false },
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
];

const dropdownOptions = {
  portArea: portAreaOptions,
  operator: operatorOptions,
  principalName: principalOptions,
};

export default function ContainerTruck() {
  return (
    <SurveyForm
      title="Transloading Container-Truck Survey"
      fields={fields}
      dropdownOptions={dropdownOptions}
      secretAccess="TransloadingContainerTruck"
    />
  );
}
