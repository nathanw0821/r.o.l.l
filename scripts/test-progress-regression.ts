import { findLocalProgressEntry, LocalProgressMap } from "../src/lib/progress-lookup";

function runRegressionSuite() {
  console.log("==========================================");
  console.log("🧪 RUNNING PROGRESS & PERK REGRESSION SUITE");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // Test 1: Legacy Key Lookup Formats
  const sampleMap: LocalProgressMap = {
    "1star-bloodied": { unlocked: true, modCount: 5 },
    "anti-armor": { unlocked: true, isSeeking: true },
    "overeaters_2star": { unlocked: true, modCount: 1 },
    "Bloodied": { unlocked: true },
    "unyielding": { unlocked: true }
  };

  const res1 = findLocalProgressEntry(sampleMap, "effect-1star-bloodied", "Bloodied", "1 Star");
  assert(res1?.unlocked === true && res1?.modCount === 5, "Resolves legacy key '1star-bloodied'");

  const res2 = findLocalProgressEntry(sampleMap, "effect-1star-anti-armor", "Anti-armor", "1 Star");
  assert(res2?.unlocked === true && res2?.isSeeking === true, "Resolves legacy key 'anti-armor'");

  const res3 = findLocalProgressEntry(sampleMap, "effect-2star-overeaters", "Overeater's", "2 Star");
  assert(res3?.unlocked === true && res3?.modCount === 1, "Resolves legacy key 'overeaters_2star'");

  const res4 = findLocalProgressEntry(sampleMap, "effect-1star-unyielding", "Unyielding", "1 Star");
  assert(res4?.unlocked === true, "Resolves legacy key 'unyielding'");

  // Test 2: Missing Key Graceful Handling
  const res5 = findLocalProgressEntry(sampleMap, "effect-3star-non-existent", "NonExistentMod", "3 Star");
  assert(res5 === undefined, "Returns undefined safely for un-tracked mod");

  // Test 3: Null/Empty Map Safety
  const res6 = findLocalProgressEntry(null, "effect-1star-bloodied", "Bloodied");
  assert(res6 === undefined, "Handles null localProgress gracefully");

  console.log("------------------------------------------");
  console.log(`RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("------------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite();
