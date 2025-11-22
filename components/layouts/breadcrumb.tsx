'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import IconHome from '@/components/icon/icon-home';
import IconArrowForward from '@/components/icon/icon-arrow-forward';
import { useEffect, useState } from 'react';
import useResource from '@/hooks/useResource';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

const Breadcrumb = () => {
    const pathname = usePathname();
    const [trainName, setTrainName] = useState<string | null>(null);
    const trainsResource = useResource('trains');

    // Загружаем имя поезда, если мы на странице расписания
    useEffect(() => {
        const match = pathname.match(/^\/trainSchedules\/(\d+)/);
        if (match) {
            const trainId = parseInt(match[1]);
            const loadTrainName = async () => {
                try {
                    const train = await trainsResource.get(trainId);
                    if (train) {
                        setTrainName(train.name || `Поезд ${train.id}`);
                    }
                } catch (error) {
                    console.error('Error loading train name:', error);
                    setTrainName(null);
                }
            };
            loadTrainName();
        } else {
            setTrainName(null);
        }
    }, [pathname]);

    const breadcrumbItems = (() => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const items: BreadcrumbItem[] = [
            { label: 'Главная', href: '/' }
        ];

        if (pathSegments.length === 0) {
            return items;
        }

        // Маппинг путей к читаемым названиям
        const pathLabels: Record<string, string> = {
            'routes': 'Маршруты',
            'routeStations': 'Станции маршрута',
            'trains': 'Поезда',
            'stations': 'Станции',
            'railwayStations': 'Железнодорожные станции',
            'trainSchedules': 'Расписание поездов',
            'users': 'Пользователи',
            'roles': 'Роли',
            'userRoles': 'Роли пользователей',
            'connections': 'Соединения',
            'depots': 'Депо',
            'railwaies': 'Железные дороги',
            'tickets': 'Билеты',
            'trainWagons': 'Вагоны поездов',
            'wagons': 'Вагоны',
            'seats': 'Места',
            'seatTypes': 'Типы мест',
            'seatReservations': 'Бронирования мест',
            'seatCountReservations': 'Количество бронирований мест',
            'seatSegments': 'Сегменты мест',
            'seatCountSegments': 'Количество сегментов мест',
            'tarifications': 'Тарификация',
            'baseFares': 'Базовые тарифы',
            'seasons': 'Сезоны',
            'seatTariffHistories': 'История тарифов мест',
            'seatTariffs': 'Тарифы мест',
            'trainCategories': 'Категории поездов',
            'wagonClasses': 'Классы вагонов'
        };

        let currentPath = '';
        for (let i = 0; i < pathSegments.length; i++) {
            currentPath += `/${pathSegments[i]}`;
            const segment = pathSegments[i];
            let label = pathLabels[segment] || segment;

            // Специальная обработка для ID поезда в trainSchedules
            if (i === 1 && pathSegments[0] === 'trainSchedules' && /^\d+$/.test(segment)) {
                // Это ID поезда
                label = trainName || segment;
            }

            // Последний элемент не должен быть ссылкой
            const isLast = i === pathSegments.length - 1;
            items.push({
                label,
                href: isLast ? undefined : currentPath
            });
        }

        return items;
    })();

    return (
        <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 px-6 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <IconHome className="h-4 w-4" />
            {breadcrumbItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                    <IconArrowForward className="h-4 w-4" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumb;
