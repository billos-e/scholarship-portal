type FontResult = { className: string; variable: string; style: { fontFamily: string } };

function makeFont() {
  return (_opts?: unknown): FontResult => ({
    className: "",
    variable: "",
    style: { fontFamily: "" },
  });
}

export const Inter = makeFont();
export const Geist_Mono = makeFont();
export const Geist = makeFont();
export const Roboto_Mono = makeFont();
export const JetBrains_Mono = makeFont();

const handler: ProxyHandler<Record<string, unknown>> = {
  get: () => makeFont(),
};

export default new Proxy({}, handler);
