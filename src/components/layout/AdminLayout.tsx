import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChartBarIcon, UsersIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const navigation = [
    { name: 'Metrics', href: '/admin', icon: ChartBarIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
];

export const AdminLayout: React.FC = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-white font-bold">SpireTrack Admin</span>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    {navigation.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={cn(
                                                    isActive
                                                        ? 'bg-slate-800 text-white'
                                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                                                    'px-3 py-2 rounded-md text-sm font-medium transition-colors'
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Link to="/app" className="text-slate-300 hover:text-white p-2 rounded-md">
                                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
