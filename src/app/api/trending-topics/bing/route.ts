/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"

// Interface for our trending topics
interface TrendingTopic {
  id: string
  hashtag: string
  title: string
  category: string
  posts: number
  trend: "up" | "down" | "stable"
  percentageChange?: number
  timeframe: string
  url?: string
}

export async function GET() {
  try {
    // Fetch trending topics from Bing News Search API
    const bingTrends = await fetchBingNewsTrends()

    // If Bing API fails, use GitHub as backup
    if (bingTrends.length === 0) {
      const githubTrends = await fetchGitHubTrends()

      // If both APIs fail, use sample data
      if (githubTrends.length === 0) {
        return NextResponse.json(sampleTrendingTopics)
      }

      return NextResponse.json(githubTrends)
    }

    return NextResponse.json(bingTrends)
  } catch (error) {
    console.error("Error fetching trending topics:", error)
    return NextResponse.json(sampleTrendingTopics)
  }
}

// Fetch trending news from Bing News Search API
async function fetchBingNewsTrends(): Promise<TrendingTopic[]> {
  try {
    // You need to sign up for a free API key at https://www.microsoft.com/en-us/bing/apis/bing-news-search-api
    const apiKey = process.env.BING_NEWS_API_KEY

    if (!apiKey) {
      console.warn("Bing News API key not found")
      return []
    }

    const response = await fetch(
      "https://api.bing.microsoft.com/v7.0/news/search?q=education+technology+learning+student&count=10&sortBy=relevance",
      {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!response.ok) {
      throw new Error(`Bing News API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform Bing News data to our format
    return data.value.map((article: any, index: number) => {
      // Create a hashtag from the title
      const hashtag = article.name
        .split(" ")
        .slice(0, 2)
        .join("")
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 15)

      // Determine category based on content
      let category = "news"
      const title = article.name.toLowerCase()

      if (title.includes("github") || title.includes("code") || title.includes("programming")) {
        category = "technology"
      } else if (title.includes("education") || title.includes("learning") || title.includes("student")) {
        category = "education"
      }

      // Calculate trend and engagement metrics (simulated)
      const trend = index < 3 ? "up" : index < 7 ? "stable" : "down"
      const posts = Math.floor(2000 + Math.random() * 8000)
      const percentageChange =
        trend === "up"
          ? Math.floor(20 + Math.random() * 40)
          : trend === "down"
            ? Math.floor(5 + Math.random() * 15)
            : Math.floor(1 + Math.random() * 10)

      // Calculate timeframe based on publish date
      const publishedDate = new Date(article.datePublished)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60))
      let timeframe = "This week"

      if (diffHours < 24) {
        timeframe = "Today"
      } else if (diffHours < 48) {
        timeframe = "Yesterday"
      }

      return {
        id: `bing-${index}-${Date.now()}`,
        hashtag,
        title: article.name.substring(0, 60),
        category,
        posts,
        trend,
        percentageChange,
        timeframe,
        url: article.url,
      }
    })
  } catch (error) {
    console.error("Error fetching Bing News trends:", error)
    return []
  }
}

// Fetch trending GitHub repositories related to education
async function fetchGitHubTrends(): Promise<TrendingTopic[]> {
  try {
    // GitHub API to get trending repositories in education
    const response = await fetch(
      "https://api.github.com/search/repositories?q=topic:education+topic:learning&sort=stars&order=desc",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Add GitHub token if you have one to increase rate limit
          // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform GitHub data to our format
    return data.items.slice(0, 10).map((repo: any, index: number) => {
      // Calculate trend based on stars and forks
      const trend = repo.stargazers_count > 100 ? "up" : repo.stargazers_count > 50 ? "stable" : "down"

      // Calculate percentage change (simplified)
      const percentageChange =
        trend === "up"
          ? Math.floor(10 + Math.random() * 40)
          : trend === "down"
            ? Math.floor(5 + Math.random() * 15)
            : Math.floor(1 + Math.random() * 8)

      return {
        id: `github-${repo.id}`,
        hashtag: repo.name.replace(/[-_]/g, "").substring(0, 15),
        title: repo.description?.substring(0, 60) || repo.name,
        category: "github",
        posts: repo.stargazers_count,
        trend,
        percentageChange,
        timeframe: "This week",
        url: repo.html_url,
      }
    })
  } catch (error) {
    console.error("Error fetching GitHub trends:", error)
    return []
  }
}

// Sample data as fallback
const sampleTrendingTopics = [
  {
    id: "1",
    hashtag: "DigitalLearning",
    title: "New approaches to online education",
    category: "education",
    posts: 24500,
    trend: "up",
    percentageChange: 32,
    timeframe: "Today",
  },
  {
    id: "2",
    hashtag: "STEM",
    title: "Promoting science and technology in schools",
    category: "education",
    posts: 18300,
    trend: "up",
    percentageChange: 45,
    timeframe: "Today",
  },
  {
    id: "3",
    hashtag: "TeacherResources",
    title: "Free materials for classroom instruction",
    category: "resources",
    posts: 12700,
    trend: "stable",
    percentageChange: 5,
    timeframe: "This week",
  },
  {
    id: "4",
    hashtag: "EdTech",
    title: "Latest educational technology innovations",
    category: "technology",
    posts: 9800,
    trend: "up",
    percentageChange: 28,
    timeframe: "Today",
  },
  {
    id: "5",
    hashtag: "RemoteLearning",
    title: "Challenges in distance education",
    category: "education",
    posts: 8500,
    trend: "down",
    percentageChange: 12,
    timeframe: "Today",
  },
  {
    id: "6",
    hashtag: "StudentSuccess",
    title: "Strategies for improving academic performance",
    category: "resources",
    posts: 7200,
    trend: "up",
    percentageChange: 18,
    timeframe: "This week",
  },
  {
    id: "7",
    hashtag: "AI4Education",
    title: "Artificial intelligence in the classroom",
    category: "technology",
    posts: 6500,
    trend: "up",
    percentageChange: 22,
    timeframe: "Yesterday",
  },
  {
    id: "8",
    hashtag: "InclusiveLearning",
    title: "Making education accessible for all students",
    category: "education",
    posts: 5800,
    trend: "stable",
    percentageChange: 3,
    timeframe: "This week",
  },
]
