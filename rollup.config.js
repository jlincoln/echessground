import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/echessground.js',
      format: 'iife',
      name: 'Echessground',
    },
    {
      file: 'dist/echessground.min.js',
      format: 'iife',
      name: 'Echessground',
      plugins: [
        terser({
          safari10: true,
        }),
      ],
    },
  ],
  plugins: [
    typescript(),
    commonjs({
      extensions: ['.js', '.ts'],
    }),
  ],
};
