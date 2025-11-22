'use client';

import React, { useState, useEffect } from "react";
import Details2 from "./details2";
import { findIndex } from "@/components/genA/functions/linq1";
import SheetTable from "./sheetTable";
import IconEye from '@/components/icon/icon-eye';

export default function MultiLookup({name, options, fullWidth = true, placeholder, formatItem, onChange, iconClassName, icon, value, renderTable, renderSelectionsTable, onSelectionsChange, ...props}) {
    const [detailsShow, setDetailsShow] = useState(false);
    const render = options?.table?.render;

    const format = (value) => formatItem ? formatItem(value) : value?.id;
    const icon2 = icon || IconEye;

    const [selected, setSelected] = useState(() => value || []);

    useEffect(() => {
        if (value !== undefined) {
            setSelected((prevSelected) => {
                // Сравниваем по содержимому, а не по ссылке
                const prevIds = prevSelected.map(s => s?.id).sort().join(',');
                const newIds = (value || []).map(v => v?.id).sort().join(',');
                if (prevIds !== newIds) {
                    return value || [];
                }
                return prevSelected;
            });
        }
    }, [value]);

    // Сбрасываем selected при открытии модального окна, чтобы всегда начинать с актуального value
    useEffect(() => {
        if (detailsShow && value !== undefined) {
            setSelected(value || []);
        }
    }, [detailsShow, value]);

    const selectButtonClass = 'group inline-flex items-center gap-2 h-10 px-4 min-w-[2.5rem] rounded-md transition-all duration-200 text-white shadow-[0_18px_34px_-18px_rgba(15,23,42,0.7)] bg-[linear-gradient(135deg,#0f172a_0%,#1c2a4c_52%,#3b82f6_120%)] hover:-translate-y-0.5 hover:shadow-[0_28px_44px_-18px_rgba(15,23,42,0.78)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';
    const confirmButtonClass = 'group inline-flex items-center gap-2 h-10 px-6 rounded-md transition-all duration-200 text-white shadow-[0_18px_34px_-18px_rgba(15,23,42,0.7)] bg-[linear-gradient(135deg,#0f172a_0%,#1c2a4c_52%,#3b82f6_120%)] hover:-translate-y-0.5 hover:shadow-[0_28px_44px_-18px_rgba(15,23,42,0.78)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500';

    const selectedCount = selected.length;

    return (
        <>
            <button 
                type="button" 
                className={selectButtonClass}
                onClick={() => setDetailsShow(true)}
            >
                <IconEye className="h-5 w-5 text-white drop-shadow-sm" />
                <span className="font-medium">Выбрать</span>
                {selectedCount > 0 && (
                    <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                        {selectedCount}
                    </span>
                )}
            </button>
            <Details2 
                show={detailsShow} 
                setShow={setDetailsShow} 
                {...options?.details} 
                {...props}
                size={options?.details?.size || null}
                dialogClassName={options?.details?.dialogClassName || "modal-90w"}
                formatTitle={options?.details?.formatTitle || ((_) => `Выбор ${_ || ""}`)}
                renderButtons={() => {
                    return (
                        <button 
                            className={confirmButtonClass}
                            onClick={() => {
                                setDetailsShow(false);
                                onChange && onChange(selected);
                            }}
                        >
                            <span>Применить</span>
                            {selectedCount > 0 && (
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
                                    {selectedCount}
                                </span>
                            )}
                        </button>
                    );
                }}
            >
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-100">
                        <div className="mb-4 space-y-1">
                            <h3 className="text-base font-semibold text-slate-900">Доступные значения</h3>
                            <p className="text-xs text-slate-500">Нажмите на строку в таблице для добавления</p>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                            {renderTable ?
                                renderTable(options, setDetailsShow) :
                                <SheetTable 
                                    renderFooter={() => {
                                        return (
                                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">Для выбора значения нажмите на строку в таблице</p>
                                            </div>
                                        );
                                    }}
                                    {...options?.table} 
                                    actions={{
                                        onSelect: (row) => {
                                            setSelected((prevSelected) => {
                                                if (prevSelected.find(_ => _.id == row.id))
                                                    return prevSelected;

                                                const newSelected = [row, ...prevSelected];
                                                onSelectionsChange && onSelectionsChange(row, prevSelected, 'add');
                                                return newSelected;
                                            });
                                        }
                                    }} 
                                    {...props}
                                />
                            }
                        </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-100">
                        <div className="mb-4 space-y-1">
                            <h3 className="text-base font-semibold text-slate-900">Выбранные значения</h3>
                            <p className="text-xs text-slate-500">
                                {selectedCount > 0 
                                    ? `Выбрано: ${selectedCount}` 
                                    : "Список пуст"}
                            </p>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                            {renderSelectionsTable ?
                                renderSelectionsTable(options, setDetailsShow) :
                                <SheetTable 
                                    data={selected} 
                                    setData={setSelected} 
                                    renderHeader={() => {
                                        return (
                                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                                <p className="text-sm font-medium text-slate-700">Выбранные значения</p>
                                            </div>
                                        );
                                    }} 
                                    renderFooter={() => {
                                        return (
                                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">Для отмены выбранного значения нажмите на строку в таблице</p>
                                            </div>
                                        );
                                    }} 
                                    isPager={false} 
                                    {...options?.selectionsTable} 
                                    actions={{
                                        onSelect: (row) => {
                                            setSelected((prevSelected) => {
                                                const index = findIndex(prevSelected, _ => _.id == row.id);

                                                if (index < 0)
                                                    return prevSelected;

                                                const deleted = prevSelected[index];
                                                const newSelected = prevSelected.filter((_, i) => i !== index);
                                                onSelectionsChange && onSelectionsChange(deleted, newSelected, 'remove');
                                                return newSelected;
                                            });
                                        }
                                    }} 
                                    {...props}
                                />
                            }
                        </div>
                    </div>
                </div>
            </Details2>
        </>
    );
}
