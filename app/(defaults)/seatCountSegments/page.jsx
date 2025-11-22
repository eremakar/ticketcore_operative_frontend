'use client';

import ResourceTable2 from "@/components/genA/resourceTable";
import useOperativeResource from "@/hooks/useOperativeResource";
import { useState } from "react";
import { asJSONSafe } from "@/components/genA/functions/json";

export default function SeatCountSegments() {
    const [query, setQuery] = useState({
        paging: { skip: 0, take: 100 },
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
    const [data, setData] = useState([]);
    const resourceActionPostfix = "сегмент по количеству мест";

    const fetch = () => {
        setQuery({...query});
    }

    const map = (items) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.tickets) {
                item.tickets = asJSONSafe(item.tickets);
            }
        }

        return items;
    }

    const resource = useOperativeResource('seatCountSegments');
    return (
        <>
            <ResourceTable2
                resource={resource}
                resourceName={resourceActionPostfix}
                query={query}
                setQuery={setQuery}
                hideDelete={false}
                isFetch={true}
                data={data}
                setData={setData}
                onMap={map}
                columns={[
                    { key: 'id', title: 'Ид', isSortable: true },
                    { key: 'seatCount', title: 'SeatCount', isSortable: true },
                    { key: 'freeCount', title: 'FreeCount', isSortable: true },
                    { key: 'price', title: 'Price', isSortable: true },
                    { key: 'tickets', title: 'Tickets', isSortable: true },
                    { key: 'from', title: 'From', isSortable: true, render: (value) => value?.name },
                    { key: 'to', title: 'To', isSortable: true, render: (value) => value?.name },
                    { key: 'train', title: 'Train', isSortable: true, render: (value) => value?.name },
                    { key: 'wagon', title: 'Wagon', isSortable: true, render: (value) => value?.name },
                    { key: 'trainSchedule', title: 'TrainSchedule', isSortable: true, render: (value) => value?.name },
                ]}
                filters={[
                    {
                        title: 'Ид',
                        key: 'id',
                    },
                    {
                        title: 'SeatCount',
                        key: 'seatCount',
                        type: 'number',
                    },
                    {
                        title: 'FreeCount',
                        key: 'freeCount',
                        type: 'number',
                    },
                    {
                        title: 'Price',
                        key: 'price',
                        type: 'number',
                    },
                    {
                        title: 'Tickets',
                        key: 'tickets',
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
            />
        </>
    )
}
