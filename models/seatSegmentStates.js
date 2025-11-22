export const SeatSegmentStateIds = {
    Free: 1,
    Reserved: 2,
    Occupied: 3,
    Quota: 4,
    Rule: 5,
};

export const SeatSegmentStateNames = {
    [SeatSegmentStateIds.Free]: 'Свободно',
    [SeatSegmentStateIds.Reserved]: 'Забронировано',
    [SeatSegmentStateIds.Occupied]: 'Занято',
    [SeatSegmentStateIds.Quota]: 'Квота',
    [SeatSegmentStateIds.Rule]: 'Правило',
};
