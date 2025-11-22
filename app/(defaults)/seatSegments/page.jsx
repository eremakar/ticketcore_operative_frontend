'use client';

import ResourceTable2 from "@/components/genA/v2/resourceTable";
import useOperativeResource from "@/hooks/useOperativeResource";
import { useState, useEffect, useMemo, Fragment } from "react";
import { formatDateTime, formatTimeSpan as formatTimeSpanText } from "@/components/genA/functions/datetime";
import { timeSpanToMinutes, minutesToTimeSpan } from "@/components/genA/functions/timespan";
import { SeatSegmentStateNames } from "@/models/seatSegmentStates";
import IconSeat from "@/components/icon/icon-seat";
import { fixTimeZone } from "@/functions/dates";
import useEnv from "@/hooks/useEnv";

const RULE_STATE_TEXT = {
    1: 'Свободно',
    2: 'Закрыто'
};

const RULE_STATE_CLASS = {
    1: 'bg-orange-100/80 border-orange-300/90 text-orange-900',
    2: 'bg-red-100 border-red-300 text-red-800'
};

const RULE_STATE_STATUS = {
    1: 'Разрешено',
    2: 'Запрещено'
};

const NO_VALUE_PLACEHOLDER = '—';

function pushUnique(target, value) {
    if (value === undefined || value === null) {
        return;
    }
    const key = String(value);
    if (!target.seen.has(key)) {
        target.seen.add(key);
        target.values.push(value);
    }
}

function getEntityIdCandidates(entity, fallback) {
    const acc = { seen: new Set(), values: [] };

    if (entity && typeof entity === 'object') {
        pushUnique(acc, entity.id);
        pushUnique(acc, entity.value);
        pushUnique(acc, entity.valueId);
        pushUnique(acc, entity.key);
        pushUnique(acc, entity.code);
        pushUnique(acc, entity.stationId);
        pushUnique(acc, entity.trainStationId);
        pushUnique(acc, entity.routeStationId);
        if (entity.station) {
            pushUnique(acc, entity.station.id);
        }
    } else {
        pushUnique(acc, entity);
    }

    pushUnique(acc, fallback);

    return acc.values;
}

function getNameCandidates(entity) {
    const names = new Set();
    const addName = (value) => {
        if (!value) return;
        names.add(String(value).trim().toLowerCase());
    };

    if (entity == null) {
        return names;
    }

    if (typeof entity === 'string') {
        addName(entity);
        return names;
    }

    if (typeof entity === 'object') {
        addName(entity.name);
        addName(entity.title);
        addName(entity.label);
        addName(entity.code);
        if (entity.station) {
            addName(entity.station.name);
        }
    }

    return names;
}

function getPrimaryId(entity, fallback) {
    const [first] = getEntityIdCandidates(entity, fallback);
    return first ?? null;
}

function getStationName(entity) {
    if (!entity) return NO_VALUE_PLACEHOLDER;
    if (typeof entity === 'string') return entity;
    return entity.station?.name || entity.name || entity.title || entity.label || entity.code || NO_VALUE_PLACEHOLDER;
}

function getOrderValue(entity) {
    if (!entity || typeof entity !== 'object') return null;
    return entity.order ?? entity.sequence ?? entity.position ?? entity.index ?? null;
}

function getRuleStateLabel(state) {
    return RULE_STATE_TEXT[state] || (state != null ? String(state) : NO_VALUE_PLACEHOLDER);
}

function getRuleStateClass(state) {
    return RULE_STATE_CLASS[state] || 'bg-gray-100 border-gray-300 text-gray-600';
}

function getRuleStateStatus(state) {
    return RULE_STATE_STATUS[state] || NO_VALUE_PLACEHOLDER;
}

function parseDateToNumber(value) {
    if (!value) return Number.POSITIVE_INFINITY;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function formatRuleDateRange(fromDate, toDate) {
    if (!fromDate && !toDate) return '';
    if (fromDate && toDate) {
        return `${formatDateTime(fromDate)} — ${formatDateTime(toDate)}`;
    }
    if (fromDate) {
        return `с ${formatDateTime(fromDate)}`;
    }
    return `до ${formatDateTime(toDate)}`;
}

function parseDateValue(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date;
}

function addMinutesToDate(date, minutes) {
    if (!date || typeof minutes !== 'number' || Number.isNaN(minutes)) {
        return null;
    }
    return new Date(date.getTime() + minutes * 60000);
}

function resolveStationEventDate(station, eventKey, baseDate) {
    if (!station) return null;

    const directValue = parseDateValue(station?.[eventKey]);
    if (directValue) {
        return directValue;
    }

    const timeSpanKey = `${eventKey}Time`;
    const timeSpanValue = station?.[timeSpanKey];
    if (timeSpanValue && baseDate) {
        const minutes = timeSpanToMinutes(timeSpanValue);
        if (typeof minutes === 'number' && !Number.isNaN(minutes)) {
            return addMinutesToDate(baseDate, minutes);
        }
    }

    return null;
}

function convertDateWithOffset(value, offset) {
    const parsed = parseDateValue(value);
    if (!parsed) {
        return null;
    }
    if (!Number.isFinite(offset)) {
        return parsed;
    }
    return fixTimeZone(parsed, offset);
}

function applyTimezoneFixToSegments(segments, offset) {
    if (!Array.isArray(segments)) {
        return segments;
    }

    return segments.map((segment) => {
        if (!segment || typeof segment !== 'object') {
            return segment;
        }

        const nextSegment = { ...segment };
        ['arrival', 'departure'].forEach((field) => {
            const fixed = convertDateWithOffset(nextSegment[field], offset);
            if (fixed) {
                nextSegment[field] = fixed;
            }
        });

        return nextSegment;
    });
}

function normalizeDateOnly(date) {
    if (!date) return null;
    const validDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(validDate.getTime())) return null;
    return new Date(
        validDate.getFullYear(),
        validDate.getMonth(),
        validDate.getDate(),
        0,
        0,
        0,
        0,
    );
}

