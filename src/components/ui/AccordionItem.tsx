import { useState } from "react";

interface AccordionItemProps {
  title: string;
  content: string;
}

const AccordionItem = ({ title, content }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white/60 border border-white/40 rounded-2xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center text-left font-bold text-lg"
      >
        {title}
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </button>
      <div className={`px-6 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-6' : 'max-h-0'}`}>
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
          {content}
        </p>
      </div>
    </div>
  )
}
export default AccordionItem