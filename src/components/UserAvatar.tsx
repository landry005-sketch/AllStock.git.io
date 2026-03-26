import { User } from "lucide-react";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  photoUrl?: string;
}

export default function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  // On récupère l'initiale du nom (ex: "L" pour Landry)
const initial = name && name.length > 0 ? name.charAt(0).toUpperCase() : "?";
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200`}>
      {name ? initial : <User className="w-1/2 h-1/2" />}
    </div>
  );
}