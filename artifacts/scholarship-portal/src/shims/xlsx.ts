export const utils = {
  book_new: () => ({}),
  aoa_to_sheet: () => ({}),
  json_to_sheet: () => ({}),
  sheet_add_aoa: () => ({}),
  sheet_add_json: () => ({}),
  book_append_sheet: () => {},
  sheet_to_json: <T = unknown>() => [] as T[],
  sheet_to_csv: () => "",
  decode_range: () => ({ s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }),
  encode_range: () => "",
  encode_cell: () => "",
  decode_cell: () => ({ r: 0, c: 0 }),
};

export function read(..._args: unknown[]) {
  return { SheetNames: [] as string[], Sheets: {} as Record<string, unknown> };
}

export function readFile(..._args: unknown[]) {
  return { SheetNames: [] as string[], Sheets: {} as Record<string, unknown> };
}

export function write(..._args: unknown[]): unknown {
  return "";
}

export function writeFile(..._args: unknown[]): void {}

export default { utils, read, readFile, write, writeFile };
