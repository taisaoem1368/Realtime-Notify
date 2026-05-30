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

      if (podfile.includes("SWIFT_VERSION_FIX_APPLIED")) {
        return config;
      }

      const swiftFixBlock = `
  # SWIFT_VERSION_FIX_APPLIED
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |cfg|
      cfg.build_settings['SWIFT_VERSION'] = '5.9'
      cfg.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
      existing = cfg.build_settings['OTHER_CFLAGS'] || '$(inherited)'
      unless existing.include?('-Wno-unknown-attributes')
        cfg.build_settings['OTHER_CFLAGS'] = "#{existing} -Wno-unknown-attributes"
      end
    end
  end
`;

      if (podfile.includes("post_install do |installer|")) {
        podfile = podfile.replace(
          "post_install do |installer|",
          `post_install do |installer|\n${swiftFixBlock}`
        );
      } else {
        podfile += `\npost_install do |installer|\n${swiftFixBlock}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};
