/**
 * MangaPark Paperback Extension (Full Version)
 * Author: PYTHONFLASH
 * Domain: https://mangapark.io
 * Features: Search, Latest, Popular, Manga Details, Chapters, Pages
 */

import {
  Source,
  SourceInfo,
  MangaTile,
  Manga,
  Chapter,
  ChapterDetails,
  HomeSection,
  PagedResults,
  createMangaTile,
  createManga,
  createChapter,
  createChapterDetails,
  createHomeSection,
  createPagedResults,
  createIconText,
  createRequestObject
} from "paperback-extensions-common";

const MANGAPARK_INFO: SourceInfo = {
  version: "1.0.0",
  name: "MangaPark",
  description: "Read manga from MangaPark (mangapark.io)",
  author: "PYTHONFLASH",
  authorWebsite: "https://github.com/PYTHONFLASH",
  websiteBaseURL: "https://mangapark.io"
};

export class MangaPark extends Source {
  getSourceInfo(): SourceInfo { return MANGAPARK_INFO; }

  baseUrl = "https://mangapark.io";

  async getHomePageSections(): Promise<HomeSection[]> {
    const sections: HomeSection[] = [
      createHomeSection({ id: "latest", title: "Latest Updates", view_more: true }),
      createHomeSection({ id: "popular", title: "Popular Manga", view_more: true })
    ];

    const res = await fetch(this.baseUrl);
    const html = await res.text();
    const $ = this.cheerio.load(html);

    const latest: MangaTile[] = [];
    $(".manga-card, .item").slice(0, 20).each((_, el) => {
      const a = $(el).find("a").first();
      const title = a.attr("title") || a.text().trim();
      const id = (a.attr("href") || "").replace(/^\/+/, "");
      const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
      if (id && title) latest.push(createMangaTile({ id, image, title: createIconText({ text: title }) }));
    });
    sections[0].items = latest;
    sections[1].items = latest.slice(0, 10);
    return sections;
  }

  async search(query: any): Promise<PagedResults> {
    const q = encodeURIComponent(query.title || "");
    const url = `${this.baseUrl}/search/?q=${q}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = this.cheerio.load(html);

    const tiles: MangaTile[] = [];
    $(".item, .manga-card").each((_, el) => {
      const a = $(el).find("a").first();
      const id = (a.attr("href") || "").replace(/^\/+/, "");
      const title = a.attr("title") || a.text().trim();
      const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src");
      if (id && title) tiles.push(createMangaTile({ id, image, title: createIconText({ text: title }) }));
    });

    return createPagedResults({ results: tiles });
  }

  async getMangaDetails(mangaId: string): Promise<Manga> {
    const url = `${this.baseUrl}/${mangaId}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = this.cheerio.load(html);

    const title = $("h1, .title").first().text().trim();
    const image = $("meta[property='og:image']").attr("content") || $(".manga-poster img").attr("src") || "";
    const desc = $(".summary, .desc, .manga-summary").text().trim() || "";
    const status = /ongoing/i.test(html) ? 1 : 0;

    return createManga({ id: mangaId, titles: [title], image, desc, status });
  }

  async getChapters(mangaId: string): Promise<Chapter[]> {
    const url = `${this.baseUrl}/${mangaId}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = this.cheerio.load(html);

    const chapters: Chapter[] = [];
    $(".chapter-list a, .chapters a").each((i, el) => {
      const a = $(el);
      const id = (a.attr("href") || "").replace(/^\/+/, "");
      const name = a.text().trim();
      const chapNum = Number(name.match(/(\d+\.?\d*)/)?.[1]) || i + 1;
      if (id) chapters.push(createChapter({ id, mangaId, name, chapNum }));
    });

    return chapters;
  }

  async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
    const url = `${this.baseUrl}/${chapterId}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = this.cheerio.load(html);

    const pages = $("img").map((i, el) => $(el).attr("data-src") || $(el).attr("src") || "").get()
      .filter(Boolean)
      .map((u, i) => ({ index: i, url: u }));

    return createChapterDetails({ id: chapterId, mangaId, pages });
  }
}
