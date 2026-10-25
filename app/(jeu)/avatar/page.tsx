import { headers } from 'next/headers'
import { currentUser } from '@/bootstrap/server'
import { AvatarScreen } from '@/modules/forge/ui'

/**
 * Page « Mon chat », atteinte depuis le château du Village : le joueur y compose l'allure de
 * son chat. L'allure et l'équipement sont conservés par la Forge.
 */
export default async function AvatarPage() {
  const user = await currentUser(await headers())
  return <AvatarScreen userId={user?.id ?? ''} />
}
