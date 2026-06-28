import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function CourseThumbnail({
  src,
  alt,
  className = "w-full h-full object-cover",
  iconClassName = "w-10 h-10",
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <BookOpen className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
