import { useDrag } from "react-dnd";
import { useDrop } from "react-dnd";
import DataRow2 from './dataRow';
import { useEffect, useRef, useState } from 'react';
import { dataTableEventTypeIds } from '@/components/genA/v2/dataTableEventTypeIds';

const DataTable2Childrens = ({
  data,
  setData,
  columns,
  renderRow,
  onChange,
  onRowClick,
  dragType,
  dragInfo,
  dropInfo,
  onDrop,
  hierarchyMember = 'parentId',
  enableHierarchy = false,
  parentId,
  level = 0,
  context,
  row,
  setRow,
  isActions,
  renderActions,
  isExpanded,
  enableCellEditOnDoubleClick = false,
  ...props
}) => {
  const [changingRow, setChangingRow] = useState(null);

  const dropInfoRef = useRef(dropInfo);

  useEffect(() => {
    dropInfoRef.current = dropInfo;
  }, [dropInfo]);

  const [{ canDrop, isOver, didDrop, item }, drop] = useDrop(() => ({
    accept: props.dropType || "row",
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

  // Цвета рамок для разных уровней иерархии
  const hierarchyColors = [
    '#2196f3', // яркий синий для уровня 1
    '#9c27b0', // яркий фиолетовый для уровня 2
    '#4caf50', // яркий зеленый для уровня 3
    '#ff9800', // яркий оранжевый для уровня 4
    '#e91e63', // яркий розовый для уровня 5
  ];

  const borderColor = hierarchyColors[level] || '#f5f5f5';

  // Фильтруем дочерние элементы
  const children = enableHierarchy && parentId
    ? data.filter(item => item.row[hierarchyMember] === parentId)
    : [];

  if (!enableHierarchy || children.length === 0) {
    return null;
  }

  return (
    <div
      ref={drop}
      style={{
        borderLeft: `6px solid ${borderColor}`,
        borderRadius: '4px',
        marginTop: '4px',
        marginBottom: '4px'
      }}
    >

            {/* Контейнер для дочерних элементов */}
      {isExpanded && (
        <div>
          {children.map((wrappedRow, index) => {
            const aRow = wrappedRow.row;
            const selected = aRow?.id == row?.id;

            return (
              <div key={index} style={{ position: 'relative' }}>
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

                    if (mode == 'list') {
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

                {/* Рекурсивно отрисовываем дочерние элементы */}
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
                  level={level + 1}
                  context={context}
                  row={row}
                  setRow={setRow}
                  isActions={isActions}
                  renderActions={renderActions}
                  enableCellEditOnDoubleClick={enableCellEditOnDoubleClick}
                  {...props}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DataTable2Childrens;
