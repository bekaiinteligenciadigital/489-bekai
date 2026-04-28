import pb from '@/lib/pocketbase/client'

export type ModuleProgressRecord = {
  id?: string
  moduleKey: string
  completedItems: number
  totalItems: number
  completed: boolean
  lastViewedKey: string | null
  progressJson: Record<string, any>
  updated?: string
}

const STORAGE_PREFIX = 'bekai:module-progress:'

const getStorageKey = (moduleKey: string) => `${STORAGE_PREFIX}${moduleKey}`

const emptyRecord = (moduleKey: string): ModuleProgressRecord => ({
  moduleKey,
  completedItems: 0,
  totalItems: 0,
  completed: false,
  lastViewedKey: null,
  progressJson: {},
})

const normalizeRecord = (moduleKey: string, raw: any): ModuleProgressRecord => ({
  id: raw?.id,
  moduleKey,
  completedItems: Number(raw?.completed_items ?? raw?.completedItems ?? 0),
  totalItems: Number(raw?.total_items ?? raw?.totalItems ?? 0),
  completed: Boolean(raw?.completed),
  lastViewedKey: raw?.last_viewed_key ?? raw?.lastViewedKey ?? null,
  progressJson:
    raw?.progress_json && typeof raw.progress_json === 'object'
      ? raw.progress_json
      : raw?.progressJson && typeof raw.progressJson === 'object'
        ? raw.progressJson
        : {},
  updated: raw?.updated,
})

const readLocal = (moduleKey: string): ModuleProgressRecord => {
  if (typeof window === 'undefined') return emptyRecord(moduleKey)

  try {
    const raw = window.localStorage.getItem(getStorageKey(moduleKey))
    if (!raw) return emptyRecord(moduleKey)
    return normalizeRecord(moduleKey, JSON.parse(raw))
  } catch {
    return emptyRecord(moduleKey)
  }
}

const writeLocal = (record: ModuleProgressRecord) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(record.moduleKey), JSON.stringify(record))
}

export const loadModuleProgress = async (moduleKey: string): Promise<ModuleProgressRecord> => {
  const localRecord = readLocal(moduleKey)
  const userId = pb.authStore.record?.id

  if (!userId) return localRecord

  try {
    const record = await pb.collection('user_module_progress').getFirstListItem(
      `user = "${userId}" && module_key = "${moduleKey}"`,
    )
    const normalized = normalizeRecord(moduleKey, record)
    writeLocal(normalized)
    return normalized
  } catch {
    return localRecord
  }
}

export const saveModuleProgress = async (
  moduleKey: string,
  updates: Partial<ModuleProgressRecord>,
): Promise<ModuleProgressRecord> => {
  const current = await loadModuleProgress(moduleKey)
  const merged: ModuleProgressRecord = {
    ...current,
    ...updates,
    moduleKey,
    lastViewedKey:
      updates.lastViewedKey === undefined ? current.lastViewedKey : updates.lastViewedKey,
    progressJson: {
      ...current.progressJson,
      ...(updates.progressJson || {}),
    },
    updated: new Date().toISOString(),
  }

  writeLocal(merged)

  const userId = pb.authStore.record?.id
  if (!userId) return merged

  try {
    const existing = merged.id
      ? { id: merged.id }
      : await pb
          .collection('user_module_progress')
          .getFirstListItem(`user = "${userId}" && module_key = "${moduleKey}"`)
          .catch(() => null)

    const payload = {
      user: userId,
      module_key: moduleKey,
      progress_json: merged.progressJson,
      completed_items: merged.completedItems,
      total_items: merged.totalItems,
      last_viewed_key: merged.lastViewedKey,
      completed: merged.completed,
    }

    const saved = existing?.id
      ? await pb.collection('user_module_progress').update(existing.id, payload)
      : await pb.collection('user_module_progress').create(payload)

    const normalized = normalizeRecord(moduleKey, saved)
    writeLocal(normalized)
    return normalized
  } catch {
    return merged
  }
}

export const listModuleProgress = async (): Promise<ModuleProgressRecord[]> => {
  const userId = pb.authStore.record?.id
  if (!userId) {
    if (typeof window === 'undefined') return []
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .map((key) => {
        const moduleKey = key.replace(STORAGE_PREFIX, '')
        return readLocal(moduleKey)
      })
  }

  try {
    const records = await pb.collection('user_module_progress').getFullList({
      filter: `user = "${userId}"`,
      sort: '-updated',
    })
    return records.map((record) => normalizeRecord(record.module_key, record))
  } catch {
    return []
  }
}
