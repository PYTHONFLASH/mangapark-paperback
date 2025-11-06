import { SourceInfo, MangaTile, Chapter, ChapterDetails, SourceManga } from "paperback-extensions-common"

export const MangaParkInfo: SourceInfo = {
    version: "1.0.0",
    name: "MangaPark",
    author: "PYTHONFLASH",
    authorWebsite: "https://github.com/PYTHONFLASH",
    description: "MangaPark source for Paperback",
    icon: "icon.png",
    contentRating: "EVERYONE",
    websiteBaseURL: "https://mangapark.io",
    intents: []
}

export class MangaPark extends Source {
    readonly baseUrl = "https://mangapark.io"

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        return createManga({
            id: mangaId,
            titles: [mangaId],
            image: "",
            status: "ONGOING"
        })
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        return [createChapter({
            id: "ch1",
            mangaId,
            name: "Chapter 1",
            chapNum: 1
        })]
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        return createChapterDetails({
            id: chapterId,
            mangaId,
            pages: []
        })
    }

    async getSearchResults(query: string): Promise<MangaTile[]> {
        return [createMangaTile({
            id: "sample",
            image: "",
            title: createIconText({ text: "Search not implemented yet" })
        })]
    }
}
