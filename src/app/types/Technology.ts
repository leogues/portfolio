export type Technologies = Record<string, Technology>

export type Technology = {
  name: string
  category: string
  image: string
  link: string
  isRelevant: boolean
}