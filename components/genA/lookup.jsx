'use client';

import { useMemo, useState } from 'react';
// import React, { useState } from "react";
// import { Button, Form, InputGroup } from 'react-bootstrap';
import Details2 from './details2';
import { Field } from './field';
import IconEye from '@/components/icon/icon-eye';
import IconX from '@/components/icon/icon-x';
import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';
import SheetTable from './sheetTable';
// import Table2 from './table';
// import { PopoverButton } from "../form/popover";
// import Details2 from "./details2";
// import styles from "/styles/login.module.scss"

export default function Lookup({options, fullWidth = true, placeholder, formatValue, lookupValue, value, onChange, mode = 'modal', zIndex, ...props}) {
    const [detailsShow, setDetailsShow] = useState(false);
    const render = options?.table?.render;
    const [inputValue, setInputValue] = useState('');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const actionButtonBase = 'group inline-flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#f47d1d]';
    const selectButtonClass = `${actionButtonBase} text-white shadow-[0_18px_34px_-18px_rgba(15,23,42,0.7)] bg-[linear-gradient(135deg,#0f172a_0%,#1c2a4c_52%,#f47d1d_120%)] hover:-translate-y-0.5 hover:shadow-[0_28px_44px_-18px_rgba(15,23,42,0.78)]`;
    const clearButtonClass = `${actionButtonBase} border border-slate-200 bg-white/90 text-slate-500 shadow-[0_16px_32px_-20px_rgba(15,23,42,0.55)] hover:-translate-y-0.5 hover:text-[#f47d1d] hover:border-[#f47d1d]/60`;

    let formattedValue = formatValue ? formatValue(value) : value?.id;
    if(formattedValue == null){
        if(lookupValue != null){
            formattedValue = lookupValue;
        }
    }

    console.log('options', options);

    const quickSearchKeys = useMemo(() => options?.table?.quickSearchKeys || ['name'], [options?.table?.quickSearchKeys]);

    const onTypeahead = (text) => {
        setInputValue(text);
        if (!options?.table?.setQuery) return;

        const base = options?.table?.getQuery ? options?.table?.getQuery() : { paging: { skip: 0, take: 100 }, filter: {} };
        const filter = { ...(base.filter || {}) };

        const trimmed = (text || '').trim();
        if (trimmed && quickSearchKeys.length > 0) {
            // Удаляем старые фильтры быстрого поиска
            quickSearchKeys.forEach(key => {
                delete filter[key];
            });
            
            // Если одно поле, используем простой фильтр
            if (quickSearchKeys.length === 1) {
                filter[quickSearchKeys[0]] = { operator: 'like', operand1: trimmed };
            } else {
                // Если несколько полей, создаем OR фильтр
                filter.or = quickSearchKeys.map(key => ({
                    [key]: { operator: 'like', operand1: trimmed }
                }));
            }
        } else {
            // Удаляем все фильтры быстрого поиска
            quickSearchKeys.forEach(key => {
                delete filter[key];
            });
            delete filter.or;
        }
        options.table.setQuery({ ...(base || {}), paging: { skip: 0, take: base?.paging?.take || 100 }, filter });
        setIsPopoverOpen(true);
    };

    switch (mode) {
        case 'popover':
            return (
                <>
                    <div className="flex w-full items-center gap-2">
                        <Field type="text" value={inputValue || formattedValue} readOnly={false} onChange={(v) => onTypeahead(v)}
                            className="form-input flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    // Apply current input to table filter and trigger search
                                    const text = (inputValue || '').trim();
                                    if (options?.table?.setQuery) {
                                        const base = options?.table?.getQuery ? options.table.getQuery() : { paging: { skip: 0, take: 100 }, filter: {} };
                                        const next = { ...(base || {}) };
                                        const filter = { ...(next.filter || {}) };
                                        
                                        if (text && quickSearchKeys.length > 0) {
                                            // Удаляем старые фильтры быстрого поиска
                                            quickSearchKeys.forEach(key => {
                                                delete filter[key];
                                            });
                                            
                                            // Если одно поле, используем простой фильтр
                                            if (quickSearchKeys.length === 1) {
                                                filter[quickSearchKeys[0]] = { operator: 'like', operand1: text };
                                            } else {
                                                // Если несколько полей, создаем OR фильтр
                                                filter.or = quickSearchKeys.map(key => ({
                                                    [key]: { operator: 'like', operand1: text }
                                                }));
                                            }
                                        } else {
                                            // Удаляем все фильтры быстрого поиска
                                            quickSearchKeys.forEach(key => {
                                                delete filter[key];
                                            });
                                            delete filter.or;
                                        }
                                        
                                        next.filter = filter;
                                        next.paging = { skip: 0, take: base?.paging?.take || 100 };
                                        options.table.setQuery(next);
                                    }
                                    setDetailsShow(true);
                                    setIsPopoverOpen(true);
                                }
                            }}
                            {...props} placeholder={placeholder} />
                        <Tippy visible={detailsShow} interactive={true} arrow={true} onClickOutside={() => setDetailsShow(false)} render={_ => <div {..._} style={{backgroundColor: 'white'}}>
                                <h3 style={{display: "inline"}}>{options?.details?.formatTitle ? options?.details?.formatTitle(options?.details?.resourceName) : `Выбор ${options?.details?.resourceName || ""}`}</h3>
                                {render ? render(options, setDetailsShow) : <SheetTable {...options?.table} actions={{
                                        onSelect: (row) => {
                                            onChange && onChange(row);
                                            setDetailsShow(false);
                                            setIsPopoverOpen(false);
                                            setInputValue(null);
                                        }
                                     }} {...props} />}
                            </div>} placement="top-start" offset={[0, -10]}>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className={selectButtonClass}
                                    title="Выбрать"
                                    aria-label="Выбрать"
                                    onClick={_ => setDetailsShow(!detailsShow)}
                                >
                                    <IconEye className="h-5 w-5 text-white drop-shadow-sm" />
                                </button>
                                <button
                                    type="button"
                                    className={clearButtonClass}
                                    title="Очистить"
                                    aria-label="Очистить"
                                    onClick={() => {
                                        onChange(null);
                                        setInputValue('');
                                        setIsPopoverOpen(false);
                                    }}
                                >
                                    <IconX className="h-5 w-5 text-current transition-colors duration-200 group-hover:text-[#f47d1d]" />
                                </button>
                            </div>
                        </Tippy>
                    </div>
                </>
            );
        default:
            return (
                <>
                    <div className="flex w-full items-center gap-2" style={{width: '100%'}}>
                        <Field type="text" value={inputValue || formattedValue} readOnly={false} onChange={(v) => onTypeahead(v)}
                            className="form-input flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const text = (inputValue || '').trim();
                                    if (options?.table?.setQuery) {
                                        const base = options?.table?.getQuery ? options.table.getQuery() : { paging: { skip: 0, take: 100 }, filter: {} };
                                        const next = { ...(base || {}) };
                                        const filter = { ...(next.filter || {}) };
                                        
                                        if (text && quickSearchKeys.length > 0) {
                                            // Удаляем старые фильтры быстрого поиска
                                            quickSearchKeys.forEach(key => {
                                                delete filter[key];
                                            });
                                            
                                            // Если одно поле, используем простой фильтр
                                            if (quickSearchKeys.length === 1) {
                                                filter[quickSearchKeys[0]] = { operator: 'like', operand1: text };
                                            } else {
                                                // Если несколько полей, создаем OR фильтр
                                                filter.or = quickSearchKeys.map(key => ({
                                                    [key]: { operator: 'like', operand1: text }
                                                }));
                                            }
                                        } else {
                                            // Удаляем все фильтры быстрого поиска
                                            quickSearchKeys.forEach(key => {
                                                delete filter[key];
                                            });
                                            delete filter.or;
                                        }
                                        
                                        next.filter = filter;
                                        next.paging = { skip: 0, take: base?.paging?.take || 100 };
                                        options.table.setQuery(next);
                                    }
                                    setDetailsShow(true);
                                    setIsPopoverOpen(true);
                                }
                            }}
                            {...props} placeholder={placeholder} />
                        <button
                            type="button"
                            className={selectButtonClass}
                            title="Выбрать"
                            aria-label="Выбрать"
                            onClick={() => { setDetailsShow(true); setIsPopoverOpen(true); }}
                        >
                            <IconEye className="h-5 w-5 text-white drop-shadow-sm" />
                        </button>
                        <button
                            type="button"
                            className={clearButtonClass}
                            title="Очистить"
                            aria-label="Очистить"
                            onClick={() => {
                                onChange(null);
                                setInputValue('');
                                setIsPopoverOpen(false);
                            }}
                        >
                            <IconX className="h-5 w-5 text-current transition-colors duration-200 group-hover:text-[#f47d1d]" />
                        </button>
                    </div>
                    <Details2 show={detailsShow} setShow={setDetailsShow} 
                        size={options?.details?.size || "3xl"}
                        {...options?.details} 
                        {...props}
                        //dialogClassName="modal-90w"
                        formatTitle={options?.details?.formatTitle || ((_) => `Выбор ${_ || ""}`)}
                        zIndex={zIndex}
                        usePortal={options?.details?.usePortal}
                    >
                        {render ? render(options, setDetailsShow) : <SheetTable {...options?.table} actions={{
                            onSelect: (row) => {
                                onChange && onChange(row);
                                setDetailsShow(false);
                                setIsPopoverOpen(false);
                                setInputValue('');
                            }
                        }} {...props} />}
                    </Details2>
                </>
            );
    }
}
