import { Building2 } from "lucide-react";

interface OrgLogoProps {
  logoUrl?: string;
  orgName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function OrgLogo({ logoUrl, orgName, size = "md", className = "" }: OrgLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={orgName}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-gray-200 shadow-sm ${className}`}
    >
      <Building2 className={`${iconSizes[size]} text-white`} />
    </div>
  );
}
