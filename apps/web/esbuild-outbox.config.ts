import esbuild from "esbuild";

// Build the outbox kafka consumer
esbuild
  .build({
    entryPoints: ["kafka-consumer/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "dist/outbox/index.js",
    sourcemap: true,
    minify: true,
  })
  .catch(() => process.exit(1));
