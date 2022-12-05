/**
 * Helper to create tags <html> in declarative way
 * @param tagHtmlName
 * @returns HTMLElementTagNameMap by tag name
 */
export function tag<tag extends keyof HTMLElementTagNameMap>(tagHtmlName: tag) {
  return document.createElement(tagHtmlName) as HTMLElementTagNameMap[tag]
}
