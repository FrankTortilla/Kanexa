---
name: youtube-research
description: Research a YouTube channel's content. Use when user says /youtube @channelname or asks to analyze what content works for a YouTube channel.
allowed-tools: WebSearch, WebFetch, Write
---

# YouTube Channel Research Skill

When the user invokes `/youtube @channelname`, research the channel and create a markdown report.

## Instructions

1. **Extract the channel handle** from the user's input (e.g., `@mkbhd` from `/youtube @mkbhd`)

2. **Search for recent videos** using WebSearch:
   - Query: `"{channel handle}" youtube recent videos site:youtube.com`
   - Also search: `"{channel handle}" youtube channel most viewed`

3. **Fetch channel/video data** using WebFetch:
   - Fetch the channel's YouTube page: `https://www.youtube.com/@{handle}`
   - Extract: subscriber count, channel description, content niche
   - Fetch 2-3 top video pages to get view counts and engagement

4. **Analyze content patterns**:
   - What video formats are used (tutorials, reviews, vlogs, etc.)
   - What topics get the most views
   - Video length patterns
   - Thumbnail/title patterns if observable

5. **Create the research file**:
   - Create directory if needed: `./youtube-research/`
   - Save to: `./youtube-research/{handle}.md` (without the @ symbol)

## Output Format

```markdown
# {Channel Name} - YouTube Research

*Research date: {current date}*

## Channel Overview
- **Handle:** @{handle}
- **Subscribers:** {count}
- **Niche:** {description of content focus}

## Top Recent Videos

| Video | Views | Published |
|-------|-------|-----------|
| {title} | {views} | {date} |
| {title} | {views} | {date} |
| {title} | {views} | {date} |
| {title} | {views} | {date} |
| {title} | {views} | {date} |

## Content Analysis

### What's Working
{1-2 paragraphs analyzing what content formats and topics perform best}

### Key Insight
{A specific, actionable insight about what makes this channel's content successful}
```

## Notes
- If you cannot access certain data, note what was unavailable
- Focus on actionable insights, not just raw numbers
- Keep the analysis concise but valuable
