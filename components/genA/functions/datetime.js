import dayjs from "dayjs";

const DEFAULT_UTC_OFFSET_MINUTES = 5 * 60; // Country UTC+5

export const formatDateTime = (s, format = "DD.MM.YYYY HH:mm", offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES) => {
    if (!s)
        return "";
    const date = new Date(s);
    if (isNaN(date.getTime()))
        return "";
    const localOffsetMinutes = -date.getTimezoneOffset(); // e.g. UTC+6 => 360
    const deltaMinutes = offsetMinutes - localOffsetMinutes; // shift from local to target
    const shifted = new Date(date.getTime() + deltaMinutes * 60000);
    return dayjs(shifted).format(format);
}

export const formatDate = (s, format = "DD.MM.YYYY", offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES) => {
    return formatDateTime(s, format, offsetMinutes);
}

export const formatDateOnlyTime = (s, format = "HH:mm", offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES) => {
    return formatDateTime(s, format, offsetMinutes);
}

export const adjustDateToTimezone = (date, offsetMinutes = DEFAULT_UTC_OFFSET_MINUTES) => {
    if (!date)
        return null;
    if (isNaN(date.getTime()))
        return null;
    const localOffsetMinutes = -date.getTimezoneOffset();
    const deltaMinutes = offsetMinutes - localOffsetMinutes;
    const shifted = new Date(date.getTime() - deltaMinutes * 60000);
    return shifted;
}

export const formatDate2 = (inputDateTimeStr) => {
    const inputDateTime = new Date(inputDateTimeStr);
    const day = inputDateTime.getDate();
    const month = inputDateTime.getMonth() + 1; // Months are zero-indexed, so we add 1
    const year = inputDateTime.getFullYear();
    return `${day < 10 ? "0" + day: day}.${month < 10 ? "0" + month : month}.${year}`;
};

// Formats values that represent an offset from the Unix epoch (1970-01-01) into
// a compact human-readable time span like "19:00" or "1день 13:00".
// Accepts ISO strings, numbers (ms), or Date-like inputs.
export const formatDurationFromEpoch = (value) => {
    if (!value)
        return "";

    const epoch = dayjs(0);
    const dt = dayjs(value);
    if (!dt.isValid())
        return "";

    const ms = dt.diff(epoch);
    if (isNaN(ms))
        return "";

    const oneDayMs = 24 * 60 * 60 * 1000;
    const days = Math.floor(ms / oneDayMs);
    const remainderMs = ms % oneDayMs;
    const totalMinutes = Math.floor(remainderMs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hh = `${hours < 10 ? '0' : ''}${hours}`;
    const mm = `${minutes < 10 ? '0' : ''}${minutes}`;

    return days > 0 ? `${days}день ${hh}:${mm}` : `${hh}:${mm}`;
}

// Formats timespan value into human-readable format
// Accepts:
//   - String format: "1.16:39:00" (days.hours:minutes:seconds) -> "1 день, 16 часов, 39 мин"
//   - Number (milliseconds): 135480000 -> "1 день, 13 часов, 48 мин"
export const formatTimespan = (value) => {
    if (value == null || value === '')
        return "";

    let days = 0, hours = 0, minutes = 0;

    // Handle string format like "1.16:39:00" or "16:39:00"
    if (typeof value === 'string') {
        // Check if it has days (format: "1.16:39:00")
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts.length === 2) {
                days = parseInt(parts[0], 10) || 0;
                const timePart = parts[1];
                const timeMatches = timePart.match(/^(\d+):(\d+):(\d+)$/);
                if (timeMatches) {
                    hours = parseInt(timeMatches[1], 10) || 0;
                    minutes = parseInt(timeMatches[2], 10) || 0;
                }
            }
        } else {
            // Format without days: "16:39:00"
            const timeMatches = value.match(/^(\d+):(\d+):(\d+)$/);
            if (timeMatches) {
                hours = parseInt(timeMatches[1], 10) || 0;
                minutes = parseInt(timeMatches[2], 10) || 0;
            }
        }
    } else {
        // Handle number (milliseconds)
        const ms = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(ms) || ms < 0)
            return "";

        const oneDayMs = 24 * 60 * 60 * 1000;
        const oneHourMs = 60 * 60 * 1000;
        const oneMinuteMs = 60 * 1000;

        days = Math.floor(ms / oneDayMs);
        const remainderAfterDays = ms % oneDayMs;
        hours = Math.floor(remainderAfterDays / oneHourMs);
        const remainderAfterHours = remainderAfterDays % oneHourMs;
        minutes = Math.floor(remainderAfterHours / oneMinuteMs);
    }

    const parts = [];
    if (days > 0) {
        parts.push(`${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`);
    }
    if (hours > 0) {
        const hoursWord = hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов';
        parts.push(`${hours} ${hoursWord}`);
    }
    if (minutes > 0 || parts.length === 0) {
        parts.push(`${minutes} мин`);
    }

    return parts.join(', ');
}

