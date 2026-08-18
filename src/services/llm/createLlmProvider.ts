import { MockLlmProvider } from './mockLlmProvider'
import { ProxyLlmProvider } from './proxyLlmProvider'
import type { LLMProvider } from './llmProvider'

interface LlmProxyConfig {
  proxyUrl?: string
}

let cachedProvider: LLMProvider | null = null
let cachedProxyUrl: string | null = null

async function loadProxyUrl(): Promise<string | null> {
  if (cachedProxyUrl !== null) {
    return cachedProxyUrl
  }

  try {
    const response = await fetch('./llm-proxy.json', { cache: 'no-store' })
    if (!response.ok) {
      cachedProxyUrl = ''
      return null
    }

    const config = (await response.json()) as LlmProxyConfig
    cachedProxyUrl = config.proxyUrl?.trim() ?? ''
    return cachedProxyUrl || null
  } catch {
    cachedProxyUrl = ''
    return null
  }
}

export async function resolveLlmProvider(): Promise<LLMProvider> {
  if (cachedProvider) {
    return cachedProvider
  }

  const proxyUrl = await loadProxyUrl()
  if (proxyUrl) {
    cachedProvider = new ProxyLlmProvider(proxyUrl)
    return cachedProvider
  }

  cachedProvider = new MockLlmProvider()
  return cachedProvider
}

export function resetLlmProviderCache(): void {
  cachedProvider = null
  cachedProxyUrl = null
}
