const { spawn } = require("child_process");

async function run(cmd, args) {
  return new Promise((resolve, reject) => {
    // Execute from the backend directory to resolve relative test scripts correctly
    const p = spawn(cmd, args, {
      cwd: __dirname,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    p.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${cmd} ${args.join(" ")} exit ${code}`)),
    );
  });
}

(async () => {
  try {
    console.log("== Hotels ==");
    await run("node", ["run-hotel-crud.js"]);

    console.log("== Promotions ==");
    await run("node", ["run-promotion-crud.js"]);

    console.log("== Attractions ==");
    await run("node", ["run-attraction-crud.js"]);

    console.log("== Tickets ==");
    await run("node", ["run-ticket-crud.js"]);

    console.log("All smoke tests passed.");
    process.exit(0);
  } catch (e) {
    console.error("Smoke tests failed:", e.message);
    process.exit(1);
  }
})();
