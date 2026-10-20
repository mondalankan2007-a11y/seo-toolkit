#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { analyzePage } from "../src/crawler/analyzePage.js";
import { generateSitemap } from "../src/sitemap/generateSitemap.js";
import { generateRobots } from "../src/robots/generateRobots.js";
import { VERSION } from "../src/index.js";
import { formatAuditReport } from "./formatOutput.js";

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
seo-toolkit v${VERSION}
High-performance technical SEO toolkit for developers.

USAGE:
  $ npx seo-toolkit <command> [options]

COMMANDS:
  analyze <url>     Audit webpage SEO health (meta, headings, og, json-ld, score)
  check <url>       CI/CD quality gate check with threshold enforcement
  sitemap           Generate standard sitemap.xml
  robots            Generate standard robots.txt

OPTIONS:
  --min-score <n>   Fail with exit code 1 if score is below threshold (CI/CD)
  --json            Output results as formatted JSON (analyze command)
  --out <file>      Write generated sitemap or robots output to file
  --hostname <url>  Base domain for sitemap generation
  --routes <paths>  Comma-separated list of paths for sitemap
  --sitemap <url>   Sitemap URL for robots.txt
  --allow <path>    Allow directive for robots.txt
  --disallow <path> Disallow directive for robots.txt
  -v, --version     Show version
  -h, --help        Show help

EXAMPLES:
  $ npx seo-toolkit analyze https://example.com
  $ npx seo-toolkit check https://example.com --min-score 85
  $ npx seo-toolkit analyze https://example.com --json
  $ npx seo-toolkit sitemap --hostname https://example.com --routes /,/about,/pricing
  $ npx seo-toolkit robots --sitemap https://example.com/sitemap.xml --disallow /admin
`);
}

async function main() {
  if (args.length === 0 || args.includes("-h") || args.includes("--help") || args.includes("help")) {
    showHelp();
    process.exit(0);
  }

  if (args.includes("-v") || args.includes("--version") || args.includes("version")) {
    console.log(`seo-toolkit v${VERSION}`);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case "check":
      case "analyze": {
        const url = args[1];
        if (!url || url.startsWith("-")) {
          console.error("Error: Please provide a valid URL to analyze.");
          console.error("Usage: seo-toolkit analyze <url> [--min-score <threshold>]");
          process.exit(1);
        }

        const isJson = args.includes("--json");
        const minScoreIndex = args.indexOf("--min-score");
        const minScore = minScoreIndex !== -1 ? parseInt(args[minScoreIndex + 1], 10) : null;

        const audit = await analyzePage(url);

        if (isJson) {
          console.log(JSON.stringify(audit, null, 2));
        } else {
          console.log(formatAuditReport(audit));
        }

        if (minScore !== null && !isNaN(minScore)) {
          const score = audit.score?.score ?? 0;
          if (score < minScore) {
            console.error(`\n✖ Quality Gate Failed: SEO health score (${score}/100) is below minimum threshold (${minScore}/100).`);
            process.exit(1);
          } else {
            console.log(`\n✓ Quality Gate Passed: SEO health score (${score}/100) satisfies minimum threshold (${minScore}/100).`);
          }
        }
        break;
      }

      case "sitemap": {
        const hostIndex = args.indexOf("--hostname");
        const hostname = hostIndex !== -1 ? args[hostIndex + 1] : undefined;

        const routesIndex = args.indexOf("--routes");
        let routes = ["/"];
        if (routesIndex !== -1 && args[routesIndex + 1]) {
          routes = args[routesIndex + 1].split(",").map((r) => r.trim());
        }

        const outIndex = args.indexOf("--out");
        const outFile = outIndex !== -1 ? args[outIndex + 1] : null;

        const xml = generateSitemap(routes, { hostname, pretty: true });

        if (outFile) {
          writeFileSync(outFile, xml, "utf-8");
          console.log(`✓ Sitemap successfully generated and saved to ${outFile}`);
        } else {
          console.log(xml);
        }
        break;
      }

      case "robots": {
        const sitemapIndex = args.indexOf("--sitemap");
        const sitemap = sitemapIndex !== -1 ? args[sitemapIndex + 1] : undefined;

        const allowIndex = args.indexOf("--allow");
        const allow = allowIndex !== -1 ? args[allowIndex + 1] : "/";

        const disallowIndex = args.indexOf("--disallow");
        const disallow = disallowIndex !== -1 ? args[disallowIndex + 1] : undefined;

        const outIndex = args.indexOf("--out");
        const outFile = outIndex !== -1 ? args[outIndex + 1] : null;

        const txt = generateRobots({
          allow,
          disallow,
          sitemap
        });

        if (outFile) {
          writeFileSync(outFile, txt, "utf-8");
          console.log(`✓ robots.txt successfully generated and saved to ${outFile}`);
        } else {
          console.log(txt);
        }
        break;
      }

      default: {
        console.error(`Unknown command: '${command}'.`);
        console.error("Run 'seo-toolkit --help' for available commands.");
        process.exit(1);
      }
    }
  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

main();
