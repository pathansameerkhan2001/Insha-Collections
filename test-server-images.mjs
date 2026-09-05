import fs from "fs";

async function test() {
  const urls = [
    // Direct S3 proxy endpoints
    "http://127.0.0.1:3000/api/images/s3/products/new/showcase/1788612583011-chatgpt-image-sep-5-2026-06-19-02-pm.png?w=400",
    "http://127.0.0.1:3000/api/images/s3/products/new/real/1788613099662-img-46512.jpg?w=800",
    "http://127.0.0.1:3000/api/images/s3/products/new/showcase/1788610690589-chatgpt-image-sep-5-2026-05-47-52-pm.png?w=400",
    "http://127.0.0.1:3000/api/images/s3/products/new/real/1788610696845-img-4763.jpg?w=800",
    "http://127.0.0.1:3000/api/images/s3/products/new/showcase/1788610127272-chatgpt-image-sep-5-2026-05-38-27-pm.png?w=400",
    "http://127.0.0.1:3000/api/images/s3/products/new/real/1788610132796-img-4749.jpg?w=800",

    // Next.js _next/image optimizer endpoint testing localPatterns
    "http://127.0.0.1:3000/_next/image?url=" + encodeURIComponent("/api/images/s3/products/new/showcase/1788612583011-chatgpt-image-sep-5-2026-06-19-02-pm.png?w=400") + "&w=640&q=75",
    "http://127.0.0.1:3000/_next/image?url=" + encodeURIComponent("/api/images/s3/products/new/real/1788613099662-img-46512.jpg?w=800") + "&w=828&q=80",
    "http://127.0.0.1:3000/_next/image?url=" + encodeURIComponent("/api/images/s3/products/new/showcase/1788610690589-chatgpt-image-sep-5-2026-05-47-52-pm.png?w=400") + "&w=640&q=75",
    "http://127.0.0.1:3000/_next/image?url=" + encodeURIComponent("/api/images/s3/products/new/showcase/1788610127272-chatgpt-image-sep-5-2026-05-38-27-pm.png?w=400") + "&w=640&q=75",
    "http://127.0.0.1:3000/_next/image?url=" + encodeURIComponent("/images/prod-kundan-jhumkas.jpg") + "&w=640&q=75",
  ];

  console.log("=== TESTING IMAGE URLS ON LIVE SERVER ===");
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const ct = res.headers.get("content-type");
      const cc = res.headers.get("cache-control");
      console.log(`URL: ${url.slice(0, 110)}...`);
      console.log(`  -> Status: ${res.status} ${res.statusText} | Content-Type: ${ct} | Size: ${buf.byteLength} bytes | Cache-Control: ${cc?.slice(0, 40)}`);
      if (!res.ok) {
        const text = new TextDecoder().decode(buf);
        console.log(`  -> Error body:`, text.slice(0, 200));
      }
    } catch (err) {
      console.error(`  -> Failed fetch for ${url}:`, err.message);
    }
  }
}

test();
