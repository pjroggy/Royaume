import { sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import type { ForgeView } from '@/modules/forge/contracts'
import type { Stock } from '@/modules/realm/contracts'
import { createTestApi } from './testing'

type TestApi = Awaited<ReturnType<typeof createTestApi>>

/**
 * Application de test où Alice et Bob ont fondé leur village : chacun dispose de 100 poisson
 * (wood) et 50 lait (stone). L'horloge reste figée tant que le test ne la fait pas avancer :
 * les villages ne produisent rien, et les stocks ne varient que par la Forge.
 */
async function forgeWithVillages() {
  const api = await createTestApi()
  for (const player of ['alice', 'bob']) {
    await api.post('/api/realm/village', { name: `Village de ${player}` }, player)
  }
  return api
}

/** Stock du village d'un joueur. */
async function stockOf(api: TestApi, player = 'alice'): Promise<Stock> {
  const res = await api.get('/api/realm/village', player)
  return ((await res.json()) as { view: { stock: Stock } }).view.stock
}

/** Vue renvoyée par une route de la Forge. */
async function viewOf(res: Response) {
  return ((await res.json()) as { view: ForgeView }).view
}

/** Commande au nom d'Alice le heaume cornu (60 poisson, 40 lait, 2 minutes), ou une autre recette. */
const order = (api: TestApi, recipe = 'hornedHelm', player = 'alice') =>
  api.post('/api/forge/orders', { recipe }, player)

/** Alice commande le heaume cornu, attend la fin de la fabrication, puis le retire. */
async function aliceHasAHelm(api: TestApi) {
  await order(api)
  api.advance(2)
  return viewOf(await api.post('/api/forge/collect', {}))
}

describe('API du module Forge - accès et validation', () => {
  it('refuse une requête anonyme (401)', async () => {
    const api = await createTestApi()
    expect((await api.get('/api/forge', null)).status).toBe(401)
    expect((await api.post('/api/forge/orders', { recipe: 'hornedHelm' }, null)).status).toBe(401)
  })

  it('présente la forge du joueur : niveau 1, recettes, aucun travail en cours', async () => {
    const api = await forgeWithVillages()
    const view = await viewOf(await api.get('/api/forge'))
    expect(view).toMatchObject({ level: 1, quality: 'common', current: null, inventory: [] })
    expect(view.recipes).toHaveLength(8)
  })

  it('refuse une entrée invalide (400) et une recette inconnue (404)', async () => {
    const api = await forgeWithVillages()
    expect((await api.post('/api/forge/orders', {})).status).toBe(400)
    expect((await api.post('/api/forge/unequip', { slot: 'tail' })).status).toBe(400)
    const res = await order(api, 'excalibur')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: { code: 'UNKNOWN_RECIPE' } })
  })

  it("n'agit que sur la forge du joueur connecté", async () => {
    const api = await forgeWithVillages()
    await aliceHasAHelm(api)
    // Bob ne voit pas l'inventaire d'Alice, et ne peut ni équiper ni graver son heaume.
    expect((await viewOf(await api.get('/api/forge', 'bob'))).inventory).toEqual([])
    expect((await api.post('/api/forge/equip', { itemId: 'item-1' }, 'bob')).status).toBe(404)
    const engrave = { itemId: 'item-1', text: 'À Bob' }
    expect((await api.post('/api/forge/engrave', engrave, 'bob')).status).toBe(404)
  })
})

