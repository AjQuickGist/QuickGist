import {mount} from "svelte";
import Sandbox from "./Sandbox.svelte";
import {
    Action,
    type Analysis,
    AnalysisService,
    type Gist
} from "../common/common";
import {Readability} from "@mozilla/readability";
import {gists} from "./state.svelte";

chrome.storage.local.get(['enabled']).then(results => {
    if (results.enabled) {
        start().then()
    }
})

async function start() {

    const tabId: number = (await chrome.runtime.sendMessage({action: Action.WHOAMI})).tabId

    const analysisService = new AnalysisService()
    const gistMap: Map<string, Gist> = new Map<string, Gist>()

    function analyzePage(): Promise<Analysis> {
        const documentClone = document.cloneNode(true) as Document
        const article = new Readability(documentClone).parse()
        if (article?.textContent) {
            return analysisService.analyze(article?.textContent)
        } else {
            return Promise.reject()
        }
    }


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.action) {

            case Action.ANALYZE:
                analyzePage().then(analysis => {
                    sendResponse(analysis)
                })
                return true

            case Action.ANALYSIS:
                const gist = gistMap.get(message.gistId)
                if (gist) {
                    gist.analysis = message.analysis
                }
                break

            default:
                return false
        }
    })

    window.addEventListener('click', (event: MouseEvent) => {
        if (event.shiftKey && event.target && event.target instanceof HTMLElement) {
            const link = event.target.closest('a[href]')
            if (link) {
                const url = new URL(link.getAttribute('href')!, window.location.origin).href
                const gistId = crypto.randomUUID()
                gists.push({
                    id: gistId,
                    url: url,
                    metadata: {
                        anchor: link as HTMLElement,
                        click: {
                            clientX: event.clientX,
                            clientY: event.clientY,
                            screenX: event.screenX,
                            screenY: event.screenY
                        }
                    }
                })

                // Since storing state converts the gist into a proxy,
                // we need to get the proxy instead of the gist we pass in.
                gistMap.set(gistId, gists[gists.length - 1])

                event.preventDefault()
            }
        }
    })

    const SANDBOX_CSS = `
    all: unset !important; 
    position: fixed !important;
    top: 0px !important;
    left: 0px !important;
    width: 0px !important;
    height: 0px !important;
    border: 0px !important;
    margin: 0px !important;
    overflow: visible !important;
    z-index: 2147483647 !important;`

    const CSS_VARS = `
    :root {
        --main-bg-color: orange;
    }
    #qg-sandbox {
        --main-bg-color: orange;
    }`

    function createSandbox(): ShadowRoot {
        const sandboxElem = document.createElement('div')
        sandboxElem.id = 'qg-sandbox';
        sandboxElem.style.cssText = SANDBOX_CSS
        const shadow = sandboxElem.attachShadow({mode: 'closed'})
        const stylesheet = new CSSStyleSheet()
        stylesheet.replaceSync(CSS_VARS)
        shadow.adoptedStyleSheets = [stylesheet]
        document.body.appendChild(sandboxElem)
        const sandbox = mount(Sandbox, {
            target: shadow, props: {
                // @ts-ignore
                tabId: tabId, gists: gists
            }
        })
        return shadow
    }


    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createSandbox()
        })
    } else {
        createSandbox()
    }
}