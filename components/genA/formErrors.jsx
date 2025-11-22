import { useState } from 'react';
import IconBellBing from '@/components/icon/icon-bell-bing';

// Функция для получения переведенного названия поля
const getFieldLabel = (fieldName, fieldLabels = {}) => {
    return fieldLabels[fieldName] || fieldName;
};

export default function FormErrors({errors, fieldLabels = {}, ...props}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return errors.length > 0 && (
        <div className="mb-6">
            <div className="rounded-xl border border-red-200/60 bg-red-50/30 backdrop-blur-sm">
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-red-50/50 rounded-xl"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100/80 text-red-600">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-800">
                                Обнаружены ошибки валидации
                            </h3>
                            <p className="text-xs text-red-600/70">
                                {errors.length} {errors.length === 1 ? 'ошибка' : errors.length < 5 ? 'ошибки' : 'ошибок'}
                            </p>
                        </div>
                    </div>
                    <svg
                        className={`h-5 w-5 text-red-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
                
                {isExpanded && (
                    <div className="border-t border-red-200/60 bg-white/40 p-4">
                        <div className="space-y-2">
                            {errors && errors.map((error, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2.5 rounded-lg border border-red-200/40 bg-white/60 p-3"
                                >
                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200/80 text-xs font-semibold text-red-700">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium text-red-800">
                                            {getFieldLabel(error.name, fieldLabels)}:
                                        </span>
                                        <span className="ml-1.5 text-sm text-red-700/90">
                                            {error.message}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

