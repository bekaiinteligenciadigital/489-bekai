import PocketBase from 'pocketbase'

const baseUrl =
  import.meta.env.VITE_POCKETBASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8090')

const pb = new PocketBase(baseUrl)
pb.autoCancellation(false)

export default pb
