const fs = require("fs");
const ipfsAPI = require("ipfs-http-client");
const { Buffer } = require("buffer");

const ipfs = ipfsAPI({ host: "localhost", port: "5001", protocol: "http" });

const main = async () => {
  const allAssets = {};

  const artwork = JSON.parse(fs.readFileSync("./artwork.json").toString());

  for (const key in artwork) {
    const stringJSON = JSON.stringify(artwork[key]);
    const buf = Buffer.from(stringJSON, "utf-8");
    const upload = await ipfs.add(buf);
    allAssets[upload[0].path] = artwork[key];
  }

  console.log("\n Injecting assets into the frontend...");
  const finalAssetFile = "export default " + JSON.stringify(allAssets) + "";
  const assetsDir = __dirname + "/../src/assets";
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
  fs.writeFileSync(assetsDir + "/assets.ts", finalAssetFile);
  fs.writeFileSync("../uploaded.json", JSON.stringify(allAssets));
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
