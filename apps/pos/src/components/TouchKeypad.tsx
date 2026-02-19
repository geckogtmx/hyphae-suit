import React from 'react';
import { Eraser, Delete, ArrowRight } from 'lucide-react';

interface TouchKeypadProps {
    onInput: (char: string) => void;
    onClear: () => void;
    onBackspace: () => void;
    onSubmit: () => void;
    submitDisabled?: boolean;
    themeColor?: 'lime' | 'yellow' | 'blue';
}

const KEYBOARD_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const KEYBOARD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const TouchKeypad: React.FC<TouchKeypadProps> = ({
    onInput,
    onClear,
    onBackspace,
    onSubmit,
    submitDisabled = false,
    themeColor = 'lime'
}) => {
    const themeClasses = {
        lime: {
            active: 'active:bg-lime-400/20 active:border-lime-400',
            submit: 'bg-lime-500 hover:bg-lime-400 text-zinc-50', // lime-500 is teal, zinc-50 is dark jet
        },
        yellow: {
            active: 'active:bg-yellow-400/20 active:border-yellow-400',
            submit: 'bg-yellow-400 hover:bg-yellow-300 text-zinc-50',
        },
        blue: {
            active: 'active:bg-blue-400/20 active:border-blue-400',
            submit: 'bg-blue-400 hover:bg-blue-300 text-zinc-50',
        }
    };

    const currentTheme = themeClasses[themeColor];

    return (
        <div className="w-full">
            <div className="grid grid-cols-5 gap-2 mb-4 font-mono">
                {KEYBOARD_NUMBERS.map((key) => (
                    <button
                        key={key}
                        onClick={() => onInput(key)}
                        className={`h-14 bg-zinc-50 border border-zinc-200 rounded-lg text-2xl font-black text-zinc-900 shadow-lg transition-all ${currentTheme.active}`}
                    >
                        {key}
                    </button>
                ))}
            </div>

            <div className="bg-zinc-100 rounded-xl p-3 border border-zinc-200 mb-4">
                <div className="grid grid-cols-4 gap-2">
                    {KEYBOARD_LETTERS.map((key) => (
                        <button
                            key={key}
                            onClick={() => onInput(key)}
                            className={`h-12 bg-zinc-50 border border-zinc-200 rounded-lg text-xl font-black text-zinc-900 shadow-lg transition-all ${currentTheme.active}`}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={onClear}
                    className="bg-zinc-50 hover:bg-zinc-100 text-zinc-400 rounded-xl flex flex-col items-center justify-center py-3 transition-all border border-zinc-200 shadow-lg active:scale-95"
                >
                    <Eraser size={20} className="mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Clear</span>
                </button>
                <button
                    onClick={onBackspace}
                    className="bg-zinc-50 hover:bg-zinc-100 text-zinc-400 rounded-xl flex flex-col items-center justify-center py-3 transition-all border border-zinc-200 shadow-lg active:scale-95"
                >
                    <Delete size={20} className="mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Back</span>
                </button>
                <button
                    onClick={onSubmit}
                    disabled={submitDisabled}
                    className={`rounded-xl font-black uppercase tracking-widest shadow-xl transition-all flex flex-col items-center justify-center py-3 border border-white/10 active:scale-[0.98] ${submitDisabled ? 'opacity-30 cursor-not-allowed bg-zinc-100 text-zinc-400' : currentTheme.submit}`}
                >
                    <ArrowRight size={20} className="mb-1" strokeWidth={3} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Go</span>
                </button>
            </div>
        </div>
    );
};

export default TouchKeypad;
