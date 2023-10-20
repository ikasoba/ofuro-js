import { context } from "esbuild/mod.js";
import { copy } from "esbuild-plugin-copy/";
import { denoPlugins } from "esbuild_deno_loader/mod.ts";
import * as path from "path/mod.ts";
import * as fs from "fs/mod.ts";

const resolve = (x: string) => path.toFileUrl(path.resolve(x)).toString();

const glob = async (pattern: string) => {
  const res = [];

  for await (const item of fs.expandGlob(pattern)) {
    res.push(path.toFileUrl(item.path).toString());
  }

  return res;
};

const ctx = await context({
  entryPoints: [resolve("./src/main.tsx")],
  bundle: true,
  minify: true,
  sourcemap: "inline",
  jsx: "automatic",
  jsxImportSource: "easy-js",
  outdir: ".out/",
  plugins: [
    ...denoPlugins({ configPath: path.resolve("./deno.json") }),
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["src/index.html", "src/no_image.jpg"],
        to: [".out/"],
      },
    }),
  ],
});

console.log("http://localhost:3000/");

await ctx.serve({
  port: 3000,
  servedir: ".out/",
});
