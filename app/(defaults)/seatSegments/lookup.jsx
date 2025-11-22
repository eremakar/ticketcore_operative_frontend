import ResourceLookup from "@/components/genA/resourceLookup";

export default function SeatSegmentLookup({useResource, resource, name, label, options, ...props}) {
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
                        { key: 'price', title: 'Price', isSortable: true },
                        { key: 'seat', title: 'Seat', isSortable: true, render: (value) => value?.name },
                        { key: 'from', title: 'From', isSortable: true, render: (value) => value?.name },
                        { key: 'to', title: 'To', isSortable: true, render: (value) => value?.name },
                        { key: 'train', title: 'Train', isSortable: true, render: (value) => value?.name },
                        { key: 'wagon', title: 'Wagon', isSortable: true, render: (value) => value?.name },
                        { key: 'trainSchedule', title: 'TrainSchedule', isSortable: true, render: (value) => value?.name },
                        { key: 'ticket', title: 'Ticket', isSortable: true, render: (value) => value?.name },
                        { key: 'seatReservation', title: 'SeatReservation', isSortable: true, render: (value) => value?.name }
                    ],
                    filters: [
                        {
                            title: 'Ид',
                            key: 'id'
                        },
                        {
                            title: 'Price',
                            key: 'price',
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
                        },
                        {
                            title: 'TicketId',
                            key: 'ticketId'
                        },
                        {
                            title: 'SeatReservationId',
                            key: 'seatReservationId'
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
