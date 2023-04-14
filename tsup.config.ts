import type { Options } from 'tsup'

export const tsup: Options = {
  target: 'node18',
  splitting: false,
  sourcemap: true,
  clean: true,
  entryPoints: ['src/*.ts', 'src/*.tsx'],
  outDir: 'lib',
  dts: true,
  minify: true
}
