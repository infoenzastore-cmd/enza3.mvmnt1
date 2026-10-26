import { cpSync, mkdirSync } from 'node:fs';

mkdirSync('dist/prototype/assets', { recursive: true });
cpSync('prototype/assets', 'dist/prototype/assets', { recursive: true });
