'use client';

import React, { useState, useMemo, useEffect } from 'react';
import DataTable2 from './dataTable';
import { dataTableEventTypeIds } from '@/components/genA/v2/dataTableEventTypeIds';
import { DataSource } from '@/components/genA/v2/dataSource';

const Table2 = ({
  keyMember = 'id',
  data,
  setData,
  query,
  setQuery,
  columns,
  filters = [],
  sorts = [],
  actions = {},
  actionsHeadStyle,
  leftActions,
  leftActionAdd = true,
  leftActionEdit = true,
  isDelete = true,
  onDelete,
  onEdit,
  onCreate,
  onChange,
  fullHeight = false,
  isTopPanel = true,
  isPager = true,
  isActions = true,
  isCard = true,
  ...props
}) => {
  console.log('data:', data);
  
  useEffect(() => {
    setQuery(previous => ({ ...previous }));
  }, [data]);

  const [data2, setData2] = useState(data);

  // Create local DataSource that returns local data
  const dataSource = useMemo(() => {
    return new DataSource(async (query) => {
      if (!data) return { result: [], totalCount: 0 };
      
      // Apply local filtering and sorting
      let filteredData = [...data];
      
      // Apply filters
      if (query.filter && Object.keys(query.filter).length > 0) {
        filteredData = filteredData.filter(item => {
          return Object.entries(query.filter).every(([key, filterValue]) => {
            if (!filterValue) return true;
            
            const itemValue = item[key];
            if (typeof filterValue === 'object' && filterValue.operator) {
              switch (filterValue.operator) {
                case 'equals':
                  return itemValue === filterValue.operand1;
                case 'like':
                  return itemValue?.toString().toLowerCase().includes(filterValue.operand1?.toString().toLowerCase());
                case 'greater':
                  return itemValue > filterValue.operand1;
                case 'less':
                  return itemValue < filterValue.operand1;
                default:
                  return true;
              }
            }
            return itemValue === filterValue;
          });
        });
      }
      
      // Apply sorting
      if (query.sort && Object.keys(query.sort).length > 0) {
        filteredData.sort((a, b) => {
          for (const [key, sortConfig] of Object.entries(query.sort)) {
            if (!sortConfig || !sortConfig.operator) continue;
            
            const aVal = a[key];
            const bVal = b[key];
            
            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            if (aVal > bVal) comparison = 1;
            
            if (sortConfig.operator === 'desc') {
              comparison = -comparison;
            }
            
            if (comparison !== 0) return comparison;
          }
          return 0;
        });
      }
      
      // Apply paging
      const skip = query.paging?.skip || 0;
      const take = query.paging?.take || 1000;
      const totalCount = filteredData.length;
      
      if (take === 0) return { result: [], totalCount };
      
      const pagedData = filteredData.slice(skip, skip + take);
      
      return { result: pagedData, totalCount };
    });
  }, [data]);

  const actionsWithLocalHandlers = {
    ...actions,
    onDelete: isDelete ? async (wrappedRow) => {
      const row = wrappedRow.row;
      if (onDelete) {
        await onDelete(row);
      } else {
        // Default delete behavior
        setData(previous => previous.filter(item => item !== row));
      }
    } : null
  };

  return (
    <DataTable2
      data={data2}
      setData={setData2}
      query={query}
      setQuery={setQuery}
      dataSource={dataSource}
      columns={columns}
      filters={filters}
      sorts={sorts}
      actions={actionsWithLocalHandlers}
      actionsHeadStyle={actionsHeadStyle}
      leftActions={leftActions}
      leftActionAdd={leftActionAdd}
      leftActionEdit={leftActionEdit}
      fullHeight={fullHeight}
      enableHierarchy={false}
      hierarchyMember={null}
      hierarchyLevel={0}
      isTopPanel={isTopPanel}
      isPager={isPager}
      isActions={isActions}
      isCard={isCard}
      onChange={async (e) => {
        const wrappedRow = e.target;
        const row = wrappedRow.row;
        const type = e.type;

        if (onChange) {
          await onChange(e);
        }

        if (type === dataTableEventTypeIds.commitRow) {
          if (row[keyMember]) {
            // Edit existing row
            if (onEdit) {
              await onEdit(row);
            } else {
              // Default edit behavior
              setData(previous => {
                const data2 = previous.map(item => {
                  if (item[keyMember] == row[keyMember]) {
                    return { ...item, ...row };
                  }
                  return item;
                });
                return data2;
              });
            }
          } else {
            // Create new row
            if (onCreate) {
              const newId = await onCreate(row);
              row.id = newId;
            } else {
              // Default create behavior - generate a temporary ID
              row.id = Date.now();
            }
            setData(previous => [...previous, row]);
          }
        }
      }}
      {...props}
    />
  );
};

export default Table2;

