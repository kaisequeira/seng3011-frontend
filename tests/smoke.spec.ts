import { expect, test } from "@playwright/test"

import {
  mockDatasets,
  mockDatasetEvents,
  mockLogin,
  mockPredictive,
  seedAuthCookie,
} from "./mocks"

test("Homepage renders", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("link", { name: /TANGO/i })).toBeVisible()
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()
})

test("Login sets session cookie (mocked) and opens /app", async ({ page }) => {
  await mockLogin(page)

  await page.goto("/login?next=/app")
  await page.getByLabel("Email").fill("user@example.com")
  await page.getByLabel("Password").fill("TestP@ssw0rd1!")
  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page).toHaveURL(/\/app$/)
  await expect(
    page.getByRole("heading", { name: "Welcome to TANGO" })
  ).toBeVisible()
})

test("Datasets page lists datasets (mocked)", async ({ page }) => {
  await seedAuthCookie(page)
  await mockDatasets(page, [
    {
      dataset_id: "dataset_1",
      name: "Tech Stocks",
      description: "AAPL + MSFT",
      dataset_type: "daily_stock_ohlc_data",
      data_source: "YahooFinance",
    },
  ])

  await page.goto("/app/datasets")
  await expect(page.getByText("Tech Stocks")).toBeVisible()
  await expect(page.getByText("dataset_1")).toBeVisible()
})

test("Charts render from OHLC events (mocked)", async ({ page }) => {
  await seedAuthCookie(page)

  await mockDatasets(page, [
    {
      dataset_id: "dataset_2",
      name: "OHLC Demo",
      dataset_type: "daily_stock_ohlc_data",
    },
  ])

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
  ])

  await page.goto("/app/charts?dataset=dataset_2")

  // Wait for legend label (means chart config + render has happened).
  await expect(page.getByText("AAPL.XNAS").first()).toBeVisible()
  await expect(page.getByRole("tab", { name: "Price (Close)" })).toBeVisible()

  // Recharts renders an SVG.
  await expect(page.locator("svg").first()).toBeVisible()
})

test("Predictive page trains + runs (mocked)", async ({ page }) => {
  await seedAuthCookie(page)
  await mockPredictive(page)

  await page.goto("/app/predict")

  await page.getByLabel("Dataset ID").fill("dataset_2")
  await page.getByRole("button", { name: "Train model" }).click()
  await expect(page.getByText("model_id:")).toBeVisible()
  await expect(page.getByText("model_test_1")).toBeVisible()

  await page.getByRole("button", { name: "Run forecast" }).click()
  await expect(page.getByText("AAPL.XNAS")).toBeVisible()
  await expect(page.getByText(/23\.0%/)).toBeVisible()

  await page.getByRole("tab", { name: "Electricity shock" }).click()
  await expect(page.getByText("NSW")).toBeVisible()
})
