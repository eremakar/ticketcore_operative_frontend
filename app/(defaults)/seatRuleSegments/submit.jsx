import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import ResourceSubmit from "@/components/genA/resourceSubmit";
import HookForm from "@/components/genA/hookForm";
import FormField from "@/components/genA/FormField";
import useResource from "@/hooks/useResource";
import { formatDate, formatDateTime } from "@/components/genA/functions/datetime";

const FORM_SCHEMA = yup.object().shape({
    fromDate: yup.string().required("Укажите дату начала"),
    toDate: yup.string().required("Укажите дату окончания"),
    state: yup
        .number()
        .typeError("Укажите статус (1 или 2)")
        .oneOf([1, 2], "Допустимы значения 1 или 2")
        .required("Укажите статус"),
    seatId: yup.mixed().required("Выберите место"),
    fromId: yup.mixed().required("Станция отправления обязательна"),
    toId: yup.mixed().required("Станция назначения обязательна"),
    trainId: yup.mixed().required("Укажите поезд"),
    wagonId: yup.mixed().required("Выберите вагон"),
    trainScheduleId: yup.mixed().required("Выберите расписание"),
});

const STATE_LABELS = {
    1: "Свободно",
    2: "Закрыто",
};

export default function SeatRuleSegmentSubmit({
    show,
    setShow,
    resourceName,
    resource,
    resourceMode,
    resourceData,
    onResourceSubmitted,
    relationData = null,
}) {
    const seatsResource = useResource("seats");
    const trainStationsResource = useResource("trainStations");
    const trainsResource = useResource("trains");
    const trainWagonsResource = useResource("trainWagons");
    const trainSchedulesResource = useResource("trainSchedules");

    const mergedData = useMemo(() => {
        const rel = relationData || {};
        const res = resourceData || {};
        const result = { ...rel, ...res };

        const pickId = (...values) => {
            for (const value of values) {
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
            return null;
        };

        const ensureEntity = (key) => {
            if (result[key] == null && rel[key] != null) {
                result[key] = rel[key];
            }
        };

        const ensureId = (idKey, entityKey, ...extraCandidates) => {
            const candidate = pickId(result[idKey], ...(extraCandidates || []), result[entityKey]?.id);
            if (candidate != null) {
                result[idKey] = candidate;
            }
        };

        ensureEntity("seat");
        ensureEntity("from");
        ensureEntity("to");
        ensureEntity("train");
        ensureEntity("wagon");
        ensureEntity("trainSchedule");
        ensureEntity("trainScheduleWorkflow");

        ensureId("seatId", "seat", res?.seatId, rel?.seatId);
        ensureId("fromId", "from", res?.fromId, rel?.fromId);
        ensureId("toId", "to", res?.toId, rel?.toId);
        ensureId("trainId", "train", res?.trainId, rel?.trainId);
        ensureId("wagonId", "wagon", res?.wagonId, rel?.wagonId, rel?.trainWagon?.wagonId);
        ensureId("trainWagonId", "trainWagon", res?.trainWagonId, rel?.trainWagonId);
        ensureId("trainScheduleId", "trainSchedule", res?.trainScheduleId, rel?.trainScheduleId);
        ensureId(
            "trainScheduleWorkflowId",
            "trainScheduleWorkflow",
            res?.trainScheduleWorkflowId,
            rel?.trainScheduleWorkflowId,
            rel?.scheduleworkflowId
        );

        result.trainWagonId = pickId(res?.trainWagonId, rel?.trainWagonId, result.trainWagonId);

        return result;
    }, [relationData, resourceData]);

    const defaultValues = useMemo(
        () => ({
            fromDate: mergedData?.fromDate || "",
            toDate: mergedData?.toDate || "",
            state: mergedData?.state ?? "",
            seatId: mergedData?.seatId ?? mergedData?.seat?.id ?? null,
            seat: mergedData?.seat ?? null,
            fromId: mergedData?.fromId ?? mergedData?.from?.id ?? null,
            from: mergedData?.from ?? null,
            toId: mergedData?.toId ?? mergedData?.to?.id ?? null,
            to: mergedData?.to ?? null,
            trainId: mergedData?.trainId ?? mergedData?.train?.id ?? null,
            train: mergedData?.train ?? null,
            wagonId: mergedData?.wagonId ?? mergedData?.wagon?.id ?? null,
            wagon: mergedData?.wagon ?? null,
            trainWagonId: mergedData?.trainWagonId ?? null,
            trainScheduleId: mergedData?.trainScheduleId ?? mergedData?.trainSchedule?.id ?? null,
            trainSchedule: mergedData?.trainSchedule ?? null,
            trainScheduleWorkflowId:
                mergedData?.trainScheduleWorkflowId ?? mergedData?.trainScheduleWorkflow?.id ?? null,
            trainScheduleWorkflow: mergedData?.trainScheduleWorkflow ?? null,
        }),
        [mergedData]
    );

    const trainStationsInitialQuery = useMemo(() => {
        if (!relationData?.trainScheduleWorkflowId) {
            return null;
        }

        return {
            paging: { skip: 0, take: 500 },
            filter: {
                trainScheduleWorkflowId: {
                    operand1: relationData.trainScheduleWorkflowId,
                    operator: "equals",
                },
            },
            sort: {
                order: { operator: "asc" },
            },
        };
    }, [relationData?.trainScheduleWorkflowId]);

    const methods = useForm({
        resolver: yupResolver(FORM_SCHEMA),
        mode: "onChange",
        defaultValues,
    });

    const {
        watch,
        setValue,
        trigger,
        formState: { errors },
        handleSubmit,
    } = methods;

    const watchValues = watch();

    const selectedWagonId = watchValues?.wagonId;

    const seatSelectInitialQuery = useMemo(() => {
        const relationWagonId =
            relationData?.wagonId ??
            relationData?.wagon?.id ??
            relationData?.trainWagon?.wagonId ??
            null;

        const effectiveWagonId = selectedWagonId ?? relationWagonId;

        if (!effectiveWagonId) {
            return null;
        }

        return {
            paging: { skip: 0, take: 500 },
            filter: {
                wagonId: {
                    operand1: effectiveWagonId,
                    operator: "equals",
                },
            },
            sort: {
                number: { operator: "asc" },
            },
        };
    }, [
        relationData?.trainWagon?.wagonId,
        relationData?.trainWagonId,
        relationData?.wagon?.id,
        relationData?.wagonId,
        selectedWagonId,
    ]);

    const intervalLabel =
        watchValues?.fromDate && watchValues?.toDate
            ? `${formatDateTime(watchValues.fromDate)} → ${formatDateTime(watchValues.toDate)}`
            : "Интервал не задан";

    const seatLabel = watchValues?.seat?.name || watchValues?.seat?.number || "Место не выбрано";
    const routeLabel =
        (watchValues?.from?.name || watchValues?.from?.station?.name || "") &&
        (watchValues?.to?.name || watchValues?.to?.station?.name || "")
            ? `${watchValues?.from?.name || watchValues?.from?.station?.name || ""} → ${
                  watchValues?.to?.name || watchValues?.to?.station?.name || ""
              }`
            : "Маршрут не выбран";
    const stateLabel = STATE_LABELS[watchValues?.state] || "Не указан";
    const wagonLabel = watchValues?.wagon?.name || "Без вагона";
    const trainLabel = watchValues?.train?.name || "Поезд не выбран";
    const trainScheduleLabel =
        formatDate(watchValues?.trainScheduleWorkflow?.date) ||
        watchValues?.trainSchedule?.name ||
        "Расписание не выбрано";

    const hasLockedTrain = Boolean(relationData?.trainId || relationData?.train);
    const hasLockedWagon = Boolean(relationData?.wagonId || relationData?.wagon || relationData?.trainWagonId);
    const hasLockedSchedule = Boolean(relationData?.trainScheduleId || relationData?.trainSchedule);
    const hasLockedFrom = Boolean(relationData?.fromId || relationData?.from);
    const hasLockedTo = Boolean(relationData?.toId || relationData?.to);

    return (
        <ResourceSubmit
            resource={resource}
            show={show}
            setShow={setShow}
            resourceName={resourceName}
            resourceMode={resourceMode}
            resourceData={resourceData}
            onResourceSubmitted={onResourceSubmitted}
            onSubmit={async (handler) => {
                await handleSubmit(async (formValues) => {
                    const toApiDateTime = (value) => {
                        if (!value) return null;
                        if (value instanceof Date) return value.toISOString();
                        const parsed = new Date(value);
                        return isNaN(parsed.getTime()) ? value : parsed.toISOString();
                    };

                    const payload = {
                        fromDate: toApiDateTime(formValues.fromDate),
                        toDate: toApiDateTime(formValues.toDate),
                        state: formValues.state != null ? Number(formValues.state) : null,
                        seatId: formValues.seatId ?? null,
                        fromId: formValues.fromId ?? null,
                        toId: formValues.toId ?? null,
                        trainId: formValues.trainId ?? null,
                        wagonId: formValues.trainWagonId ?? null,
                        trainScheduleId: formValues.trainScheduleId ?? null,
                        trainScheduleWorkflowId:
                            formValues.trainScheduleWorkflowId ??
                            mergedData?.trainScheduleWorkflowId ??
                            null,
                        request: formValues.request ?? mergedData?.request ?? null,
                    };

                    Object.keys(payload).forEach((key) => {
                        if (payload[key] === undefined) {
                            delete payload[key];
                        }
                    });

                    if (mergedData?.id) {
                        payload.id = mergedData.id;
                    }

                    await handler(payload);
                })();
            }}
            size="5xl"
            submitButtonClass="btn btn-primary"
            closeButtonClass="btn btn-outline-secondary"
        >
            <HookForm methods={methods} data={mergedData}>
                <section className="space-y-8">
                    <HeroHeader
                        title={seatLabel !== "Место не выбрано" ? `Правило для ${seatLabel}` : "Новое правило сегмента места"}
                        mode={resourceMode}
                        metrics={[
                            { label: "Интервал", value: intervalLabel },
                            { label: "Статус", value: stateLabel },
                            { label: "Маршрут", value: routeLabel },
                        ]}
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <SectionCard
                            title="Маршрут применения"
                            description="Определите станцию отправления и назначения, чтобы ограничить действие правила."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                            {hasLockedFrom ? (
                                <FormField
                                    orientation="vertical"
                                    type="label"
                                    name="from"
                                    label="Откуда"
                                    value={
                                        watchValues?.from?.station?.name ||
                                        watchValues?.from?.name ||
                                        "Не определена"
                                    }
                                />
                            ) : (
                                <FormField
                                    orientation="vertical"
                                    resource={trainStationsResource}
                                    type="resourceselect"
                                    name="fromId"
                                    label="*Откуда"
                                    value={watchValues?.fromId}
                                    error={errors.fromId?.message}
                                    trigger={trigger}
                                    placeholder="Выберите станцию"
                                    initialQuery={trainStationsInitialQuery || undefined}
                                    onChange={(value, original, mapped) => {
                                        setValue("fromId", value ?? null, { shouldValidate: true });
                                        setValue("from", mapped ?? original ?? null);
                                    }}
                                    labelMemberFunc={(row) => row?.station?.name}
                                    onRowChange={(row) => setValue("from", row ?? null)}
                                    isValidated
                                />
                            )}
                            {hasLockedTo ? (
                                <FormField
                                    orientation="vertical"
                                    type="label"
                                    name="to"
                                    label="Куда"
                                    value={
                                        watchValues?.to?.station?.name ||
                                        watchValues?.to?.name ||
                                        "Не определена"
                                    }
                                />
                            ) : (
                                <FormField
                                    orientation="vertical"
                                    resource={trainStationsResource}
                                    type="resourceselect"
                                    name="toId"
                                    label="*Куда"
                                    value={watchValues?.toId}
                                    error={errors.toId?.message}
                                    trigger={trigger}
                                    placeholder="Выберите станцию"
                                    initialQuery={trainStationsInitialQuery || undefined}
                                    onChange={(value, original, mapped) => {
                                        setValue("toId", value ?? null, { shouldValidate: true });
                                        setValue("to", mapped ?? original ?? null);
                                    }}
                                    labelMemberFunc={(row) => row?.station?.name}
                                    onRowChange={(row) => setValue("to", row ?? null)}
                                    isValidated
                                />
                            )}
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Интервал действия"
                            description="Определите временные границы, когда правило будет активно."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    orientation="vertical"
                                    type="datetime"
                                    name="fromDate"
                                    label="*Начало действия"
                                    value={watchValues?.fromDate}
                                    placeholder="Выберите дату"
                                    error={errors.fromDate?.message}
                                    trigger={trigger}
                                    onChange={(value) => setValue("fromDate", value, { shouldValidate: true })}
                                    isValidated
                                />
                                <FormField
                                    orientation="vertical"
                                    type="datetime"
                                    name="toDate"
                                    label="*Окончание действия"
                                    value={watchValues?.toDate}
                placeholder="Выберите дату"
                error={errors.toDate?.message}
                trigger={trigger}
                onChange={(value) => setValue("toDate", value, { shouldValidate: true })}
                isValidated
            />
            <FormField
                orientation="vertical"
                type="select"
                name="state"
                label="*Статус"
                value={watchValues?.state}
                options={[
                    { id: 1, name: "Свободно" },
                    { id: 2, name: "Закрыто" },
                ]}
                placeholder="Выберите статус"
                error={errors.state?.message}
                trigger={trigger}
                onChange={(value) => {
                    const parsed = value != null ? Number(value) : null;
                    setValue("state", parsed, { shouldValidate: true });
                }}
                isValidated
            />
                            </div>
                        </SectionCard>
                    </div>

                    <SectionCard
                        title="Привязка к объектам"
                        description="Выберите место и вагоны, на которые распространяется правило."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            {hasLockedSchedule ? (
                                <FormField
                                    orientation="vertical"
                                    type="label"
                                    name="trainSchedule"
                                    label="Расписание"
                                    value={trainScheduleLabel}
                                />
                            ) : (
                                <FormField
                                    orientation="vertical"
                                    resource={trainSchedulesResource}
                                    type="resourceselect"
                                    name="trainScheduleId"
                                    mode="portal"
                                    label="*Расписание"
                                    value={watchValues?.trainScheduleId}
                                    error={errors.trainScheduleId?.message}
                                    trigger={trigger}
                                    placeholder="Выберите расписание"
                                    onChange={(value, original, mapped) => {
                                        setValue("trainScheduleId", value ?? null, { shouldValidate: true });
                                        setValue("trainSchedule", mapped ?? original ?? null);
                                    }}
                                    onRowChange={(row) => setValue("trainSchedule", row ?? null)}
                                    isValidated
                                />
                            )}
                            {hasLockedTrain ? (
                                <FormField
                                    orientation="vertical"
                                    type="label"
                                    name="train"
                                    label="Поезд"
                                    value={watchValues?.train?.name || "Не определен"}
                                />
                            ) : (
                                <FormField
                                    orientation="vertical"
                                    resource={trainsResource}
                                    type="resourceselect"
                                    name="trainId"
                                    mode="portal"
                                    label="*Поезд"
                                    value={watchValues?.trainId}
                                    error={errors.trainId?.message}
                                    trigger={trigger}
                                    placeholder="Выберите поезд"
                                    onChange={(value, original, mapped) => {
                                        setValue("trainId", value ?? null, { shouldValidate: true });
                                        setValue("train", mapped ?? original ?? null);
                                    }}
                                    onRowChange={(row) => setValue("train", row ?? null)}
                                    isValidated
                                />
                            )}
                            {hasLockedWagon ? (
                                <FormField
                                    orientation="vertical"
                                    type="label"
                                    name="wagon"
                                    label="Вагон"
                                    value={watchValues?.wagon?.name || watchValues?.wagon?.number || "Не определен"}
                                />
                            ) : (
                                <FormField
                                    orientation="vertical"
                                    resource={trainWagonsResource}
                                    type="resourceselect"
                                    name="wagonId"
                                    mode="portal"
                                    label="*Вагон"
                                    value={watchValues?.wagonId}
                                    error={errors.wagonId?.message}
                                    trigger={trigger}
                                    placeholder="Выберите вагон"
                                    onChange={(value, original, mapped) => {
                                        setValue("wagonId", value ?? null, { shouldValidate: true });
                                        setValue("wagon", mapped ?? original ?? null);
                                    }}
                                    onRowChange={(row) => setValue("wagon", row ?? null)}
                                    isValidated
                                />
                            )}
                            <FormField
                                orientation="vertical"
                                resource={seatsResource}
                                type="resourceselect"
                                name="seatId"
                                mode="portal"
                                label="*Место"
                                value={watchValues?.seatId}
                                error={errors.seatId?.message}
                                trigger={trigger}
                                placeholder="Выберите место"
                                initialQuery={seatSelectInitialQuery || undefined}
                                onChange={(value, original, mapped) => {
                                    setValue("seatId", value ?? null, { shouldValidate: true });
                                    setValue("seat", mapped ?? original ?? null);
                                }}
                                onRowChange={(row) => setValue("seat", row ?? null)}
                                labelMemberFunc={(row) => row?.number}
                                isValidated
                            />
                        </div>
                    </SectionCard>

                    <SummaryGrid
                        items={[
                            { title: "Интервал", value: intervalLabel },
                            { title: "Статус", value: stateLabel },
                            { title: "Маршрут", value: routeLabel },
                            { title: "Поезд", value: trainLabel },
                            { title: "Вагон", value: wagonLabel },
                            { title: "Место", value: seatLabel },
                            { title: "Расписание", value: trainScheduleLabel },
                        ]}
                    />
                </section>
            </HookForm>
        </ResourceSubmit>
    );
}

function HeroHeader({ title, mode, metrics }) {
    const badge = mode === "edit" ? "Редактирование" : "Новое правило";

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900 text-white shadow-[0_28px_55px_-30px_rgba(15,23,42,0.65)]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_60%,#3b82f6_115%)]" />
            <div className="absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]" />
            <div className="absolute right-0 top-0 h-48 w-48 translate-x-10 -translate-y-12 bg-[radial-gradient(circle,rgba(96,165,250,0.35),transparent_65%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />

            <div className="relative z-10 grid gap-8 px-8 py-10 lg:grid-cols-[1.5fr_minmax(0,1fr)] lg:items-end">
                <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                        {badge}
                    </span>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
                        <p className="text-sm leading-6 text-white/75">
                            Настройте ограничения для конкретного места и интервала. Система применит правило сразу после сохранения.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {metrics.map((metric) => (
                        <div
                            key={metric.label}
                            className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-[0_18px_34px_-20px_rgba(15,23,42,0.55)] backdrop-blur-md"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_65%)] opacity-80" />
                            <div className="relative">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">{metric.label}</p>
                                <p className="mt-2 text-sm font-semibold leading-tight text-white/95">{metric.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SectionCard({ title, description, children }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-100">
            <div className="mb-4 space-y-1">
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function SummaryGrid({ items }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-5">
            <h4 className="mb-4 text-sm font-semibold text-slate-700">Итоговая сводка</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{item.title}</p>
                        <p className="mt-1 font-medium text-slate-700">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
