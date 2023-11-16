import ipfsAPI from "ipfs-http-client";
import chalk from "chalk";
import clearLine from "readline";

const { globSource } = ipfsAPI;

const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});
const ipfsGateway = "https://ipfs.io/ipfs/";
const addOptions = { pin: true };

const pushDirectoryToIPFS = async (path) => {
  try {
    const response = await ipfs.add(
      globSource(path, { recursive: true }),
      addOptions
    );
  } catch (e) {
    return {};
  }
};
