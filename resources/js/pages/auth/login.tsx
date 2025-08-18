import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <Form method="post" action={route('login')} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="backdrop-blur-sm bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/15"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink 
                                            href={route('password.request')} 
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200" 
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="backdrop-blur-sm bg-white/50 dark:bg-white/10 border-white/30 dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/15"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none"></div>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 py-2">
                                <Checkbox 
                                    id="remember" 
                                    name="remember" 
                                    tabIndex={3}
                                    className="rounded-md border-white/30 dark:border-white/20 bg-white/50 dark:bg-white/10 backdrop-blur-sm"
                                />
                                <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                                    Remember me for 30 days
                                </Label>
                            </div>

                            <Button 
                                type="submit" 
                                className="relative mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                                tabIndex={4} 
                                disabled={processing}
                            >
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent"></div>
                                <div className="relative flex items-center justify-center gap-2">
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    {processing ? 'Signing in...' : 'Sign in to your account'}
                                </div>
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Don't have an account?{' '}
                                <TextLink 
                                    href={route('register')} 
                                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                                    tabIndex={5}
                                >
                                    Create one now
                                </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-6 p-4 text-center text-sm font-medium text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-900/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 rounded-xl">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
