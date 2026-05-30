const { withDangerousMod, withXcodeProject } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

// Fix 1: Modify Podfile post_install to patch all pod targets
function withPodfileSwiftFix(config) {
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
      existing_cflags = cfg.build_settings['OTHER_CFLAGS'] || '$(inherited)'
      cfg.build_settings['OTHER_CFLAGS'] = "#{existing_cflags} -Wno-unknown-attributes"
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
}

// Fix 2: Patch main app Xcode project build settings
function withXcodeSwiftFix(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();

    Object.keys(configurations).forEach((key) => {
      const cfg = configurations[key];
      if (cfg && cfg.buildSettings) {
        const s = cfg.buildSettings;
        s.SWIFT_VERSION = "5.9";
        s.SWIFT_STRICT_CONCURRENCY = "minimal";
        const existing = s.OTHER_CFLAGS || "$(inherited)";
        if (!String(existing).includes("-Wno-unknown-attributes")) {
          s.OTHER_CFLAGS = `${existing} -Wno-unknown-attributes`;
        }
      }
    });

    return config;
  });
}

module.exports = function withSwiftConcurrency(config) {
  config = withPodfileSwiftFix(config);
  config = withXcodeSwiftFix(config);
  return config;
};
