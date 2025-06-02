import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizes = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  size = "xl",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 md:px-6", sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
