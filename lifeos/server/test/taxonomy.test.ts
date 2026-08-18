import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BOTTLENECK_CLASS_IDS,
  DOMAIN_IDS,
  FACET_IDS,
  TAXONOMY,
  domainOfFacet,
  isFacetId,
} from "@lifeos/core";
import { ONBOARDING_CHAPTERS } from "@lifeos/core";

describe("taxonomy v1 (spec 01)", () => {
  it("has exactly the 12 domains", () => {
    assert.equal(DOMAIN_IDS.length, 12);
    assert.ok(DOMAIN_IDS.includes("physical"));
    assert.ok(DOMAIN_IDS.includes("legacy"));
  });

  it("every domain has at least 4 facets and unique slugs", () => {
    for (const domain of TAXONOMY.domains) {
      assert.ok(domain.facets.length >= 4, domain.id);
      assert.equal(new Set(domain.facets).size, domain.facets.length, domain.id);
    }
    assert.equal(new Set(FACET_IDS).size, FACET_IDS.length);
  });

  it("has the 10 bottleneck candidate classes", () => {
    assert.equal(BOTTLENECK_CLASS_IDS.length, 10);
    assert.ok(BOTTLENECK_CLASS_IDS.includes("focus-dilution"));
  });

  it("facet helpers resolve correctly", () => {
    assert.ok(isFacetId("emotional/courage"));
    assert.ok(!isFacetId("emotional/nonexistent"));
    assert.equal(domainOfFacet("adventure/novelty"), "adventure");
    assert.equal(domainOfFacet("bogus/thing"), undefined);
  });
});

describe("onboarding chapters (spec 03 §5)", () => {
  it("has 7 chapters in order with valid coverage domains", () => {
    assert.equal(ONBOARDING_CHAPTERS.length, 7);
    ONBOARDING_CHAPTERS.forEach((chapter, i) => {
      assert.equal(chapter.index, i);
      for (const d of chapter.coverageDomains) {
        assert.ok(DOMAIN_IDS.includes(d), `${chapter.id}: ${d}`);
      }
    });
  });

  it("chapters collectively touch most domains", () => {
    const covered = new Set(ONBOARDING_CHAPTERS.flatMap((c) => c.coverageDomains));
    assert.ok(covered.size >= 10, `covered only: ${[...covered].join(", ")}`);
  });
});
