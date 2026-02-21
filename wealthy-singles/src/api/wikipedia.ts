const WIKI_API = "https://en.wikipedia.org/w/api.php"

export interface WikiSummary {
  title: string
  extract: string
  thumbnail?: string
}

export async function fetchPersonSummary(
  name: string,
): Promise<WikiSummary | null> {
  const params = new URLSearchParams({
    action: "query",
    titles: name,
    prop: "extracts|pageimages",
    exintro: "1",
    explaintext: "1",
    pithumbsize: "200",
    format: "json",
    origin: "*",
  })

  try {
    const response = await fetch(`${WIKI_API}?${params}`)
    if (!response.ok) return null

    const data = await response.json()
    const pages = data.query?.pages
    if (!pages) return null

    const pageId = Object.keys(pages)[0]
    if (pageId === "-1") return null

    const page = pages[pageId]
    return {
      title: page.title,
      extract: page.extract || "",
      thumbnail: page.thumbnail?.source,
    }
  } catch {
    return null
  }
}
