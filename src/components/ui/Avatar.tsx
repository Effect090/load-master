import Image from "next/image";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  ring?: boolean;
  ringColor?: "green" | "gold";
}

const sizeClasses = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
  "2xl": "w-28 h-28 text-3xl",
};

const ringClasses = {
  green: "ring-2 ring-green-500/60 ring-offset-2 ring-offset-cf-bg",
  gold: "ring-2 ring-gold-DEFAULT/60 ring-offset-2 ring-offset-cf-bg",
};

export function Avatar({
  src,
  username,
  size = "md",
  className,
  ring,
  ringColor = "green",
}: AvatarProps) {
  const avatarUrl = getAvatarUrl(src ?? null, username);
  const isExternal = avatarUrl.startsWith("http");

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-cf-surface-2 flex-shrink-0",
        sizeClasses[size],
        ring && ringClasses[ringColor],
        className
      )}
    >
      {isExternal ? (
        <Image
          src={avatarUrl}
          alt={username}
          fill
          className="object-cover"
          unoptimized={avatarUrl.includes("dicebear")}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-800 to-cf-surface-2 text-white font-bold">
          {username[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}
