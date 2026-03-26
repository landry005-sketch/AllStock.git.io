import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {type LucideIcon, Package, Barcode, Box, TrendingUp, ClipboardList, Zap, Users, Truck, ShoppingCart, FolderTree } from 'lucide-react';

// --- 1. L'interface pour TypeScript ---
interface FallingIconProps {
  Icon: LucideIcon;
  size?: number;
  duration?: number;
  delay?: number;
  className?: string;
  color?: string
}

// --- 2. Le composant qui chute ---
const FallingIcon = ({ Icon, size = 40, duration = 5, delay = 0, className = "", color="#3b82f6" }: FallingIconProps) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animation de chute verticale
    gsap.fromTo(iconRef.current, 
      { 
        y: "-100",    // Commence au-dessus de l'écran
        opacity: 50
      },
      {
        y: "1000%",    // Descend jusqu'en bas
        opacity: 0.3,  // Opacité légère pour ne pas gêner la lecture
        duration: duration,
        delay: delay,
        repeat: -1,    // Boucle infinie
        ease: "none",  // Vitesse constante
      }
    );

    // Petite rotation aléatoire pour plus de naturel
    gsap.to(iconRef.current, {
      rotation: 360,
      duration: duration * 2,
      repeat: -1,
      ease: "none"
    });
  }, { scope: iconRef });

  return (
    <div ref={iconRef} className={`absolute ${className} pointer-events-none`}>
      <Icon size={size} strokeWidth={1} color={color} />
    </div>
  );
};

// --- 3. Le conteneur principal (Exporté) ---
const AnimationBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden h-full w-full pointer-events-none ">
      {/* On répartit les icônes sur la largeur (left-X) */}
      <FallingIcon Icon={Package} size={80} duration={12} delay={0} color='red' className="left-[5%]" />
      <FallingIcon Icon={Box} size={100} duration={15} delay={2} className="left-[15%]" />
      <FallingIcon Icon={Barcode} size={50} duration={9} delay={1} className="left-[25%]" />
      <FallingIcon Icon={TrendingUp} size={60} duration={18} delay={5} color='purple' className="left-[35%]" />
      <FallingIcon Icon={ClipboardList} size={90} duration={14} delay={3} className="left-[45%]" />
      <FallingIcon Icon={Zap} size={80} duration={10} delay={0.5} color='yellow' className="left-[55%]" />
       <FallingIcon Icon={Users} size={60} duration={10} delay={4}  className="left-[65%]" />
        <FallingIcon Icon={Truck} size={70} duration={10} delay={3.5} color='purple' className="left-[75%]" />
         <FallingIcon Icon={ShoppingCart} size={70} duration={10} delay={2.5}  className="left-[85%]" />
        <FallingIcon Icon={FolderTree} size={60} duration={10} delay={4.5} color='green' className="left-[95%]" />
    </div>
  );
};

export default AnimationBackground;