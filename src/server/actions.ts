import childProcess from "child_process";
import { getAction, getRepl } from "./config";

export function performAction(actionId: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const action = getAction(actionId);
      const repl = `"${getRepl()}"`;

      console.log(action);

      const process = childProcess.exec(repl, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(`exec error: ${error}`);
        } else if (stderr) {
          console.error(`stderr: ${stderr}`);
          reject(`stderr: ${stderr}`);
        } else {
          resolve();
        }
      });

      if (!process.stdin) {
        console.error("stdin is null");
        reject("stdin is null");
        return;
      }

      process.stdin.end(`actions.${action}`);
    } catch (err) {
      console.error("Unexpected error in performAction:", err);
      reject(err);
    }
  });
}
