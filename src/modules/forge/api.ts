import { Hono } from 'hono'
import type { AppEnv } from '@/platform/http/types'
import { validateJson } from '@/platform/http/validate'
import type { ForgeService } from './application/forge-service'
import {
  CatsQuery,
  CustomizeCatInput,
  EngraveItemInput,
  EquipItemInput,
  type ForgeError,
  MeltItemInput,
  OrderItemInput,
  UnequipSlotInput,
} from './contracts'

/** Code HTTP associé à chaque erreur métier. */
const STATUS: Record<ForgeError['code'], 400 | 404 | 409> = {
  UNKNOWN_RECIPE: 404,
  FORGE_BUSY: 409,
  INVENTORY_FULL: 409,
  MAX_LEVEL_REACHED: 409,
  NOTHING_TO_COLLECT: 409,
  NOT_READY: 409,
  NOT_CANCELLABLE: 409,
  NOT_IN_INVENTORY: 404,
  ITEM_EQUIPPED: 409,
  INVALID_ENGRAVING: 400,
  INVALID_LOOK: 400,
}

/**
 * Sous-application Hono du module Forge, montée sur /api/forge.
 * Le joueur est toujours celui que l'authentification a identifié : aucune route n'accepte
 * un identifiant de joueur dans la requête, et chacun n'agit que sur sa propre forge.
 */
export function createForgeApi(service: ForgeService) {
  return (
    new Hono<AppEnv>()
      // Forge du joueur : niveau, recettes, travail en cours, inventaire et équipement.
      .get('/', async (c) => c.json({ view: await service.getView(c.var.userId) }))

      // Amélioration de la forge, payée par le Village.
      .post('/upgrade', async (c) => {
        const result = await service.upgrade(c.var.userId)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Commande d'un objet, payée par le Village.
      .post('/orders', validateJson(OrderItemInput), async (c) => {
        const result = await service.order(c.var.userId, c.req.valid('json').recipe)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Annulation de la fabrication en cours, remboursée par le Village.
      .post('/orders/cancel', async (c) => {
        const result = await service.cancel(c.var.userId)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Retrait de l'objet fabriqué.
      .post('/collect', async (c) => {
        const result = await service.collect(c.var.userId)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Équipement d'un objet de l'inventaire.
      .post('/equip', validateJson(EquipItemInput), async (c) => {
        const result = await service.equip(c.var.userId, c.req.valid('json').itemId)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Emplacement vidé.
      .post('/unequip', validateJson(UnequipSlotInput), async (c) => {
        const result = await service.unequip(c.var.userId, c.req.valid('json').slot)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Fonte d'un objet de l'inventaire, qui n'est pas porté : il est détruit.
      .post('/melt', validateJson(MeltItemInput), async (c) => {
        const result = await service.melt(c.var.userId, c.req.valid('json').itemId)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Gravure d'un objet de l'inventaire.
      .post('/engrave', validateJson(EngraveItemInput), async (c) => {
        const { itemId, text } = c.req.valid('json')
        const result = await service.engrave(c.var.userId, itemId, text)
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Allure du chat du joueur.
      .post('/look', validateJson(CustomizeCatInput), async (c) => {
        const result = await service.customize(c.var.userId, c.req.valid('json'))
        return result.ok
          ? c.json({ view: result.view })
          : c.json({ error: result.error }, STATUS[result.error.code])
      })

      // Chats d'autres joueurs (allure et équipement porté), pour les dessiner dans la Taverne
      // ou le Donjon. Aucune donnée personnelle : ni gravure, ni inventaire, ni ressources.
      .get('/cats', async (c) => {
        const parsed = CatsQuery.safeParse({ ids: c.req.query('ids') ?? '' })
        if (!parsed.success) {
          const message = parsed.error.issues[0]?.message ?? 'Entrée invalide'
          return c.json({ error: { code: 'INVALID_INPUT' as const, message } }, 400)
        }
        return c.json({ cats: await service.cats(parsed.data.ids) })
      })
  )
}

/** Type de la sous-application, utilisé par le client typé de l'interface. */
export type ForgeApi = ReturnType<typeof createForgeApi>
