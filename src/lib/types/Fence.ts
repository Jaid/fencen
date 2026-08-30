export type FencePayload = {
  language?: string
}

export type Fence = {
  closer: () => string
  opener: (payload?: FencePayload) => string
}
