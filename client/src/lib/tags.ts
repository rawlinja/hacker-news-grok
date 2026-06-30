import type { Story } from '../types'

export type Tag = 'ai_ml' | 'technical_deep_dive' | 'science_research' | 'paper'

export const TAG_ORDER: Tag[] = ['ai_ml', 'technical_deep_dive', 'science_research', 'paper']

export const TAG_LABELS: Record<Tag, string> = {
  ai_ml: 'AI/ML',
  technical_deep_dive: 'Technical Deep Dive',
  science_research: 'Science/Research',
  paper: 'Paper',
}

const isKnownTag = (value: string): value is Tag => value in TAG_LABELS

export interface TagFacet {
  tag: Tag
  label: string
  count: number
}

export function deriveTagFacets(stories: Story[]): TagFacet[] {
  const countByTag = new Map<Tag, number>()
  for (const story of stories) {
    for (const tag of story.tags) {
      if (isKnownTag(tag)) countByTag.set(tag, (countByTag.get(tag) ?? 0) + 1)
    }
  }
  return [...countByTag.entries()]
    .map(([tag, count]) => ({ tag, label: TAG_LABELS[tag], count }))
    .sort((first, second) =>
      second.count - first.count || TAG_ORDER.indexOf(first.tag) - TAG_ORDER.indexOf(second.tag),
    )
}

export function filterByTags(stories: Story[], selectedTags: Tag[]): Story[] {
  if (selectedTags.length === 0) return stories
  return stories.filter((story) => story.tags.some((tag) => selectedTags.includes(tag as Tag)))
}
