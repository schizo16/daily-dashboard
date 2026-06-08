export interface GitHubRepo {
  id: number
  name: string
  description: string
  stars: number
  url: string
  language: string
}

export interface HackerNewsStory {
  id: number
  title: string
  url: string
  score: number
  by: string
}

export interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  overview: string
  release_date: string
  genre_ids: number[]
}

export interface SteamDeal {
  title: string
  salePrice: string
  normalPrice: string
  savings: string
  steamRating: string
  thumb: string
  dealID: string
}

export interface RadioStation {
  name: string
  url: string
  votes: number
  country: string
}

export interface RedditPost {
  title: string
  url: string
  score: number
  comments: number
}
