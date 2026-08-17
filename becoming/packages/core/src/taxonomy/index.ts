import taxonomy from "./taxonomy.v1.json" with { type: "json" };

export interface Domain {
  id: string;
  label: string;
  facets: string[];
}

export interface BottleneckClass {
  id: string;
  signal: string;
}

export interface Taxonomy {
  version: string;
  domains: Domain[];
  bottleneckClasses: BottleneckClass[];
}

export const TAXONOMY: Taxonomy = taxonomy as Taxonomy;
export const TAXONOMY_VERSION = TAXONOMY.version;

export const DOMAIN_IDS = TAXONOMY.domains.map((d) => d.id);

/** Fully-qualified facet ids, e.g. "emotional/courage". */
export const FACET_IDS = TAXONOMY.domains.flatMap((d) =>
  d.facets.map((f) => `${d.id}/${f}`),
);

export const BOTTLENECK_CLASS_IDS = TAXONOMY.bottleneckClasses.map((b) => b.id);

export function isDomainId(id: string): boolean {
  return DOMAIN_IDS.includes(id);
}

export function isFacetId(id: string): boolean {
  return FACET_IDS.includes(id);
}

export function domainOfFacet(facetId: string): string | undefined {
  const domain = facetId.split("/")[0];
  return domain && isDomainId(domain) ? domain : undefined;
}
