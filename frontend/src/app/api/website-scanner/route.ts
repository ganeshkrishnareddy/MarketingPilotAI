import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Check = {
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

const SECURITY_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS websites can be scanned.");
  }
  return url;
}

function fallbackUrl(url: URL) {
  if (url.protocol !== "https:") return null;
  const fallback = new URL(url.toString());
  fallback.protocol = "http:";
  return fallback;
}

async function fetchWithFallback(target: URL) {
  const requestInit: RequestInit = {
    redirect: "follow",
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "user-agent": "Mozilla/5.0 (compatible; MarketingPilotAIWebsiteScanner/1.0; +https://marketingpilot.ai)",
    },
    signal: AbortSignal.timeout(20000),
  };

  try {
    return {
      response: await fetch(target, requestInit),
      target,
      attemptedFallback: false,
    };
  } catch (primaryError) {
    const fallback = fallbackUrl(target);
    if (!fallback) throw primaryError;

    try {
      return {
        response: await fetch(fallback, requestInit),
        target: fallback,
        attemptedFallback: true,
      };
    } catch (fallbackError) {
      const reason = fallbackError instanceof Error ? fallbackError.message : "fetch failed";
      throw new Error(`Could not reach ${target.hostname}. Tried HTTPS and HTTP. ${reason}`);
    }
  }
}

function getMeta(html: string, name: string) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, "i");
  const match = html.match(pattern)?.[0] ?? "";
  return match.match(/content=["']([^"']*)["']/i)?.[1]?.trim() ?? "";
}

function getTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

