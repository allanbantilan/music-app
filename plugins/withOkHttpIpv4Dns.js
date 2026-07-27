/**
 * Config plugin: make React Native's okhttp resolve IPv4 first.
 *
 * On networks with broken/unroutable IPv6, okhttp tries the AAAA (IPv6)
 * address for a hostname and hangs (no fast Happy-Eyeballs fallback),
 * so every hostname fetch stalls while raw-IPv4 works. youtubei.js then
 * hangs in Innertube.create(). This installs a custom okhttp Dns that
 * returns IPv4 addresses first, falling back to IPv6 only when no IPv4
 * record exists — safe on healthy dual-stack networks.
 */
const { withMainApplication } = require("expo/config-plugins");

const IMPORTS = [
  "import com.facebook.react.modules.network.OkHttpClientProvider",
  "import okhttp3.Dns",
  "import java.net.Inet4Address",
  "import java.net.InetAddress",
];

const SNIPPET = `
    // ipv4-first DNS (see plugins/withOkHttpIpv4Dns.js): avoid hanging on dead IPv6
    OkHttpClientProvider.setOkHttpClientFactory {
      OkHttpClientProvider.createClientBuilder()
        .dns(object : Dns {
          override fun lookup(hostname: String): List<InetAddress> {
            val all = Dns.SYSTEM.lookup(hostname)
            val v4 = all.filterIsInstance<Inet4Address>()
            return if (v4.isNotEmpty()) v4 else all
          }
        })
        .build()
    }`;

module.exports = function withOkHttpIpv4Dns(config) {
  return withMainApplication(config, (cfg) => {
    let src = cfg.modResults.contents;

    for (const imp of IMPORTS) {
      if (!src.includes(imp)) {
        src = src.replace(/^(package .+)$/m, `$1\n${imp}`);
      }
    }

    if (!src.includes("setOkHttpClientFactory")) {
      // insert right after the first super.onCreate() in MainApplication
      src = src.replace(/(super\.onCreate\(\)\s*\n)/, `$1${SNIPPET}\n`);
    }

    cfg.modResults.contents = src;
    return cfg;
  });
};
