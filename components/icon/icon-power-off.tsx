import { FC } from 'react';

interface IconPowerOffProps {
    className?: string;
}

const IconPowerOff: FC<IconPowerOffProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M12 2V6M12 18V22M8.5 8.5L5.5 5.5M15.5 8.5L18.5 5.5M8.5 15.5L5.5 18.5M15.5 15.5L18.5 18.5M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
            />
            <path
                d="M4 4L20 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default IconPowerOff;
