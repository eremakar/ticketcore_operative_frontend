import ResourceLookup from "@/components/genA/resourceLookup";
import { formatDateTime } from "@/components/genA/functions/datetime";

export default function SeatRuleSegmentLookup({useResource, resource, name, label, options, ...props}) {
    resource = useResource ? useResource() : resource;

    return (
        <ResourceLookup
            resource = {resource}
            name={name}
            label={label}
            options={{
                ...options,
                table: {
                    ...options?.table,
                    columns: [
                        { key: 'id', title: 'Ид', isSortable: true },
                        { key: 'fromDate', title: 'FromDate', isSortable: true, render: (value) => formatDateTime(value) },
                        { key: 'toDate', title: 'ToDate', isSortable: true, render: (value) => formatDateTime(value) },
                        { key: 'state', title: '1 - свободно, 2 - закрыто', isSortable: true },
                        { key: 'seat', title: 'Seat', isSortable: true, render: (value) => value?.name },
                        { key: 'from', title: 'From', isSortable: true, render: (value) => value?.name },
                        { key: 'to', title: 'To', isSortable: true, render: (value) => value?.name },
                        { key: 'train', title: 'Train', isSortable: true, render: (value) => value?.name },
                        { key: 'wagon', title: 'Wagon', isSortable: true, render: (value) => value?.name },
                        { key: 'trainSchedule', title: 'TrainSchedule', isSortable: true, render: (value) => value?.name }
                    ],
                    filters: [
                        {
                            title: 'Ид',
                            key: 'id'
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
                            key: 'seatId'
                        },
                        {
                            title: 'FromId',
                            key: 'fromId'
                        },
                        {
                            title: 'ToId',
                            key: 'toId'
                        },
                        {
                            title: 'TrainId',
                            key: 'trainId'
                        },
                        {
                            title: 'WagonId',
                            key: 'wagonId'
                        },
                        {
                            title: 'TrainScheduleId',
                            key: 'trainScheduleId'
                        }
                    ],
                    actions: {}
                }
            }}
            getRow={async (value) => {
                if (!value) {
                    return;
                }
                return await resource.get(value);
            }}
            {...props}
        />
    )
}