function getRowFirstStationDate(row) {
    const segments = row?.segments || [];

    if (!segments.length) {
        return null;
    }

    const firstSegment = segments[0];

    if (!firstSegment) {
        return null;
    }

    const departureDate = firstSegment.departure;
    const arrivalDate = firstSegment.arrival;

    if (!arrivalDate && !departureDate) {
        return null;
    }

    let date = new Date(arrivalDate || departureDate);
    const normalizedDate = normalizeDateOnly(date);
    const result = normalizedDate;
    return result;
}

function formatTimeSpanLabel(value, baseDate) {
    if (!value || !baseDate) return NO_VALUE_PLACEHOLDER;
    const minutesDiff = Math.round((value.getTime() - baseDate.getTime()) / 60000);
    if (!Number.isFinite(minutesDiff)) {
        return NO_VALUE_PLACEHOLDER;
    }

    const clampedMinutes = minutesDiff < 0 ? 0 : minutesDiff;
    const timeSpanString = minutesToTimeSpan(clampedMinutes);
    const formatted = formatTimeSpanText(timeSpanString, 'dd, HH:mm');
    return formatted || NO_VALUE_PLACEHOLDER;
}

function matchRuleToPairIndexes(rule, pairs) {
    if (!Array.isArray(pairs) || pairs.length === 0) {
        return [];
    }

    const fromIds = getEntityIdCandidates(rule?.from, rule?.fromId).map((v) => String(v));
    const toIds = getEntityIdCandidates(rule?.to, rule?.toId).map((v) => String(v));
    const fromNames = getNameCandidates(rule?.from);
    const toNames = getNameCandidates(rule?.to);
    const ruleFromOrder = getOrderValue(rule?.from);
    const ruleToOrder = getOrderValue(rule?.to);

    const byOrderMatches = [];
    const hasOrderBounds = ruleFromOrder != null || ruleToOrder != null;

    if (hasOrderBounds) {
        pairs.forEach((pair, index) => {
            const pairFromOrder = pair?.fromOrder;
            const pairToOrder = pair?.toOrder;

            if (pairFromOrder == null || pairToOrder == null) {
                return;
            }

            if (ruleFromOrder != null && pairFromOrder < ruleFromOrder) {
                return;
            }

            if (ruleToOrder != null && pairToOrder > ruleToOrder) {
                return;
            }

            byOrderMatches.push(index);
        });

        if (byOrderMatches.length > 0) {
            return byOrderMatches;
        }
    }

    const fromCandidateIndexes = new Set();
    const toCandidateIndexes = new Set();
    const exactMatches = new Set();

    pairs.forEach((pair, index) => {
        const pairFromId = pair?.fromId != null ? String(pair.fromId) : null;
        const pairToId = pair?.toId != null ? String(pair.toId) : null;

        const [pairFromNameRaw, pairToNameRaw] = (pair?.title || '').split(' → ');
        const pairFromName = pairFromNameRaw ? pairFromNameRaw.trim().toLowerCase() : null;
        const pairToName = pairToNameRaw ? pairToNameRaw.trim().toLowerCase() : null;

        const fromMatchesById = fromIds.length > 0 && pairFromId != null && fromIds.includes(pairFromId);
        const fromMatchesByName = fromNames.size > 0 && pairFromName && fromNames.has(pairFromName);
        const toMatchesById = toIds.length > 0 && pairToId != null && toIds.includes(pairToId);
        const toMatchesByName = toNames.size > 0 && pairToName && toNames.has(pairToName);

        if (fromMatchesById || fromMatchesByName) {
            fromCandidateIndexes.add(index);
        }

        if (toMatchesById || toMatchesByName) {
            toCandidateIndexes.add(index);
        }

        const fromMatch = fromIds.length > 0
            ? (pairFromId != null && fromIds.includes(pairFromId))
            : (fromNames.size > 0 ? (pairFromName && fromNames.has(pairFromName)) : true);

        const toMatch = toIds.length > 0
            ? (pairToId != null && toIds.includes(pairToId))
            : (toNames.size > 0 ? (pairToName && toNames.has(pairToName)) : true);

        if (fromMatch && toMatch) {
            exactMatches.add(index);
        }
    });

    if (fromCandidateIndexes.size === 0 && fromIds.length === 0 && fromNames.size === 0) {
        fromCandidateIndexes.add(0);
    }

    if (toCandidateIndexes.size === 0 && toIds.length === 0 && toNames.size === 0) {
        toCandidateIndexes.add(pairs.length - 1);
    }

    if (fromCandidateIndexes.size > 0 && toCandidateIndexes.size > 0) {
        const start = Math.min(...fromCandidateIndexes);
        const end = Math.max(...toCandidateIndexes);

        if (end >= start) {
            const inclusiveRange = [];
            for (let idx = start; idx <= end; idx += 1) {
                inclusiveRange.push(idx);
            }
            if (inclusiveRange.length > 0) {
                return inclusiveRange;
            }
        }
    }

    if (exactMatches.size > 0) {
        return Array.from(exactMatches).sort((a, b) => a - b);
    }

    return [];
}

