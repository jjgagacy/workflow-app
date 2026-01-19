import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/classnames";

export type AvatarProps = {
  name: string;
  avatar: string | null;
  size?: number;
  className?: string;
}

const Avatar = ({
  name,
  avatar,
  size,
  className
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

  if (avatar && !imageError) {
    return (
      <Image
        src={avatar}
        alt={name}
        fill
        className={cn('object-cover', className)}
        sizes={`${size || 96}px`}
        onError={handleError}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <User className="w-12 h-12 text-gray-400" />
    </div>
  );
}

export default Avatar;
