import { Shield, Bolt, FileText, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface CoverScreenProps {
  onEnter: () => void;
}

export default function CoverScreen({ onEnter }: CoverScreenProps) {
  const logoUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCPW3EceoldRDNKHXhXbK0aGi6nD__kFN-wUrcGj5YS09Bt7cUvMv1Pe6zBeFURZrIU514uVzWj6MY3nWr9g4L73M8mrlAA1-sTN2AiyfkQ_esWu3sf-SAvgGiwiOJKrEYj7jrKuUdt8j6jXXsbyj0g7tEXc877fs3yVTqXo15vcaUqlziZ6L9vciQmi2vU0fu7Iw4p85xc4nj14Un1OoDNDB16outMrTPalbUXz0h0xoh43iFbJZktJNJia0tyjVq80mecpICV-K_f";

  // Micro-interaction states for subtle movement based on pointer tracking
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setCoords({
      x: (clientX - centerX) / 50,
      y: (clientY - centerY) / 50,
    });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center tree-gradient-bg overflow-hidden p-6 relative select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Absolute Decorative Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-primary-light/10 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl opacity-50"></div>

      {/* Decorative Corner SVG Leaf shape */}
      <div className="fixed top-0 right-0 w-64 h-64 pointer-events-none opacity-15">
        <svg className="w-full h-full text-brand-primary fill-current" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7,-76.4C58.3,-69.2,70,-58.5,78.2,-45.5C86.4,-32.5,91.1,-17.2,90.4,-2.2C89.6,12.7,83.4,27.4,74.5,40.1C65.5,52.8,53.8,63.6,40.2,71.2C26.5,78.8,11,83.1,-4.2,89.5C-19.3,95.9,-34.2,104.3,-47.1,100.8C-60,97.3,-71,81.9,-78.9,67.3C-86.8,52.7,-91.7,38.9,-93.6,24.8C-95.6,10.7,-94.6,-3.6,-90.4,-16.9C-86.2,-30.3,-78.7,-42.6,-68.8,-52.8C-58.8,-63,-46.3,-71.2,-33.5,-78.8C-20.7,-86.3,-7.5,-93.3,4.7,-101.4C16.9,-109.5,31,-118.8,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Main Content Card */}
      <motion.main 
        id="cover-main-content"
        className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center space-y-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        
        {/* Brand Icon Logo Container */}
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-brand-primary-light/20 rounded-full blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <motion.img 
            id="cover-logo-image"
            alt="E-bill Tree Logo" 
            className="relative w-48 h-48 md:w-64 md:h-64 object-contain transition-transform duration-300"
            style={{
              transform: `translate(${coords.x}px, ${coords.y}px)`,
              filter: `drop-shadow(0 15px 25px rgba(0,0,0,0.04))`
            }}
            src={logoUrl}
          />
        </div>

        {/* Title Content */}
        <div className="space-y-4">
          <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight text-brand-gray-dark">
            <span className="text-brand-primary">E-Billing</span> Portal
          </h1>
          <p className="font-sans text-lg md:text-xl text-brand-gray-medium max-w-2xl mx-auto leading-relaxed font-medium">
            GST Billing, Invoice, Challan, E-Way Bill & Reports Management
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <div className="px-5 py-2 bg-white border border-brand-primary/10 rounded-full font-sans text-xs font-semibold text-brand-secondary flex items-center gap-2 shadow-sm">
            <Shield className="w-4 h-4 text-brand-secondary" />
            <span>Secure</span>
          </div>
          <div className="px-5 py-2 bg-white border border-brand-primary/10 rounded-full font-sans text-xs font-semibold text-brand-primary flex items-center gap-2 shadow-sm">
            <Bolt className="w-4 h-4 text-brand-primary" />
            <span>Real-time</span>
          </div>
          <div className="px-5 py-2 bg-white border border-brand-primary/10 rounded-full font-sans text-xs font-semibold text-[#004c6b] flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4 text-[#00658d]" />
            <span>GST Ready</span>
          </div>
        </div>

        {/* Visual Call To Action */}
        <div className="pt-6">
          <button 
            id="btn-enter-eco-portal"
            onClick={onEnter}
            className="px-8 py-3 bg-brand-primary text-white font-semibold rounded-full shadow-md hover:bg-brand-primary-light active:scale-95 hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2 text-sm justify-center group"
          >
            <span>Enter Eco-Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </motion.main>

      {/* Footer Details */}
      <footer className="fixed bottom-0 left-0 w-full p-6 flex flex-col md:flex-row justify-between items-center border-t border-brand-primary/10 text-brand-gray-medium/70 text-xs bg-white/60 backdrop-blur-md">
        <div className="flex items-center space-x-2 mb-3 md:mb-0">
          <span className="font-semibold text-brand-secondary">Prepared by</span>
          <span className="px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary rounded-md font-bold">Stitch AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-brand-gray-medium/80" />
            <span>June 4, 2024</span>
          </div>
          <span className="hidden md:block h-4 w-[1px] bg-brand-gray-medium/20"></span>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-brand-gray-medium/80" />
            <span>Digital Headquarters</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
