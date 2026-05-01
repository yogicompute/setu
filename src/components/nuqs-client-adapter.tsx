"use client";

import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next";

export default function NuqsClientAdapter({ children }: { children: React.ReactNode }) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
