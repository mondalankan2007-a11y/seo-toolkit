/**
 * TypeScript definitions for seo-toolkit
 */

export const VERSION: string;

// Meta tag generator types
export interface MetaTag {
  tag: string;
  name?: string;
  property?: string;
  content?: string;
  charset?: string;
  rel?: string;
  href?: string;
  text?: string;
  [key: string]: any;
}

export interface MetaResult {
  tags: MetaTag[];
  toHtml: () => string;
  toString: () => string;
}

export interface MetaOptions {
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  charset?: string;
  viewport?: string;
  keywords?: string | string[];
  author?: string;
  openGraph?: OpenGraphOptions;
  twitter?: TwitterCardOptions;
  extra?: Array<Record<string, any>>;
}

export interface OpenGraphImage {
  url: string;
  secureUrl?: string;
  type?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface OpenGraphOptions {
  title?: string;
  description?: string;
  url?: string;
  image?: string | OpenGraphImage;
  type?: string;
  siteName?: string;
  locale?: string;
  extra?: Record<string, string | number | boolean>;
}

export interface OpenGraphResult {
  tags: MetaTag[];
  toHtml: () => string;
  toString: () => string;
}

export interface TwitterImage {
  url: string;
  alt?: string;
}

export interface TwitterCardOptions {
  card?: "summary" | "summary_large_image" | "app" | "player";
  title?: string;
  description?: string;
  image?: string | TwitterImage;
  imageAlt?: string;
  site?: string;
  creator?: string;
  extra?: Record<string, string | number | boolean>;
}

export interface TwitterResult {
  tags: MetaTag[];
  toHtml: () => string;
  toString: () => string;
}

// Validation types
export interface ValidationConfig {
  throwOnError?: boolean;
  requireTitle?: boolean;
  requireDescription?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Sitemap types
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapRoute {
  loc?: string;
  url?: string;
  lastmod?: string | Date | number;
  lastModified?: string | Date | number;
  changefreq?: ChangeFrequency;
  changeFrequency?: ChangeFrequency;
  priority?: number;
}

export interface SitemapOptions {
  hostname?: string;
  pretty?: boolean;
  strict?: boolean;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string | Date;
}

export interface SitemapIndexOptions {
  pretty?: boolean;
  strict?: boolean;
}

// Robots types
export interface RobotsRuleGroup {
  userAgent?: string | string[];
  userAgents?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
}

export interface RobotsOptions {
  rules?: RobotsRuleGroup[] | RobotsRuleGroup;
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
  sitemap?: string | string[];
  host?: string;
  strict?: boolean;
}

// Schema.org Structured Data types
export interface SchemaResult {
  "@context": string;
  "@type": string;
  [key: string]: any;
  toJSON: () => Record<string, any>;
  toScript: (options?: { pretty?: boolean }) => string;
  toString: (options?: { pretty?: boolean }) => string;
}

export interface PersonData {
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: string | Record<string, any>;
  sameAs?: string[];
  description?: string;
  email?: string;
}

export interface OrganizationData {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  description?: string;
  contactPoint?: Record<string, any> | Array<Record<string, any>>;
  address?: string | Record<string, any>;
  type?: string;
}

export interface ArticleData {
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string | Date;
  dateModified?: string | Date;
  author?: string | Record<string, any>;
  publisher?: string | Record<string, any>;
  url?: string;
  type?: "Article" | "NewsArticle" | "BlogPosting";
}

export interface ProductData {
  name: string;
  image?: string | string[];
  description?: string;
  sku?: string;
  brand?: string | Record<string, any>;
  offers?: {
    price?: string | number;
    priceCurrency?: string;
    availability?: string;
    url?: string;
    validThrough?: string;
  };
  aggregateRating?: {
    ratingValue: string | number;
    reviewCount: number;
    bestRating?: string | number;
    worstRating?: string | number;
  };
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
  item?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageData {
  questions?: FaqItem[];
  items?: FaqItem[];
  mainEntity?: any[];
}

export interface HowToStep {
  name?: string;
  text: string;
  image?: string | string[];
  url?: string;
}

export interface HowToData {
  name: string;
  description?: string;
  steps: Array<HowToStep | string>;
  totalTime?: string;
  image?: string | string[];
  supply?: string | string[] | Array<{ name: string }>;
  tool?: string | string[] | Array<{ name: string }>;
}

// SEO Analysis & Score types
export interface Issue {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  [key: string]: any;
}

export interface TitleAnalysis {
  present: boolean;
  count: number;
  text: string;
  length: number;
  status: "optimal" | "too-short" | "too-long" | "empty" | "missing";
  issues: Issue[];
}

export interface DescriptionAnalysis {
  present: boolean;
  count: number;
  text: string;
  length: number;
  status: "optimal" | "too-short" | "too-long" | "empty" | "missing";
  issues: Issue[];
}

export interface HeadingsAnalysis {
  h1Count: number;
  h1Text: string[];
  totalHeadings: number;
  headings: Array<{ level: number; text: string }>;
  issues: Issue[];
}

export interface ImagesAnalysis {
  total: number;
  withAlt: number;
  missingAlt: number;
  emptyAlt: number;
  missingAltSources: string[];
  issues: Issue[];
}

export interface CanonicalAnalysis {
  present: boolean;
  count: number;
  url: string;
  isValid: boolean;
  issues: Issue[];
}

export interface OpenGraphAnalysis {
  present: boolean;
  count: number;
  properties: Record<string, string>;
  issues: Issue[];
}

export interface JsonLdAnalysis {
  present: boolean;
  count: number;
  schemas: any[];
  types: string[];
  syntaxErrors: string[];
  issues: Issue[];
}

export interface ScoreCategory {
  score: number;
  max: number;
  message: string;
  passed: boolean;
}

export interface SeoHealthScore {
  score: number;
  maxScore: number;
  percentage: number;
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  breakdown: {
    title: ScoreCategory;
    description: ScoreCategory;
    h1: ScoreCategory;
    headingsStructure: ScoreCategory;
    canonical: ScoreCategory;
    images: ScoreCategory;
    openGraph: ScoreCategory;
    structuredData: ScoreCategory;
    mobile: ScoreCategory;
    crawlability: ScoreCategory;
    [key: string]: ScoreCategory;
  };
  disclaimer: string;
}

export interface HtmlAnalysisResult {
  title: TitleAnalysis;
  description: DescriptionAnalysis;
  headings: HeadingsAnalysis;
  canonical: CanonicalAnalysis;
  images: ImagesAnalysis;
  openGraph: OpenGraphAnalysis;
  jsonLd: JsonLdAnalysis;
  meta: {
    robots: string;
    viewport: string;
    charset: string;
  };
  score: SeoHealthScore;
  issues: {
    errors: Issue[];
    warnings: Issue[];
    info: Issue[];
    all: Issue[];
  };
}

// Crawler types
export interface FetchPageOptions {
  timeout?: number;
  userAgent?: string;
  headers?: Record<string, string>;
  redirect?: RequestRedirect;
}

export interface FetchPageResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  redirected: boolean;
  contentType: string;
  responseTimeMs: number;
  html: string;
}

export interface PageAuditResult extends HtmlAnalysisResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  redirected: boolean;
  responseTimeMs: number;
  contentType: string;
}

// Errors
export class SeoError extends Error {
  code: string;
  constructor(message: string, code?: string);
}

export class SeoValidationError extends SeoError {
  errors: string[];
  warnings: string[];
  constructor(message: string, errors?: string[], warnings?: string[]);
}

// Exported functions
export function generateMeta(options?: MetaOptions, config?: { validate?: boolean }): MetaResult;
export function generateOpenGraph(options?: OpenGraphOptions): OpenGraphResult;
export function generateTwitterCard(options?: TwitterCardOptions): TwitterResult;
export function validateMeta(options: MetaOptions, config?: ValidationConfig): ValidationResult;

export function generateSitemap(routes?: Array<string | SitemapRoute>, options?: SitemapOptions): string;
export function generateSitemapIndex(sitemaps?: Array<string | SitemapIndexEntry>, options?: SitemapIndexOptions): string;
export function generateRobots(options?: RobotsOptions): string;

export function generateJsonLd(schemaData: any, options?: { pretty?: boolean }): SchemaResult;
export function generatePerson(data: PersonData): SchemaResult;
export function generateOrganization(data: OrganizationData): SchemaResult;
export function generateArticle(data: ArticleData): SchemaResult;
export function generateProduct(data: ProductData): SchemaResult;
export function generateBreadcrumbList(items: BreadcrumbItem[]): SchemaResult;
export function generateFAQPage(data: FaqItem[] | FaqPageData): SchemaResult;
export function generateHowTo(data: HowToData): SchemaResult;

export function analyzeHtml(html: string): HtmlAnalysisResult;
export function analyzeTitle(html: string): TitleAnalysis;
export function analyzeDescription(html: string): DescriptionAnalysis;
export function analyzeHeadings(html: string): HeadingsAnalysis;
export function analyzeImages(html: string): ImagesAnalysis;
export function analyzeCanonical(html: string): CanonicalAnalysis;
export function analyzeOpenGraph(html: string): OpenGraphAnalysis;
export function analyzeJsonLd(html: string): JsonLdAnalysis;
export function calculateScore(analysis: any): SeoHealthScore;

export function fetchPage(url: string, options?: FetchPageOptions): Promise<FetchPageResult>;
export function analyzePage(url: string, options?: FetchPageOptions): Promise<PageAuditResult>;
