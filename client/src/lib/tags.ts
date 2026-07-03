import type { Story } from '../types'

export type Tag =
  | 'technical_deep_dive'
  | 'new_tool_or_library'
  | 'company_or_startup_news'
  | 'ai_ml'
  | 'security_privacy'
  | 'science_research'
  | 'policy_regulation_law'
  | 'career_work_culture'
  | 'opinion_analysis'
  | 'show_hn_launch'
  | 'historical_or_retrospective'
  | 'other'
  | 'announcement'
  | 'tutorial'
  | 'reference'
  | 'benchmark'
  | 'postmortem'
  | 'paper'
  | 'discussion_prompt'
  | 'personal_story'
  | 'investigation'
  | 'demo_project'

export const TAG_ORDER: Tag[] = [
  'technical_deep_dive',
  'new_tool_or_library',
  'company_or_startup_news',
  'ai_ml',
  'security_privacy',
  'science_research',
  'policy_regulation_law',
  'career_work_culture',
  'opinion_analysis',
  'show_hn_launch',
  'historical_or_retrospective',
  'other',
  'announcement',
  'tutorial',
  'reference',
  'benchmark',
  'postmortem',
  'paper',
  'discussion_prompt',
  'personal_story',
  'investigation',
  'demo_project',
]

export const TAG_LABELS: Record<Tag, string> = {
  technical_deep_dive: 'Technical Deep Dive',
  new_tool_or_library: 'New Tool/Library',
  company_or_startup_news: 'Company/Startup News',
  ai_ml: 'AI/ML',
  security_privacy: 'Security/Privacy',
  science_research: 'Science/Research',
  policy_regulation_law: 'Policy/Regulation/Law',
  career_work_culture: 'Career/Work Culture',
  opinion_analysis: 'Opinion/Analysis',
  show_hn_launch: 'Show HN/Launch',
  historical_or_retrospective: 'Historical/Retrospective',
  other: 'Other',
  announcement: 'Announcement',
  tutorial: 'Tutorial',
  reference: 'Reference',
  benchmark: 'Benchmark',
  postmortem: 'Postmortem',
  paper: 'Paper',
  discussion_prompt: 'Discussion Prompt',
  personal_story: 'Personal Story',
  investigation: 'Investigation',
  demo_project: 'Demo Project',
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
