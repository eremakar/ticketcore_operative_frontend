'use client';

import { Field } from './field';
import { parseTimeSpan, formatTimeSpan } from './functions/timespan';

// Создает Date объект из часов и минут (для поля type='time')
const createTimeDate = (hours, minutes) => {
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
};

// Извлекает часы и минуты из Date объекта или строки
const extractTimeFromValue = (timeValue) => {
    if (!timeValue) {
        return { hours: 0, minutes: 0 };
    }
    
    if (timeValue instanceof Date && !isNaN(timeValue.getTime())) {
        return {
            hours: timeValue.getHours(),
            minutes: timeValue.getMinutes()
        };
    }
    
    if (typeof timeValue === 'string') {
        const match = timeValue.trim().match(/^(\d+):(\d+)$/);
        if (match) {
            return {
                hours: parseInt(match[1], 10) || 0,
                minutes: parseInt(match[2], 10) || 0
            };
        }
    }
    
    return { hours: 0, minutes: 0 };
};

export const TimeSpan = ({ value, onChange, options, disabled, readOnly, ...props }) => {
    // Парсим входное значение из .NET TimeSpan формата
    const parsed = parseTimeSpan(value);
    const { days, hours, minutes } = parsed;
    // Создаем Date объект для поля type='time'
    const timeDate = createTimeDate(hours, minutes);
    
    const hideDays = options?.hideDays || false;
    
    const handleDayChange = (newDay) => {
        const parsedDay = parseInt(newDay) || 0;
        const newValue = formatTimeSpan(parsedDay, hours, minutes);
        onChange && onChange(newValue);
    };
    
    const handleTimeChange = (newTimeValue) => {
        // newTimeValue может быть Date объектом или строкой
        const { hours: newHours, minutes: newMinutes } = extractTimeFromValue(newTimeValue);
        const newValue = formatTimeSpan(days, newHours, newMinutes);
        onChange && onChange(newValue);
    };

    const isReadOnly = disabled || readOnly;
    
    return (
        <div className={`flex items-center gap-2 ${props.className || ''}`}>
            {!hideDays && (
                <>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Сутки:</span>
                    <Field 
                        type='number' 
                        value={days} 
                        onChange={isReadOnly ? undefined : handleDayChange} 
                        className={props.className ? `${props.className} w-16` : "form-input w-16"} 
                        options={{ min: 0, ...options?.dayOptions }}
                        disabled={isReadOnly}
                        readOnly={isReadOnly}
                    />
                </>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">Время:</span>
            <Field 
                type='time' 
                value={timeDate} 
                onChange={isReadOnly ? undefined : handleTimeChange} 
                className={props.className ? `${props.className} form-input` : "form-input"}
                options={options?.timeOptions}
                disabled={isReadOnly}
                readOnly={isReadOnly}
            />
        </div>
    );
};

export default TimeSpan;