describe('API du module Forge - saga de paiement avec le Village', () => {
  it('prélève le coût dans le village et commence la fabrication', async () => {
    const api = await forgeWithVillages()
    const view = await viewOf(await order(api))

    // La saga a progressé jusqu'à la fabrication pendant la requête de commande.
    expect(view.current).toMatchObject({ status: 'forging', recipe: 'hornedHelm' })
    expect(await stockOf(api)).toMatchObject({ wood: 40, stone: 10 })
  })

  it('rejette la commande, sans rien prélever, lorsque le village ne peut pas payer', async () => {
    const api = await forgeWithVillages()
    // Griffes d'acier : 60 poisson et 60 lait, alors qu'Alice n'a que 50 lait.
    const view = await viewOf(await order(api, 'steelClaws'))

    expect(view).toMatchObject({ current: null, refusal: { missing: { stone: 10 } } })
    expect(await stockOf(api)).toMatchObject({ wood: 100, stone: 50 })
  })

  it('rembourse intégralement une fabrication annulée (compensation)', async () => {
    const api = await forgeWithVillages()
    await order(api)
    const view = await viewOf(await api.post('/api/forge/orders/cancel', {}))

    expect(view.current).toBeNull()
    expect(await stockOf(api)).toMatchObject({ wood: 100, stone: 50 })
  })

  it('refuse une deuxième commande pendant la fabrication (409)', async () => {
    const api = await forgeWithVillages()
    await order(api)
    const res = await order(api, 'shadowHood')
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: { code: 'FORGE_BUSY' } })
  })

  it("ignore une réponse du Village livrée deux fois : le coût n'est prélevé qu'une fois", async () => {
    const api = await forgeWithVillages()
    await order(api)
    // Le distributeur remet une seconde fois tous les messages déjà traités, comme après une
    // panne survenue entre leur traitement et leur marquage.
    await api.db.execute(sql`UPDATE platform.outbox SET processed_at = NULL`)
    // La consultation de la forge distribue la boîte d'envoi : tous les messages sont remis.
    const view = await viewOf(await api.get('/api/forge'))

    expect(view.current).toMatchObject({ status: 'forging' })
    expect(await stockOf(api)).toMatchObject({ wood: 40, stone: 10 })
  })

  it('améliore la forge une fois son coût payé, et forge ensuite des objets de meilleure qualité', async () => {
    const api = await forgeWithVillages()
    // Vingt minutes de production : 300 poisson et 170 lait, de quoi payer l'amélioration.
    api.advance(20)
    const view = await viewOf(await api.post('/api/forge/upgrade', {}))
    expect(view).toMatchObject({ level: 2, quality: 'sturdy' })

    const ordered = await viewOf(await order(api))
    expect(ordered.current).toMatchObject({ quality: 'sturdy' })
  })
})

describe('API du module Forge - fabrication, retrait, équipement et gravure', () => {
  it("refuse le retrait avant la fin de la fabrication, et l'accepte ensuite", async () => {
    const api = await forgeWithVillages()
    await order(api)
    const early = await api.post('/api/forge/collect', {})
    expect(early.status).toBe(409)
    expect(await early.json()).toMatchObject({ error: { code: 'NOT_READY' } })

    // L'échéance est constatée à la lecture : la forge présente l'objet comme prêt.
    api.advance(2)
    expect((await viewOf(await api.get('/api/forge'))).current).toMatchObject({ status: 'ready' })
    const view = await viewOf(await api.post('/api/forge/collect', {}))
    expect(view.inventory).toMatchObject([{ itemId: 'item-1', recipe: 'hornedHelm' }])
  })

  it('équipe un objet, puis vide son emplacement', async () => {
    const api = await forgeWithVillages()
    await aliceHasAHelm(api)
    const equipped = await viewOf(await api.post('/api/forge/equip', { itemId: 'item-1' }))
    expect(equipped.equipped.helmet).toMatchObject({ itemId: 'item-1' })
    expect(equipped.bonuses.defense).toBeGreaterThan(0)

    const emptied = await viewOf(await api.post('/api/forge/unequip', { slot: 'helmet' }))
    expect(emptied.equipped.helmet).toBeNull()
  })

  it('grave un objet, et refuse une gravure trop longue (400)', async () => {
    const api = await forgeWithVillages()
    await aliceHasAHelm(api)
    const view = await viewOf(
      await api.post('/api/forge/engrave', { itemId: 'item-1', text: ' Moustache ' }),
    )
    expect(view.inventory[0].engraving).toBe('Moustache')

    const long = await api.post('/api/forge/engrave', { itemId: 'item-1', text: 'x'.repeat(21) })
    expect(long.status).toBe(400)
  })
})

describe('Forge - canal temps réel', () => {
  it('autorise un joueur à écouter le canal de sa forge, qui transmet ses événements', async () => {
    const api = await forgeWithVillages()
    await order(api)
    const res = await api.get('/api/stream/forge-alice')

    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('"type":"ItemOrdered"')
    expect(text).toContain('"type":"PaymentConfirmed"')
  })

  it("refuse l'écoute de la forge d'un autre joueur (403)", async () => {
    const api = await forgeWithVillages()
    expect((await api.get('/api/stream/forge-bob', 'alice')).status).toBe(403)
  })
})

describe('Forge - droits des joueurs', () => {
  it('exporte la forge du joueur, et efface ses gravures avec son compte', async () => {
    const api = await forgeWithVillages()
    await aliceHasAHelm(api)
    await api.post('/api/forge/engrave', { itemId: 'item-1', text: 'Valombre' })

    const exported = await (await api.get('/api/account/export')).json()
    expect(exported.sections.forge.inventory).toMatchObject([{ engraving: 'Valombre' }])

    await api.api.request('/api/account', { method: 'DELETE', headers: { 'x-test-user': 'alice' } })
    const rows = await api.db.execute(
      sql`SELECT data FROM platform.events WHERE stream = 'forge-alice' AND type = 'ItemEngraved'`,
    )
    const data = (rows as unknown as { rows: { data: { text: string } }[] }).rows[0].data
    expect(data.text).toBe('Gravure effacée')
  })
})
