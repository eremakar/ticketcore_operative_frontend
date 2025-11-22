'use client';

import ResourceTable2 from "@/components/genA/resourceTable";
import useOperativeResource from "@/hooks/useOperativeResource";
import { useEffect, useState } from "react";
import { formatDateTime } from "@/components/genA/functions/datetime";
import SeatRuleSegmentSubmit from "./submit";
import SeatRuleSegmentDetails from "./details";

export default function SeatRuleSegments({ defaultQuery = null, hideFilters = false, fullHeight = false, relationData = null, ...props }) {
    const [query, setQuery] = useState(defaultQuery || {
        paging: { skip: 0, take: 10 },
        filter: {},
        sort: {
            id: {
                operator: 'desc'
            }
        }
    });

    const [createShow, setCreateShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [detailsShow, setDetailsShow] = useState(false);

    const [row, setRow] = useState(null);
    const [newRow] = useState({});
    const resourceActionPostfix = "правила сегментов мест";

    useEffect(() => {
        if (defaultQuery) {
            setQuery(defaultQuery);
        }
    }, [defaultQuery]);

    const fetch = () => {
        setQuery({...query});
    }

    const resource = useOperativeResource('seatRuleSegments');
    return (
        <>
            <ResourceTable2
                resource={resource}
                resourceName={resourceActionPostfix}
                query={query}
                setQuery={setQuery}
                filterMode={hideFilters ? "none" : "default"}
                sortMode={hideFilters ? "none" : "default"}
                hideDelete={false}
                fullHeight={fullHeight}
                actions={{
                    onCreate: () => setCreateShow(true),
                    onEdit: (selectedRow) => {
                        setRow({ ...selectedRow });
                        setEditShow(true);
                    },
                    onDetails: (selectedRow) => {
                        setRow({ ...selectedRow });
                        setDetailsShow(true);
                    }
                }}
                columns={[
                    { key: 'id', title: 'Ид', isSortable: true },
                    { key: 'fromDate', title: 'FromDate', isSortable: true, render: (value) => formatDateTime(value) },
                    { key: 'toDate', title: 'ToDate', isSortable: true, render: (value) => formatDateTime(value) },
                    { key: 'state', title: '1 - свободно, 2 - закрыто', isSortable: true },
                    { key: 'seat', title: 'Seat', isSortable: true, render: (value) => value?.name },
                    { key: 'from', title: 'From', isSortable: true, render: (value) => value?.name },
                    { key: 'to', title: 'To', isSortable: true, render: (value) => value?.name },
                    ...(relationData?.trainId
                        ? []
                        : [{ key: 'train', title: 'Train', isSortable: true, render: (value) => value?.name }]),
                    ...(relationData?.wagonId
                        ? []
                        : [{ key: 'wagon', title: 'Wagon', isSortable: true, render: (value) => value?.name }]),
                    ...(relationData?.trainScheduleId
                        ? []
                        : [{ key: 'trainSchedule', title: 'TrainSchedule', isSortable: true, render: (value) => value?.name }]),
                ]}
                filters={[
                    {
                        title: 'Ид',
                        key: 'id',
                    },
                    {
                        title: 'FromDate',
                        key: 'fromDate',
                        type: 'datetime',
                    },
                    {
                        title: 'ToDate',
                        key: 'toDate',
                        type: 'datetime',
                    },
                    {
                        title: '1 - свободно, 2 - закрыто',
                        key: 'state',
                        type: 'number',
                    },
                    {
                        title: 'SeatId',
                        key: 'seatId',
                    },
                    {
                        title: 'FromId',
                        key: 'fromId',
                    },
                    {
                        title: 'ToId',
                        key: 'toId',
                    },
                    {
                        title: 'TrainId',
                        key: 'trainId',
                    },
                    {
                        title: 'WagonId',
                        key: 'wagonId',
                    },
                    {
                        title: 'TrainScheduleId',
                        key: 'trainScheduleId',
                    },
                ]}
                {...props}
            />
            <SeatRuleSegmentSubmit
                resource={resource}
                show={createShow}
                setShow={setCreateShow}
                resourceName={resourceActionPostfix}
                resourceMode="create"
                resourceData={newRow}
                relationData={relationData}
                onResourceSubmitted={async () => {
                    fetch();
                }}
                orientation="horizontal"
                type="expandable"
            />
            <SeatRuleSegmentSubmit
                resource={resource}
                show={editShow}
                setShow={setEditShow}
                resourceName={resourceActionPostfix}
                resourceMode="edit"
                resourceData={row}
                relationData={relationData}
                onResourceSubmitted={async () => {
                    fetch();
                }}
                orientation="horizontal"
                type="expandable"
            />
            <SeatRuleSegmentDetails
                resource={resource}
                show={detailsShow}
                setShow={setDetailsShow}
                resourceName={resourceActionPostfix}
                resourceData={row}
                orientation="horizontal"
                type="expandable"
            />
        </>
    )
}
