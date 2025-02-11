// Entrypoint for type "rust" builds, after "wrangler build" has run
import assert from "assert";
import { promises as fs } from "fs";
import path from "path";

(async () => {
  // 1. Load package.json file generated by wasm-bindgen containing filenames
  const pkg: { files: string[] } = JSON.parse(
    await fs.readFile(path.join("pkg", "package.json"), "utf8")
  );

  // 2. Concatenate wasm-bindgen glue and worker code into worker/generated/script.js
  const glueName = pkg.files.find((file) => file.endsWith(".js"));
  assert(glueName);
  const glueCode = await fs.readFile(path.join("pkg", glueName), "utf8");
  const code = await fs.readFile(path.join("worker", "worker.js"), "utf8");
  const generatedDir = path.join("worker", "generated");
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(
    path.join(generatedDir, "script.js"),
    `${glueCode} ${code}`,
    "utf8"
  );

  // 3. Copy *_bg.wasm file into worker/generated/script.wasm
  const wasmName = pkg.files.find((file) => file.endsWith(".wasm"));
  assert(wasmName);
  await fs.copyFile(
    path.join("pkg", wasmName),
    path.join(generatedDir, "script.wasm")
  );
})();
