const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

module.exports = function withNetworkSecurityConfig(config) {
  // 1) Copy the XML into the generated android project during prebuild
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      const src = path.join(projectRoot, "network_security_config.xml");
      const destDir = path.join(
        projectRoot,
        "android",
        "app",
        "src",
        "main",
        "res",
        "xml"
      );
      const dest = path.join(destDir, "network_security_config.xml");

      if (!fs.existsSync(src)) {
        throw new Error(
          `Missing ${src}. Create network_security_config.xml at project root.`
        );
      }

      ensureDirSync(destDir);
      fs.copyFileSync(src, dest);

      return config;
    },
  ]);

  // 2) Wire it into AndroidManifest
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    if (!application) return config;

    application.$["android:usesCleartextTraffic"] = "false";
    application.$["android:networkSecurityConfig"] = "@xml/network_security_config";

    return config;
  });
};
