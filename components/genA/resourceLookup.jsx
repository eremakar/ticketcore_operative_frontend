import React, { useEffect } from "react";
import { useState } from "react";
import Lookup from "./lookup";
import ResourceTable2 from "./v2/resourceTable";

export default function ResourceLookup({useResource, name, resourceName, options, formatValue, valueMemberName = 'id', labelMemberName = 'name',
    fullWidth = true, placeholder, getRow, value, lookupValue, onChange, onRowChange, anonymous, zIndex, defaultRow = null, ...props}) {
    const [row, setRow] = useState(defaultRow || null);
    const [query, setQuery] = useState(options?.table?.query || {
        paging: { skip: 0, take: 100 },
        filter: {},
        sort: {
            id: {
                operator: 'asc'
            }
        }
    });

    useEffect(() => {
        if (defaultRow) {
            setRow(defaultRow);
            return;
        }

        if (!value) {
            setRow(null);
        }
    }, [value, defaultRow]);

    const formatValue2 = formatValue || ((row) => row ? row[labelMemberName] : "");

    const fetchRow = async () => {
        if (row) {
            const id = row[valueMemberName];
            if (id == value)
                return;
        }

        if (!getRow)
            return;

        const response = await getRow(value);
        setRow(response);
    }

    useEffect(() => {
        if (!value || defaultRow)
            return;

        fetchRow();
    }, [value, defaultRow]);

    return (
        <Lookup name={name}
            value={row}
            lookupValue={lookupValue}
            formatValue={formatValue2}
            options={{
                details: {
                    ...options?.details,
                    resourceName: resourceName
                },
                table: {
                    ...options?.table,
                    useResource: useResource,
                    getQuery: () => query,
                    setQuery: setQuery,
                    render: (lookupOptions, setDetailsShow) => {
                        const tableOptions = lookupOptions?.table || {};
                        const {
                            render: _render,
                            getQuery: _getQuery,
                            setQuery: _setQuery,
                            query: _query,
                            onRowClick: externalOnRowClick,
                            useResource: tableUseResource,
                            ...restTableOptions
                        } = tableOptions;

                        const handleRowClick = async (event, wrappedRow) => {
                            if (typeof externalOnRowClick === "function") {
                                const result = await externalOnRowClick(event, wrappedRow);
                                if (result === false)
                                    return;
                            }

                            const selectedRow = wrappedRow?.row;
                            if (!selectedRow)
                                return;

                            setRow(selectedRow);

                            const id = selectedRow[valueMemberName];

                            onChange && onChange(id);
                            onRowChange && onRowChange(selectedRow);
                            setDetailsShow(false);
                        };

                        return (
                            <ResourceTable2
                                query={query}
                                setQuery={setQuery}
                                anonymous={anonymous}
                                {...restTableOptions}
                                {...props}
                                useResource={tableUseResource || useResource}
                                onRowClick={handleRowClick}
                            />
                        );
                    }
                }
            }} fullWidth={fullWidth} placeholder={placeholder} onChange={(row) => {
                setRow(row);
                //const id = row[valueMemberName];
                onChange && onChange(row);
            }} zIndex={zIndex} {...props}>
        </Lookup>
    );
}
