"use client";

import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const variantClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  return <button className={`btn ${variantClass} ${className}`.trim()} {...props} />;
}
