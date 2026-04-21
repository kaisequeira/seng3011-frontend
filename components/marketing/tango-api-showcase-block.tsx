import { CodeExample1 } from "@/components/code-example1"

function buildCodeSnippets(apiBaseUrl: string) {
  return [
    {
      language: "javascript",
      label: "Dataset create",
      filename: "create-dataset.js",
      code: `const API_BASE = "${apiBaseUrl}"

const response = await fetch(\`\${API_BASE}/datasets\`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    name: "Energy Watchlist",
    description: "ASX + NASDAQ tickers with predictive monitoring",
  }),
})

const dataset = await response.json()
console.log(dataset.dataset_id)`,
    },
    {
      language: "typescript",
      label: "Ticker ingest",
      filename: "ingest-events.ts",
      code: `const API_BASE = "${apiBaseUrl}"

await fetch(\`\${API_BASE}/datasets/\${datasetId}/events\`, {
  method: "PUT",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    symbols: ["AAPL", "MSFT", "NEE"],
    exchange: "XNAS",
    date_from: "2025-01-01",
    date_to: "2025-12-31",
  }),
})`,
    },
    {
      language: "bash",
      label: "Predict run",
      filename: "predict-run.sh",
      code: `curl -X POST "${apiBaseUrl}/predict/run" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataset_id": "dataset_123",
    "model_id": "model_abc",
    "grid_overlay": {
      "enabled": true,
      "grid_exposed_symbols": ["NEE.XNAS", "AEP.XNAS"]
    }
  }'`,
    },
  ]
}

export function TangoApiShowcaseBlock({
  apiBaseUrl,
  docsUrl,
}: {
  apiBaseUrl: string
  docsUrl: string
}) {
  return (
    <CodeExample1
      tagline="API utility"
      heading="CALL THE API."
      headingHighlight="SHIP REAL SIGNALS."
      description="TANGO’s combined gateway covers datasets, retrieval, exports, charts, and predictive risk endpoints. The examples below use the real backend base URL shown on this deployment."
      buttonText="Open Swagger docs"
      buttonUrl={docsUrl}
      codeSnippets={buildCodeSnippets(apiBaseUrl)}
      className="flex flex-col items-center justify-center border-y bg-muted/30"
    />
  )
}
