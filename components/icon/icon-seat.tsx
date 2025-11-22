import { FC } from 'react';
import Image from 'next/image';

interface IconSeatProps {
    className?: string;
}

const IconSeat: FC<IconSeatProps> = ({ className }) => {
    return (
        <div className={`relative inline-block ${className || ''}`}>
            <Image
                src="/assets/images/seats/seat-80.png"
                alt="Seat"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                style={{
                    filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1352%) hue-rotate(198deg) brightness(95%) contrast(89%)',
                }}
            />
        </div>
    );
};

export default IconSeat;

