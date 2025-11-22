// Парсит .NET TimeSpan формат: "1.01:00:00" (дни.часы:минуты:секунды)
export const parseTimeSpan = (timeSpanString) => {
    if (!timeSpanString || typeof timeSpanString !== 'string') {
        return { days: 0, hours: 0, minutes: 0 };
    }
    
    const trimmed = timeSpanString.trim();
    if (!trimmed) {
        return { days: 0, hours: 0, minutes: 0 };
    }
    
    if (trimmed.includes('.')) {
        const [daysPart, timePart] = trimmed.split('.');
        const days = parseInt(daysPart, 10) || 0;
        
        if (timePart) {
            const timeMatch = timePart.match(/^(\d+):(\d+):(\d+)$/);
            if (timeMatch) {
                return {
                    days,
                    hours: parseInt(timeMatch[1], 10) || 0,
                    minutes: parseInt(timeMatch[2], 10) || 0
                };
            }
        }
    } else {
        const timeMatch = trimmed.match(/^(\d+):(\d+):(\d+)$/);
        if (timeMatch) {
            return {
                days: 0,
                hours: parseInt(timeMatch[1], 10) || 0,
                minutes: parseInt(timeMatch[2], 10) || 0
            };
        }
    }
    
    return { days: 0, hours: 0, minutes: 0 };
};

// Форматирует в .NET TimeSpan формат: "days.hours:minutes:seconds" (секунды всегда 00)
export const formatTimeSpan = (days, hours, minutes) => {
    const d = days || 0;
    const h = String(hours || 0).padStart(2, '0');
    const m = String(minutes || 0).padStart(2, '0');
    
    return `${d}.${h}:${m}:00`;
};

// Конвертирует TimeSpan строку в общее количество минут
export const timeSpanToMinutes = (timeSpanValue) => {
    if (!timeSpanValue) return null;
    
    // Если это строка TimeSpan
    if (typeof timeSpanValue === 'string') {
        const { days, hours, minutes } = parseTimeSpan(timeSpanValue);
        return days * 24 * 60 + hours * 60 + minutes;
    }
    
    return null;
};

// Конвертирует минуты в TimeSpan строку
export const minutesToTimeSpan = (minutes) => {
    if (minutes === null || minutes < 0) return '0.00:00:00';
    
    const days = Math.floor(minutes / (24 * 60));
    const remainingMinutes = minutes % (24 * 60);
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;
    
    const d = days;
    const h = String(hours).padStart(2, '0');
    const m = String(mins).padStart(2, '0');
    
    return `${d}.${h}:${m}:00`;
};

