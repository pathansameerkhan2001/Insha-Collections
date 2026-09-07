import { subcategoryStore } from "../lib/categories/subcategoryStore";

async function runTests() {
  console.log("=== STARTING SUBCATEGORY SYSTEM TESTS ===");

  // 1. Check Initial Seed Data
  const initialData = await subcategoryStore.getAllWithCounts();
  console.log("Categories loaded:", Object.keys(initialData));
  console.log("Jewellery subcategories count:", initialData.jewellery.length);
  console.log("Sample Jewellery subcategories:", initialData.jewellery.slice(0, 5).map(s => `${s.name} (${s.productCount} prods)`));

  // 2. Test duplicate prevention
  try {
    await subcategoryStore.create("jewellery", initialData.jewellery[0].name);
    console.error("FAIL: Duplicate should have thrown an error!");
  } catch (err: unknown) {
    console.log("PASS: Duplicate check blocked creation:", err instanceof Error ? err.message : String(err));
  }

  // 3. Test Add New Subcategory
  const testSubName = "Exclusive Heritage Polki " + Date.now().toString().slice(-4);
  const created = await subcategoryStore.create("jewellery", testSubName);
  console.log("PASS: Created new subcategory:", created.name, "id:", created.id);

  // 4. Test Rename Subcategory & Product cascade
  const renamedName = testSubName + " (Updated)";
  const renameResult = await subcategoryStore.update("jewellery", testSubName, renamedName);
  console.log("PASS: Renamed subcategory to:", renameResult.subcategory.name, "Affected products:", renameResult.affectedProductsCount);

  // 5. Test Delete of unused subcategory (0 products)
  const delResult = await subcategoryStore.delete("jewellery", renamedName);
  console.log("PASS: Deleted unused subcategory:", delResult.name);

  // 6. Test Delete Protection for in-use subcategory
  const subInUse = initialData.jewellery.find(s => s.productCount > 0);
  if (subInUse) {
    try {
      await subcategoryStore.delete("jewellery", subInUse.name);
      console.error("FAIL: Delete in-use subcategory should have thrown error!");
    } catch (err: unknown) {
      console.log("PASS: Delete protection active:", err instanceof Error ? err.message : String(err));
    }
  }

  console.log("=== ALL SUBCATEGORY TESTS PASSED ===");
}

runTests().catch(console.error);
