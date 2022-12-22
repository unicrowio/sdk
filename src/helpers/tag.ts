/**
 * Helper to create tags <html> in declarative way
 * @returns HTMLElementTagNameMap by tag name
 */
export function tag<tag extends keyof HTMLElementTagNameMap>(tagHtmlName: tag) {
  return document.createElement(tagHtmlName) as HTMLElementTagNameMap[tag];
}
