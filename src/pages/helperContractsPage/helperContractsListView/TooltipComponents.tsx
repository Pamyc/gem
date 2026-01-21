
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building, FileSignature, Building2, ArrowUpFromLine, Layers } from 'lucide-react';
import { CityNode, JKNode } from './types';

// --- Delayed Tooltip Wrapper using Portal ---
export const DelayedTooltipWrapper: React.FC<{
    children: React.ReactNode;
    content: React.ReactNode;
    delay?: number; // ms
}> = ({ children, content, delay = 1000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        timerRef.current = setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.top + window.scrollY, // Position relative to document
                    left: rect.left + window.scrollX
                });
                setIsVisible(true);
            }
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div 
            ref={triggerRef}
            className="relative w-fit inline-block"
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {isVisible && createPortal(
                <div 
                    className="absolute z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: coords.top - 10, // Slight offset upwards
                        left: coords.left,
                        transform: 'translateY(-100%)' // Shift fully above the element
                    }}
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};

// --- Tooltip Content Components ---
export const CityTooltipContent: React.FC<{ city: CityNode }> = ({ city }) => (
    <div className="w-64 bg-slate-800 text-white text-xs rounded-xl shadow-xl p-3 border border-white/10 relative">
        <div className="font-bold text-sm mb-2 border-b border-white/10 pb-1">{city.name}: Показатели</div>
        <div className="space-y-1.5">
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><Building size={12}/> Кол-во ЖК:</span>
                <span className="font-mono font-bold">{city.jks.length}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><FileSignature size={12}/> Договоров:</span>
                <span className="font-mono font-bold">{city.totalContracts}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><Building2 size={12}/> Литеров:</span>
                <span className="font-mono font-bold">{city.totalLiters}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><ArrowUpFromLine size={12}/> Лифтов:</span>
                <span className="font-mono font-bold">{city.totalElevators}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><Layers size={12}/> Этажей:</span>
                <span className="font-mono font-bold">{city.totalFloors}</span>
            </div>
        </div>
        {/* Arrow */}
        <div className="absolute left-4 -bottom-1.5 w-3 h-3 bg-slate-800 rotate-45 border-b border-r border-white/10"></div>
    </div>
);

export const JKTooltipContent: React.FC<{ jk: JKNode }> = ({ jk }) => (
    <div className="w-56 bg-slate-900 text-white text-xs rounded-xl shadow-xl p-3 border border-white/10 relative">
        <div className="font-bold text-sm mb-2 border-b border-white/10 pb-1">{jk.name}</div>
        <div className="space-y-1.5">
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><FileSignature size={12}/> Договоров:</span>
                <span className="font-mono font-bold text-indigo-400">{jk.totalContracts}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><Building2 size={12}/> Литеров:</span>
                <span className="font-mono font-bold text-orange-400">{jk.totalLiters}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><ArrowUpFromLine size={12}/> Лифтов:</span>
                <span className="font-mono font-bold text-emerald-400">{jk.totalElevators}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1"><Layers size={12}/> Этажей:</span>
                <span className="font-mono font-bold text-fuchsia-400">{jk.totalFloors}</span>
            </div>
        </div>
        {/* Arrow */}
        <div className="absolute left-4 -bottom-1.5 w-3 h-3 bg-slate-900 rotate-45 border-b border-r border-white/10"></div>
    </div>
);
