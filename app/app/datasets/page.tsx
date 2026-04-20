import { redirect } from "next/navigation"

export default function DatasetsIndexPage() {
  // Dataset-first navigation: datasets live at /app/datasets/[datasetId].
  redirect("/app")
}
