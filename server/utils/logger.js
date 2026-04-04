import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

const ensureLogDir = () => {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
};

export const logJson = (level, msg, meta = {}) => {
  const record = {
    time: new Date().toISOString(),
    level,
    msg,
    ...meta
  };

  const line = JSON.stringify(record) + "\n";

  // Console
  console.log(line.trimEnd());

  // File
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, line, { encoding: "utf8" });
  } catch (e) {
    // avoid crashing the app if logging fails
    console.error(
      JSON.stringify({
        time: new Date().toISOString(),
        level: "error",
        msg: "Failed to write log file",
        error: e?.message
      })
    );
  }
};