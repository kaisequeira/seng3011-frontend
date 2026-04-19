import type { Page } from "@playwright/test"

export async function mockLogin(page: Page) {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        // Middleware checks for this cookie on /app routes.
        "set-cookie": "tango_access_token=fake; Path=/; HttpOnly; SameSite=Lax",
      },
      body: JSON.stringify({ ok: true }),
    })
  })
}

export async function seedAuthCookie(page: Page) {
  await page.context().addCookies([
    {
      name: "tango_access_token",
      value: "fake",
      domain: "localhost",
      path: "/",
      httpOnly: true,
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
}
