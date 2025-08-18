import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
                {/* Floating Elements */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Glass Morphism Container */}
            <div className="relative w-full max-w-md z-10">
                <div className="backdrop-blur-xl bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-6">
                            <Link href={route('home')} className="flex flex-col items-center gap-3 font-medium group">
                                <div className="relative mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <AppLogoIcon className="size-10 fill-current text-white" />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-3 text-center">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{title}</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
