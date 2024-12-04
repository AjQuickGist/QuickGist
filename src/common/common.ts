type GistMetadata = {
    anchor: HTMLElement
    click: {
        clientX: number, clientY: number,
        screenX: number, screenY: number
    }
}

export type Analysis = {
    summary?: string
}

export type Gist = {
    id: string,
    url: string,
    metadata: GistMetadata
    analysis?: Analysis

}

export type Position = {
    top: number
    left: number
}

export enum Action {
    WHOAMI,
    CREATE,
    CLOSE,
    SHOW,
    EXPAND,
    HIDE,
    MOVE_START,
    MOVE,
    ANALYZE,
    ANALYSIS,
    SUMMARIZE
}

export class AnalysisService {

    async analyze(content: string): Promise<Analysis> {
        const summary = await chrome.runtime.sendMessage({
            action: Action.SUMMARIZE,
            content: content
        })

        return {
            summary: summary,
        }
    }
}