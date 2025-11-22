'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useResource from '@/hooks/useResource';
import IconStation from '@/components/icon/icon-map-pin';
import IconTrain from '@/components/icon/icon-credit-card';
import IconSchedule from '@/components/icon/icon-calendar';
import IconWagon from '@/components/icon/icon-box';
import IconTicket from '@/components/icon/icon-clipboard-text';
import IconReservation from '@/components/icon/icon-bookmark';
import IconTrendingUp from '@/components/icon/icon-trending-up';
import IconUsers from '@/components/icon/icon-users';
import Link from 'next/link';

const Home = () => {
    const router = useRouter();
    const [stats, setStats] = useState({
        stations: 0,
        trains: 0,
        schedules: 0,
        segments: 0,
        wagons: 0,
        reservations: 0,
        tickets: 0,
        loading: true
    });

    const [cachedSegments, setCachedSegments] = useState<number | null>(null);
    const [lastCacheTime, setLastCacheTime] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string>('');

    const dashboardResource = useResource('dashboard');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          router.replace('/auth/cover-login');
            return;
        }

        loadDashboardData();
      }, [router]);

    const loadDashboardData = async () => {
        try {
            // @ts-ignore
            const data = await dashboardResource.fetch('GET', '/statistics', null);
            
            if (!data) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            // Кешируем сегменты
            const segmentsTotal = data.segmentsCount || 0;
            const cachedValue = localStorage.getItem('cached_segments');
            const cachedTime = localStorage.getItem('cached_segments_time');
            
            if (cachedValue && cachedTime) {
                setCachedSegments(parseInt(cachedValue));
                setLastCacheTime(cachedTime);
            }
            
            localStorage.setItem('cached_segments', segmentsTotal.toString());
            const generatedTime = new Date(data.generatedAt).toLocaleString('ru-RU');
            localStorage.setItem('cached_segments_time', generatedTime);
            setGeneratedAt(generatedTime);

            setStats({
                stations: data.stationsCount || 0,
                trains: data.trainsCount || 0,
                schedules: data.schedulesCount || 0,
                segments: segmentsTotal,
                wagons: data.wagonModelsCount || 0,
                reservations: data.reservationsCount || 0,
                tickets: data.ticketsCount || 0,
                loading: false
            });
        } catch (error) {
            console.error('Ошибка загрузки данных дашборда:', error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const StatCard = ({ title, value, icon, link, subtitle }: any) => (
        <Link href={link}>
            <div className="group h-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 ease-out hover:-translate-y-1 hover:border-[#ff9900] hover:shadow-xl">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {title}
                        </p>
                        <div className="mt-3 text-3xl font-semibold text-[#1f2937]">
                            {value.toLocaleString('ru-RU')}
                        </div>
                        {subtitle ? (
                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                {subtitle}
                            </p>
                        ) : null}
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1f2937_0%,#253554_60%,#f47d1d_100%)] text-white shadow-lg">
                        {icon}
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#0073bb] opacity-0 transition group-hover:opacity-100">
                    Перейти
                    <span className="h-px w-6 bg-current"></span>
                </div>
            </div>
        </Link>
    );

    if (stats.loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f6fb] px-4 pb-16 pt-10 sm:px-6 lg:px-10">
            <section className="overflow-hidden rounded-[32px] bg-white shadow-[0_35px_65px_-25px_rgba(15,23,42,0.35)]">
                <div className="flex flex-col gap-10 px-8 py-10 lg:flex-row lg:px-12 lg:py-14">
                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">TicketCore Ядро: Оперативная БД</p>
                            <h1 className="mt-4 text-4xl font-semibold text-[#232f3e]">
                                Управление железнодорожной системой без хаоса
                            </h1>
                        </div>
                        <p className="text-base leading-7 text-slate-600">
                            Сводная панель, где сходятся ключевые показатели по станциям, вагонам, поездам и билетам. Все метрики обновлены: {generatedAt || new Date().toLocaleString('ru-RU')}.
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                            <span className="rounded-full bg-slate-100 px-4 py-2">Система бронирования</span>
                            <span className="rounded-full bg-slate-100 px-4 py-2">Инфраструктура</span>
                            <span className="rounded-full bg-slate-100 px-4 py-2">Аналитика</span>
                        </div>
                    </div>
                    <div className="relative w-full max-w-[360px] self-center overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#1c2a4c_50%,#f47d1d_100%)] px-8 py-10 text-white shadow-xl">
                        <div className="space-y-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Живые данные</p>
                            <div>
                                <div className="text-sm text-white/80">Активных станций</div>
                                <div className="mt-1 text-3xl font-semibold">{stats.stations.toLocaleString('ru-RU')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-white/80">Бронирований сегодня</div>
                                <div className="mt-1 text-3xl font-semibold">{stats.reservations.toLocaleString('ru-RU')}</div>
                            </div>
                            <div>
                                <div className="text-sm text-white/80">Конверсия в билеты</div>
                                <div className="mt-1 text-3xl font-semibold">
                                    {stats.reservations > 0 ? ((stats.tickets / stats.reservations) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.35),transparent_70%)]" />
                    </div>
                </div>
            </section>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Станции"
                    value={stats.stations}
                    icon={<IconStation className="w-8 h-8 text-white" />}
                    link="/stations"
                />
                <StatCard
                    title="Поезда"
                    value={stats.trains}
                    icon={<IconTrain className="w-8 h-8 text-white" />}
                    link="/trains"
                />
                <StatCard
                    title="Расписания"
                    value={stats.schedules}
                    icon={<IconSchedule className="w-8 h-8 text-white" />}
                    link="/trainSchedules"
                />
                <StatCard
                    title="Модели вагонов"
                    value={stats.wagons}
                    icon={<IconWagon className="w-8 h-8 text-white" />}
                    link="/wagons"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Сегменты мест"
                    value={stats.segments}
                    icon={<IconTrendingUp className="w-8 h-8 text-white" />}
                    link="/seatSegments"
                    subtitle={cachedSegments ? `Предыдущее значение: ${cachedSegments.toLocaleString('ru-RU')} (${lastCacheTime})` : ''}
                />
                <StatCard
                    title="Бронирования"
                    value={stats.reservations}
                    icon={<IconReservation className="w-8 h-8 text-white" />}
                    link="/seatReservations"
                />
                <StatCard
                    title="Билеты"
                    value={stats.tickets}
                    icon={<IconTicket className="w-8 h-8 text-white" />}
                    link="/tickets"
                />
            </div>

            <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1f2937]">Быстрый доступ</h2>
                        <p className="mt-1 text-sm text-slate-500">Выберите раздел для детального управления</p>
                    </div>
                    <button
                        onClick={loadDashboardData}
                        className="inline-flex items-center gap-2 rounded-full bg-[#ff9900] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#f29100] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9900]"
                    >
                        Обновить данные
                    </button>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {[
                        { name: 'Поезда', link: '/trains', icon: <IconTrain className="w-6 h-6" /> },
                        { name: 'Расписания', link: '/trainSchedules', icon: <IconSchedule className="w-6 h-6" /> },
                        { name: 'Билеты', link: '/tickets', icon: <IconTicket className="w-6 h-6" /> },
                        { name: 'Бронирования', link: '/seatReservations', icon: <IconReservation className="w-6 h-6" /> },
                        { name: 'Станции', link: '/stations', icon: <IconStation className="w-6 h-6" /> },
                        { name: 'Пользователи', link: '/users', icon: <IconUsers className="w-6 h-6" /> }
                    ].map((item, index) => (
                        <Link key={index} href={item.link}>
                            <div className="flex h-full flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center text-slate-600 shadow-sm transition hover:-translate-y-1 hover:border-[#ff9900] hover:text-[#ff9900] hover:shadow-lg">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f6fb] text-slate-500">
                                    {item.icon}
                                </span>
                                <div className="text-sm font-semibold">{item.name}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Эффективность бронирования</p>
                    <div className="mt-4 text-3xl font-semibold text-[#1f2937]">
                        {stats.schedules > 0 ? ((stats.reservations / stats.schedules) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        Показатель подтверждённых бронирований относительно расписаний.
                    </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Средняя загрузка вагонов</p>
                    <div className="mt-4 text-3xl font-semibold text-[#1f2937]">
                        {stats.wagons > 0 ? (stats.reservations / stats.wagons).toFixed(1) : 0}
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        Среднее количество резерваций на модель вагона за текущий период.
                    </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Конверсия в билеты</p>
                    <div className="mt-4 text-3xl font-semibold text-[#1f2937]">
                        {stats.reservations > 0 ? ((stats.tickets / stats.reservations) * 100).toFixed(1) : 0}%
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                        Доля бронирований, перешедших в оформленные билеты.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
