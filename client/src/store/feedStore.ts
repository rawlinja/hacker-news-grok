import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getFeed } from '../api'
import type { Feed, Story, Tag } from '../types'

interface FeedStore {
  feed: Feed
  page: number
  loadedStories: Story[]
  loading: boolean
  error: boolean
  selectedTags: Tag[]
  ensureLoaded: () => Promise<void>
  loadMore: () => Promise<void>
  selectFeed: (feed: Feed) => Promise<void>
  retry: () => Promise<void>
  toggleTag: (tag: Tag) => void
  clearTags: () => void
}

export const useFeedStore = create<FeedStore>()(
  persist(
    (set, get) => {
      const fetchPage = async (feed: Feed, page: number, append: boolean) => {
        set({ loading: true, error: false })
        try {
          const batch = await getFeed(feed, page)
          set((state) => ({
            feed,
            page,
            loadedStories: append ? [...state.loadedStories, ...batch] : batch,
            loading: false,
          }))
        } catch {
          set({ loading: false, error: true })
        }
      }

      return {
        feed: 'top',
        page: 0,
        loadedStories: [],
        loading: false,
        error: false,
        selectedTags: [],
        ensureLoaded: async () => {
          if (get().loadedStories.length === 0) await fetchPage(get().feed, 0, false)
        },
        loadMore: async () => {
          await fetchPage(get().feed, get().page + 1, true)
        },
        selectFeed: async (feed) => {
          if (feed === get().feed) return
          set({ feed, page: 0, loadedStories: [] })
          await fetchPage(feed, 0, false)
        },
        retry: async () => {
          await fetchPage(get().feed, get().page, get().loadedStories.length > 0)
        },
        toggleTag: (tag) =>
          set((state) => ({
            selectedTags: state.selectedTags.includes(tag)
              ? state.selectedTags.filter((selectedTag) => selectedTag !== tag)
              : [...state.selectedTags, tag],
          })),
        clearTags: () => set({ selectedTags: [] }),
      }
    },
    {
      name: 'hn-grok-feed',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        feed: state.feed,
        page: state.page,
        loadedStories: state.loadedStories,
        selectedTags: state.selectedTags,
      }),
    },
  ),
)