function count(html: string, pattern: RegExp) {
  return html.match(pattern)?.length ?? 0;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreFromChecks(checks: Check[]) {
  const points = checks.reduce((total, check) => {
    if (check.status === "pass") return total + 1;
    if (check.status === "warn") return total + 0.55;
    return total;
  }, 0);
  return clampScore((points / Math.max(checks.length, 1)) * 100);
}

function detectTechnology(html: string, headers: Headers) {
  const headerText = Array.from(headers.entries()).map(([k, v]) => `${k}:${v}`).join("\n").toLowerCase();
  const source = `${html}\n${headerText}`.toLowerCase();
  const signals: string[] = [];

  const detectors: Array<[string, RegExp]> = [
    ["WordPress", /wp-content|wp-includes|wordpress/],
    ["Shopify", /cdn\.shopify|shopify|x-shopify/],
    ["WooCommerce", /woocommerce/],
    ["React", /react|__react|data-reactroot/],
    ["Next.js", /_next\/static|next-router|x-nextjs/],
    ["Vite", /\/assets\/index-[a-z0-9]+\.js|vite/],
    ["Google Analytics", /googletagmanager|google-analytics|gtag\(/],
    ["Meta Pixel", /connect\.facebook\.net|fbq\(/],
    ["Cloudflare", /cloudflare|cf-ray|cf-cache-status/],
    ["Vercel", /vercel|x-vercel/],
    ["Netlify", /netlify|x-nf-/],
  ];

  for (const [name, regex] of detectors) {
    if (regex.test(source)) signals.push(name);
  }

  return unique(signals);
}

function buildRecommendations(scores: Record<string, number>, checks: Check[]) {
  const failed = checks.filter((check) => check.status === "fail").slice(0, 5);
  const weakArea = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];

  const recommendations = [
    `Prioritize ${weakArea[0]} first. It is currently scoring ${weakArea[1]}/100 and has the highest growth upside.`,
    "Turn this scan into a lead magnet: export the findings as a free audit and attach a clear improvement roadmap.",
    "Create a 30-day content plan from the top SEO and positioning gaps discovered on this website.",
  ];

  for (const issue of failed) {
    recommendations.push(`${issue.label}: ${issue.detail}`);
  }

  return recommendations.slice(0, 8);
}

export async function POST(request: NextRequest) {
  try {
    const { url: inputUrl } = await request.json();
    if (!inputUrl || typeof inputUrl !== "string") {
      return NextResponse.json({ error: "Website URL is required." }, { status: 400 });
    }

    const startedAt = performance.now();
    const requestedTarget = normalizeUrl(inputUrl);
    const pageFetch = await fetchWithFallback(requestedTarget);
    const target = pageFetch.target;
    const robotsUrl = new URL("/robots.txt", target.origin);
    const sitemapUrl = new URL("/sitemap.xml", target.origin);

    const [pageResponse, robotsResponse, sitemapResponse] = await Promise.all([
      Promise.resolve(pageFetch.response),
      fetch(robotsUrl, { signal: AbortSignal.timeout(5000) }).catch(() => null),
      fetch(sitemapUrl, { signal: AbortSignal.timeout(5000) }).catch(() => null),
    ]);

    const html = await pageResponse.text();
    const headers = pageResponse.headers;
    const title = getTitle(html);
    const description = getMeta(html, "description");
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
    const h1Count = count(html, /<h1\b/gi);
    const h2Count = count(html, /<h2\b/gi);
    const imageCount = count(html, /<img\b/gi);
    const imagesMissingAlt = count(html, /<img(?![^>]*\salt=)[^>]*>/gi);
    const internalLinks = unique(Array.from(html.matchAll(/href=["']([^"']+)["']/gi)).map((m) => m[1]))
      .filter((href) => href.startsWith("/") || href.startsWith(target.origin));
    const externalLinks = unique(Array.from(html.matchAll(/href=["']https?:\/\/([^/"']+)/gi)).map((m) => m[1]))
      .filter((host) => host !== target.host);
    const forms = count(html, /<form\b/gi);
    const inputs = count(html, /<input\b|<textarea\b|<select\b/gi);
    const labels = count(html, /<label\b/gi);
    const scripts = count(html, /<script\b/gi);
    const stylesheets = count(html, /<link[^>]+rel=["']stylesheet["']/gi);
    const schemaBlocks = count(html, /application\/ld\+json/gi);
    const ogTitle = getMeta(html, "og:title");
    const ogImage = getMeta(html, "og:image");
    const viewport = getMeta(html, "viewport");
    const loadMs = Math.round(performance.now() - startedAt);
    const sizeKb = Math.round(Buffer.byteLength(html, "utf8") / 1024);

    const seoChecks: Check[] = [
      { label: "Title tag", status: title.length >= 20 && title.length <= 65 ? "pass" : title ? "warn" : "fail", detail: title || "Missing page title." },
      { label: "Meta description", status: description.length >= 80 && description.length <= 165 ? "pass" : description ? "warn" : "fail", detail: description || "Missing meta description." },
      { label: "Single H1", status: h1Count === 1 ? "pass" : h1Count > 1 ? "warn" : "fail", detail: `${h1Count} H1 heading(s) found.` },
      { label: "Structured data", status: schemaBlocks > 0 ? "pass" : "warn", detail: `${schemaBlocks} JSON-LD schema block(s) found.` },
      { label: "Canonical URL", status: canonical ? "pass" : "warn", detail: canonical ? "Canonical tag exists." : "No canonical tag found." },
      { label: "Open Graph", status: ogTitle && ogImage ? "pass" : ogTitle || ogImage ? "warn" : "fail", detail: `${ogTitle ? "Title" : "No title"} / ${ogImage ? "image" : "no image"}.` },
      { label: "Internal links", status: internalLinks.length >= 5 ? "pass" : internalLinks.length ? "warn" : "fail", detail: `${internalLinks.length} internal link(s) discovered.` },
      { label: "Sitemap", status: sitemapResponse?.ok ? "pass" : "warn", detail: sitemapResponse?.ok ? "sitemap.xml is reachable." : "No reachable sitemap.xml at root." },
      { label: "Robots.txt", status: robotsResponse?.ok ? "pass" : "warn", detail: robotsResponse?.ok ? "robots.txt is reachable." : "No reachable robots.txt at root." },
    ];

    const performanceChecks: Check[] = [
      { label: "HTML response", status: pageResponse.ok ? "pass" : "fail", detail: `HTTP ${pageResponse.status} returned in ${loadMs}ms.` },
      { label: "Page weight", status: sizeKb < 350 ? "pass" : sizeKb < 900 ? "warn" : "fail", detail: `${sizeKb}KB HTML payload.` },
      { label: "Script count", status: scripts <= 18 ? "pass" : scripts <= 35 ? "warn" : "fail", detail: `${scripts} script tag(s) found.` },
      { label: "Stylesheets", status: stylesheets <= 8 ? "pass" : stylesheets <= 16 ? "warn" : "fail", detail: `${stylesheets} stylesheet(s) found.` },
      { label: "Image volume", status: imageCount <= 30 ? "pass" : imageCount <= 70 ? "warn" : "fail", detail: `${imageCount} image(s) on the page.` },
      { label: "Mobile viewport", status: viewport.includes("width=device-width") ? "pass" : viewport ? "warn" : "fail", detail: viewport || "Missing viewport meta tag." },
    ];

    const securityChecks: Check[] = [
      { label: "HTTPS", status: target.protocol === "https:" ? "pass" : "fail", detail: target.protocol === "https:" ? "Secure protocol detected." : "Site is not using HTTPS." },
      ...SECURITY_HEADERS.map((header) => ({
        label: header,
        status: headers.has(header) ? "pass" as const : "warn" as const,
        detail: headers.has(header) ? headers.get(header) || "Header present." : "Header not present.",
      })),
    ];

    const accessibilityChecks: Check[] = [
      { label: "Image alt text", status: imagesMissingAlt === 0 ? "pass" : imagesMissingAlt <= 3 ? "warn" : "fail", detail: `${imagesMissingAlt} of ${imageCount} image(s) missing alt text.` },
      { label: "Form labels", status: inputs === 0 || labels >= inputs ? "pass" : labels > 0 ? "warn" : "fail", detail: `${labels} label(s) for ${inputs} field(s).` },
      { label: "Heading structure", status: h1Count >= 1 && h2Count >= 1 ? "pass" : "warn", detail: `${h1Count} H1 and ${h2Count} H2 heading(s).` },
      { label: "Language attribute", status: /<html[^>]+lang=/i.test(html) ? "pass" : "warn", detail: /<html[^>]+lang=/i.test(html) ? "HTML language is declared." : "HTML language is missing." },
    ];

    const scores = {
      seo: scoreFromChecks(seoChecks),
      performance: scoreFromChecks(performanceChecks),
      security: scoreFromChecks(securityChecks),
      accessibility: scoreFromChecks(accessibilityChecks),
    };
    const healthScore = clampScore((scores.seo * 0.34) + (scores.performance * 0.24) + (scores.security * 0.22) + (scores.accessibility * 0.2));
    const opportunityScore = clampScore(100 - healthScore + Math.min(20, externalLinks.length));
    const allChecks = [...seoChecks, ...performanceChecks, ...securityChecks, ...accessibilityChecks];
    const technologies = detectTechnology(html, headers);

    return NextResponse.json({
      scannedAt: new Date().toISOString(),
      url: requestedTarget.toString(),
      scannedUrl: target.toString(),
      finalUrl: pageResponse.url,
      attemptedFallback: pageFetch.attemptedFallback,
      statusCode: pageResponse.status,
      healthScore,
      opportunityScore,
      scores,
      summary: {
        title,
        description,
        technologies,
        loadMs,
        sizeKb,
        internalLinks: internalLinks.length,
        externalLinks: externalLinks.length,
        images: imageCount,
        forms,
      },
      checks: {
        seo: seoChecks,
        performance: performanceChecks,
        security: securityChecks,
        accessibility: accessibilityChecks,
      },
      aiReport: {
        executiveSummary: `${target.hostname} scored ${healthScore}/100. The strongest area is ${Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]}, while the biggest improvement opportunity is ${Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]}.`,
        strengths: allChecks.filter((check) => check.status === "pass").slice(0, 6).map((check) => `${check.label}: ${check.detail}`),
        weaknesses: allChecks.filter((check) => check.status === "fail").slice(0, 6).map((check) => `${check.label}: ${check.detail}`),
        recommendations: buildRecommendations(scores, allChecks),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to scan this website." },
      { status: 500 }
    );
  }
}
