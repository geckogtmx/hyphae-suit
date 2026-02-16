import React, { useState } from 'react';
import { Delete, User, Check, AlertCircle, Sun, Moon } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
    onLoginSuccess: (staff: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const { theme, toggleTheme } = useTheme();
    const [pin, setPin] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleNumClick = (num: number) => {
        if (pin.length < 4) {
            setPin((prev) => prev + num.toString());
            setError(null);
        }
    };

    const handleClear = () => {
        setPin('');
        setError(null);
    };

    const handleBackspace = () => {
        setPin((prev) => prev.slice(0, -1));
        setError(null);
    };

    const handleLogin = async () => {
        if (pin.length !== 4) {
            setError('PIN must be 4 digits');
            return;
        }

        setIsLoading(true);
        try {
            const result = await AuthService.loginWithPin(pin);
            if (result.success && result.staff) {
                onLoginSuccess(result.staff);
            } else {
                setError(result.error || 'Invalid PIN');
                setPin('');
            }
        } catch (err) {
            setError('System Error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 bg-white dark:bg-zinc-900 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-800 transition-all"
            >
                {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-lime-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-lime-500/30">
                        <span className="font-mono font-bold text-zinc-950 text-3xl">H</span>
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        HYPHAE<span className="text-lime-600 dark:text-lime-500">.POS</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2 uppercase tracking-widest font-mono">
                        Terminal Access
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl">
                    <div className="mb-8 relative">
                        <div className="h-16 bg-zinc-50 dark:bg-zinc-950 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden">
                            <div className="flex gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full transition-all duration-300 ${i < pin.length
                                            ? 'bg-lime-500 scale-100 shadow-[0_0_10px_rgba(132,204,22,0.8)]'
                                            : 'bg-zinc-300 dark:bg-zinc-800 scale-75'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        {error && (
                            <div className="absolute -bottom-6 left-0 right-0 text-center flex items-center justify-center text-red-500 text-xs font-bold uppercase tracking-wide animate-in slide-in-from-top-1">
                                <AlertCircle size={12} className="mr-1" /> {error}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumClick(num)}
                                className="h-20 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-lime-500 active:text-zinc-950 text-zinc-900 dark:text-white rounded-2xl text-2xl font-bold transition-all duration-100 shadow-sm dark:shadow-lg border border-zinc-200 dark:border-zinc-700/50"
                            >
                                {num}
                            </button>
                        ))}

                        <button
                            onClick={handleClear}
                            className="h-20 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-500/50 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-2xl flex items-center justify-center transition-all border border-zinc-200 dark:border-zinc-700/50"
                        >
                            C
                        </button>

                        <button
                            onClick={() => handleNumClick(0)}
                            className="h-20 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-lime-500 active:text-zinc-950 text-zinc-900 dark:text-white rounded-2xl text-2xl font-bold transition-all border border-zinc-200 dark:border-zinc-700/50"
                        >
                            0
                        </button>

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className={`h-20 rounded-2xl flex items-center justify-center transition-all border font-bold text-xl uppercase tracking-wider
                ${pin.length === 4
                                    ? 'bg-lime-500 text-zinc-950 hover:bg-lime-400 hover:scale-[1.02] shadow-[0_0_20px_rgba(132,204,22,0.4)] border-lime-400'
                                    : 'bg-zinc-200 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Check size={24} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
