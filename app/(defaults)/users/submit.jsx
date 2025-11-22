'use client';

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";

import ResourceSubmit from "@/components/genA/resourceSubmit";
import HookForm from "@/components/genA/hookForm";
import FormField from "@/components/genA/FormField";
import useResource from "@/hooks/useResource";
import MultiLookup from "@/components/genA/multiLookup";
import { RoleIds, RoleNames } from "@/models/roleIds";

const FORM_SCHEMA = yup.object().shape({
    userName: yup.string().required("Поле обязательное*"),
    passwordHash: yup.string().required("Поле обязательное*"),
    isActive: yup.string().required("Поле обязательное*"),
    protectFromBruteforceAttempts: yup.string().required("Поле обязательное*"),
    fullName: yup.string().required("Поле обязательное*"),
    positionName: yup.string().required("Поле обязательное*"),
    roleId: yup.string().required("Поле обязательное*"),
});

export default function UserSubmit({show, setShow, resourceName, resource, resourceMode, resourceData, onResourceSubmitted, orientation, type}) {
    const [selectedRoles, setSelectedRoles] = useState([]);
    const rolesResource = useResource('roles');

    const defaultValues = useMemo(
        () => ({
            userName: resourceData?.userName || "",
            passwordHash: resourceData?.passwordHash || "",
            isActive: resourceData?.isActive ?? "",
            protectFromBruteforceAttempts: resourceData?.protectFromBruteforceAttempts ?? "",
            fullName: resourceData?.fullName || "",
            positionName: resourceData?.positionName || "",
            roleId: resourceData?.roleId ?? null,
        }),
        [resourceData]
    );

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

    const rolesData = useMemo(() => {
        return Object.entries(RoleIds)
            .filter(([key]) => key !== 'Undefined')
            .map(([key, id]) => ({
                id,
                name: RoleNames[id]
            }));
    }, []);

    const userNameLabel = watchValues?.userName || "Имя пользователя не задано";
    const fullNameLabel = watchValues?.fullName || "ФИО не указано";
    const isActiveLabel = watchValues?.isActive ? "Активен" : "Неактивен";
    const rolesLabel = selectedRoles.length > 0 
        ? selectedRoles.map(r => RoleNames[r.id] || r.name).join(", ") 
        : "Роли не назначены";

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
                    const payload = {
                        userName: formValues.userName ?? null,
                        passwordHash: formValues.passwordHash ?? null,
                        isActive: formValues.isActive ?? null,
                        protectFromBruteforceAttempts: formValues.protectFromBruteforceAttempts ?? null,
                        fullName: formValues.fullName ?? null,
                        positionName: formValues.positionName ?? null,
                        roleId: formValues.roleId ?? null,
                    };

                    Object.keys(payload).forEach((key) => {
                        if (payload[key] === undefined) {
                            delete payload[key];
                        }
                    });

                    if (resourceData?.id) {
                        payload.id = resourceData.id;
                    }

                    await handler(payload);
                })();
            }}
            size="5xl"
            submitButtonClass="btn btn-primary"
            closeButtonClass="btn btn-outline-secondary"
        >
            <HookForm methods={methods} data={resourceData}>
                <section className="space-y-8">
                    <HeroHeader
                        title={fullNameLabel !== "ФИО не указано" ? fullNameLabel : "Новый пользователь"}
                        mode={resourceMode}
                        metrics={[
                            { label: "Имя пользователя", value: userNameLabel },
                            { label: "Статус", value: isActiveLabel },
                            { label: "Роли", value: rolesLabel },
                        ]}
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        <SectionCard
                            title="Учетные данные"
                            description="Основная информация для входа в систему."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField 
                                    orientation="vertical"
                                    type="text" 
                                    name="userName" 
                                    label="*Имя пользователя" 
                                    value={watchValues?.userName} 
                                    placeholder="Введите имя пользователя"
                                    error={errors.userName?.message} 
                                    trigger={trigger} 
                                    onChange={(value) => setValue('userName', value, { shouldValidate: true })} 
                                    isValidated 
                                />
                                <FormField 
                                    orientation="vertical"
                                    type="text" 
                                    name="passwordHash" 
                                    label="*Хеш пароля" 
                                    value={watchValues?.passwordHash} 
                                    placeholder="Введите хеш пароля"
                                    error={errors.passwordHash?.message} 
                                    trigger={trigger} 
                                    onChange={(value) => setValue('passwordHash', value, { shouldValidate: true })} 
                                    isValidated 
                                />
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Контактные данные"
                            description="Персональная информация о пользователе."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField 
                                    orientation="vertical"
                                    type="text" 
                                    name="fullName" 
                                    label="*Ф.И.О" 
                                    value={watchValues?.fullName} 
                                    placeholder="Введите ФИО"
                                    error={errors.fullName?.message} 
                                    trigger={trigger} 
                                    onChange={(value) => setValue('fullName', value, { shouldValidate: true })} 
                                    isValidated 
                                />
                                <FormField 
                                    orientation="vertical"
                                    type="text" 
                                    name="positionName" 
                                    label="*Название должности" 
                                    value={watchValues?.positionName} 
                                    placeholder="Введите должность"
                                    error={errors.positionName?.message} 
                                    trigger={trigger} 
                                    onChange={(value) => setValue('positionName', value, { shouldValidate: true })} 
                                    isValidated 
                                />
                            </div>
                        </SectionCard>
                    </div>

                    <SectionCard
                        title="Настройки безопасности"
                        description="Параметры защиты и активности учетной записи."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField 
                                orientation="vertical"
                                type="boolean" 
                                name="isActive" 
                                label="*Активен ли пользователь" 
                                value={watchValues?.isActive} 
                                error={errors.isActive?.message} 
                                trigger={trigger} 
                                onChange={(value) => setValue('isActive', value, { shouldValidate: true })} 
                                isValidated 
                            />
                            <FormField 
                                orientation="vertical"
                                type="number" 
                                name="protectFromBruteforceAttempts" 
                                label="*Количество попыток входа" 
                                value={watchValues?.protectFromBruteforceAttempts} 
                                placeholder="Введите количество попыток"
                                error={errors.protectFromBruteforceAttempts?.message} 
                                trigger={trigger} 
                                onChange={(value) => setValue('protectFromBruteforceAttempts', value, { shouldValidate: true })} 
                                isValidated 
                            />
                        </div>
                    </SectionCard>

                    {(!resourceMode || resourceMode == 'create') && (
                        <SectionCard
                            title="Роли пользователя"
                            description="Назначьте роли для определения прав доступа."
                        >
                            <div className="space-y-4">
                                <MultiLookup 
                                    name="roles" 
                                    options={{
                                        table: {
                                            data: rolesData,
                                            setData: () => {},
                                            columns: [
                                                { key: 'id', title: 'Ид' },
                                                { key: 'name', title: 'Наименование' },
                                            ]
                                        },
                                        filters: [],
                                        selectionsTable: {
                                            columns: [
                                                { key: 'id', title: 'Ид' },
                                                { key: 'name', title: 'Наименование' },
                                            ]
                                        }
                                    }}
                                    value={selectedRoles.sort(function(a,b){
                                        return a.id - b.id;
                                    })}
                                    onChange={(value) => {
                                        setSelectedRoles(value || []);
                                    }}
                                />
                                {selectedRoles.length > 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Выбранные роли ({selectedRoles.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedRoles
                                                .sort((a, b) => a.id - b.id)
                                                .map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 shadow-sm"
                                                    >
                                                        {RoleNames[role.id] || role.name}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    <SummaryGrid
                        items={[
                            { title: "Имя пользователя", value: userNameLabel },
                            { title: "ФИО", value: fullNameLabel },
                            { title: "Должность", value: watchValues?.positionName || "Не указана" },
                            { title: "Статус", value: isActiveLabel },
                            { title: "Попытки входа", value: watchValues?.protectFromBruteforceAttempts || "Не задано" },
                            { title: "Роли", value: rolesLabel },
                        ]}
                    />
                </section>
            </HookForm>
        </ResourceSubmit>
    );
}

function HeroHeader({ title, mode, metrics }) {
    const badge = mode === "edit" ? "Редактирование" : "Новый пользователь";

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
                            Настройте параметры учетной записи пользователя. Система применит изменения сразу после сохранения.
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
