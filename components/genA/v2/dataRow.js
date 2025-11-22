import { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { viewTypeIds } from "./viewTypeIds";
import DataCell2 from "./dataCell";

const DataRow2 = ({
    sourceWrappedRow,
    setSourceRow,
    data,
    setData,
    columns,
    selected,
    isActions,
    renderActions,
    mode = 'manual',
    isEdit,
    render,
    dragType,
    dragInfo,
    onRowClick,
    index,
    onChange,
    enableCellEditOnDoubleClick = false,
    ...props
  }) => {
    const [wrappedRow, setWrappedRow] = useState({ ...sourceWrappedRow, row: { ...sourceWrappedRow?.row } });

    useEffect(() => {
        setWrappedRow({ ...sourceWrappedRow, row: { ...sourceWrappedRow?.row } });
    }, [sourceWrappedRow]);

    const row = wrappedRow?.row;

    const onClick = (e) => {
        if (onRowClick && !onRowClick(e, sourceWrappedRow)) {
            return;
        }

        setSourceRow && setSourceRow(!selected ? wrappedRow : null);

        //if (!onSelect) return

        if (e.target.className == null)
            return;

        if (e?.target?.className?.indexOf && e?.target?.className?.indexOf('prevent') >= 0) return
        //onSelect(row, data, page);
        setSourceRow && setSourceRow(wrappedRow);
    }

    const [{ opacity }, dragRef] = useDrag(
        () => {
          return {
            type: dragType || "row",
            item: { item: wrappedRow, dragInfo },
            collect: (monitor) => {
              return {
                opacity: monitor.isDragging() ? 0.5 : 1
              }
            }
        }},
        [row?.id]
    )


    const renderCell = (column) => {
        if (!column)
            return <></>

        const cell = wrappedRow?.cells?.find(_ => _.key == column.key);
        return <DataCell2 data={data} setData={setData} column={column} wrappedRow={sourceWrappedRow} changingRow={wrappedRow} row={wrappedRow.row} isEdit={cell?.isEdit || isEdit} onChange={async (_, mode) => {
            setWrappedRow({...wrappedRow});
            if (onChange)
                await onChange(wrappedRow, 'change', mode);
        }} rowIndex={index} />
    }

    return <>
        <tr
            key={row?.id}
            onClick={(e) => {
                onClick(e);
            }}
            onMouseEnter={() => {
                sourceWrappedRow.isHover = true;
                setData(previous => [...previous]);
            }}
            onMouseLeave={() => {
                sourceWrappedRow.isHover = false;
                setData(previous => [...previous]);
            }}
            className={selected ? 'table-selected' : ''}
            {...props}
        >
            {!render ? <>
            {columns.map((column, columnIndex) => {
                const cell = wrappedRow?.cells?.find(_ => _.key == column.key);
                return <td key={`${wrappedRow.id}${columnIndex}`} style={column.style || {}} onDoubleClick={enableCellEditOnDoubleClick ? async (e) => {
                    if (!column.editable || !cell || sourceWrappedRow.isEdit) {
                        return;
                    }

                    cell.isEdit = true;
                    setWrappedRow({...wrappedRow});
                    if (onChange)
                        await onChange(wrappedRow, 'doubleClick');
                } : undefined} onBlur={async (e) => {
                    if (!column.editable || !cell || sourceWrappedRow.isEdit) {
                        return;
                    }

                    switch (column.type) {
                        case viewTypeIds.date:
                        case viewTypeIds.dateTime:
                        case viewTypeIds.dropdown:
                        case viewTypeIds.lookup:
                            return;
                    }

                    cell.isEdit = false;
                    setWrappedRow({...wrappedRow});

                    if (onChange)
                        await onChange(wrappedRow, 'blur');
                }}>
                    <DataCell2 data={data} setData={setData} column={column} wrappedRow={sourceWrappedRow} changingRow={wrappedRow} row={row} isEdit={cell?.isEdit || isEdit} onChange={async (_, mode) => {
                        console.log(wrappedRow);
                        setWrappedRow({...wrappedRow});
                        if (onChange)
                            await onChange(wrappedRow, 'change', mode, column.key);
                    }} rowIndex={index} />
                </td>
            })}
            {isActions && <td>{renderActions(wrappedRow)}</td>}
            </> : render(columns, sourceWrappedRow, data, renderCell, renderActions, dragRef)}
        </tr>
    </>
}
export default DataRow2;
