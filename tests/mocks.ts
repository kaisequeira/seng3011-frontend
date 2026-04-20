import type { Page } from "@playwright/test"

export async function mockLogin(page: Page) {
  await page.route("**/api/auth/login", async (route) => {
    // Our UI reads auth from cookies. In E2E we set them directly to keep things deterministic.
    await page.context().addCookies([
      {
        name: "tango_access_token",
        value: "fake",
        url: "http://localhost",
        httpOnly: true,
        sameSite: "Lax",
      },
      {
        name: "tango_user_email",
        value: "user@example.com",
        url: "http://localhost",
        httpOnly: false,
        sameSite: "Lax",
      },
    ])
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  })
}

export async function seedAuthCookie(page: Page) {
  await page.context().addCookies([
    {
      name: "tango_access_token",
      value: "fake",
      url: "http://localhost",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "tango_user_email",
      value: "user@example.com",
      url: "http://localhost",
      httpOnly: false,
      sameSite: "Lax",
    },
  ])
}

export async function mockDatasets(page: Page, datasets: unknown[]) {
  await page.route("**/api/datasets", async (route) => {
    if (route.request().method() !== "GET") return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(datasets),
    })
  })
}

export async function mockCreateDataset(page: Page, createResponse: unknown) {
  await page.route("**/api/datasets", async (route) => {
    if (route.request().method() !== "POST") return route.fallback()
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(createResponse),
    })
  })
}

export async function mockDatasetMeta(
  page: Page,
  datasetId: string,
  meta: unknown
) {
  await page.route(
    `**/api/datasets/${encodeURIComponent(datasetId)}`,
    async (route) => {
      if (route.request().method() !== "GET") return route.fallback()
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(meta),
      })
    }
  )
}

export async function mockDatasetEvents(
  page: Page,
  datasetId: string,
  events: unknown[]
) {
  await page.route(
    `**/api/datasets/${encodeURIComponent(datasetId)}/events?**`,
    async (route) => {
      if (route.request().method() !== "GET") return route.fallback()
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          retrieved: events.length,
          dataset: { dataset_id: datasetId, events },
        }),
      })
    }
  )
}

export async function mockDatasetStats(
  page: Page,
  datasetId: string,
  stats: unknown
) {
  await page.route(
    `**/api/datasets/${encodeURIComponent(datasetId)}/events/stats**`,
    async (route) => {
      if (route.request().method() !== "GET") return route.fallback()
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(stats),
      })
    }
  )
}

export async function mockDatasetIngest(
  page: Page,
  datasetId: string,
  response: unknown
) {
  await page.route(
    `**/api/datasets/${encodeURIComponent(datasetId)}/events`,
    async (route) => {
      if (route.request().method() !== "PUT") return route.fallback()
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(response),
      })
    }
  )
}

export async function mockPredictive(page: Page) {
  await page.route("**/api/tango/predict/models/train", async (route) => {
    if (route.request().method() !== "POST") return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        model_id: "model_test_1",
        trained_at: new Date("2026-04-19T00:00:00.000Z").toISOString(),
        feature_list: ["ret_1d", "vol_5d", "drawdown_20d"],
        metrics: { auc: 0.71, precision: 0.22, recall: 0.34 },
      }),
    })
  })

  await page.route("**/api/tango/predict/run", async (route) => {
    if (route.request().method() !== "POST") return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        as_of: "2026-04-19",
        predictions: [
          {
            symbol: "AAPL.XNAS",
            p_spike_7d: 0.23,
            risk_level: "ELEVATED",
            drivers: ["vol_5d", "drawdown_20d"],
          },
        ],
      }),
    })
  })

  await page.route("**/api/tango/predict/electricity-shock", async (route) => {
    if (route.request().method() !== "GET") return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        generated_at: "2026-04-19T00:00:00.000Z",
        regions: [
          {
            region: "NSW",
            current_price: 120.1,
            price_30m: 141.0,
            shock_score: 0.7,
            level: "HIGH",
          },
        ],
      }),
    })
  })

  await page.route("**/api/tango/predict/macro-summary", async (route) => {
    if (route.request().method() !== "GET") return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        source: "Mango API",
        cpi_latest: { date: "2026-03-31", value: 138.2, change: 0.011 },
        unemp_latest: { date: "2026-03-31", value: 4.2, change: 0.1 },
      }),
    })
  })
}

export async function mockMarketHeadlines(page: Page) {
  await page.route("**/api/market-headlines**", async (route) => {
    if (route.request().method() !== "GET") return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        source: "MarketWatch (RSS)",
        items: [
          {
            title:
              "Mock: U.S. stock futures move ahead of data (test headline)",
            link: "https://www.marketwatch.com/",
            publishedAt: "2026-04-20T03:04:00.000Z",
            author: "Test Author",
          },
        ],
      }),
    })
  })
}

export async function mockDocs(page: Page) {
  await page.route("**/api/docs", async (route) => {
    if (route.request().method() !== "GET") return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body><h1>TANGO Docs</h1></body></html>",
    })
  })
}
