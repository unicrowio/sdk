import type { Options } from 'tsup'

export const tsup: Options = {
  target: [
    'es2022',
    'chrome109',
    'firefox109',
  ],
  platform: 'neutral',
  splitting: true,
  sourcemap: true,
  format: 'cjs',
  treeshake: true,
  clean: true,
  entryPoints: ['src/*.ts', 'src/*.tsx'],
  outDir: 'lib',
  dts: true,
  minify: true,
  shims: true,
}
