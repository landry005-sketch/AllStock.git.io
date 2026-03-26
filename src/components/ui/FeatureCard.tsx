import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;      // Pour accepter du JSX/SVG
  title: string;        // Pour du texte
  description: string;
  tags: string[];       // Un tableau de chaînes de caractères
  color: string;
  bgColor: string;
}

const FeatureCard = ({ icon, title, description, tags, color, bgColor  }: FeatureCardProps) => (
  <div className="bg-white/80 backdrop-blur-md border border-white/40 p-8 rounded-3xl flex gap-6 items-start hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-[#5d5cde]/30 transition-all duration-300 group">
    <div className={`shrink-0 w-14 h-14 ${bgColor} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {icon}
      </svg>
    </div>
    <div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
        {description}
      </p>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#5d5cde] group-hover:border-[#5d5cde]/20 transition-colors">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);
export default FeatureCard;