import { FootballDataProvider } from './football-data'
import type { MatchDataProvider } from './provider.interface'

// Sélection du provider via variable d'env — permet de switcher sans toucher l'app
function createProvider(): MatchDataProvider {
  const provider = process.env.MATCH_PROVIDER ?? 'football-data'
  switch (provider) {
    case 'football-data':
      return new FootballDataProvider(process.env.FOOTBALL_DATA_API_KEY!)
    default:
      throw new Error(`Provider inconnu : ${provider}`)
  }
}

// Singleton — une seule instance par processus Node
let _provider: MatchDataProvider | null = null

export function getMatchProvider(): MatchDataProvider {
  if (!_provider) _provider = createProvider()
  return _provider
}
