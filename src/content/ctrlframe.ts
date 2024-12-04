import {Action, type Analysis, type Position} from "../common/common";

const urlParams = new URLSearchParams(window.location.search);
const frameTabId = Number.parseInt(urlParams.get('tabId')!);

type Preview = {
    winId: number
    tabId: number
    moveWidth?: number
    moveHeight?: number
}

const previewMap: Map<string, Preview> = new Map<string, Preview>()

// Maps tabIds to gistIds
const tabMap: Map<number, string> = new Map<number, string>()

function onTabCreated(tabId: number, gistId: string) {
    analyzeTab(tabId).then(analysis => {
        chrome.tabs.sendMessage(frameTabId, {
            action: Action.ANALYSIS,
            gistId: gistId,
            analysis: analysis
        })
    })
}

function createPreview(gistId: string, url: string, position: Position) {
    chrome.windows.create({
        top: Math.round(position.top),
        left: Math.round(position.left),
        width: 400,
        height: 500,
        url: url,
        type: 'panel'
    }, (win) => {
        const tabId = win?.tabs?.[0]?.id;
        if (!(win && tabId)) {
            throw new Error()
        }

        const preview: Preview = {
            winId: win.id!,
            tabId: tabId,
            moveWidth: win.width,
            moveHeight: win.height
        }

        previewMap.set(gistId, preview)
        tabMap.set(tabId, gistId)

        addEventListener("beforeunload", (event) => {
            chrome.windows.remove(win.id!);
        });

        addEventListener("visibilitychange", (_) => {
            if (document.hidden) {
                chrome.windows.update(win.id!, {
                    state: 'minimized'
                })
            }
        });
        chrome.tabs.onUpdated.addListener((changeTabId, changeInfo, changeTab) => {
            if (changeTabId !== tabId) {
                return
            }
            if (changeInfo.status == 'complete') {
                onTabCreated(tabId, gistId)
            }
            if (changeInfo.status == 'loading') {
                chrome.tabs.setZoomSettings(tabId, {
                    mode: 'automatic',
                    scope: 'per-tab',
                    defaultZoomFactor: 0.3
                }).then(() => {
                    chrome.tabs.setZoom(tabId, 0.3)
                })
            }
        })
    })
}

function analyzeTab(tabId: number): Promise<Analysis> {
    return chrome.tabs.sendMessage(tabId, {action: Action.ANALYZE})
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // Only accept messages from our own tab, or preview tabs that we created
    if (!sender.tab?.id) {
        return
    }

    if (tabMap.has(sender.tab.id)) {
        switch (message.action) {

            case Action.ANALYSIS:
                break

        }

    } else if (sender.tab.id !== frameTabId) {
        return
    }

    if (message.action == Action.CREATE) {
        createPreview(message.gistId, message.url, message.position)
        return
    }

    const preview = previewMap.get(message.gistId)
    if (!preview) {
        return
    }
    const winId = preview.winId

    switch (message.action) {

        case Action.CLOSE:
            chrome.windows.remove(preview.winId)
            break

        case Action.SHOW:
            chrome.windows.update(winId, {focused: true})
            break

        case Action.EXPAND:
            chrome.tabs.get(frameTabId).then(frameTab => {
                chrome.tabs.move(preview.tabId, {
                    index: frameTab.index + 1,
                    windowId: frameTab.windowId
                }).then(previewTab => {
                    chrome.tabs.setZoom(preview.tabId, 1)
                })
            })
            break

        case Action.MOVE_START:
            chrome.windows.get(winId).then(win => {
                preview.moveWidth = win.width!
                preview.moveHeight = win.height!
            })
            break

        case Action.MOVE:

            chrome.windows.update(winId, {
                focused: true,
                left: Math.floor(message.position.left),
                top: Math.floor(message.position.top),
                width: preview.moveWidth,
                height: preview.moveHeight
            }).catch(e => {
                chrome.windows.update(winId, {state: 'minimized'})
            })
            break

        case Action.HIDE:
            chrome.windows.update(preview.winId, {
                state: 'minimized'
            })
            break

        case Action.ANALYZE:
            analyzeTab(preview.tabId).then(analysis => {
                sendResponse(analysis)
            })
            break

        default:
            return false
    }
    return true
})