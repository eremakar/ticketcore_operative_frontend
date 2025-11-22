import { FC } from 'react';

interface IconBedFlatProps {
    className?: string;
}

const IconBedFlat: FC<IconBedFlatProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Base line */}
            <path d="M3 17H21" stroke="currentColor" strokeWidth="1.5"/>
            {/* Legs */}
            <path d="M6 17V19" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M18 17V19" stroke="currentColor" strokeWidth="1.5"/>
            {/* Mattress (flat) */}
            <rect x="4" y="12" width="10" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            {/* Pillow */}
            <rect x="15.5" y="12.5" width="4.5" height="3" rx="0.8" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    );
};

export default IconBedFlat;


