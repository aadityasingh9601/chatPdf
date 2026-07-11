import LlamaCloud from "@llamaindex/llama-cloud";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const client = new LlamaCloud({
  apiKey: process.env['LLAMA_CLOUD_API_KEY'],
});

// Upload and parse a document
const file = await client.files.create({
  file: fs.createReadStream("../document.pdf"),
  purpose: "parse",
});

const result = await client.parsing.parse({
  file_id: file.id,
  tier: "fast",
  version: "latest",
  expand: ["markdown"],
});

//Extract all pages one by one.
let page = await client.extract.list({ page_size: 5 });
for (const extractV2Job of page.items) {
  console.log("1", extractV2Job);
}

while (page.hasNextPage()) {
  page = await page.getNextPage();
}

if (result.markdown) {
  console.log(result?.markdown?.pages);
}
