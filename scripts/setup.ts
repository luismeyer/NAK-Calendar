import path from "path";
import { promisify } from "util";
import { exec as defaultExec } from "child_process";
import meow from "meow";
import fs from "fs";

import { Secrets } from "../src/typings";
import { requestUrl, fetch } from "../src/telegram";
import {
  MEETINGS,
  SECRETS,
  SECRETS_ENCRYPTED,
  MEETINGS_ENCRYPTED,
} from "../src/utils/constants";

const exec = promisify(defaultExec);

const cli = meow(
  `
    Usage
      $ setup [options]
    Options
      --passphrase, -p  Passphrase to decode secret files
`,
  {
    flags: {
      passphrase: {
        type: "string",
        alias: "p",
      },
    },
  }
);

const { passphrase } = cli.flags;
if (!passphrase) throw new Error("Missing flag: PASSPHRASE");

const start = () => {
  console.log("Setup app 🚀 \n");
  return Promise.resolve();
};

const decryptFilePath = (filepath: string, outputPath: string) => () => {
  console.log(`Decrypting ${filepath}...`);
  if (!fs.existsSync(filepath)) return Promise.resolve();

  return exec(
    `gpg --quiet --batch --yes --decrypt --passphrase="${passphrase}" --output ${outputPath} ${filepath}`
  ).then((result) => console.log("Result: ", result));
};

const readSecrets = () => {
  const secrets = fs.readFileSync(SECRETS);
  return JSON.parse(secrets.toString()) as Secrets;
};

const fetchSetWebhook = () => {
  console.log("Setting webhook...");

  const secrets = readSecrets();
  if (!secrets.token) throw new Error("Missing secret: TOKEN");

  const url = requestUrl(secrets.token, "setWebhook");
  return fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: `https://${secrets.domain}/bot`,
    }),
  }).then((res) => console.log("Result: ", res));
};

start()
  .then(decryptFilePath(MEETINGS_ENCRYPTED, MEETINGS))
  .then(decryptFilePath(SECRETS_ENCRYPTED, SECRETS))
  .then(fetchSetWebhook);