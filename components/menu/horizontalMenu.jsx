import IconCaretDown from '@/components/icon/icon-caret-down';
import Link from 'next/link';
import { getTranslation } from '@/i18n';
import useUser from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

const HorizontalMenu = () => {
    const { t, i18n } = getTranslation();
    const { logout } = useUser();
    const router = useRouter();

    const menuSurfaceStyle = {
        backgroundImage:
            'linear-gradient(135deg,#0f172a 0%,#1c2a4c 52%,#f47d1d 108%), radial-gradient(circle at 88% 12%, rgba(255,200,120,0.55), transparent 58%), radial-gradient(circle at 0% 100%, rgba(91,132,255,0.45), transparent 60%)',
        backgroundSize: 'cover',
        boxShadow: '0 28px 55px -25px rgba(10,18,40,0.85)',
        border: '1px solid rgba(255,255,255,0.16)',
    };

    const submenuSurfaceStyle = {
        backgroundImage:
            'linear-gradient(145deg, rgba(11,19,38,0.92) 0%, rgba(28,42,76,0.94) 50%, rgba(244,125,29,0.88) 120%)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 28px 55px -25px rgba(10,18,40,0.85)',
    };

    const navLinkClass = 'nav-link px-3 py-2 rounded-lg transition-colors hover:bg-white/15 text-white/85 hover:text-white [&.active]:bg-white/20 [&.active]:text-white [&_a.active]:!text-white';

    return <>
        <ul
            className="horizontal-menu hidden relative isolate rounded-3xl text-white font-semibold px-8 py-3 rtl:space-x-reverse lg:flex lg:space-x-2 xl:space-x-7 [&_a]:text-white/85 [&_a:hover]:text-white"
            style={menuSurfaceStyle}
        >
            <li className="menu nav-item relative">
                <button type="button" className={navLinkClass}>
                    <div className="flex items-center">
                        <Link href="/">Главная</Link>
                    </div>
                </button>
            </li>

            <li className="menu nav-item relative">
                <button type="button" className={navLinkClass}>
                    <div className="flex items-center">
                        <span className="px-1">Управление сегментами</span>
                    </div>
                    <div className="right_arrow">
                        <IconCaretDown />
                    </div>
                </button>
                <ul
                    className="sub-menu rounded-2xl text-white/95 p-2 [&_li]:min-w-[220px] [&_a]:block [&_a]:px-3 [&_a]:py-2 [&_a]:rounded-lg [&_a]:text-white/90 [&_a:hover]:bg-white/20 [&_a:hover]:text-white [&_a.active]:bg-white/25"
                    style={submenuSurfaceStyle}
                >
                    <li>
                        <Link href="/seatSegments">Сегменты мест</Link>
                    </li>
                    <li>
                        <Link href="/seatCountSegments">Количество сегментов мест</Link>
                    </li>
                    <li>
                        <Link href="/seatRuleSegments">Правила сегментов мест</Link>
                    </li>
                </ul>
            </li>
            <li className="menu nav-item relative">
                <button type="button" className={navLinkClass}>
                    <div className="flex items-center">
                        <span className="px-1">Администрирование</span>
                    </div>
                    <div className="right_arrow">
                        <IconCaretDown />
                    </div>
                </button>
                <ul
                    className="sub-menu rounded-2xl text-white/95 p-2 [&_li]:min-w-[220px] [&_a]:block [&_a]:px-3 [&_a]:py-2 [&_a]:rounded-lg [&_a]:text-white/90 [&_a:hover]:bg-white/20 [&_a:hover]:text-white [&_a.active]:bg-white/25"
                    style={submenuSurfaceStyle}
                >
                    <li>
                        <Link href="/users">Пользователи</Link>
                    </li>
                </ul>
            </li>
            <li className="menu nav-item relative">
                <button type="button" className={navLinkClass} onClick={() => {
                    logout();
                    router.replace('/auth/cover-login');
                }}>
                    <div className="flex items-center">
                        <span className="px-1">Выход</span>
                    </div>
                </button>
            </li>
        </ul>
    </>
}
export default HorizontalMenu;
