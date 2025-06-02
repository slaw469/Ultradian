"use client";

// Temporarily disabled due to type conflicts
// TODO: Fix chart component compatibility with current React/Recharts versions

import * as React from "react";

export const ChartContainer = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ChartTooltip = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ChartTooltipContent = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ChartLegend = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ChartLegendContent = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);
