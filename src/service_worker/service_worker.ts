import {Action} from "../common/common";

const MAX_SUMMARIZE_CHARS = 4000

let summarizer: any

(async () => {
//@ts-ignore
    const canSummarize = await ai.summarizer.capabilities()
    if (canSummarize && canSummarize.available !== 'no') {
        if (canSummarize.available === 'readily') {
            //@ts-ignore
            summarizer = await ai.summarizer.create({
                type: 'tl;dr',
                format: 'plain-text',
                length: 'medium'
            })
        } else {
            //@ts-ignore
            summarizer = await ai.summarizer.create()
            await summarizer.ready
        }
    } else {
        // The summarizer can't be used at all.
    }
})()

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({enabled: true})
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case Action.WHOAMI:
            sendResponse({tabId: sender.tab?.id})
            break

        case Action.SUMMARIZE:
            const content = message.content
            if (!summarizer) {
                return content.substring(0, 100)
            }
            summarizer.summarize(content.substring(0, MAX_SUMMARIZE_CHARS)).then((summary: any) => {
                sendResponse(summary)
            })
            return true
    }
})