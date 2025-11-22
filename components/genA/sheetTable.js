// import {Button, Table} from "react-bootstrap";
import List from "./list";
import { clearSort, setSort2, switchSort, getFilterValue2, setFilter2 } from "./functions/query";
import { useEffect, useState } from "react";
// import styles from "/styles/common.module.scss";
// import { TextField } from "@mui/material";
import IconMinus from '@/components/icon/icon-minus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconEye from '@/components/icon/icon-eye';
import IconFilter from '@/components/icon/icon-filter';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconX from '@/components/icon/icon-x';
import IconRefresh from '@/components/icon/icon-refresh';
import { Field } from "./field";
import Tippy from "@tippyjs/react";

const SheetTable = ({data, setData, query, setQuery, onQuery, onMap, columns, view, filters, sorts, renderHeads, renderRows, renderFooters, actions, filterActions, actionsHeadStyle, actionsMap,
    onCalculate, onCalculateCell, renderRowActions, isFetch, fetch, ...props}) => {
    let { sort } = query || { sort: {} };
    sort = sort || {};

    const [calculating, setCalculating] = useState(false);
    const [openFilterKey, setOpenFilterKey] = useState(null);
    const [filterDrafts, setFilterDrafts] = useState({});
    const [hoveredFilterKey, setHoveredFilterKey] = useState(null);
    const [openSortKey, setOpenSortKey] = useState(null);
    const [hoveredSortKey, setHoveredSortKey] = useState(null);
    const defaultSort = props?.defaultQuery?.sort || {};

    const isFilterApplied = (key) => {
        try {
            const v = getFilterValue2(query?.filter || {}, key, 1);
            return v != null && v !== '';
        } catch {
            return false;
        }
    };

    const applyColumnFilter = (filterItem) => {
        const key = filterItem.key;
        const value = filterDrafts[key];
        const newFilter = { ...(query?.filter || {}) };
        if (value == null || value === '') {
            setFilter2(newFilter, key, "", filterItem.operandIndex || 1, filterItem.operator || 'equals', filterItem.advanced);
        } else {
            setFilter2(newFilter, key, filterItem.convertToArray ? [value] : value, filterItem.operandIndex || 1, filterItem.operator || 'equals', filterItem.advanced);
        }
        const newQuery = {
            ...query,
            filter: { ...newFilter },
            paging: query?.paging ? { ...query.paging, returnCount: true } : undefined
        };
        setQuery(newQuery);
        setOpenFilterKey(null);
    };

    const clearColumnFilter = (filterItem) => {
        const key = filterItem.key;
        const newFilter = { ...(query?.filter || {}) };
        setFilter2(newFilter, key, "", filterItem.operandIndex || 1, filterItem.operator || 'equals', filterItem.advanced);
        const newDrafts = { ...filterDrafts };
        delete newDrafts[key];
        setFilterDrafts(newDrafts);
        const newQuery = {
            ...query,
            filter: { ...newFilter },
            paging: query?.paging ? { ...query.paging, returnCount: true } : undefined
        };
        setQuery(newQuery);
        setOpenFilterKey(null);
    };

    const normalizeFilterKey = (key) => {
        return (key ?? '')
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/id$/, '');
    };

    const getFilterKeyCandidates = (column) => {
        const candidates = [
            column.options?.relationMemberName,
            column.relationMemberName,
            column.sortKey,
            column.filterKey,
            column.key
        ].filter(Boolean);

        return Array.from(new Set(candidates));
    };

    const findFilterItemForColumn = (column) => {
        if (!filters || filters.length === 0) {
            return null;
        }

        const candidates = getFilterKeyCandidates(column);
        if (candidates.length === 0) {
            return null;
        }

        const directMatch = filters.find((filter) => {
            const filterKeys = [filter.key, filter.columnKey].filter(Boolean);
            return filterKeys.some((candidate) => candidates.includes(candidate));
        });

        if (directMatch) {
            return directMatch;
        }

        const normalizedCandidates = candidates.map(normalizeFilterKey).filter(Boolean);
        if (normalizedCandidates.length === 0) {
            return null;
        }

        return filters.find((filter) => {
            const filterKeys = [filter.key, filter.columnKey].filter(Boolean);
            return filterKeys
                .map(normalizeFilterKey)
                .some((candidate) => candidate && normalizedCandidates.includes(candidate));
        }) || null;
    };

    const renderHead = (column, columnIndex = null) => {
        if(column.key === 'addOrRemove'){
            return <button type="button" className="btn btn-sm prevent" onClick={addRow}><i className="fa fa-plus fs-14 prevent"></i></button>;
        }

        const sortKey = column.sortKey || column.key;
        const filterItem = findFilterItemForColumn(column);
        const candidateKeys = [
            sortKey,
            ...getFilterKeyCandidates(column),
            ...(filterItem ? [filterItem.key] : [])
        ].filter(Boolean);
        const sortValue = candidateKeys
            .map((key) => sort?.[key])
            .find((value) => value != null);
        const sortOperator = sortValue?.operator;
        const isSortable = (!!filterItem?.isSortable) || (!!column?.isSortable) || (sorts || []).some((_) => candidateKeys.includes(_.key));
        const isApplied = filterItem ? isFilterApplied(filterItem.key) : false;
        const currentDraftValue = filterItem
            ? (filterDrafts[filterItem.key] ??
                getFilterValue2(query?.filter || {}, filterItem.key, filterItem.operandIndex || 1, filterItem.advanced))
            : undefined;
        const headContent = column.renderHead ? column.renderHead(column) : <span>{column.title}</span>;
        const isFilterHovered = hoveredFilterKey === filterItem?.key;
        const isFilterOpen = openFilterKey === filterItem?.key;
        const isSortHovered = hoveredSortKey === sortKey;
        const isSortOpen = openSortKey === sortKey;
        const isSortApplied = !!sortOperator;
        const isFirstColumn = columnIndex === 0;

        return (
            <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>{headContent}</div>
                    {filterItem && (
                        <Tippy
                            visible={openFilterKey === filterItem.key}
                            interactive={true}
                            arrow={true}
                            placement="bottom"
                            zIndex={100}
                            delay={[0, 0]}
                            onClickOutside={() => {}}
                            render={(attrs) => openFilterKey === filterItem.key && (
                                <div {...attrs} style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                    <div style={{ minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {filterItem.renderField
                                            ? filterItem.renderField({
                                                value: currentDraftValue,
                                                onChange: (v) => setFilterDrafts({ ...filterDrafts, [filterItem.key]: v }),
                                                placeholder: filterItem.title,
                                                type: filterItem.type || 'text',
                                                options: filterItem.options
                                            })
                                            : <Field
                                                value={currentDraftValue}
                                                onChange={(v) => setFilterDrafts({ ...filterDrafts, [filterItem.key]: v })}
                                                placeholder={filterItem.title}
                                                type={filterItem.type || 'text'}
                                                options={filterItem.options}
                                            />}
                                        <div className="flex gap-2">
                                            <button type="button" className="btn btn-neo btn-sm" onClick={() => applyColumnFilter(filterItem)}>Применить</button>
                                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => clearColumnFilter(filterItem)}>Очистить</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        >
                            <button
                                type="button"
                                className="btn btn-sm btn-xsm prevent"
                                style={{
                                    color: isApplied ? '#ff9900' : undefined,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: (isApplied || isFilterHovered || isFilterOpen) ? 1 : 0.12,
                                    transform: (isFilterHovered || isFilterOpen) ? 'scale(1)' : 'scale(0.92)',
                                    transition: 'opacity 0.18s ease, transform 0.18s ease'
                                }}
                                onMouseEnter={() => setHoveredFilterKey(filterItem.key)}
                                onMouseLeave={() => setHoveredFilterKey(null)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFilterDrafts({ ...filterDrafts, [filterItem.key]: currentDraftValue });
                                    setOpenFilterKey(openFilterKey === filterItem.key ? null : filterItem.key);
                                }}
                                title={isApplied ? 'Фильтр применён' : 'Фильтр'}
                            >
                                <IconFilter />
                            </button>
                        </Tippy>
                    )}
                    {isSortable && (
                        <Tippy
                            visible={isSortOpen}
                            interactive={true}
                            arrow={true}
                            placement="bottom"
                            zIndex={100}
                            delay={[0, 0]}
                            onClickOutside={() => setOpenSortKey(null)}
                            render={(attrs) => isSortOpen && (
                                <div
                                    {...attrs}
                                    style={{
                                        backgroundColor: 'white',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-xsm prevent"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: sortOperator === 'desc' ? '#ff9900' : undefined
                                            }}
                                            title="Сортировать по убыванию"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSort(column, 'desc');
                                                setOpenSortKey(null);
                                                setHoveredSortKey(null);
                                            }}
                                        >
                                            <IconCaretsDown fill={sortOperator === 'desc'} />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-xsm prevent"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: sortOperator === 'asc' ? '#ff9900' : undefined
                                            }}
                                            title="Сортировать по возрастанию"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSort(column, 'asc');
                                                setOpenSortKey(null);
                                                setHoveredSortKey(null);
                                            }}
                                        >
                                            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
                                                <IconCaretsDown fill={sortOperator === 'asc'} />
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-xsm prevent"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Очистить сортировку"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeSort(column);
                                                setOpenSortKey(null);
                                                setHoveredSortKey(null);
                                            }}
                                        >
                                            <IconX />
                                        </button>
                                    </div>
                                </div>
                            )}
                        >
                            <button
                                type="button"
                                className="btn btn-sm btn-xsm prevent"
                                style={{
                                    color: isSortApplied ? '#ff9900' : undefined,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: (isSortApplied || isSortHovered || isSortOpen) ? 1 : 0.12,
                                    transform: (isSortApplied || isSortHovered || isSortOpen) ? 'scale(1)' : 'scale(0.92)',
                                    transition: 'opacity 0.18s ease, transform 0.18s ease'
                                }}
                                onMouseEnter={() => setHoveredSortKey(sortKey)}
                                onMouseLeave={() => setHoveredSortKey(null)}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpenFilterKey(null);
                                    setOpenSortKey(isSortOpen ? null : sortKey);
                                }}
                                title={isSortApplied ? 'Сортировка применена' : 'Сортировка'}
                            >
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        transform: sortOperator === 'asc' ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.18s ease'
                                    }}
                                >
                                    <IconCaretsDown fill={isSortApplied} />
                                </span>
                            </button>
                        </Tippy>
                    )}
                    {isFirstColumn && isFetch && fetch && (
                        <Tippy content="Обновить">
                            <button
                                type="button"
                                className="btn btn-sm btn-xsm prevent"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.7,
                                    transition: 'opacity 0.18s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    await fetch();
                                }}
                            >
                                <IconRefresh />
                            </button>
                        </Tippy>
                    )}
                </div>
                {column.renderHeadFooter && column.renderHeadFooter(column)}
            </>
        );
    }

    const addRow = ()=>{
        setData([...data, {}])
    }

    const setSort = (column, operator) => {
        const sortKey = column.sortKey || column.key;

        if (operator === null) {
            clearSort(sort);
        } else if (operator) {
            clearSort(sort);
            setSort2(sort, sortKey, operator);
        } else {
            const sortValue = sort[sortKey];
            if (sortValue) {
                switchSort(sort, sortKey);
            } else {
                clearSort(sort);
                setSort2(sort, sortKey, 'desc');
            }
        }

        setQuery({ ...query, sort: { ...sort } });
    }

    const removeSort = (column) => {
        const sortKey = column.sortKey || column.key;

        clearSort(sort);
        for (let key in defaultSort) {
            if (defaultSort[key]?.operator) {
                setSort2(sort, key, defaultSort[key].operator);
            }
        }

        if (!defaultSort[sortKey]) {
            delete sort[sortKey];
        }

        setQuery({ ...query, sort: { ...sort } });
    }

    const deleteTableRows = (rowIndex)=>{
        let newRows = [...data];
        newRows.splice(rowIndex, 1);
        setData(newRows);
    }

    useEffect(() => {
        if (!data || data.length == 0 || calculating)
            return;
        setCalculating(true);
        onCalculate ? onCalculate(data) : calculate();
        setCalculating(false);
    }, [data, calculating]);

    const calculate = () => {
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            for (let j = 0; j < columns?.length; j++) {
                const column = columns[j];
                const key = column.key;
                onCalculateCell && onCalculateCell(data, i, row, j, column, key);
            }
        }
    }

    const handleCellChange = (row, key, value) => {
        row[key] = value;
    };

    const handleCellStartEditing = (row, key) => {
        if (!row._state)
            row._state = {};
        row._state[key] = 'edit';
        setData && setData([...data]);
    };

    const handleCellEndEditing = (row, key) => {
        if (!row._state)
            row._state = {};
        row._state[key] = 'readonly';

        setData && setData([...data]);
    };

    const renderCell = (row, column, page, data, columnIndex, rowIndex) => {
        const value = row[column.key]

        if(column.key === 'addOrRemove'){
            return <td key={`${row.key}${columnIndex}`}>
                <button type="button" class="btn btn-danger" onClick={() => deleteTableRows(rowIndex)}>
                    <IconMinus />
                </button>
            </td>;
        }
        const changedRow = formattedRow(row);

        const text = (value || "").toString();

        const cellView = column.view || view;

        switch (cellView) {
            case 'edit':
                return <EditableCell
                    key={`${row.key}${columnIndex}`}
                    value={text}
                    onChange={(value) =>
                        handleCellChange(row, column.key, value)
                    }
                    column={column}
                    row={row}
                    page={page}
                    onDoubleClick={(value) => {
                        handleCellStartEditing(row, column.key);
                    }}
                    onBlur={(value) =>
                        handleCellEndEditing(row, column.key)
                    }
                    />
        }

        return <td
            key={`${row.key}${columnIndex}`}
            style={column.style || {}}
        >
            {!column.render ? text : column.render(value, changedRow, page, data)}
        </td>
    }


    const formattedRow = (row) => {
        const roles = [];
        row.roles?.map(e => roles.push(e.roleId));
        return {
            ...row,
            roles: roles
        };
    }

    const renderEditableCell = (column, value, onChange) => {
        const type = column.type || "text";

        switch (type) {
            case "number":
                return <Field
                    style={{minWidth: '100px'}}
                    value={value}
                    size="small"
                    onChange={(e) => onChange(e.target.value)}
                    type={"number"}
                    fullWidth
                    autoFocus
                />
            case "text":
                return <Field
                    style={{minWidth: '100px'}}
                    value={value}
                    size="small"
                    onChange={(e) => {
                        onChange(e.target.value)
                    }}
                    type={"text"}
                    fullWidth
                    autoFocus
                />
            default:
                return <span>`View for ${type} is not defined`</span>
        }
    }

    const EditableCell = ({ value, onChange, column, row, page, onDoubleClick, onBlur }) => {
        const _state = row._state || {};
        const editing = _state[column.key] == 'edit';

        const [text, setText] = useState(value);

        return (
            <td
                style={column.style || {}}
                onDoubleClick={onDoubleClick}
                onBlur={onBlur}
                contentEditable={editing}
                suppressContentEditableWarning
            >
                <>
                    {column.render ?
                    <>
                        {column.render(text, row, page, data, setData, (v) => {
                            setText(v);
                            onChange && onChange(v);
                        }, _state, column.key) || <span>&nbsp;</span>}
                    </> :
                    <>
                        {editing ?
                            renderEditableCell(column, text, (v) => {
                                setText(v);
                                onChange && onChange(v);
                            })
                        :
                            value || <span>&nbsp;</span>
                        }
                    </>
                }
                </>

            </td>
        );
    };

    const renderActions = (row) => {
        let actions = filterActions ? filterActions(row) : ["edit", "delete", "details"];
        actions = actionsMap ? actionsMap : actions;

        return <div className="flex gap-2">
            {actions.find(_ => _ == "edit") && onEdit &&
                <Tippy content="Редактирование">
                <button type="button" className="btn btn-warning btn-sm" onClick={async () => await onEdit(row)}>
                    <IconEdit />
                </button></Tippy>}
            {actions.find(_ => _ == "delete") && onDelete &&
                <Tippy content="Удаление">
                <button type="button" className="btn btn-danger btn-sm" onClick={async () => await onDelete(row)}>
                    <IconTrash />
                </button></Tippy>}
            {actions.find(_ => _ == "details") && onDetails &&
                <Tippy content="Просмотр">
                <button type="button" className="btn btn-info btn-sm" onClick={async () => await onDetails(row)}>
                    <IconEye />
                </button></Tippy>}
            {renderRowActions && renderRowActions(row, actions)}
        </div>
    }

    const { onEdit, onEditPassword, onDelete, onDetails, onSelect } = actions || {};
    const isActions = onEdit || onEditPassword || onDelete || onDetails || renderRowActions;

    return <List data={data} setData={setData} query={query} view={view} setQuery={setQuery} onQuery={onQuery} onMap={onMap} columns={columns} filters={filters} sorts={sorts} 
        
        actions={actions} {...props}
        render={(data, setData, page, setPage, columns, filters, sorts, props) => {
            return (
                    <div style={{maxHeight: props.maxHeight ? props.maxHeight : ''}} className={`table-responsive mb-5 flex items-center justify-between`}>
                        <table className="border text-nowrap text-md-nowrap table-hover table-bordered table-sm mb-0" style={{width: '100%'}} {...props}>
                            { columns && <thead>
                            <tr>
                                {renderHeads ? renderHeads(columns, renderHead, data, page) : columns.map((_, index) => <th key={_.key} {..._}>
                                    {renderHead(_, index)}
                                </th>)}
                                {isActions && <th style={{width:'10px', ...actionsHeadStyle}}>Действия</th>}
                            </tr>
                            </thead>}
                            <tbody>
                            {
                                renderRows ? renderRows(columns, renderCell, data, page, renderActions) : page.map((row, rowIndex) =>
                                    <tr style={row.style} key={row.key} onClick={(e) => {
                                        if (!onSelect)
                                            return;

                                        if (e.target.className?.indexOf('prevent') >= 0)
                                            return;
                                        onSelect(row, data, page);
                                    }}>
                                        {columns.map((column, columnIndex) =>
                                            renderCell(row, column, page, data, columnIndex, rowIndex))
                                        }
                                        {isActions && <td>
                                            {renderActions(row)}
                                        </td>}
                                    </tr>)

                            }
                            {renderFooters && renderFooters(data)}
                            </tbody>
                        </table>
                    </div>
            )
        }}
    />
}
export default SheetTable;
