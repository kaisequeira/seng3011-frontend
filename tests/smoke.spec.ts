import { expect, test } from "@playwright/test"

import {
  mockCreateDataset,
  mockDatasets,
  mockDatasetMeta,
  mockDatasetEvents,
  mockDatasetIngest,
  mockDatasetStats,
  mockDocs,
  mockLogin,
  mockMarketHeadlines,
  mockPredictive,
  seedAuthCookie,
} from "./mocks"

test("Homepage renders", async ({ page }) => {
  await mockDocs(page)
  await page.goto("/")
  await expect(page.getByRole("link", { name: /TANGO/i })).toBeVisible()
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Sign in" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Swagger docs" }).first()
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Contact", exact: true })
  ).toBeVisible()
  await expect(page.getByText("Team Mango", { exact: true })).toBeVisible()
  await expect(page.getByText("GridX", { exact: true }).first()).toBeVisible()
})

test("Login sets session cookie (mocked) and opens /app", async ({ page }) => {
  await mockLogin(page)
  await mockMarketHeadlines(page)

  await page.goto("/login?next=/app")
  await page.getByLabel("Email").fill("user@example.com")
  await page.getByLabel("Password").fill("TestP@ssw0rd1!")
  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page).toHaveURL(/\/app$/)
  await expect(
    page.getByRole("heading", {
      name: /Welcome back.*user@example\.com/i,
    })
  ).toBeVisible()
})

test("Sidebar lists datasets and opens workspace (mocked)", async ({
  page,
}) => {
  await seedAuthCookie(page)
  await mockMarketHeadlines(page)
  await mockDatasets(page, [
    {
      dataset_id: "dataset_1",
      name: "Tech Stocks",
      description: "AAPL + MSFT",
      dataset_type: "daily_stock_ohlc_data",
      data_source: "YahooFinance",
    },
  ])

  await mockDatasetMeta(page, "dataset_1", {
    dataset_id: "dataset_1",
    name: "Tech Stocks",
    description: "AAPL + MSFT",
    dataset_type: "daily_stock_ohlc_data",
    data_source: "YahooFinance",
  })

  await mockDatasetStats(page, "dataset_1", {
    total_events: 3,
    event_type_counts: { stock_ohlc: 3 },
  })

  await mockDatasetEvents(page, "dataset_1", [
    {
      time_object: { timestamp: "2026-03-01 00:00:00.000", timezone: "UTC" },
      event_type: "stock_ohlc",
      attribute: { symbol: "AAPL.XNAS", close: 180, volume: 10 },
    },
    {
      time_object: { timestamp: "2026-03-02 00:00:00.000", timezone: "UTC" },
      event_type: "stock_ohlc",
      attribute: { symbol: "AAPL.XNAS", close: 183, volume: 11 },
    },
    {
      time_object: { timestamp: "2026-03-03 00:00:00.000", timezone: "UTC" },
      event_type: "stock_ohlc",
      attribute: { symbol: "AAPL.XNAS", close: 179, volume: 9 },
    },
  ])

  await page.goto("/app")
  await expect(page.getByRole("button", { name: "Tech Stocks" })).toBeVisible()

  await page.getByRole("button", { name: "Tech Stocks" }).click()
  await expect(page).toHaveURL(/\/app\/datasets\/dataset_1$/)
  await expect(page.locator("input[aria-label='Dataset name']")).toHaveValue(
    "Tech Stocks"
  )
})

test("Dataset workspace renders charts, stats, ingest, and prediction (mocked)", async ({
  page,
}) => {
  await seedAuthCookie(page)
  await mockPredictive(page)

  await mockDatasets(page, [
    {
      dataset_id: "dataset_2",
      name: "OHLC Demo",
      dataset_type: "daily_stock_ohlc_data",
    },
  ])

  await mockDatasetMeta(page, "dataset_2", {
    dataset_id: "dataset_2",
    name: "OHLC Demo",
    dataset_type: "daily_stock_ohlc_data",
    data_source: "YahooFinance",
  })

  await mockDatasetStats(page, "dataset_2", {
    total_events: 5,
    event_type_counts: { stock_ohlc: 3, volatility_spike: 2 },
  })

  await mockDatasetEvents(page, "dataset_2", [
    {
      time_object: { timestamp: "2026-03-01 00:00:00.000", timezone: "UTC" },
      event_type: "stock_ohlc",
      attribute: { symbol: "AAPL.XNAS", close: 180, volume: 10 },
    },
    {
      time_object: { timestamp: "2026-03-02 00:00:00.000", timezone: "UTC" },
      event_type: "stock_ohlc",
      attribute: { symbol: "AAPL.XNAS", close: 183, volume: 11 },
    },
    {
      time_object: { timestamp: "2026-03-03 00:00:00.000", timezone: "UTC" },
      event_type: "stock_ohlc",
      attribute: { symbol: "AAPL.XNAS", close: 179, volume: 9 },
    },
    {
      time_object: { timestamp: "2026-03-03 00:00:00.000", timezone: "UTC" },
      event_type: "volatility_spike",
      attribute: { symbol: "AAPL.XNAS", window: 5 },
    },
  ])

  await mockDatasetIngest(page, "dataset_2", {
    count: 44,
    raw_event_count: 38,
    derived_event_count: 6,
    event_type_counts: { stock_ohlc: 38, volatility_spike: 2 },
  })

  await page.goto("/app/datasets/dataset_2")

  // Wait for legend label (means chart config + render has happened).
  await expect(page.getByText("AAPL.XNAS").first()).toBeVisible()
  await expect(page.getByRole("tab", { name: "Price" })).toBeVisible()

  // Recharts renders an SVG.
  await expect(page.locator("svg").first()).toBeVisible()

  // Ingest tickers (mocked). Multiple "Symbols" fields exist on the page.
  await page.locator("#ingestSymbols").fill("AAPL,MSFT")
  await page.getByRole("button", { name: "Ingest" }).click()
  await expect(page.getByText(/Ingestion complete\./)).toBeVisible()

  // Predict (mocked).
  await page.getByRole("button", { name: "Train & run" }).click()
  await expect(page.getByText("model_id:")).toBeVisible()
  await expect(page.getByText("model_test_1")).toBeVisible()
  await expect(page.getByText("23.0%", { exact: true }).last()).toBeVisible()
})

test("Create dataset from sidebar (mocked)", async ({ page }) => {
  await seedAuthCookie(page)
  await mockMarketHeadlines(page)
  await mockDatasets(page, [
    { dataset_id: "dataset_existing", name: "Existing" },
    { dataset_id: "dataset_new", name: "Created" },
  ])
  await mockCreateDataset(page, {
    dataset_id: "dataset_new",
    name: "Created",
    dataset_type: "daily_stock_ohlc_data",
  })
  await mockDatasetMeta(page, "dataset_new", {
    dataset_id: "dataset_new",
    name: "Created",
    dataset_type: "daily_stock_ohlc_data",
  })
  await mockDatasetStats(page, "dataset_new", {
    total_events: 0,
    event_type_counts: {},
  })
  await mockDatasetEvents(page, "dataset_new", [])

  await page.goto("/app")
  await page.getByRole("button", { name: "New dataset" }).click()
  await page.getByLabel("Name").fill("Created")
  await page.getByRole("button", { name: "Create" }).click()

  await expect(page).toHaveURL(/\/app\/datasets\/dataset_new$/)
  await expect(page.locator("input[aria-label='Dataset name']")).toHaveValue(
    "Created"
  )
})
