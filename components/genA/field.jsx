'use client';

import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import fp from 'flatpickr';
import { Select2 } from './select';
import { ResourceSelect2 } from './resourceSelect2';
import Lookup from './lookup';
import ResourceLookup from './resourceLookup';
import IconX from '@/components/icon/icon-x';
import TimeSpan from './TimeSpan';

export const Field = ({type = "text", orientation, value, onChange, options,  ...props}) => {
    const vertical = orientation=="vertical";
    const nullable = props.nullable || options?.nullable;
    const handleNullableInput = (e) => {
        if (!nullable) return;
        const v = e?.target?.value;
        if (v == null || v.trim() === '') {
            onChange && onChange(null);
        }
    };

    switch (type) {
        case "label":
            return <label
                className="form-input" {...props}>{value}</label>
        case "text":
            return <input type={options?.type || "text"} placeholder={vertical ? props.placeholder : ""}
                className="form-input"
                value={value} onChange={(e) => {
                    onChange && onChange(e.target.value);
                }} {...props} />
        case "textarea":
            return <textarea className={props.className || "form-input"}
                placeholder={vertical ? placeholder : ""}
                rows={options?.rows || 3} style={{width:'100%', ...props.style}}
                value={value} onChange={(e) => {
                    onChange && onChange(e.target.value);
                }}
                {...props} ></textarea>
        case "number":
            return <input type="number" placeholder={vertical ? props.placeholder : ""}
                className="form-input"
                value={value} onChange={(e) => {
                    onChange && onChange(e.target.value);
                }} disabled={props.disabled} readOnly={props.readOnly} {...props} />
        case "float":
            const decimalPlaces = options?.decimalPlaces || 2;
            const step = Math.pow(10, -decimalPlaces);
            return <input type="number" step={step} placeholder={vertical ? props.placeholder : ""}
                className="form-input"
                value={value} onChange={(e) => {
                    onChange && onChange(e.target.value);
                }} {...props} />
        case "boolean":
        case "checkbox":
            return <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="form-checkbox"
                    checked={value}
                    onChange={(e) => {
                        onChange && onChange(e.target.checked);
                    }} {...props} />
                <span className=" text-white-dark">{props.label || props.placeholder}</span>
            </label>
        case "multicheckbox":
            // Handle both old format (array) and new format (object with items and columns)
            const items = Array.isArray(options) ? options : (options?.items || []);
            const columns = (Array.isArray(options) ? 1 : options?.columns) || 1;
            const itemsPerColumn = Math.ceil(items.length / columns);
            const columnItems = [];
            
            for (let i = 0; i < columns; i++) {
                const startIndex = i * itemsPerColumn;
                const endIndex = Math.min(startIndex + itemsPerColumn, items.length);
                columnItems.push(items.slice(startIndex, endIndex));
            }
            
            return <div className="flex flex-col lg:flex-row gap-4">
                {columnItems.map((columnOptions, columnIndex) => (
                    <div key={columnIndex} className="flex flex-col flex-1">
                        {columnOptions.map((option) => {
                            // Handle both string and object formats
                            const optionValue = typeof option === 'string' ? option : option.value;
                            const optionLabel = typeof option === 'string' ? option : option.label;
                            const optionKey = typeof option === 'string' ? option : option.value;
                            
                            return (
                                <label key={optionKey} className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="form-checkbox"
                                        checked={value && value.includes(optionValue)}
                                        onChange={() => {
                                            if (!value || !value.push)
                                                return;

                                            const selected = value.includes(optionValue) ?
                                                value.filter((_) => _ !== optionValue) :
                                                [...value, optionValue];
                                                onChange && onChange(selected);
                                        }}
                                    />
                                    <span className=" text-white-dark">{optionLabel}</span>
                                </label>
                            );
                        })}
                    </div>
                ))}
            </div>
        case "date":
            return <Flatpickr
                className="form-input"
                value={value}
                options={{
                    dateFormat: "d.m.Y" || options?.dateFormat,
                    allowInput: nullable || options?.inputOptions?.allowInput
                }}
                onChange={(newValue) => {
                    if (newValue.length)
                        onChange && onChange(newValue[0]);
                    else
                        onChange && onChange(newValue);
                }}
                onInput={handleNullableInput}
            />
        case "datetime":
            return <Flatpickr
                data-enable-time
                className="form-input"
                value={value}
                options={{
                    enableTime: options?.enableTime || true,
                    dateFormat: "d.m.Y H:i" || options?.dateFormat,
                    time_24hr: true,
                    allowInput: nullable || options?.inputOptions?.allowInput,
                    ...options?.inputOptions
                }}
                onChange={(newValue) => {
                    if (newValue.length)
                        onChange && onChange(newValue[0]);
                    else
                        onChange && onChange(newValue);
                }}
                onInput={handleNullableInput}
            />
        case "time":
            let timezoneOffset = options?.timezoneOffset !== undefined ? options.timezoneOffset : 5; // Default to UTC+5
            if (timezoneOffset == 0) timezoneOffset = 0;
            const TZ_MIN = timezoneOffset * 60; // Convert hours to minutes
            const toTarget = (date) => {
                const localOffset = -date.getTimezoneOffset();
                const delta = TZ_MIN - localOffset;
                return new Date(date.getTime() + delta * 60000);
            };
            const fromTarget = (date) => {
                return new Date(date.getTime());
            };

            const uiValue = typeof value === 'number' ? new Date(value) : value;

            return <div style={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
                <Flatpickr
                    data-enable-time
                    className="form-input"
                    value={uiValue}
                    disabled={props.disabled || props.readOnly}
                    options={{
                        enableTime: true,
                        noCalendar: true,
                        dateFormat: "H:i" || options?.dateFormat,
                        time_24hr: true,
                        clickOpens: !props.disabled && !props.readOnly,
                        //formatDate: (date, format, locale) => fp.formatDate(toTarget(date), format, locale),
                        parseDate: (str, format) => {
                            return fromTarget(fp.parseDate(str, format))
                        },
                        ...options?.inputOptions
                    }}
                    onChange={(newValue) => {
                        if (props.disabled || props.readOnly) return;
                        if (newValue.length) {
                            onChange && onChange(newValue[0]);
                        } else
                            onChange && onChange(newValue);
                    }}
                    onInput={handleNullableInput}
                />
                {nullable && uiValue ? (
                    <button
                        type="button"
                        className="btn btn-sm btn-xsm prevent"
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)' }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onChange && onChange(null);
                        }}
                    >
                        <IconX />
                    </button>
                ) : null}
            </div>
        case "timeSpan":
            return <TimeSpan
                value={value}
                onChange={onChange}
                options={options}
                {...props}
            />
        case "radiogroup":
            return <div className="space-y-2">
                {options.map((option, index) => (
                    <div>
                        <label key={index} className="inline-flex">
                            <input type="radio" className="form-radio"
                                checked={value == index}
                                onChange={() => {
                                    onChange && onChange(index);
                                }}
                            />
                            <span className=" text-white-dark">{option}</span>
                        </label>
                    </div>
                    )
                )}
            </div>
        case "select":
            return <Select2 options={options}
                value={value}
                onChange={onChange}
                placeholder={vertical ? placeholder : ""}
                {...props}
            />
        case "resourceselect":
            return <ResourceSelect2
                value={value}
                onChange={onChange}
                placeholder={vertical ? placeholder : ""}
                {...props} />
        case "lookup":
            return <Lookup options={options}
                value={value}
                onChange={onChange}
                placeholder={vertical ? placeholder : ""}
                {...props}
            />
        case "resourcelookup":
            return <ResourceLookup options={options}
                value={value}
                onChange={onChange}
                placeholder={vertical ? placeholder : ""}
                {...props}
            />
        // case "hierarchyresourcelookup":
        //     return <HierarchyResourceLookup options={options}
        //         value={value}
        //         onChange={onChange}
        //         placeholder={vertical ? placeholder : ""}
        //         {...props}
        //     />
        case "control":
            return null;

        default:
            return <><span>Type {type} is not supported</span></>
    }
}
