import type { Options } from 'tsup'

export const tsup: Options = {
  target: 'node16',
  splitting: false,
  sourcemap: true,
  clean: true,
  entryPoints: ['src/*.ts', 'src/*.tsx'],
  outDir: 'lib',
  dts: true,
  minify: true
}
