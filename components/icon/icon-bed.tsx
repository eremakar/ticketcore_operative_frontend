import { FC } from 'react';

interface IconBedProps {
    className?: string;
}

const IconBed: FC<IconBedProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M4 16.5H20" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 16.5V19" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M18 16.5V19" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4 12V9.5C4 8.11929 5.11929 7 6.5 7H10.5C11.8807 7 13 8.11929 13 9.5V12" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 12H18C19.6569 12 21 13.3431 21 15V16.5" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
    );
};

export default IconBed;


