const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

module.exports = function withSwiftConcurrency(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfile = fs.readFileSync(podfilePath, "utf8");

      const swiftFixBlock = `
  # Fix Swift 6 strict concurrency errors in Expo/RN pods (Xcode 16)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |cfg|
      cfg.build_settings['SWIFT_VERSION'] = '5'
      cfg.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
    end
  end
`;

      if (podfile.includes("SWIFT_VERSION_FIX_APPLIED")) {
        // Already patched
        return config;
      }

      const marker = "# SWIFT_VERSION_FIX_APPLIED\n";

      if (podfile.includes("post_install do |installer|")) {
        // Inject into existing post_install block
        podfile = podfile.replace(
          "post_install do |installer|",
          `post_install do |installer|\n${marker}${swiftFixBlock}`
        );
      } else {
        // No post_install block — append one
        podfile += `\npost_install do |installer|\n${marker}${swiftFixBlock}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};
