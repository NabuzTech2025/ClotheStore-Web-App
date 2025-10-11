import fs from "fs";
import packageJson from "./package.json";

const appVersion = packageJson.version;
const buildTime = new Date().getTime();

const jsonData = {
  version: appVersion,
  buildTime: buildTime,
};

const jsonContent = JSON.stringify(jsonData);

fs.writeFile("./public/meta.json", jsonContent, "utf8", function (err) {
  if (err) {
    console.log("Error writing meta.json");
    return console.log(err);
  }
  console.log(`meta.json created with version ${appVersion}`);
});
