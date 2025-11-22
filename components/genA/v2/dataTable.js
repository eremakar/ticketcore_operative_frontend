import React from 'react';
import { clearSort, setSort2, switchSort } from '@/components/genA/functions/query'
import { useDrag } from "react-dnd";
import { useDrop } from "react-dnd";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import List2 from './list';
import DataRow2 from './dataRow';
import DataTable2Childrens from './dataTableChildrens';
import { useEffect, useRef, useState } from 'react';
import { dataTableEventTypeIds } from '@/components/genA/v2/dataTableEventTypeIds';
import { groupBy } from '@/components/genA/functions/linq1';
import CollapseRow from '../collapseRow';
import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconX from '@/components/icon/icon-x';
import IconSquareCheck from '@/components/icon/icon-square-check';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconMinus from '@/components/icon/icon-minus';
import IconEye from '@/components/icon/icon-eye';
import IconTrash from '@/components/icon/icon-trash';
import IconFilter from '@/components/icon/icon-filter';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconRefresh from '@/components/icon/icon-refresh';
import Tippy from "@tippyjs/react";
import { getFilterValue2, setFilter2 } from '@/components/genA/functions/query';
import { Field } from '@/components/genA/field';

const DataTable2Inner = ({
  context,
  data,
  projectedData,
  setData,
  query,
  setQuery,
  columns,
  filters,
  sorts,
  groups,
  defaultGroupKey,
  groupMode = 'column',
  renderHeads,
  renderRows,
  renderRow,
  actions,
  isHead=true,
  isActionsRendered=true,
  actionsHeadStyle,
  row,
  fullHeight = false,
  setRow,
  renderRowActions,
  leftActions,
  leftActionAdd=true,
  leftActionEdit=true,
  leftActionsAdd = true,
  selectedRowId,
  leftActionsAddIndices,
  forceShowAdd = false,
  rowEditMode = 'manual',
  hoverUI = true,
  renderCell,
  labelDisplayedRows,
  useDnd,
  isDndAction=true,
  dragType,
  dropType,
  dragInfo,
  dropInfo,
  onDrop,
  onChange,
  onRowClick,
  dataSource,
  onGroupKeyChange,
  collapsedGroups,
  onToggleGroup,
  hierarchyId,
  enableHierarchy,
  hierarchyMember,
  hierarchyLevel,
  enableCellEditOnDoubleClick = false,
  renderExpandedRow,
  renderFooter,
  isCard = true,
  isFetch,
  fetch,
  ...props
}) => {
  columns = columns.filter(_ => !_.hidden);
  const [changingRow, setChangingRow] = useState(null);
  const [groupKey, setGroupKey] = useState(defaultGroupKey);
  const defaultSort = props.defaultQuery?.sort || { id: { operator: 'desc' } };

  useEffect(() => {
    if (!groupKey)
      return;
    localStorage.setItem('groupKey', groupKey);
  }, [groupKey]);

  const rowEditModeIsManual = rowEditMode == 'manual';

  // Column filter popover state
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [filterDrafts, setFilterDrafts] = useState({});
  const [hoveredFilterKey, setHoveredFilterKey] = useState(null);
  const [openSortKey, setOpenSortKey] = useState(null);
  const [hoveredSortKey, setHoveredSortKey] = useState(null);

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
      // clear via empty value branch inside setFilter2
      setFilter2(newFilter, key, "", filterItem.operandIndex || 1, filterItem.operator || 'equals', filterItem.advanced);
    } else {
      setFilter2(newFilter, key, filterItem.convertToArray ? [value] : value, filterItem.operandIndex || 1, filterItem.operator || 'equals', filterItem.advanced);
    }
    setQuery(previous => ({
      ...previous,
      filter: { ...newFilter },
      paging: previous?.paging ? { ...previous.paging, returnCount: true } : undefined
    }));
    setOpenFilterKey(null);
  };

  const clearColumnFilter = (filterItem) => {
    const key = filterItem.key;
    const newFilter = { ...(query?.filter || {}) };
    setFilter2(newFilter, key, "", filterItem.operandIndex || 1, filterItem.operator || 'equals', filterItem.advanced);
    const newDrafts = { ...filterDrafts };
    delete newDrafts[key];
    setFilterDrafts(newDrafts);
    setQuery(previous => ({
      ...previous,
      filter: { ...newFilter },
      paging: previous?.paging ? { ...previous.paging, returnCount: true } : undefined
    }));
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

  const DragButton = (item, hidden, hoverVisibility) => {
    const [{ opacity }, dragRef] = useDrag(
        () => {
          return {
            type: dragType || "row",
            item: { item, dragInfo },
            collect: (monitor) => {
              return {
                opacity: monitor.isDragging() ? 0.5 : 1
              }
            }
        }},
        [item?.id]
    )
    return <>
      <button className="btn btn-sm btn-xsm prevent" style={{marginRight:'2px', display: hidden ? 'none': 'inline'}} ref={dragRef}><IconLayoutGrid /></button>
    </>
  }

  const dropInfoRef = useRef(dropInfo);

  useEffect(() => {
    dropInfoRef.current = dropInfo;
  }, [dropInfo]);

  const [{ canDrop, isOver, didDrop, item }, drop] = useDrop(() => ({
    accept: dropType || "row",
    drop: (item) => {
        onDrop && onDrop(item, dropInfoRef.current);
        return {};
    },
    collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        didDrop: monitor.didDrop(),
        item: monitor.getItem()
    }),
  }));

  const addRowAtStart = async () => {
    setChangingRow(null);
    const newRow = wrap({});
    newRow.isEdit = true;
    if (onChange)
      await onChange({ target: newRow, data: { context: context, position: 'start' }, type: dataTableEventTypeIds.newRow });
    setData(previous => [newRow, ...previous]);
  }

  const addRowAtEnd = async () => {
    setChangingRow(null);
    const newRow = wrap({});
    newRow.isEdit = true;
    if (onChange)
      await onChange({ target: newRow, data: { context: context, position: 'end' }, type: dataTableEventTypeIds.newRow });
    setData(previous => [...previous, newRow]);
  }

  const editRow = async (wrappedRow, value) => {
    wrappedRow.isEdit = value;
    setData(previous => {
      const index = previous.findIndex(_ => _.row.id == wrappedRow?.row?.id);
      if (index === -1) return previous;
      const newData = [...previous];
      newData[index] = { ...wrappedRow };
      return newData;
    });
  }

  const commit = async (wrappedRow, data, changingRow) => {
    if (changingRow != null) {
      wrappedRow.row = changingRow.row;
    }
    await editRow(wrappedRow, false);
    if (onChange)
      await onChange({ target: wrappedRow, data: { context: context }, type: dataTableEventTypeIds.commitRow });
    setData(previous => [...previous]);
  }

  const rollback = async (wrappedRow) => {
    wrappedRow.row = {...wrappedRow.row};
    await editRow(wrappedRow, false);
    if (onChange)
      await onChange({ target: wrappedRow, data: { context: context }, type: dataTableEventTypeIds.rollbackRow });
    setData(previous => [...previous]);
  }

  const remove = async (index) => {
    // Получаем row из текущего data для onChange
    const row = data[index];
    if (onChange)
      await onChange({ target: row, data: { context: context }, type: dataTableEventTypeIds.removedRow });
    setData(previous => {
      const newData = [...previous];
      newData.splice(index, 1);
      return newData;
    });
  }

  const renderLeftActions = (value, wrappedRow, data, setData, index, changingRow) => {
    const row = wrappedRow?.row;
    const isEdit = wrappedRow?.isEdit;

    const result = [];

    if (!data || !row)
      return result;

    const workingData = projectedData || data;

    const hoverVisibility = wrappedRow.isHover ? 'visible': 'hidden';

    if (useDnd && isDndAction) {
      result.push(DragButton(row, isEdit, hoverVisibility));
    }

    if (leftActionsAdd) {
      if (index == 0 && workingData.length > 0 && leftActionAdd) {
        result.push(<button className="btn btn-sm btn-xsm prevent" style={{marginRight:'2px'}} onClick={async (e) => {
          e.preventDefault();
          await addRowAtStart();
        }}><IconPlus /></button>);
      }

      if (index == workingData.length - 1 && workingData.length > 1 && leftActionAdd) {
        result.push(<button className="btn btn-sm btn-xsm prevent" style={{marginRight:'2px'}} onClick={async (e) => {
          e.preventDefault();
          await addRowAtEnd();
        }}><IconPlus /></button>);
      }
    }

    if (rowEditModeIsManual) {
      if (isEdit) {
        result.push(<button className="btn btn-sm btn-xsm prevent" style={{marginRight:'2px'}} onClick={async (e) => {
          e.preventDefault();
          await commit(wrappedRow, data, changingRow);
        }}><IconSquareCheck /></button>);
        result.push(<button className="btn btn-sm btn-xsm prevent" style={{marginRight:'2px'}} onClick={async (e) => {
          e.preventDefault();
          if (row.id)
            await rollback(wrappedRow, data);
          else {
            await remove(index);
          }
        }}><IconX /></button>);
      } else if (leftActionEdit) {
        result.push(<button className="btn btn-sm btn-xsm prevent" style={{marginRight:'2px'}} onClick={async (e) => {
          e.preventDefault();
          await editRow(wrappedRow, true);
        }}><IconEdit /></button>);
      }
    }

    return result;
  }

  if (leftActions || useDnd) {
    columns = [{
      key: 'leftActions',
      style: {width: '10px', paddingRight: '0px'},
      render: (value, wrappedRow, onChange, data, setData, index, changingRow) => {
        return renderLeftActions(value, wrappedRow, data, setData, index, changingRow);
      },
      renderHead: (column, data, setData) => {
        return ((leftActionsAdd && data?.length == 0) || forceShowAdd) ? <button className="btn btn-sm btn-xsm prevent" onClick={async (e) => {
          e.stopPropagation();
          await addRowAtEnd();
        }}><IconPlus /></button> : <></>
      }
    }, ...columns];
  }

  const { sort } = query?.sort ? query || { sort: {} } : { sort: {} };

  const renderHead = (column, data, setData, columnIndex = null) => {
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
    const isSortable =
      (!!filterItem?.isSortable) ||
      (!!column?.isSortable) ||
      (sorts || []).some((_) => candidateKeys.includes(_.key));
    const isApplied = filterItem ? isFilterApplied(filterItem.key) : false;
    const currentDraftValue = filterItem
      ? (filterDrafts[filterItem.key] ??
        getFilterValue2(query?.filter || {}, filterItem.key, filterItem.operandIndex || 1, filterItem.advanced))
      : undefined;
    const headContent = column.renderHead ? column.renderHead(column, data, setData) : <span>{column.title}</span>;
    const isFilterHovered = hoveredFilterKey === filterItem?.key;
    const isFilterOpen = openFilterKey === filterItem?.key;
    const isSortHovered = hoveredSortKey === sortKey;
    const isSortOpen = openSortKey === sortKey;
    const isSortApplied = !!sortOperator;
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
              //hideOnClick={false}
              delay={[0, 0]}
              //onClickOutside={() => setOpenFilterKey(null)}
              onClickOutside={() => {
              }}
              //boundary={filterItem.boundary || document.body}
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
          {columnIndex === 0 && isFetch && fetch && (
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
        {column.renderHeadFooter && column.renderHeadFooter(column, data, setData)}
      </>
    )
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

    setQuery(previous => ({ ...previous, sort: { ...sort } }));
  }

  const removeSort = (column) => {
    const sortKey = column.sortKey || column.key;

    clearSort(sort);
    for (let key in defaultSort) {
      setSort2(sort, key, defaultSort[key].operator);
    }

    setQuery(previous => ({ ...previous, sort: { ...sort } }));
  }


  actions = actions || {};

  const { onEdit, onDelete, onDetails } = actions
  const isActions = onEdit || onDelete || onDetails || renderRowActions;

  const renderActions = (row) => {
    const baseButtonClass = "prevent inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#ff9900] hover:text-[#ff9900] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9900] focus-visible:ring-offset-2";

    const renderActionIcon = (label, icon, handler) => (
      <button
        type="button"
        aria-label={label}
        title={label}
        className={baseButtonClass}
        onClick={async (e) => {
          e.stopPropagation();
          await handler(row);
        }}
      >
        {icon}
      </button>
    );

    return (
      <div className="flex items-center gap-1">
        {onEdit && renderActionIcon('Изменить', <IconEdit className="prevent h-4 w-4" />, onEdit)}
        {onDelete && renderActionIcon('Удалить', <IconTrash className="prevent h-4 w-4" />, onDelete)}
        {onDetails && renderActionIcon('Просмотр', <IconEye className="prevent h-4 w-4" />, onDetails)}
        {renderRowActions && renderRowActions(row)}
      </div>
    )
  }

  const wrap = (aRow) => {
    return {
      row: aRow,
      isEdit: false,
      cells: columns.map(_ => {
        return {
          key: _.key,
          isEdit: false
        }
      })
    }
  }

  const renderHirearchy = (items, parentKey, level) => {
    return items.map((wrappedRow, index) => {
      const aRow = wrappedRow.row;
      const selected = selectedRowId ? aRow?.id == selectedRowId : aRow?.id == row?.id;

      const children = aRow?.id ? data.filter(_ => _.row[parentKey] == aRow?.id) : [];

      const colors = ['#D9E1F2', '#BFBFBF'];
      const color = level < colors.length ? colors[level] : null;

      return <>
      <DataRow2 key={index} sourceWrappedRow={wrappedRow} data={data} setData={setData} columns={columns}
        dragType={dragType}
        dragInfo={dragInfo}
        selected={selected} setRow={setRow} onRowClick={onRowClick} isActions={isActions}
        index={index}
        renderActions={renderActions}
        isEdit={wrappedRow.isEdit}
        render={renderRow}
        style={{backgroundColor: color}}
        enableCellEditOnDoubleClick={enableCellEditOnDoubleClick}
        onChange={async (_, type, mode, columnKey) => {
          setChangingRow(_);

          if (mode == 'list' || mode == 'editCommitted') {
            if (onChange)
              await onChange({ target: wrappedRow, data: { context: context, type: 'blur', mode: mode, columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
            return;
          }

          if (type != 'blur')
            return;
          if (onChange)
            await onChange({ target: wrappedRow, data: { context: context, type: 'blur', columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
        }}
        />
        {renderHirearchy(children, parentKey, level + 1)}
        </>
    });
  }

  return (
    <List2
      data={data}
      setData={setData}
      query={query}
      setQuery={setQuery}
      dataSource={dataSource}
      columns={columns}
      filters={filters}
      sorts={sorts}
      groups={groups}
      groupKey={groupKey}
      setGroupKey={setGroupKey}
      actions={actions}
      onGroupKeyChange={onGroupKeyChange}
      wrapData={_ => {
        if (!_?.map)
          return [];

        return _.map(i => wrap(i));
      }}
      labelDisplayedRows={labelDisplayedRows}
      renderAdvancedActions={() => {
        return row ? renderActions(row) : <></>;
      }}
      isCard={isCard}
      isFilter={false}
      isSort={false}
      {...props}
      render={({ data, setData, columns, filters, sorts, props }) => {
        const quickActions = columns.filter(_ => _.key == 'leftActions');
        const group = groups?.find(_ => _.key == groupKey);
        const type = group?.type;

        switch (type) {
          case "hierarchy":
            const parentKey = group.parentKey || 'parentId';
            const rootData = data?.filter(_ => _.row[parentKey] == null);

            return <div className={`table-responsive mb-5 flex ${fullHeight ? 'flex-col h-full' : 'items-center justify-between'}`} style={{...props.style}}>
              <table className="border text-nowrap text-md-nowrap table-hover table-bordered table-sm mb-0">
                {columns && isHead && (
                  <thead>
                    <tr>
                      {renderHeads
                        ? renderHeads(columns, renderHead, data)
                        : columns.map((_, index) => {
                          return <th key={_.key} style={_.style || {}}>{renderHead(_, data, setData, index)}</th>
                        })}
                      {isActions && isActionsRendered && <th style={{ width: '10px', ...actionsHeadStyle }}>Действия</th>}
                    </tr>
                  </thead>
                )}
                {!isHead && data && data.length == 0 && <thead>
                  <tr>
                    {quickActions.map((_, index) => <th key={_.key} style={_.style || {}}>{renderHead(_, data, setData, index)}</th>)}
                  </tr>
                </thead>}
                <tbody>
                  {rootData && renderHirearchy(rootData, parentKey, 0)}
                </tbody>
              </table>
            </div>
          default:
            if (groupKey) {
              const groupSelector = group.groupSelector;
              const groupedData = (data && !groupSelector) ? groupBy(data, group.selector ? _ => group.selector(_.row) : _ => _.row[groupKey], (key1, key2) => key1 == key2, group.sortFunc) : [];
              const keys = group?.keys || groupedData.map(_ => _.key);
              const mapName = group?.mapName;
              const width = group?.width || '400px';
              const height = group?.height || '60vh';

              switch (groupMode) {
                case 'column':
                  return <div className="table-responsive mb-5 flex items-center justify-between" style={{...props.style, width: 'auto', padding: '0px', margin: '0px'}}>
                    <table className="border text-nowrap text-md-nowrap table-hover table-bordered table-sm mb-0" style={{width: 'auto'}}>
                      <thead>
                        <tr>
                        {keys.map((_, index) => {
                          const groupItem = groupedData.find(i => i.key == _);
                          const isCollapsed = collapsedGroups?.[_];
                          return <th key={index} style={{
                            minWidth: isCollapsed ? '50px' : '300px',
                            width: isCollapsed ? '50px' : '300px',
                            textAlign: 'center',
                            paddingTop: '2px',
                            paddingBottom: '2px',
                            color: 'whitesmoke',
                            position: 'relative'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginRight: '5px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                gap: '8px'
                              }}>
                                {index === 0 && (
                                  <div style={{
                                    display: 'flex',
                                    gap: '4px'
                                  }}>
                                    <button
                                      className="btn btn-sm btn-xsm prevent"
                                      onClick={() => {
                                        const newState = {};
                                        keys.forEach(key => {
                                          newState[key] = true;
                                        });
                                        onToggleGroup && onToggleGroup(newState);
                                      }}
                                    >
                                      <i className="fa fa-angle-double-left fs-14"></i> Свернуть все
                                    </button>
                                    <button
                                      className="btn btn-sm btn-xsm prevent"
                                      onClick={() => {
                                        const newState = {};
                                        keys.forEach(key => {
                                          newState[key] = false;
                                        });
                                        onToggleGroup && onToggleGroup(newState);
                                      }}
                                    >
                                      <i className="fa fa-angle-double-right fs-14"></i> Развернуть все
                                    </button>
                                  </div>
                                )}
                                <div style={{flex: 1, textAlign: 'center'}}>
                                  {mapName ? mapName(_, groupItem) : _}
                                </div>
                              </div>
                              <button
                                className="btn btn-sm btn-xsm prevent"
                                style={{position: 'absolute', right: '2px', top: '2px'}}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onToggleGroup && onToggleGroup(_);
                                }}
                              >
                                <i className={`fa fa-${isCollapsed ? 'expand' : 'compress'} fs-14 prevent`}></i>
                              </button>
                            </div>
                          </th>
                        })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                        {keys.map((_, index) => {
                          const group = !groupSelector ? groupedData.find(i => i.key == _) : {
                            key: _,
                            values: data.filter(i => groupSelector(i, _))
                          };
                          const values = group?.values || [];
                          const values2 = group?.values || data;
                          //const hierarchyValues = hierarchyMember ? values.filter(_ => !_.row[hierarchyMember]) : values;
                          const addIndices = leftActionsAddIndices || [];
                          const leftActionsAdd = leftActionsAddIndices.find(i => i == _);
                          const isCollapsed = collapsedGroups?.[_];
                          const groupItem = groupedData.find(i => i.key == _);

                          return isCollapsed ? (
                            <td key={index} style={{
                              minWidth: '50px',
                              width: '50px',
                              padding: '0',
                              height: '100%',
                              verticalAlign: 'top'
                            }}>
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                background: '#fff',
                                borderRight: '1px solid #dee2e6',
                                minHeight: '500px'
                              }}>
                                <button
                                  className="btn btn-sm btn-xsm prevent"
                                  style={{
                                    margin: '4px 0',
                                    padding: '2px 4px',
                                    zIndex: 1
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onToggleGroup && onToggleGroup(_);
                                  }}
                                >
                                  <i className="fa fa-expand fs-14 prevent"></i>
                                </button>
                                <div style={{
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  whiteSpace: 'nowrap',
                                  padding: '20px 0',
                                  fontSize: '14px'
                                }}>
                                  {mapName ? mapName(_, groupItem) : _}
                                </div>
                                <div style={{
                                  writingMode: 'vertical-rl',
                                  transform: 'rotate(180deg)',
                                  whiteSpace: 'nowrap',
                                  marginTop: 'auto',
                                  padding: '10px 0',
                                  fontSize: '12px',
                                  color: '#666'
                                }}>
                                  {values.length} задач
                                </div>
                              </div>
                            </td>
                          ) : (
                            <td key={index} style={{
                              minWidth: '300px',
                              width: '300px',
                              verticalAlign: 'top',
                              padding: '8px'
                            }}>
                              <DataTable2Inner
                                projectedData={values}
                                data={data}
                                setData={setData}
                                columns={columns}
                                renderRow={renderRow}
                                onChange={onChange}
                                isHead={false}
                                isPager={false}
                                isTopPanel={false}
                                isBottomPanel={false}
                                dragInfo={{key: _}}
                                dropInfo={{key: _}}
                                onDrop={onDrop}
                                leftActionsAdd={leftActionsAdd}
                                style={{height: height}}
                                bodyStyle={{padding: '0px'}}
                                onRowClick={onRowClick}
                                enableHierarchy={enableHierarchy}
                                hierarchyMember={hierarchyMember}
                                hierarchyLevel={hierarchyLevel + 1}
                              />
                            </td>
                          );
                        })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  case 'row':
                    return <div className={`table-responsive mb-5 flex ${fullHeight ? 'h-full flex-col' : 'items-center justify-between'}`} style={{...props.style}}>
                      <table className="border text-nowrap text-md-nowrap table-hover table-bordered table-sm mb-0">
                        {columns && isHead && (
                          <thead>
                            <tr>
                              {renderHeads
                                ? renderHeads(columns, renderHead, data)
                                : columns.map((_, index) => {
                                  return <th key={_.key} style={_.style || {}}>{renderHead(_, data, setData, index)}</th>
                                })}
                              {isActions && isActionsRendered && <th style={{ width: '10px', ...actionsHeadStyle }}>Действия</th>}
                            </tr>
                          </thead>
                        )}
                        {!isHead && data && data.length == 0 && <thead>
                          <tr>
                            {quickActions.map((_) => <th key={_.key} style={_.style || {}}>{renderHead(_, data, setData)}</th>)}
                          </tr>
                        </thead>}
                        <tbody>
                          {keys.map((_, index) => {
                            const group = groupedData.find(i => i.key == _);
                            const values = group?.values || [];
                            const addIndices = leftActionsAddIndices || [];
                            //const leftActionsAdd = leftActionsAddIndices.find(i => i == _);
                            return <CollapseRow key={index} colSpan={columns.length} renderRow={() => {
                              const groupItem = groupedData.find(i => i.key == _);
                              return <td colSpan={columns.length + 1}>{mapName(_, groupItem)}</td>
                            }} renderCollapse={() => {
                              return <>
                                {values.map((wrappedRow, index) => {
                                    const aRow = wrappedRow.row;
                                    const selected = selectedRowId ? aRow?.id == selectedRowId : aRow?.id == row?.id;

                                    return <DataRow2 key={index} sourceWrappedRow={wrappedRow} data={data} setData={setData} columns={columns}
                                      dragType={dragType}
                                      dragInfo={dragInfo}
                                      selected={selected} setRow={setRow} onRowClick={onRowClick} isActions={isActions}
                                      index={index}
                                      renderActions={renderActions}
                                      isEdit={wrappedRow.isEdit}
                                      render={renderRow}
                                      enableCellEditOnDoubleClick={enableCellEditOnDoubleClick}
                                      onChange={async (_, type, mode, columnKey) => {
                                        setChangingRow(_);

                                        if (mode == 'list' || mode == 'editCommitted') {
                                          if (onChange)
                                            await onChange({ target: wrappedRow, data: { context: context, type: 'blur', mode: mode, columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
                                          return;
                                        }

                                        if (type != 'blur')
                                          return;
                                        if (onChange)
                                          await onChange({ target: wrappedRow, data: { context: context, type: 'blur', columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
                                      }}
                                      />
                                  })}
                              </>
                            }} />
                          })}
                        </tbody>
                      </table>
                    </div>
              }

            }
            break;
        }

        const projectedData2 = [];

        if (projectedData == null) {
          projectedData = data || [];
        }

        for (let i = 0; i < projectedData.length; i++) {
          const item = projectedData[i];
          const parentId = hierarchyMember ? item.row[hierarchyMember] : null;
          if (!parentId) {
            projectedData2.push(item);
          } else {
            const parent = projectedData.find(_ => _.row['id'] == parentId);
            if (!parent) {
              projectedData2.push(item);
            }
          }
        }
        //console.log(projectedData2);

        return (
          <div className={`table-responsive mb-5 flex ${fullHeight ? 'h-full flex-col' : 'items-center justify-between'}`} ref={drop} style={{...props.style}}>
            <table className="border text-nowrap text-md-nowrap table-hover table-bordered table-sm mb-0">
              {columns && isHead && (
                <thead>
                  <tr>
                    {renderHeads
                      ? renderHeads(columns, renderHead, data)
                      : columns.map((_, index) => <th key={_.key} style={_.style || {}}>{renderHead(_, data, setData, index)}</th>)}
                    {isActions && isActionsRendered && <th style={{ width: '10px', ...actionsHeadStyle }}>Действия</th>}
                  </tr>
                </thead>
              )}
              {!isHead && data && data.length == 0 && <thead>
                <tr>
                  {quickActions.map((_) => <th key={_.key} style={_.style || {}}>{renderHead(_, data, setData)}</th>)}
                </tr>
              </thead>}
              <tbody>
                {renderRows
                  ? renderRows(columns, renderCell, data, setData, renderActions)
                  : (projectedData2 || data)?.map((wrappedRow, index) => {
                    const aRow = wrappedRow.row;
                    const selected = selectedRowId ? aRow?.id == selectedRowId : aRow?.id == row?.id;
                    const isExpanded = wrappedRow.isExpanded;
                    const childrens = enableHierarchy ? data.filter(_ => _.row[hierarchyMember] == aRow.id) : [];

                    return (
                      enableHierarchy ? <React.Fragment key={index}>
                        <div style={{ position: 'relative' }}>
                          {/* Кнопка разворачивания/сворачивания */}
                          {enableHierarchy && childrens.length > 0 && (
                            <button
                              className="btn btn-sm btn-xsm prevent"
                              style={{
                                position: 'absolute',
                                left: '2px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '0px 0px',
                                fontSize: '8px',
                                zIndex: 10
                              }}
                              onClick={() => {
                                wrappedRow.isExpanded = !wrappedRow.isExpanded;
                                setData(previous => [...previous]);
                              }}
                            >
                              <i className={`fa fa-${isExpanded ? 'minus' : 'plus'} fs-12 prevent`}></i>
                            </button>
                          )}
                          <DataRow2
                            sourceWrappedRow={wrappedRow}
                            data={data}
                            setData={setData}
                            columns={columns}
                            dragType={dragType}
                            dragInfo={dragInfo}
                            selected={selected}
                            setRow={setRow}
                            onRowClick={onRowClick}
                            isActions={isActions}
                            index={index}
                            renderActions={renderActions}
                            isEdit={wrappedRow.isEdit}
                            render={renderRow}
                            enableCellEditOnDoubleClick={enableCellEditOnDoubleClick}
                            onChange={async (_, type, mode, columnKey) => {
                              setChangingRow(_);

                              if (mode == 'list' || mode == 'editCommitted') {
                                if (onChange)
                                  await onChange({ target: _, data: { context: context, type: 'blur', mode: mode, columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
                                return;
                              }

                              if (type != 'blur')
                                return;
                              if (onChange)
                                await onChange({ target: wrappedRow, data: { context: context, type: 'blur', columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
                            }}
                          />
                        </div>

                        {/* Отрисовка дочерних элементов */}
                        {enableHierarchy && (
                          <DataTable2Childrens
                            data={data}
                            setData={setData}
                            columns={columns}
                            renderRow={renderRow}
                            onChange={onChange}
                            onRowClick={onRowClick}
                            dragType={dragType}
                            dragInfo={dragInfo}
                            dropInfo={dropInfo}
                            onDrop={onDrop}
                            hierarchyMember={hierarchyMember}
                            enableHierarchy={enableHierarchy}
                            parentId={aRow.id}
                            level={hierarchyLevel}
                            context={context}
                            row={row}
                            setRow={setRow}
                            isActions={isActions}
                            renderActions={renderActions}
                            isExpanded={wrappedRow.isExpanded}
                            enableCellEditOnDoubleClick={enableCellEditOnDoubleClick}
                            {...props}
                          />
                        )}
                      </React.Fragment> : <>
                        <DataRow2
                            sourceWrappedRow={wrappedRow}
                            data={data}
                            setData={setData}
                            columns={columns}
                            dragType={dragType}
                            dragInfo={dragInfo}
                            selected={selected}
                            setRow={setRow}
                            onRowClick={onRowClick}
                            isActions={isActions}
                            index={index}
                            renderActions={renderActions}
                            isEdit={wrappedRow.isEdit}
                            render={renderRow}
                            enableCellEditOnDoubleClick={enableCellEditOnDoubleClick}
                            onChange={async (_, type, mode, columnKey) => {
                              setChangingRow(_);

                              if (mode == 'list' || mode == 'editCommitted') {
                                if (onChange)
                                  await onChange({ target: _, data: { context: context, type: 'blur', mode: mode, columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
                                return;
                              }

                              if (type != 'blur')
                                return;
                              if (onChange)
                                await onChange({ target: wrappedRow, data: { context: context, type: 'blur', columnKey: columnKey }, type: dataTableEventTypeIds.commitRow });
                            }}
                          />

                        {/* Render expanded row content */}
                        {renderExpandedRow && renderExpandedRow(wrappedRow) && (
                          <tr>
                            <td colSpan={columns.length + (isActions ? 1 : 0)} style={{ padding: 0, border: 'none' }}>
                              {renderExpandedRow(wrappedRow)}
                            </td>
                          </tr>
                        )}

                      </>
                    );
                  })}
              </tbody>
              {renderFooter && (
                <tfoot>
                  {renderFooter({ data, columns, isActions })}
                </tfoot>
              )}
            </table>
          </div>
        )
      }}
    />
  )
}
const DataTable2 = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DataTable2Inner {...props} />
    </DndProvider>
  );
}

export default DataTable2
