import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
            exclude: [
                '**/node_modules/**',
                '**/dist/**',
                '**/.turbo/**',
                '**/coverage/**',
                '**/*.config.{ts,js}',
                '**/*.d.ts',
            ],
        },
    },
});
