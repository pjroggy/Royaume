import { headers } from 'next/headers'
import { currentUser } from '@/bootstrap/server'
import { DungeonLobby } from '@/modules/dungeon/ui'

/** Page du Donjon : liste des expéditions ouvertes et ouverture d'une expédition. */
export default async function DungeonPage() {
  const user = await currentUser(await headers())
  return <DungeonLobby userId={user?.id ?? ''} />
}
