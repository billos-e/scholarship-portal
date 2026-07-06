const noop = (..._args: unknown[]): unknown => undefined;

export const createReadStream = () => ({ pipe: noop, on: noop, read: noop });
export const createWriteStream = () => ({ write: noop, end: noop, on: noop });
export const existsSync = () => false;

export const mkdir = async () => undefined;
export const stat = async () => ({ isFile: () => false, isDirectory: () => false, size: 0 });
export const writeFile = async () => undefined;
export const readFile = async () => "";
export const readdir = async () => [] as string[];
export const unlink = async () => undefined;
export const access = async () => undefined;

export class Readable {
  static from() {
    return new Readable();
  }
  pipe() {
    return this;
  }
  on() {
    return this;
  }
}

export const randomBytes = (size = 16) => ({
  toString: (_enc?: string) => "0".repeat(size * 2),
});
export const randomUUID = () => "00000000-0000-0000-0000-000000000000";
export const createHash = () => ({
  update() {
    return this;
  },
  digest() {
    return "";
  },
});

export const join = (...parts: string[]) => parts.join("/");
export const resolve = (...parts: string[]) => parts.join("/");
export const dirname = (p: string) => p.split("/").slice(0, -1).join("/");
export const basename = (p: string) => p.split("/").pop() ?? "";
export const extname = (p: string) => {
  const b = basename(p);
  const i = b.lastIndexOf(".");
  return i > 0 ? b.slice(i) : "";
};

export const sep = "/";
export const posix = {
  join,
  resolve,
  dirname,
  basename,
  extname,
  sep: "/",
};

export const tmpdir = () => "/tmp";
export const homedir = () => "/home";

export default {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdir,
  stat,
  writeFile,
  readFile,
  readdir,
  unlink,
  access,
  Readable,
  randomBytes,
  randomUUID,
  createHash,
  join,
  resolve,
  dirname,
  basename,
  extname,
  sep,
  posix,
  tmpdir,
  homedir,
};