function buildIndexRanges(indexes) {
    if (!indexes || indexes.length === 0) return [];

    const sorted = Array.from(new Set(indexes)).sort((a, b) => a - b);
    const ranges = [];

    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i += 1) {
        const current = sorted[i];
        if (current === prev + 1) {
            prev = current;
            continue;
        }

        ranges.push({ start, end: prev });
        start = current;
        prev = current;
    }

    ranges.push({ start, end: prev });
    return ranges;
}

function deduplicateRules(rules) {
    const seen = new Set();

    return rules.filter((rule) => {
        const key = rule?.id != null
            ? `id:${rule.id}`
            : `hash:${[
                getPrimaryId(rule?.seat, rule?.seatId) ?? '',
                getPrimaryId(rule?.trainSchedule, rule?.trainScheduleId) ?? '',
                getPrimaryId(rule?.wagon, rule?.wagonId) ?? '',
                getPrimaryId(rule?.train, rule?.trainId) ?? '',
                getPrimaryId(rule?.from, rule?.fromId) ?? '',
                getPrimaryId(rule?.to, rule?.toId) ?? '',
                rule?.state ?? '',
                rule?.fromDate ?? '',
                rule?.toDate ?? '',
            ].join('|')}`;

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

export default function SeatSegments({ defaultQuery = null, hideFilters = false, fullHeight = false, ...props }) {
    const [query, setQuery] = useState(defaultQuery || {
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
    const [data, setData] = useState([]);
    const [segmentPairs, setSegmentPairs] = useState([]);
    const [ruleSegments, setRuleSegments] = useState([]);

    const [row, setRow] = useState(null);
    const resourceActionPostfix = "сегмент по месту (от-до)";

    const fetch = () => {
        setQuery({...query});
    }

    // Update query when defaultQuery changes
    useEffect(() => {
        if (defaultQuery) {
            setQuery(defaultQuery);
        }
    }, [defaultQuery]);

    // Check if wagonId is filtered in query
    const isWagonFiltered = query?.filter?.wagonId || defaultQuery?.filter?.wagonId;

    const env = useEnv();
    const timeZoneOffset = Number.isFinite(env?.timeZone) ? env.timeZone : 5;

    const resource = useOperativeResource('seatSegments');
    const seatRuleSegmentsResource = useOperativeResource('seatRuleSegments');

    const ruleSegmentsBySeat = useMemo(() => {
        if (!Array.isArray(ruleSegments) || ruleSegments.length === 0) {
            return {};
        }

        const grouped = {};

        ruleSegments.forEach((rule) => {
            const seatId = getPrimaryId(rule?.seat, rule?.seatId);
            const key = seatId != null ? String(seatId) : '__null__';
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(rule);
        });

        Object.values(grouped).forEach((list) => {
            list.sort((a, b) => {
                const fromOrderDiff = (getOrderValue(a?.from) ?? Number.POSITIVE_INFINITY) - (getOrderValue(b?.from) ?? Number.POSITIVE_INFINITY);
                if (fromOrderDiff !== 0) return fromOrderDiff;

                const fromNameDiff = getStationName(a?.from).localeCompare(getStationName(b?.from));
                if (fromNameDiff !== 0) return fromNameDiff;

                const toOrderDiff = (getOrderValue(a?.to) ?? Number.POSITIVE_INFINITY) - (getOrderValue(b?.to) ?? Number.POSITIVE_INFINITY);
                if (toOrderDiff !== 0) return toOrderDiff;

                const toNameDiff = getStationName(a?.to).localeCompare(getStationName(b?.to));
                if (toNameDiff !== 0) return toNameDiff;

                const stateDiff = (a?.state ?? 0) - (b?.state ?? 0);
                if (stateDiff !== 0) return stateDiff;

                return parseDateToNumber(a?.fromDate) - parseDateToNumber(b?.fromDate);
            });
        });

        return grouped;
    }, [ruleSegments]);

    useEffect(() => {
        let cancelled = false;

        const fetchSeatRuleSegments = async () => {
            try {
                const baseQuery = defaultQuery ? JSON.parse(JSON.stringify(defaultQuery)) : {};
                const mergedFilter = { ...(baseQuery.filter || {}), ...(query?.filter || {}) };
                const mergedSort = (query?.sort && Object.keys(query.sort || {}).length > 0)
                    ? query.sort
                    : (baseQuery.sort || { id: { operator: 'desc' } });
                const basePaging = baseQuery.paging || query?.paging || {};
                const mergedPaging = {
                    skip: 0,
                    take: Math.max(basePaging.take || 100, 500),
                    returnCount: false
                };

                const request = {
                    ...baseQuery,
                    filter: mergedFilter,
                    sort: mergedSort,
                    paging: mergedPaging
                };

                const response = await seatRuleSegmentsResource.search(request);
                if (!cancelled) {
                    setRuleSegments(Array.isArray(response?.result) ? response.result : []);
                }
            } catch (error) {
                console.error("[SeatSegments] Failed to load seat rule segments", error);
                if (!cancelled) {
                    setRuleSegments([]);
                }
            }
        };

        fetchSeatRuleSegments();

        return () => {
            cancelled = true;
        };
    }, [defaultQuery, query]);

    // Функция группировки для onMap
    const groupSegments = (segments) => {
        if (!segments || !Array.isArray(segments)) return [];

        const groups = {};

        segments.forEach(segment => {
            const key = `${segment.trainSchedule?.id || 'null'}_${segment.wagon?.id || 'null'}_${segment.seat?.id || 'null'}`;

            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    trainSchedule: segment.trainSchedule,
                    train: segment.train,
                    wagon: segment.wagon,
                    seat: segment.seat,
                    segments: []
                };
            }

            groups[key].segments.push(segment);
        });

        // Сортируем сегменты внутри каждой группы по id
        Object.values(groups).forEach(group => {
            group.segments.sort((a, b) => (a.id || 0) - (b.id || 0));
        });

        // Сортируем группы по номеру вагона и номеру места
        const sortedGroups = Object.values(groups).sort((a, b) => {
            const wagonA = a.wagon?.number || 0;
            const wagonB = b.wagon?.number || 0;

            if (wagonA !== wagonB) {
                return wagonA - wagonB;
            }

            const seatA = a.seat?.number || 0;
            const seatB = b.seat?.number || 0;
            return seatA - seatB;
        });

        return sortedGroups;
    };

    // Обертка onMap: строим группы и сразу формируем пары по первому элементу groups
    const mapAndBuildPairs = (segments) => {
        const segmentsWithFixedTimezone = applyTimezoneFixToSegments(segments, timeZoneOffset);
        const grouped = groupSegments(segmentsWithFixedTimezone);
        if (!grouped || grouped.length === 0) {
            setSegmentPairs([]);
            return grouped;
        }

        const pairMap = new Map();

        grouped.forEach((group) => {
            (group.segments || []).forEach((segment) => {
                const [fromId] = getEntityIdCandidates(segment?.from, segment?.fromId);
                const [toId] = getEntityIdCandidates(segment?.to, segment?.toId);
                if (fromId == null || toId == null) return;

                const key = `${String(fromId)}_${String(toId)}`;
                if (pairMap.has(key)) return;

                pairMap.set(key, {
                    key,
                    fromId,
                    toId,
                    title: `${getStationName(segment?.from)} → ${getStationName(segment?.to)}`,
                    fromOrder: getOrderValue(segment?.from),
                    toOrder: getOrderValue(segment?.to),
                });
            });
        });

        const pairs = Array.from(pairMap.values()).sort((a, b) => {
            const fromOrderDiff = (a.fromOrder ?? Number.POSITIVE_INFINITY) - (b.fromOrder ?? Number.POSITIVE_INFINITY);
            if (fromOrderDiff !== 0) return fromOrderDiff;

            const toOrderDiff = (a.toOrder ?? Number.POSITIVE_INFINITY) - (b.toOrder ?? Number.POSITIVE_INFINITY);
            if (toOrderDiff !== 0) return toOrderDiff;

            return a.title.localeCompare(b.title);
        });

        setSegmentPairs(pairs);
        return grouped;
    };

    const renderPairCell = (row, pair) => {
        const segments = row?.segments || [];
        const seg = segments.find(s => {
            const fromId = s?.from?.id || s?.fromId;
            const toId = s?.to?.id || s?.toId;
            return fromId === pair.fromId && toId === pair.toId;
        });
        console.log(seg);

        if (!seg) {
            return <span className="text-gray-300">—</span>;
        }

        const hasReservation = seg.seatReservation?.id || seg.seatReservation;
        const hasTicket = seg.ticket?.id || seg.ticket;
        const baseStationDate = getRowFirstStationDate(row);
        const substractDates = (a, b) => {
            const dateA = parseDateValue(a);
            const dateB = parseDateValue(b);
            if (!dateA || !dateB) return null;

            const minutesDiff = Math.round((dateA.getTime() - dateB.getTime()) / 60000);
            if (!Number.isFinite(minutesDiff) || minutesDiff < 0) {
                return null;
            }

            const timeSpanString = minutesToTimeSpan(minutesDiff);
            if (!timeSpanString) return null;

            const formatted = formatTimeSpanText(timeSpanString, 'dd, HH:mm', { showDays: false });
            return formatted || null;
        };
        
        const arrivalLabel = substractDates(seg.arrival, baseStationDate) || '-';
        const departureLabel = substractDates(seg.departure, baseStationDate) || '-';
        
        let bgColor = 'bg-blue-100 border-blue-300'; // по умолчанию синий (свободно)
        if (hasReservation) {
            bgColor = 'bg-orange-100 border-orange-300'; // оранжевый для брони
        } else if (hasTicket) {
            bgColor = 'bg-green-100 border-green-300'; // зеленый для билета
        }
        
        const stateId = seg.state || seg.stateId;
        const stateText = SeatSegmentStateNames[stateId] || 'Неизвестно';
        const stateTextWithId = `${stateText} (${stateId})`;
        const price = seg.price || 0;
        const showPrice = price !== 0;
        
        const title = `${seg.from?.station?.name || seg.from?.name || 'От'} → ${seg.to?.station?.name || seg.to?.name || 'До'}\nПрибытие: ${arrivalLabel}\nОтправление: ${departureLabel}\nСтатус: ${stateTextWithId}\nЦена: ${price} ₽\nБилет: ${seg.ticket?.name || seg.ticket?.id || '-'}\nРезерв: ${seg.seatReservation?.name || seg.seatReservation?.id || '-'}`;

        return (
            <div
                className={`${bgColor} border rounded text-xs font-medium text-center min-w-0 flex-shrink-0`}
                title={title}
            >
                <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-1">
                    <span className="text-xs font-semibold text-center">{departureLabel} {stateTextWithId} {arrivalLabel}</span>
                    {showPrice && <span className="text-[11px] font-semibold mt-0.5">{price} ₽</span>}
                </div>
            </div>
        );
    };

    // Функция для группировки сегментов по брони и создания объединенных ячеек
    const groupSegmentsByReservation = (segments) => {
        if (!segments || segments.length === 0) return [];
        
        const groups = {};
        segments.forEach(segment => {
            const reservationId = segment.seatReservation?.id || segment.seatReservation || 'no-reservation';
            if (!groups[reservationId]) {
                groups[reservationId] = {
                    reservationId,
                    segments: [],
                    totalPrice: 0
                };
            }
            groups[reservationId].segments.push(segment);
            groups[reservationId].totalPrice += segment.price || 0;
        });

        return Object.values(groups);
    };

    // Функция для группировки сегментов по билетам и создания объединенных ячеек
    const groupSegmentsByTicket = (segments) => {
        if (!segments || segments.length === 0) return [];
        
        const groups = {};
        segments.forEach(segment => {
            const ticketId = segment.ticket?.id || segment.ticket || 'no-ticket';
            if (!groups[ticketId]) {
                groups[ticketId] = {
                    ticketId,
                    segments: [],
                    totalPrice: 0
                };
            }
            groups[ticketId].segments.push(segment);
            groups[ticketId].totalPrice += segment.price || 0;
        });

        return Object.values(groups);
    };

    const renderRuleMergedCell = (rule, range, rowKey, startIndex) => {
        const span = range.end - range.start + 1;
        const stateClass = getRuleStateClass(rule?.state);
        const stateLabel = getRuleStateLabel(rule?.state);
        const statusLabel = getRuleStateStatus(rule?.state);
        const fromName = getStationName(rule?.from);
        const toName = getStationName(rule?.to);
        const dateRange = formatRuleDateRange(rule?.fromDate, rule?.toDate);

        const titleLines = [
            stateLabel,
            statusLabel,
            `${fromName} → ${toName}`,
        ];
        if (dateRange) {
            titleLines.push(dateRange);
        }

        return (
            <td key={`${rowKey}-range-${startIndex}`} colSpan={span} style={{ padding: '2px' }}>
                <div
                    className={`${stateClass} border rounded text-xs font-medium text-center w-full h-full min-h-[44px] flex flex-col justify-center items-center gap-0.5 px-2 py-2`}
                    title={titleLines.join('\n')}
                >
                    {/* <div className="text-[11px] font-semibold leading-tight">{stateLabel}</div> */}
                    <div className="text-[10px] font-normal uppercase tracking-wide opacity-80">{statusLabel}</div>
                    <div className="w-full text-[10px] font-medium leading-tight truncate">
                        {fromName} → {toName}
                    </div>
                    {dateRange && (
                        <div className="text-[9px] font-normal opacity-80">{dateRange}</div>
                    )}
                </div>
            </td>
        );
    };

    const buildDynamicCellsForRule = (rule, rowKey, dynamicCount) => {
        if (dynamicCount === 0) {
            return [];
        }

        const matchedIndexes = matchRuleToPairIndexes(rule, segmentPairs);
        if (!matchedIndexes.length) {
            const fromName = getStationName(rule?.from);
            const toName = getStationName(rule?.to);
            const statusLabel = getRuleStateStatus(rule?.state);
            return [
                <td key={`${rowKey}-nomatch`} colSpan={dynamicCount} className="px-2 py-2 text-center text-[11px] text-gray-500">
                    <div className="flex flex-col gap-1">
                        <span>{fromName} → {toName}</span>
                        <span className="uppercase tracking-wide text-[10px] text-gray-400">{statusLabel}</span>
                    </div>
                </td>
            ];
        }

        const ranges = buildIndexRanges(matchedIndexes);
        const rangesByStart = new Map();
        ranges.forEach((range) => {
            rangesByStart.set(range.start, range);
        });

        const cells = [];
        let index = 0;
        while (index < dynamicCount) {
            const range = rangesByStart.get(index);
            if (range) {
                cells.push(renderRuleMergedCell(rule, range, rowKey, index));
                index += (range.end - range.start + 1);
            } else {
                cells.push(
                    <td key={`${rowKey}-empty-${index}`} style={{ padding: '2px' }}>
                        <span className="text-gray-300 text-xs">—</span>
                    </td>
                );
                index += 1;
            }
        }

        return cells;
    };

    const renderRuleRows = (row, columns, rowKey) => {
        const dynamicCount = segmentPairs.length;
        // Находим индекс колонки "seat" и исключаем её из baseSpan
        const seatColumnIndex = columns.findIndex(col => col.key === 'seat');
        const baseColumnsCount = columns.length - dynamicCount;
        const baseSpan = seatColumnIndex >= 0 && seatColumnIndex < baseColumnsCount 
            ? Math.max(baseColumnsCount - 1, 0) 
            : Math.max(baseColumnsCount, 0);

        const rowSeatId = getPrimaryId(row?.seat, row?.seatId);
        const seatKey = rowSeatId != null ? String(rowSeatId) : '__null__';

        const candidateRules = [
            ...(ruleSegmentsBySeat[seatKey] || []),
            ...(seatKey === '__null__' ? [] : (ruleSegmentsBySeat['__null__'] || [])),
        ];

        const filteredRules = deduplicateRules(candidateRules).filter((rule) => {
            const ruleSeatId = getPrimaryId(rule?.seat, rule?.seatId);
            if (ruleSeatId != null && rowSeatId != null && String(ruleSeatId) !== String(rowSeatId)) {
                return false;
            }

            const rowTrainScheduleId = getPrimaryId(row?.trainSchedule, row?.trainScheduleId);
            const ruleTrainScheduleId = getPrimaryId(rule?.trainSchedule, rule?.trainScheduleId);
            if (rowTrainScheduleId != null && ruleTrainScheduleId != null && String(rowTrainScheduleId) !== String(ruleTrainScheduleId)) {
                return false;
            }

            const rowTrainId = getPrimaryId(row?.train, row?.trainId);
            const ruleTrainId = getPrimaryId(rule?.train, rule?.trainId);
            if (rowTrainId != null && ruleTrainId != null && String(rowTrainId) !== String(ruleTrainId)) {
                return false;
            }

            const rowWagonId = getPrimaryId(row?.wagon, row?.wagonId);
            const ruleWagonId = getPrimaryId(rule?.wagon, rule?.wagonId);
            if (rowWagonId != null && ruleWagonId != null && String(rowWagonId) !== String(ruleWagonId)) {
                return false;
            }

            return true;
        });

        if (filteredRules.length === 0) {
            return [];
        }

        const sortedRules = [...filteredRules].sort((a, b) => {
            const fromOrderDiff = (getOrderValue(a?.from) ?? Number.POSITIVE_INFINITY) - (getOrderValue(b?.from) ?? Number.POSITIVE_INFINITY);
            if (fromOrderDiff !== 0) return fromOrderDiff;

            const fromNameDiff = getStationName(a?.from).localeCompare(getStationName(b?.from));
            if (fromNameDiff !== 0) return fromNameDiff;

            const toOrderDiff = (getOrderValue(a?.to) ?? Number.POSITIVE_INFINITY) - (getOrderValue(b?.to) ?? Number.POSITIVE_INFINITY);
            if (toOrderDiff !== 0) return toOrderDiff;

            const toNameDiff = getStationName(a?.to).localeCompare(getStationName(b?.to));
            if (toNameDiff !== 0) return toNameDiff;

            const stateDiff = (a?.state ?? 0) - (b?.state ?? 0);
            if (stateDiff !== 0) return stateDiff;

            return parseDateToNumber(a?.fromDate) - parseDateToNumber(b?.fromDate);
        });

        if (dynamicCount === 0) {
            // Если нет динамических колонок, исключаем колонку "seat" из colSpan
            const colSpanBeforeSeat = seatColumnIndex >= 0 ? seatColumnIndex : 1;
            const colSpanAfterSeat = seatColumnIndex >= 0 ? columns.length - seatColumnIndex - 1 : columns.length - 1;
            return sortedRules.map((rule, idx) => {
                const dateRange = formatRuleDateRange(rule?.fromDate, rule?.toDate);
                const statusLabel = getRuleStateStatus(rule?.state);
                return (
                <tr key={`${rowKey}-rule-${rule?.id || idx}`} className="bg-slate-50/40">
                    {colSpanBeforeSeat > 0 && (
                        <td colSpan={colSpanBeforeSeat} className="px-2 py-2 text-xs">
                            {idx === 0 && <span className="font-medium text-gray-600">Правила сегментов мест</span>}
                        </td>
                    )}
                    {/* Колонка "seat" пропущена - она уже объединена в основной строке */}
                    {colSpanAfterSeat > 0 && (
                        <td colSpan={colSpanAfterSeat} className="px-2 py-2 text-xs">
                            <div className="flex flex-col gap-1">
                                <div className="text-[11px] text-gray-600">
                                    {getRuleStateLabel(rule?.state)} · {getStationName(rule?.from)} → {getStationName(rule?.to)}
                                    {dateRange ? ` · ${dateRange}` : ''}
                                </div>
                                <div className="uppercase tracking-wide text-[10px] text-gray-500">{statusLabel}</div>
                            </div>
                        </td>
                    )}
                </tr>
                );
            });
        }

        const totalRules = sortedRules.length;
        
        // Разделяем baseSpan на части до и после колонки "seat"
        const baseSpanBeforeSeat = seatColumnIndex >= 0 && seatColumnIndex < baseColumnsCount 
            ? seatColumnIndex 
            : 0;
        const baseSpanAfterSeat = seatColumnIndex >= 0 && seatColumnIndex < baseColumnsCount 
            ? Math.max(baseColumnsCount - seatColumnIndex - 1, 0)
            : baseSpan;

        return sortedRules.map((rule, idx) => {
            const dynamicCells = buildDynamicCellsForRule(rule, `${rowKey}-rule-${idx}`, dynamicCount);

            return (
                <tr key={`${rowKey}-rule-${rule?.id || idx}`} className="bg-slate-50/40">
                    {idx === 0 && baseSpanBeforeSeat > 0 ? (
                        <td
                            colSpan={baseSpanBeforeSeat}
                            rowSpan={totalRules}
                            className="align-top px-2 py-2"
                        >
                            <div className="text-xs font-medium text-gray-600">Правила сегментов мест</div>
                            <div className="mt-1 text-[11px] text-gray-500">Всего правил: {totalRules}</div>
                        </td>
                    ) : null}
                    {/* Колонка "seat" пропущена - она уже объединена в основной строке */}
                    {idx === 0 && baseSpanAfterSeat > 0 ? (
                        <td
                            colSpan={baseSpanAfterSeat}
                            rowSpan={totalRules}
                            className="align-top px-2 py-2"
                        >
                        </td>
                    ) : null}
                    {dynamicCells}
                </tr>
            );
        });
    };

    // Кастомный рендер строки с объединенными ячейками
    const renderRowWithMergedCells = (row, columns, rowIndex) => {
        const segments = row?.segments || [];
        const reservationGroups = groupSegmentsByReservation(segments);
        const ticketGroups = groupSegmentsByTicket(segments);
        const rowKey = row?.id || row?.key || `row-${rowIndex}`;
        const ruleRows = renderRuleRows(row, columns, rowKey);
        
        // Подсчитываем количество строк правил для rowSpan колонки "Место"
        const rowSeatId = getPrimaryId(row?.seat, row?.seatId);
        const seatKey = rowSeatId != null ? String(rowSeatId) : '__null__';
        const candidateRules = [
            ...(ruleSegmentsBySeat[seatKey] || []),
            ...(seatKey === '__null__' ? [] : (ruleSegmentsBySeat['__null__'] || [])),
        ];
        const filteredRules = deduplicateRules(candidateRules).filter((rule) => {
            const ruleSeatId = getPrimaryId(rule?.seat, rule?.seatId);
            if (ruleSeatId != null && rowSeatId != null && String(ruleSeatId) !== String(rowSeatId)) {
                return false;
            }
            const rowTrainScheduleId = getPrimaryId(row?.trainSchedule, row?.trainScheduleId);
            const ruleTrainScheduleId = getPrimaryId(rule?.trainSchedule, rule?.trainScheduleId);
            if (rowTrainScheduleId != null && ruleTrainScheduleId != null && String(rowTrainScheduleId) !== String(ruleTrainScheduleId)) {
                return false;
            }
            const rowTrainId = getPrimaryId(row?.train, row?.trainId);
            const ruleTrainId = getPrimaryId(rule?.train, rule?.trainId);
            if (rowTrainId != null && ruleTrainId != null && String(rowTrainId) !== String(ruleTrainId)) {
                return false;
            }
            const rowWagonId = getPrimaryId(row?.wagon, row?.wagonId);
            const ruleWagonId = getPrimaryId(rule?.wagon, rule?.wagonId);
            if (rowWagonId != null && ruleWagonId != null && String(rowWagonId) !== String(ruleWagonId)) {
                return false;
            }
            return true;
        });
        const totalRules = filteredRules.length;
        const seatRowSpan = totalRules > 0 ? totalRules + 1 : 1;
        
        return (
            <Fragment key={rowKey}>
                <tr key={`${rowKey}-main`}>
                    {columns.map((column, columnIndex) => {
                    if (column.key === 'seat') {
                        // Колонка "Место" с вертикальным объединением
                        const value = row[column.key];
                        const seatNumber = column.render ? column.render(value, row) : value;
                        return (
                            <td
                                key={columnIndex}
                                rowSpan={seatRowSpan}
                                className="align-middle text-center border border-gray-300"
                                style={{ padding: '2px', verticalAlign: 'middle' }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <IconSeat className="w-8 h-8" />
                                    <span className="text-lg font-semibold text-slate-700">{seatNumber}</span>
                                </div>
                            </td>
                        );
                    }
                    if (column.key.startsWith('seg_')) {
                        // Для сегментных колонок
                        const pairKey = column.key.replace('seg_', '');
                        const pair = segmentPairs.find(p => p.key === pairKey);
                        
                        if (!pair) {
                            return <td key={columnIndex} style={{ padding: '2px' }}>—</td>;
                        }

                        const seg = segments.find(s => {
                            const fromId = s?.from?.id || s?.fromId;
                            const toId = s?.to?.id || s?.toId;
                            return fromId === pair.fromId && toId === pair.toId;
                        });

                        if (!seg) {
                            return <td key={columnIndex} style={{ padding: '2px' }}>—</td>;
                        }

                        const reservationId = seg.seatReservation?.id || seg.seatReservation || 'no-reservation';
                        const ticketId = seg.ticket?.id || seg.ticket || 'no-ticket';
                        
                        // Проверяем бронь
                        const reservationGroup = reservationGroups.find(g => g.reservationId === reservationId);
                        const isReservationMerged = reservationGroup && reservationGroup.segments.length > 1 && reservationId !== 'no-reservation';
                        
                        // Проверяем билет
                        const ticketGroup = ticketGroups.find(g => g.ticketId === ticketId);
                        const isTicketMerged = ticketGroup && ticketGroup.segments.length > 1 && ticketId !== 'no-ticket';
                        
                        // Приоритет: сначала бронь, потом билет
                        if (isReservationMerged) {
                            // Находим индекс первого сегмента этой группы в списке пар
                            const firstSegmentInGroup = reservationGroup.segments[0];
                            const firstPairIndex = segmentPairs.findIndex(p => {
                                const fromId = firstSegmentInGroup?.from?.id || firstSegmentInGroup?.fromId;
                                const toId = firstSegmentInGroup?.to?.id || firstSegmentInGroup?.toId;
                                return p.fromId === fromId && p.toId === toId;
                            });
                            
                            const currentPairIndex = segmentPairs.findIndex(p => p.key === pairKey);
                            
                            // Если это не первый сегмент в группе, скрываем ячейку
                            if (currentPairIndex !== firstPairIndex) {
                                return null;
                            }
                            
                            // Рендерим объединенную ячейку для брони
                            const bgColor = 'bg-orange-100 border-orange-300';
                            const title = `Объединенная бронь\nКоличество сегментов: ${reservationGroup.segments.length}\nОбщая цена: ${reservationGroup.totalPrice} ₽`;
                            
                            return (
                                <td 
                                    key={columnIndex} 
                                    colSpan={reservationGroup.segments.length} 
                                    style={{ padding: '2px' }}
                                >
                                    <div
                                        className={`${bgColor} border rounded text-xs font-medium text-center min-w-0 flex-shrink-0`}
                                        title={title}
                                    >
                                        {reservationGroup.totalPrice} ({reservationGroup.segments.length})
                                    </div>
                                </td>
                            );
                        } else if (isTicketMerged) {
                            // Находим индекс первого сегмента этой группы в списке пар
                            const firstSegmentInGroup = ticketGroup.segments[0];
                            const firstPairIndex = segmentPairs.findIndex(p => {
                                const fromId = firstSegmentInGroup?.from?.id || firstSegmentInGroup?.fromId;
                                const toId = firstSegmentInGroup?.to?.id || firstSegmentInGroup?.toId;
                                return p.fromId === fromId && p.toId === toId;
                            });
                            
                            const currentPairIndex = segmentPairs.findIndex(p => p.key === pairKey);
                            
                            // Если это не первый сегмент в группе, скрываем ячейку
                            if (currentPairIndex !== firstPairIndex) {
                                return null;
                            }
                            
                            // Рендерим объединенную ячейку для билета
                            const bgColor = 'bg-green-100 border-green-300';
                            const title = `Объединенный билет\nКоличество сегментов: ${ticketGroup.segments.length}\nОбщая цена: ${ticketGroup.totalPrice} ₽`;
                            
                            return (
                                <td 
                                    key={columnIndex} 
                                    colSpan={ticketGroup.segments.length} 
                                    style={{ padding: '2px' }}
                                >
                                    <div
                                        className={`${bgColor} border rounded text-xs font-medium text-center min-w-0 flex-shrink-0`}
                                        title={title}
                                    >
                                        {ticketGroup.totalPrice} ({ticketGroup.segments.length})
                                    </div>
                                </td>
                            );
                        } else {
                            // Обычная ячейка
                            return (
                                <td key={columnIndex} style={{ padding: '2px' }}>
                                    {renderPairCell(row, pair)}
                                </td>
                            );
                        }
                    } else {
                        // Для обычных колонок
                        const value = row[column.key];
                            return (
                                <td key={columnIndex} style={{ padding: '2px' }}>
                                    {column.render ? column.render(value, row) : value}
                                </td>
                            );
                        }
                    })}
                </tr>
                {ruleRows}
            </Fragment>
        );
    };
    return (
        <>
            <ResourceTable2
                resource={resource}
                resourceName={resourceActionPostfix}
                query={query}
                setQuery={setQuery}
                data={data}
                setData={setData}
                onMap={mapAndBuildPairs}
                filterMode={hideFilters ? "none" : "default"}
                sortMode={hideFilters ? "none" : "default"}
                hideDelete={true}
                fullHeight={fullHeight}
                isFetch={true}
                fetch={fetch}
                renderRows={(columns, renderCell, data, page, renderActions) => 
                    page.map((row, rowIndex) => renderRowWithMergedCells(row, columns, rowIndex))
                }
                columns={(() => {
                    const base = [
                        { key: 'id', title: 'Ид', isSortable: true },
                        ...(isWagonFiltered ? [] : [
                            { key: 'trainSchedule', title: 'Расписание', isSortable: true, render: (value) => value?.name },
                            { key: 'train', title: 'Поезд', isSortable: true, render: (value) => value?.name },
                            { key: 'wagon', title: 'Вагон', isSortable: true, render: (value) => value?.number }
                        ]),
                        { key: 'seat', title: 'Место', isSortable: true, render: (value) => value?.number },
                    ];

                    if (segmentPairs.length > 0) {
                        const dyn = segmentPairs.map(pair => ({
                            key: `seg_${pair.key}`,
                            title: pair.title,
                            isSortable: false,
                            style: { padding: '2px' },
                            renderHead: () => (
                                <div className="text-center leading-tight">
                                    {pair.title.split(' → ').map((part, index) => (
                                        <div key={index} className="text-xs">{part}</div>
                                    ))}
                                </div>
                            ),
                            render: (value, row) => renderPairCell(row, pair)
                        }));
                        return [...base, ...dyn];
                    }

                    return [...base, {
                        key: 'segments',
                        title: 'Сегменты',
                        isSortable: false,
                        style: { padding: '2px' },
                        render: (value, row) => {
                            const segments = row.segments || [];

                            if (segments.length === 0) {
                                return <span className="text-gray-400">Нет сегментов</span>;
                            }

                            return (
                                <div className="flex flex-wrap gap-1 max-w-md">
                                    {segments.map((segment, index) => {
                                        const hasReservation = segment.seatReservation?.id || segment.seatReservation;
                                        const hasTicket = segment.ticket?.id || segment.ticket;
                                        
                                        let bgColor = 'bg-blue-100 border-blue-300'; // по умолчанию синий (свободно)
                                        if (hasReservation) {
                                            bgColor = 'bg-orange-100 border-orange-300'; // оранжевый для брони
                                        } else if (hasTicket) {
                                            bgColor = 'bg-green-100 border-green-300'; // зеленый для билета
                                        }

                                        return (
                                            <div
                                                key={segment.id || index}
                                                className={`${bgColor} border rounded text-xs font-medium min-w-0 flex-shrink-0`}
                                                title={`${segment.from?.station?.name || segment.from?.name || 'От'} → ${segment.to?.station?.name || segment.to?.name || 'До'}\nЦена: ${segment.price || 0} ₽\nБилет: ${segment.ticket?.name || segment.ticket?.id || '-'}\nРезерв: ${segment.seatReservation?.name || segment.seatReservation?.id || '-'}`}
                                            >
                                                {(segment.from?.station?.name || segment.from?.name || 'От').substring(0, 3)} → {(segment.to?.station?.name || segment.to?.name || 'До').substring(0, 3)}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }
                    }];
                })()}
                filters={[
                    {
                        title: 'Ид',
                        key: 'id',
                    },
                    {
                        title: 'Price',
                        key: 'price',
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
                    {
                        title: 'TicketId',
                        key: 'ticketId',
                    },
                    {
                        title: 'SeatReservationId',
                        key: 'seatReservationId',
                    },
                ]}
                {...props}
            />
        </>
    )
}
