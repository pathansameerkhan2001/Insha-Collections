async function runTests() {
  console.log("=== Running Insha Collections Checkout Validation Test Suite ===");
  const baseUrl = "http://localhost:3000";

  // Test 1: Missing Customer Info
  console.log("\n[Test 1] Missing Customer Info");
  try {
    const res = await fetch(`${baseUrl}/api/checkout/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { fullName: "", mobile: "", address: "", city: "", state: "", pincode: "", paymentMethod: "cod" },
        items: [{ productId: "jewel-1", quantity: 1 }],
      }),
    });
    const data = await res.json();
    console.log("Response status:", res.status, data);
    if (res.status !== 400 || data.success !== false) throw new Error("Expected 400 validation failure");
    console.log("✓ Test 1 Passed: Rejected empty customer details");
  } catch (err) {
    console.error("Test 1 Failed:", err);
  }

  // Test 2: Online payment without UTR
  console.log("\n[Test 2] Online Payment without UTR");
  try {
    const res = await fetch(`${baseUrl}/api/checkout/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fullName: "Sameer",
          mobile: "9618648050",
          address: "Room no 6, Rachuru complex",
          city: "Kadapa",
          state: "Andhra Pradesh",
          pincode: "516001",
          paymentMethod: "online",
          paymentReference: "",
        },
        items: [{ productId: "jewel-1", quantity: 1 }],
      }),
    });
    const data = await res.json();
    console.log("Response status:", res.status, data);
    if (res.status !== 400 || !data.error?.includes("Payment Reference / UTR")) throw new Error("Expected UTR validation error");
    console.log("✓ Test 2 Passed: Rejected Online Payment missing UTR");
  } catch (err) {
    console.error("Test 2 Failed:", err);
  }

  // Test 3: Valid COD Order
  console.log("\n[Test 3] Valid Cash on Delivery Order");
  try {
    const res = await fetch(`${baseUrl}/api/checkout/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fullName: "Rahul Kumar",
          mobile: "9876543210",
          address: "Flat 204, Royal Apartments, Near Clock Tower",
          city: "Kadapa",
          state: "Andhra Pradesh",
          pincode: "516001",
          instructions: "Call before reaching",
          paymentMethod: "cod",
        },
        items: [{ productId: "jewel-1", quantity: 2 }],
      }),
    });
    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Order ID:", data.orderId);
    console.log("Total Amount:", data.totalAmount);
    console.log("WhatsApp URL Preview:", data.whatsappUrl?.slice(0, 100));
    console.log("Order Message Sample:\n", data.orderMessage);
    if (!data.orderId?.startsWith("INSH-") || data.customer?.paymentMethod !== "cod") {
      throw new Error("Invalid COD response structure");
    }
    console.log("✓ Test 3 Passed: Valid COD order created with INSH Order ID");
  } catch (err) {
    console.error("Test 3 Failed:", err);
  }

  // Test 4: Valid Online Payment Order with PhonePe UTR
  console.log("\n[Test 4] Valid Online Payment Order with PhonePe UTR");
  try {
    const res = await fetch(`${baseUrl}/api/checkout/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fullName: "Sameer",
          mobile: "9618648050",
          address: "Room no 6, Rachuru complex, Y V Street",
          city: "Kadapa",
          state: "Andhra Pradesh",
          pincode: "516001",
          instructions: "Please deliver carefully",
          paymentMethod: "online",
          paymentReference: "423589120456",
        },
        items: [
          { productId: "jewel-1", quantity: 1 },
          { productId: "jewel-2", quantity: 1 },
        ],
      }),
    });
    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Order ID:", data.orderId);
    console.log("Total Amount:", data.totalAmount);
    console.log("Order Message Sample:\n", data.orderMessage);
    if (!data.orderMessage.includes("Payment Method: Online Payment") || !data.orderMessage.includes("423589120456")) {
      throw new Error("Expected Online Payment and UTR in WhatsApp text");
    }
    console.log("✓ Test 4 Passed: Valid Online Payment order created with UTR and PhonePe verification");
  } catch (err) {
    console.error("Test 4 Failed:", err);
  }
}

runTests();
