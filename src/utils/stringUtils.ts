/**
 * 字符串工具函数集合
 */

/**
 * 将字符串的首字母转为大写
 * @param str 输入字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 将连字符格式的字符串转换为标题格式
 * 例如: "hello-world" -> "Hello World"
 * @param str 输入字符串
 * @returns 标题格式的字符串
 */
export function slugToTitle(str: string): string {
  if (!str) return str;
  return str
    .split('-')
    .map(capitalize)
    .join(' ');
}

/**
 * 将标题格式的字符串转换为连字符格式(slug)
 * 例如: "Hello World" -> "hello-world"
 * @param str 输入字符串
 * @returns slug格式的字符串
 */
export function titleToSlug(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}