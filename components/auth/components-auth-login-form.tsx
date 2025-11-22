'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import useUser from '@/hooks/useUser';
import { Field } from '../genA/field';
import keycloak from '@/services/keycloak';

const ComponentsAuthLoginForm = () => {
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const isDisabled = !email || !password || !!emailError || loading;

    const loginAsync = async () => {
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.token) {
                router.replace('/');
            } else if (result.wrongLoginOrPassword) {
               setError("Неверный логин или пароль");
            } else {
                setError("Ошибка попробуйте еще раз");
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('Неизвестная ошибка авторизации');
            }
        } finally {
            setLoading(false);
        }
    }

    const loginWithSSO = async () => {
        try {
            setLoading(true);
            await keycloak.init({ onLoad: 'check-sso' });
            await keycloak.login({ redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined });
        } catch (e: unknown) {
            setError('Не удалось запустить SSO авторизацию');
        } finally {
            setLoading(false);
        }
    };

    const router = useRouter();
    const submitForm = async (e: any) => {
        e.preventDefault();
        if (!email) {
            setEmailError('Обязательное поле');
            return;
        }
        await loginAsync();
    };

    return (
        <form className="space-y-8" onSubmit={submitForm}>
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-[#232F3E]">Единая точка входа в систему</h1>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-500">i</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                    Войдите в систему, используя корпоративную учетную запись passticket.
                </p>
            </div>
            <div className="space-y-6">
                <div>
                    <label htmlFor="Email" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        Логин или email
                    </label>
                    <Field
                        id="Email"
                        type="text"
                        orientation="vertical"
                        options={{ type: 'text' }}
                        placeholder="Введите логин или email"
                        className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition focus:border-[#ff9900] focus:outline-none focus:ring-4 focus:ring-[#ff9900]/20"
                        value={email}
                        onChange={(value: string | null) => {
                            const nextValue = value ?? '';
                            setEmail(nextValue);
                            setEmailError(!nextValue ? 'Обязательное поле' : null);
                        }}
                        autoComplete="username"
                    />
                    {emailError ? (
                        <p className="mt-2 text-xs font-semibold text-red-500" role="alert" aria-live="polite">
                            {emailError}
                        </p>
                    ) : null}
                </div>
                <div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="Password" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                            Пароль
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#0073bb]">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border border-slate-300 text-[#ff9900] focus:ring-[#ff9900]"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                aria-label="Показать пароль"
                            />
                            <span className="select-none">Показать пароль</span>
                        </label>
                    </div>
                    <Field
                        id="Password"
                        type="text"
                        orientation="vertical"
                        options={{ type: showPassword ? 'text' : 'password' }}
                        placeholder="Введите пароль"
                        className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition focus:border-[#ff9900] focus:outline-none focus:ring-4 focus:ring-[#ff9900]/20"
                        value={password}
                        onChange={(value: string | null) => setPassword(value ?? '')}
                        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
                            setCapsLockOn(!!e.getModifierState && e.getModifierState('CapsLock'))
                        }
                        autoComplete="current-password"
                    />
                    {capsLockOn ? (
                        <p className="mt-2 text-xs font-semibold text-amber-500" role="status" aria-live="polite">
                            Включен CapsLock
                        </p>
                    ) : null}
                </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border border-slate-300 text-[#ff9900] focus:ring-[#ff9900]" />
                    <span>Запомнить меня</span>
                </label>
                <Link href="/auth/cover-register" className="font-semibold text-[#0073bb] hover:text-[#ff9900]">
                    Нужна помощь?
                </Link>
            </div>
            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" role="alert" aria-live="assertive">
                    {error}
                </div>
            ) : null}
            <div className="space-y-3">
                <button
                    type="submit"
                    disabled={isDisabled}
                    className={`flex w-full items-center justify-center rounded-md bg-[#ff9900] px-4 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9900] hover:bg-[#f29100] ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"></span>
                            Вход…
                        </span>
                    ) : (
                        'Войти'
                    )}
                </button>
                <button
                    type="button"
                    onClick={loginWithSSO}
                    className="flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#ff9900] hover:text-[#ff9900] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9900]"
                    disabled={loading}
                >
                    Войти через ЭЦП
                </button>
            </div>
        </form>
    );
};

export default ComponentsAuthLoginForm;
