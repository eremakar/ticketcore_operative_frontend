import ComponentsAuthLoginForm from '@/components/auth/components-auth-login-form';
import LanguageDropdown from '@/components/language-dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Вход — Продажа ж/д билетов',
};

const CoverLogin = () => {
    return (
        <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
            <div className="flex min-h-screen flex-col">
                <header className="flex items-center justify-end gap-6 px-6 py-6 text-sm text-slate-600">
                    <Link href="/" className="hidden font-semibold text-slate-500 transition hover:text-[#ff9900] sm:inline">
                        Оставить отзыв
                    </Link>
                    {/* <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
                        <span>Multi-session disabled</span>
                        <IconCaretDown className="h-3 w-3 text-slate-400" />
                    </div> */}
                    <LanguageDropdown className="w-max" />
                </header>
                <main className="flex flex-1 items-center justify-center px-4 pb-12">
                    <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_35px_65px_-25px_rgba(15,23,42,0.45)] ring-1 ring-slate-200 lg:flex-row">
                        <section className="w-full px-6 py-10 sm:px-10 sm:py-12 lg:w-[55%] lg:py-16">
                            <Link href="/" className="inline-flex items-center gap-3">
                                <div className="relative h-8 w-24">
                                    <Image src="/assets/images/logo.svg" alt="passticket" fill sizes="96px" className="object-contain" />
                                </div>
                            </Link>
                            <div className="mt-10">
                                <ComponentsAuthLoginForm />
                            </div>
                            <p className="mt-8 text-center text-xs text-slate-400">
                                © {new Date().getFullYear()}. АО НК КТЖ "Главный вычислительный центр". Все права защищены.
                            </p>
                        </section>
                        <aside className="relative hidden w-full overflow-hidden lg:flex lg:w-[45%]">
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#1c2a4c_50%,#f47d1d_100%)]" />
                                <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top_right,rgba(255,200,120,0.85),transparent_55%)]" />
                                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_bottom_left,rgba(91,132,255,0.75),transparent_60%)]" />
                            </div>
                            <div className="relative z-10 flex flex-1 flex-col justify-between px-10 py-12 text-white">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/70">Платформа управления местами, вагонами, поездами, маршрутами</p>
                                    <h2 className="mt-5 text-3xl font-semibold leading-tight">
                                        TicketCore Ядро — просто и прозрачно
                                    </h2>
                                    {/* <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white">
                                        Подробнее
                                        <IconCaretDown className="h-3 w-3 -rotate-90" />
                                    </Link> */}
                                </div>
                                <div className="mt-12 flex justify-center">
                                    <svg
                                        viewBox="0 0 120 120"
                                        className="h-36 w-36 text-white/80"
                                        fill="none"
                                        role="img"
                                        aria-label="Friendly robot illustration"
                                    >
                                        <circle cx="60" cy="52" r="20" stroke="currentColor" strokeWidth="4" />
                                        <rect x="36" y="68" width="48" height="30" rx="14" stroke="currentColor" strokeWidth="4" />
                                        <circle cx="52" cy="52" r="5" fill="currentColor" />
                                        <circle cx="68" cy="52" r="5" fill="currentColor" />
                                        <path d="M60 32V42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                        <path d="M50 90H70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                        <path d="M32 82L20 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                        <path d="M88 82L100 90" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CoverLogin;
