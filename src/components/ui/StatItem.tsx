
interface StatItemProps {
   value: string;
  label: string;
}


const StatItem = ({ value, label }: StatItemProps) => (
  <div className="group cursor-default">
    <div className="text-lg md:text-5xl font-black text-[#5d5cde] mb-2 group-hover:scale-110 transition-transform duration-300">{value}</div>
    <p className="text-slate-400 font-medium">{label}</p>
  </div>
);

export default StatItem;