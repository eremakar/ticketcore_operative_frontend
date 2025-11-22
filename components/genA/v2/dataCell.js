import { viewTypeIds } from "./viewTypeIds";
import { extract, inject } from "@/components/genA/functions/path";
import { aggregate } from "@/components/genA/functions/linq1";
import { formatDate, formatDateOnlyTime, formatTimeSpan, formatDayTime } from "@/components/genA/functions/datetime";
import { Field } from "../field";
import { SelectList } from "./selectList";

const DataCell2 = ({ data, setData,
    column,
    wrappedRow,
    changingRow,
    row,
    isEdit,
    rowIndex,
    //render,
    onChange }) => {
        let value = row[column.key];
        const obj = value || {};
        const path = column.path;
        value = path ? extract(path, null, obj) : value;
        const editable = column.editable;
        const isEditValue = typeof column.isEdit === 'function' ? column.isEdit(wrappedRow) : column.isEdit;
        const cellIsEdit = isEdit || isEditValue;

        const getChangeMode = (fallbackMode) => isEditValue ? 'editCommitted' : fallbackMode;

        const renderText = (options) => {
            const text = (value !== null && value !== undefined ? value : '').toString();

            const multilinedText = text.split('\n');

            if (multilinedText.length <= 1)
                return options?.width ? <text style={{whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word', width: options.width, overflow: 'hidden'}}>{text}</text> : <text>{text}</text>;

            //debugger;

            return multilinedText.map((_, index) => <div key={index}>{_}</div>);
        }

        const renderEditable = () => {
            //const isEdit = true;

            if (!cellIsEdit) {
                if (column.render) {
                    return column.render(column.type == viewTypeIds.text ? renderText(column.view) : value, wrappedRow, onChange, data, cellIsEdit, rowIndex, changingRow, row);
                }

                let options = null;

                switch (column.type) {
                    case viewTypeIds.json:
                        return renderText(column.view);
                    case viewTypeIds.list:
                        options = column.options;
                        return aggregate(value, '', (result, item, initialValue) => {
                            if (result?.length > 0)
                                result += ", ";
                            result += options.list?.labelSelector ? options.list?.labelSelector(item) : item.id;

                            return result;
                        });
                    case viewTypeIds.select:
                        options = column.options;
                        const labelMemberName = options?.props?.labelMemberName || "name";

                        return value ? value[labelMemberName] : "";
                    case viewTypeIds.date:
                        return formatDate(value);
                    case viewTypeIds.time:
                        // Apply timezone offset if specified
                        if (column.options?.timezoneOffset !== undefined && value) {
                            const tzValue = column.timezoneOffset || column.options?.timezoneOffset;
                            let timezoneOffset = tzValue || 5;
                            if (tzValue == 0) timezoneOffset = 0;
                            timezoneOffset = timezoneOffset + 1;
                            const TZ_MIN = timezoneOffset * 60; // Convert hours to minutes
                            const date = new Date(value);
                            const localOffset = -date.getTimezoneOffset();
                            const delta = TZ_MIN - localOffset;
                            const adjustedDate = new Date(date.getTime() + delta * 60000);
                            return formatDateOnlyTime(adjustedDate);
                        }
                        return formatDateOnlyTime(value);
                    case viewTypeIds.timeSpan:
                        // Ожидаем строку в формате .NET TimeSpan: "1.01:00:00"
                        if (typeof value === 'string') {
                            return formatTimeSpan(value);
                        }
                        // Fallback для Date объектов (для обратной совместимости)
                        if (value instanceof Date && !isNaN(value.getTime())) {
                            const timezoneOffset = column.options?.timezoneOffset !== undefined 
                                ? column.options.timezoneOffset * 60 
                                : undefined;
                            const baseDate = column.options?.baseDate || null;
                            return formatDayTime(value, baseDate, timezoneOffset);
                        }
                        return "";
                    case viewTypeIds.control:
                        return column.render(value, wrappedRow, onChange, data, cellIsEdit, rowIndex, changingRow, row);
                    default:
                        return renderText(column.view);
                }
            }

            let options = null;

            switch (column.type) {
                case viewTypeIds.text:
                    return <Field type={column.view?.type || 'text'} value={value} onChange={(newValue) => {
                        row[column.key] = newValue;
                        onChange(row, getChangeMode());
                    }} className="tableRowField" options={column.view?.options} />
                case viewTypeIds.json:
                    if (path) {
                        row[column.key] = obj;
                    }

                    return <Field type={column.view?.type || 'text'} value={value} onChange={(newValue) => {
                        if (path) {
                            const obj = row[column.key] || {};
                            inject(path, null, obj, newValue);
                            row[column.key] = obj;
                        } else {
                            row[column.key] = newValue;
                        }
                        onChange(row, getChangeMode());
                    }} className="tableRowField" options={column.view?.options} />
                case viewTypeIds.select:
                    options = column.options;
                    const relationMemberName = options.relationMemberName;

                    const value2 = relationMemberName ? row[relationMemberName] : value;

                    return <Field type='select' value={value2} onChange={(newValue, obj, mappedObj) => {
                        if (relationMemberName)
                            row[relationMemberName] = newValue;
                        if (options.primitive)
                            row[column.key] = newValue;
                        else
                            row[column.key] = mappedObj;
                            onChange(row, getChangeMode());
                    }} className="tableRowField" options={options?.items} {...options?.props} />
                case viewTypeIds.date:
                    return <Field type='date' value={value} onChange={(newValue) => {
                        row[column.key] = newValue;
                        onChange(row, getChangeMode());
                    }} className="tableRowField tableRowFieldDate" options={column.options} />
                case viewTypeIds.time:
                    return <Field type='time' value={value} onChange={(newValue) => {
                        row[column.key] = newValue;
                        onChange(row, getChangeMode());
                    }} className="tableRowField tableRowFieldDate" options={column.options} />
                case viewTypeIds.timeSpan:
                    return <Field 
                        type='timeSpan' 
                        value={value || '0.00:00:00'} 
                        onChange={(newValue) => {
                            row[column.key] = newValue;
                            onChange(row, getChangeMode());
                        }}
                        className="tableRowField" 
                        options={column.options}
                    />;
                case viewTypeIds.int:
                case viewTypeIds.bigint:
                    return <Field type='number' value={value} onChange={(newValue) => {
                        row[column.key] = newValue;
                        onChange(row, getChangeMode());
                    }} className="tableRowField" options={column.view?.options} />
                case viewTypeIds.number:
                    return <Field type='number' value={value} onChange={(newValue) => {
                        row[column.key] = newValue;
                        onChange(row, getChangeMode());
                    }} className="tableRowField" options={column.view?.options} />
                case viewTypeIds.float:
                    return <Field type='float' value={value} onChange={(newValue) => {
                        row[column.key] = newValue;
                        onChange(row, getChangeMode());
                    }} className="tableRowField" options={{...column.view?.options, decimalPlaces: column.decimalPlaces}} />
                case viewTypeIds.lookup:
                    options = column.options;
                    const lookupRelationMemberName = options.relationMemberName;

                    const lookupValue = lookupRelationMemberName ? row[lookupRelationMemberName] : value;

                    return <Field type='resourcelookup' value={lookupValue} onChange={(newValue, obj, mappedObj) => {
                        if (lookupRelationMemberName)
                            row[lookupRelationMemberName] = newValue;
                        if (options.primitive)
                            row[column.key] = newValue;
                        else
                            row[column.key] = mappedObj;
                            onChange(row, getChangeMode());
                    }} className="tableRowField" options={options} useResource={() => options.resource} resourceName={options.resourceName} {...options?.props} />
                case viewTypeIds.list:
                    options = column.options;
                    const listOptions = options?.list;
                    const selectOptions = options?.select;
                    const fetchSelectItems = options?.select?.fetch;
                    const onSelectChange = selectOptions?.onChange;

                    const keySelector = listOptions?.keySelector || (_ => _.id);

                    const appendOrSetList = (currentList, newItemOrList) => {
                        const ensureArray = (v) => Array.isArray(v) ? v : (v == null ? [] : [v]);
                        const current = ensureArray(currentList);
                        const incoming = ensureArray(newItemOrList);

                        if (incoming.length === 0) return [];

                        const combined = current.concat(incoming);
                        const seen = new Set();
                        const deduped = [];
                        for (const item of combined) {
                            const k = keySelector(item);
                            if (!seen.has(k)) {
                                seen.add(k);
                                deduped.push(item);
                            }
                        }
                        return deduped;
                    };

                    return <SelectList
                        value={value}
                        renderValueItem={listOptions?.labelSelector || (_ => _.id)}
                        mapOption={onSelectChange ? (_ => onSelectChange(_, row)) : (_ => { return { id: _.value }; })}
                        mapKey={keySelector}
                        options={options?.items}
                        fetchOptions={fetchSelectItems ? (() => fetchSelectItems(row)) : null}
                        labelMemberName={options?.labelMemberName}
                        listOptions={listOptions}
                        selectOptions={selectOptions}
                        onChange={(newItemOrList) => {
                            const next = appendOrSetList(row[column.key], newItemOrList);
                            row[column.key] = next;
                            onChange(row, getChangeMode('list'));
                        }}
                    />
                case viewTypeIds.control:
                    return column.render(value, wrappedRow, onChange, data, cellIsEdit, rowIndex, changingRow, row);
            }

            return null;
        }

        const renderCore = () => {
            if (editable) {
                const result = renderEditable();
                if (result != null && result != undefined)
                    return result;
            } else if (column.render)
                return column.render(value, wrappedRow, onChange, data, setData, rowIndex, changingRow);

            return renderText();
        }

        return renderCore();
}

export default DataCell2;
