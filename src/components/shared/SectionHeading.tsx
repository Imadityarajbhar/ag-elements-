import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  align?: "left" | "center" | "right";
}

export function SectionHeading({ 
  title, 
  subtitle, 
  className, 
  titleClassName,
  align = "center" 
}: SectionHeadingProps) {
  return (
    <div className={cn(
      "flex flex-col mb-12",
      align === "center" && "text-center items-center",
      align === "left" && "text-left items-start",
      align === "right" && "text-right items-end",
      className
    )}>
      {subtitle && (
        <span className="text-ag-purple font-label-md mb-4">{subtitle}</span>
      )}
      <h2 className={cn("font-headline-lg text-charcoal-navy", titleClassName)}>
        {title}
      </h2>
    </div>
  );
}
