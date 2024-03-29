import { writable } from 'svelte/store'

export const client_id = ''
export const api_key = ''
export const discovery_docs = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://people.googleapis.com/$discovery/rest?version=v1'
]
export const scopes = 'https://www.googleapis.com/auth/drive.readonly profile'
export const folderId = writable('root')
export const directorySize = writable(0)
export const fileCount = writable(0)
export const fileList = writable([])
export const isAuthenticated = writable(false)