// Formats a .NET TimeSpan string for display
// Accepts TimeSpan string in format "days.hours:minutes:seconds" (e.g., "1.01:00:00")
// style: 'dd, HH:mm' - формат "1 сутка, 00:00", по умолчанию - полный формат
export const formatTimeSpan = (timeSpanString, style = null, options = {}) => {
    if (!timeSpanString || typeof timeSpanString !== 'string') {
        return "";
    }
    
    const normalizedOptions = (options && typeof options === 'object') ? options : {};
    const { showDays = true } = normalizedOptions;
    
    const trimmed = timeSpanString.trim();
    if (!trimmed) {
        return "";
    }
    
    // Парсим формат: "days.hours:minutes:seconds"
    let days = 0, hours = 0, minutes = 0, seconds = 0;
    
    if (trimmed.includes('.')) {
        const [daysPart, timePart] = trimmed.split('.');
        days = parseInt(daysPart, 10) || 0;
        
        if (timePart) {
            const timeMatch = timePart.match(/^(\d+):(\d+):(\d+)$/);
            if (timeMatch) {
                hours = parseInt(timeMatch[1], 10) || 0;
                minutes = parseInt(timeMatch[2], 10) || 0;
                seconds = parseInt(timeMatch[3], 10) || 0;
            }
        }
    } else {
        const timeMatch = trimmed.match(/^(\d+):(\d+):(\d+)$/);
        if (timeMatch) {
            hours = parseInt(timeMatch[1], 10) || 0;
            minutes = parseInt(timeMatch[2], 10) || 0;
            seconds = parseInt(timeMatch[3], 10) || 0;
        }
    }
    
    // Если стиль 'dd, HH:mm'
    if (style === 'dd, HH:mm') {
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const timeStr = `${h}:${m}`;
        
        if (showDays && days > 0) {
            const dayWord = days === 1 ? 'сутка' : days < 5 ? 'сутки' : 'суток';
            return `${days} ${dayWord}, ${timeStr}`;
        }
        return timeStr;
    }
    
    // Форматируем для отображения (полный формат по умолчанию)
    const parts = [];
    if (showDays && days > 0) {
        parts.push(`${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`);
    }
    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`);
    }
    if (minutes > 0 || parts.length === 0) {
        parts.push(`${minutes} мин`);
    }
    if (seconds > 0 && parts.length === 0) {
        parts.push(`${seconds} сек`);
    }
    
    return parts.length > 0 ? parts.join(' ') : "0 мин";
}

// Legacy function for backward compatibility
export const formatDayTime = (date, baseDate = null, timezoneOffset = DEFAULT_UTC_OFFSET_MINUTES) => {
    if (!date)
        return "";
    
    if (!(date instanceof Date) || isNaN(date.getTime()))
        return "";
    
    const base = baseDate ? new Date(baseDate) : new Date(0);
    const baseStartOfDay = new Date(base);
    baseStartOfDay.setHours(0, 0, 0, 0);
    
    const dateStartOfDay = new Date(date);
    dateStartOfDay.setHours(0, 0, 0, 0);
    
    const diffMs = dateStartOfDay.getTime() - baseStartOfDay.getTime();
    const day = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    const localOffsetMinutes = -date.getTimezoneOffset();
    const deltaMinutes = timezoneOffset - localOffsetMinutes;
    const adjustedDate = new Date(date.getTime() + deltaMinutes * 60000);
    
    const hours = adjustedDate.getHours();
    const minutes = adjustedDate.getMinutes();
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    return day === 0 ? time : `${day}:${time}`;
}
