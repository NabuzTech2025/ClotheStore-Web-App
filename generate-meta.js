const fs = require("fs");
const packageJson = require("./package.json");

const jsonData = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
};

fs.writeFile("./public/meta.json", JSON.stringify(jsonData), "utf8", (err) => {
  if (err) {
    console.log("Error writing meta.json");
    return console.log(err);
  }
  console.log(`meta.json created with version ${packageJson.version}`);
});
