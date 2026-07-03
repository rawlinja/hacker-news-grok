export type Feed = 'top' | 'new' | 'best'

export const TAGS = [
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
] as const

export type Tag = (typeof TAGS)[number]

export interface Story {
  id: number
  title: string
  by: string
  score: number
  time: number
  descendants: number
  type: string
  url?: string
  text?: string
  tags: Tag[]
}

export interface Comment {
  id: number
  by: string
  time: number
  text: string
  replies: Comment[]
}

export interface StoryDetail {
  story: Story
  comments: Comment[]
}

export interface StorySummary {
  summary: string
  commentsUsed: number
}
