import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // typically 1-5
  maxRating?: number;
  className?: string;
}

export function StarRating({ rating, maxRating = 5, className }: StarRatingProps) {
  return (
    <div className={cn("flex text-ag-purple", className)}>
      {Array.from({ length: maxRating }).map((_, i) => (
        <span 
          key={i} 
          className={cn("material-symbols-outlined text-[16px]", {
            "opacity-30": i >= rating, // if it's less than rating it's filled (opacity 1)
          })} 
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
        >
          star
        </span>
      ))}
    </div>
  );
}
