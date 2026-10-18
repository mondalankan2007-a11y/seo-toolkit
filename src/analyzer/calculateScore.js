/**
 * Transparent Technical SEO Health Score calculator.
 * Evaluates webpage compliance with technical SEO best practices out of 100 points.
 *
 * NOTE: This is a diagnostic technical audit score and is not affiliated with
 * or indicative of proprietary search engine ranking algorithms.
 *
 * @param {Object} analysis - Output from analyzeHtml or sub-analyzers
 * @returns {Object} Transparent score breakdown and overall health score
 */
export function calculateScore(analysis) {
  if (!analysis || typeof analysis !== "object") {
    return {
      score: 0,
      maxScore: 100,
      percentage: 0,
      rating: "Poor",
      breakdown: {},
      disclaimer: "Technical SEO Health Score is an automated audit tool for web best practices. It does not represent search engine ranking algorithms."
    };
  }

  // If page is completely devoid of content
  const hasAnyContent = Boolean(
    analysis.title?.present ||
    analysis.description?.present ||
    (analysis.headings?.totalHeadings > 0) ||
    (analysis.images?.total > 0) ||
    analysis.canonical?.present ||
    analysis.openGraph?.present ||
    analysis.jsonLd?.present
  );

  if (!hasAnyContent) {
    return {
      score: 0,
      maxScore: 100,
      percentage: 0,
      rating: "Poor",
      breakdown: {
        title: { score: 0, max: 10, message: "Missing title", passed: false },
        description: { score: 0, max: 10, message: "Missing meta description", passed: false },
        h1: { score: 0, max: 10, message: "Missing <h1> heading", passed: false },
        headingsStructure: { score: 0, max: 10, message: "No headings found", passed: false },
        canonical: { score: 0, max: 10, message: "Missing canonical link", passed: false },
        images: { score: 0, max: 10, message: "No images found", passed: false },
        openGraph: { score: 0, max: 10, message: "Missing Open Graph tags", passed: false },
        structuredData: { score: 0, max: 10, message: "No structured data", passed: false },
        mobile: { score: 0, max: 10, message: "Missing viewport", passed: false },
        crawlability: { score: 0, max: 10, message: "No content", passed: false }
      },
      disclaimer: "Technical SEO Health Score is an automated audit tool for web best practices. It does not represent search engine ranking algorithms."
    };
  }

  const breakdown = {};

  // 1. Title (10 points)
  const title = analysis.title;
  let titleScore = 0;
  let titleMsg = "Missing title";
  if (title?.present) {
    if (title.status === "optimal") {
      titleScore = 10;
      titleMsg = `Optimal title length (${title.length} chars)`;
    } else if (title.status === "too-short" || title.status === "too-long") {
      titleScore = 6;
      titleMsg = `Title present but ${title.status} (${title.length} chars)`;
    } else {
      titleScore = 2;
      titleMsg = "Title tag is empty";
    }
  }
  breakdown.title = { score: titleScore, max: 10, message: titleMsg, passed: titleScore >= 8 };

  // 2. Description (10 points)
  const desc = analysis.description;
  let descScore = 0;
  let descMsg = "Missing meta description";
  if (desc?.present) {
    if (desc.status === "optimal") {
      descScore = 10;
      descMsg = `Optimal meta description length (${desc.length} chars)`;
    } else if (desc.status === "too-short" || desc.status === "too-long") {
      descScore = 6;
      descMsg = `Description present but ${desc.status} (${desc.length} chars)`;
    } else {
      descScore = 2;
      descMsg = "Meta description is empty";
    }
  }
  breakdown.description = { score: descScore, max: 10, message: descMsg, passed: descScore >= 8 };

  // 3. H1 Heading (10 points)
  const headings = analysis.headings;
  let h1Score = 0;
  let h1Msg = "Missing <h1> heading";
  if (headings?.h1Count === 1) {
    h1Score = 10;
    h1Msg = "Exactly one <h1> heading present";
  } else if (headings?.h1Count > 1) {
    h1Score = 5;
    h1Msg = `Multiple (${headings.h1Count}) <h1> headings found`;
  }
  breakdown.h1 = { score: h1Score, max: 10, message: h1Msg, passed: h1Score === 10 };

  // 4. Headings Structure (10 points)
  let headingStructScore = 10;
  let headingStructMsg = "Good heading hierarchy";
  if (!headings || headings.totalHeadings === 0) {
    headingStructScore = 0;
    headingStructMsg = "No headings found";
  } else {
    const hasSkip = headings.issues?.some((i) => i.code === "HEADING_HIERARCHY_SKIPPED");
    const hasEmpty = headings.issues?.some((i) => i.code === "HEADING_EMPTY");
    if (hasSkip) {
      headingStructScore -= 4;
      headingStructMsg = "Heading levels were skipped";
    }
    if (hasEmpty) {
      headingStructScore -= 3;
      headingStructMsg = "Some heading tags are empty";
    }
  }
  breakdown.headingsStructure = {
    score: Math.max(0, headingStructScore),
    max: 10,
    message: headingStructMsg,
    passed: headingStructScore >= 8
  };

  // 5. Canonical URL (10 points)
  const canonical = analysis.canonical;
  let canonicalScore = 0;
  let canonicalMsg = "Missing canonical link";
  if (canonical?.present) {
    if (canonical.isValid && canonical.count === 1) {
      canonicalScore = 10;
      canonicalMsg = "Valid canonical URL found";
    } else if (!canonical.isValid) {
      canonicalScore = 2;
      canonicalMsg = "Canonical URL is malformed";
    } else {
      canonicalScore = 4;
      canonicalMsg = "Multiple canonical links found";
    }
  }
  breakdown.canonical = { score: canonicalScore, max: 10, message: canonicalMsg, passed: canonicalScore === 10 };

  // 6. Images & Alt Attributes (10 points)
  const images = analysis.images;
  let imgScore = 10;
  let imgMsg = "All images have alt attributes";
  if (images && images.total > 0) {
    if (images.missingAlt === 0) {
      imgScore = 10;
      imgMsg = `All ${images.total} images have alt attributes`;
    } else {
      const ratio = images.withAlt / images.total;
      imgScore = Math.round(ratio * 10);
      imgMsg = `${images.missingAlt} of ${images.total} images missing alt attribute`;
    }
  } else {
    imgMsg = "No images present on page";
  }
  breakdown.images = { score: imgScore, max: 10, message: imgMsg, passed: imgScore >= 8 };

  // 7. Open Graph (10 points)
  const og = analysis.openGraph;
  let ogScore = 0;
  let ogMsg = "Missing Open Graph tags";
  if (og?.present) {
    const hasTitle = Boolean(og.properties["og:title"]);
    const hasImage = Boolean(og.properties["og:image"]);
    const hasUrl = Boolean(og.properties["og:url"]);
    const requiredCount = [hasTitle, hasImage, hasUrl].filter(Boolean).length;

    if (requiredCount === 3) {
      ogScore = 10;
      ogMsg = "All core Open Graph tags present";
    } else if (requiredCount === 2) {
      ogScore = 7;
      ogMsg = "Partial Open Graph tags present";
    } else {
      ogScore = 4;
      ogMsg = "Minimal Open Graph tags present";
    }
  }
  breakdown.openGraph = { score: ogScore, max: 10, message: ogMsg, passed: ogScore >= 7 };

  // 8. Structured Data (JSON-LD) (10 points)
  const jsonLd = analysis.jsonLd;
  let jsonLdScore = 0;
  let jsonLdMsg = "No Schema.org JSON-LD structured data";
  if (jsonLd?.present) {
    if (jsonLd.syntaxErrors && jsonLd.syntaxErrors.length > 0) {
      jsonLdScore = 3;
      jsonLdMsg = "JSON-LD present but has syntax errors";
    } else {
      jsonLdScore = 10;
      jsonLdMsg = `Valid Schema.org data found (${jsonLd.types?.join(", ") || "custom"})`;
    }
  }
  breakdown.structuredData = { score: jsonLdScore, max: 10, message: jsonLdMsg, passed: jsonLdScore === 10 };

  // 9. Mobile Viewport (10 points)
  const viewport = analysis.meta?.viewport;
  let viewportScore = 0;
  let viewportMsg = "Missing mobile viewport meta tag";
  if (viewport && viewport.includes("width=device-width")) {
    viewportScore = 10;
    viewportMsg = "Mobile viewport meta tag configured";
  } else if (viewport) {
    viewportScore = 5;
    viewportMsg = "Viewport meta tag present but missing width=device-width";
  }
  breakdown.mobile = { score: viewportScore, max: 10, message: viewportMsg, passed: viewportScore === 10 };

  // 10. Crawlability & Charset (10 points)
  const meta = analysis.meta || {};
  let crawlScore = 5; // default 5 for normal crawlability
  let crawlMsg = "Standard crawlability";
  if (meta.charset && meta.charset.toLowerCase().includes("utf-8")) {
    crawlScore += 5;
  }
  if (meta.robots && meta.robots.toLowerCase().includes("noindex")) {
    crawlScore = Math.max(0, crawlScore - 5);
    crawlMsg = "Page has 'noindex' directive";
  } else {
    crawlMsg = "Robots and charset properly configured";
  }
  breakdown.crawlability = { score: crawlScore, max: 10, message: crawlMsg, passed: crawlScore >= 8 };

  // Sum total score
  const totalScore = Object.values(breakdown).reduce((acc, cat) => acc + cat.score, 0);

  let rating = "Poor";
  if (totalScore >= 90) rating = "Excellent";
  else if (totalScore >= 75) rating = "Good";
  else if (totalScore >= 50) rating = "Fair";

  return {
    score: totalScore,
    maxScore: 100,
    percentage: totalScore,
    rating,
    breakdown,
    disclaimer: "Technical SEO Health Score is an automated audit tool for web best practices. It does not represent search engine ranking algorithms."
  };
}
