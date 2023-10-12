import { cleanEnv, port, str } from "envalid";
import * as process from "process";

function validateEnv() {
  cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ["development", "production"],
    }),
    MONGO_PASSWORD: str(),
    MONGO_PATH: str(),
    MONGO_USER: str(),
    PORT: port({ default: 8000 }),
  });
}

export default validateEnv;
