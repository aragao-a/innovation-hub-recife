'use client'

import PocketBase from 'pocketbase'

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'

let pb: PocketBase | null = null

export function getPB(): PocketBase {
  if (!pb) {
    pb = new PocketBase(PB_URL)
    pb.autoCancellation(false)
  }
  return pb
}

export function getAvatarUrl(record: { id: string; collectionId: string; avatar?: string }): string | null {
  if (!record.avatar) return null
  return getPB().files.getUrl(record, record.avatar, { thumb: '100x100' })
}
