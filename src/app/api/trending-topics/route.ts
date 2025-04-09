import { NextResponse } from "next/server";

// Interface for our trending topics
interface TrendingTopic {
  id: string;
  hashtag: string;
  title: string;
  category: string;
  posts: number;
  trend: "up" | "down" | "stable";
  percentageChange?: number;
  timeframe: string;
  url?: string;
}

export async function GET() {
  try {
    // Combine data from multiple sources
    const [githubTrends, newsTrends, hackernewsTrends] =
      await Promise.allSettled([
        fetchGitHubTrends(),
        fetchEducationNews(),
        fetchHackerNewsTrends(),
      ]);

    // Combine all trends
    let allTrends: TrendingTopic[] = [];

    // Add GitHub trends if successful
    if (githubTrends.status === "fulfilled") {
      allTrends = [...allTrends, ...githubTrends.value];
    }

    // Add news trends if successful
    if (newsTrends.status === "fulfilled") {
      allTrends = [...allTrends, ...newsTrends.value];
    }

    // Add HackerNews trends if successful
    if (hackernewsTrends.status === "fulfilled") {
      allTrends = [...allTrends, ...hackernewsTrends.value];
    }

    // If all APIs failed, use sample data
    if (allTrends.length === 0) {
      return NextResponse.json(sampleTrendingTopics);
    }

    // Sort by trend (up first) and then by post count
    allTrends.sort((a, b) => {
      if (a.trend === "up" && b.trend !== "up") return -1;
      if (a.trend !== "up" && b.trend === "up") return 1;
      return b.posts - a.posts;
    });

    return NextResponse.json(allTrends);
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return NextResponse.json(sampleTrendingTopics);
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
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform GitHub data to our format
    return data.items.slice(0, 5).map((repo: any, index: number) => {
      // Calculate trend based on stars and forks
      const trend =
        repo.stargazers_count > 100
          ? "up"
          : repo.stargazers_count > 50
          ? "stable"
          : "down";

      // Calculate percentage change (simplified)
      const percentageChange =
        trend === "up"
          ? Math.floor(10 + Math.random() * 40)
          : trend === "down"
          ? Math.floor(5 + Math.random() * 15)
          : Math.floor(1 + Math.random() * 8);

      // Create a hashtag from the repo name
      const hashtag = repo.name
        .replace(/[-_]/g, "")
        .replace(/([a-z])([A-Z])/g, "$1$2") // Add space between camelCase
        .split(/\s+/)
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("")
        .substring(0, 15);

      return {
        id: `github-${repo.id}`,
        hashtag,
        title: repo.description?.substring(0, 60) || repo.name,
        category: "github",
        posts: repo.stargazers_count,
        trend,
        percentageChange,
        timeframe: "This week",
        url: repo.html_url,
      };
    });
  } catch (error) {
    console.error("Error fetching GitHub trends:", error);
    return [];
  }
}

// Fetch education news from NewsAPI
async function fetchEducationNews(): Promise<TrendingTopic[]> {
  try {
    // Using NewsAPI to get education news
    // You need to sign up for a free API key at https://newsapi.org/
    const apiKey = process.env.NEWS_API_KEY || "YOUR_NEWS_API_KEY";
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=education+technology+learning&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform news data to our format
    return data.articles.map((article: any, index: number) => {
      // Create a hashtag from the title
      const hashtag = article.title
        .split(/\s+/)
        .slice(0, 3)
        .map((word: string) => word.replace(/[^a-zA-Z0-9]/g, ""))
        .filter((word: string) => word.length > 0)
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("")
        .substring(0, 15);

      // Calculate trend and posts (simulated)
      const trend = index < 2 ? "up" : index < 4 ? "stable" : "down";
      const posts = Math.floor(1000 + Math.random() * 9000);
      const percentageChange =
        trend === "up"
          ? Math.floor(15 + Math.random() * 30)
          : trend === "down"
          ? Math.floor(5 + Math.random() * 15)
          : Math.floor(1 + Math.random() * 8);

      // Calculate timeframe
      const publishedDate = new Date(article.publishedAt);
      const now = new Date();
      const diffHours = Math.floor(
        (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60)
      );
      let timeframe = "This week";

      if (diffHours < 24) {
        timeframe = "Today";
      } else if (diffHours < 48) {
        timeframe = "Yesterday";
      }

      return {
        id: `news-${index}-${Date.now()}`,
        hashtag,
        title: article.title.substring(0, 60),
        category: "news",
        posts,
        trend,
        percentageChange,
        timeframe,
        url: article.url,
      };
    });
  } catch (error) {
    console.error("Error fetching education news:", error);
    return [];
  }
}

// Fetch trending tech stories from HackerNews
async function fetchHackerNewsTrends(): Promise<TrendingTopic[]> {
  try {
    // Fetch top stories from HackerNews
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`HackerNews API error: ${response.status}`);
    }

    const storyIds = await response.json();

    // Get details for top 5 stories
    const storyPromises = storyIds
      .slice(0, 5)
      .map((id: number) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (res) => res.json()
        )
      );

    const stories = await Promise.all(storyPromises);

    // Filter for education/tech related stories
    const educationTechStories = stories.filter((story: any) => {
      const keywords = [
        "education",
        "learning",
        "student",
        "school",
        "university",
        "college",
        "teach",
        "course",
        "programming",
        "coding",
        "tech",
        "AI",
      ];
      const title = story.title.toLowerCase();
      return keywords.some((keyword) => title.includes(keyword));
    });

    // Transform HackerNews data to our format
    return educationTechStories.map((story: any, index: number) => {
      // Create a hashtag from the title
      const hashtag = story.title
        .split(/\s+/)
        .slice(0, 2)
        .map((word: string) => word.replace(/[^a-zA-Z0-9]/g, ""))
        .filter((word: string) => word.length > 0)
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("")
        .substring(0, 15);

      // Determine category based on content
      let category = "technology";
      const title = story.title.toLowerCase();
      if (
        title.includes("education") ||
        title.includes("learning") ||
        title.includes("student") ||
        title.includes("school") ||
        title.includes("university") ||
        title.includes("college") ||
        title.includes("teach") ||
        title.includes("course")
      ) {
        category = "education";
      }

      return {
        id: `hn-${story.id}`,
        hashtag,
        title: story.title.substring(0, 60),
        category,
        posts: story.score,
        trend: "up",
        percentageChange: Math.floor(20 + Math.random() * 30),
        timeframe: "Today",
        url: story.url,
      };
    });
  } catch (error) {
    console.error("Error fetching HackerNews trends:", error);
    return [];
  }
}

// Sample data as fallback
const sampleTrendingTopics = [
  {
    id: "1",
    hashtag: "WebDevForBegin",
    title: "24 Lessons, 12 Weeks, Get Started with Web Development",
    category: "education",
    posts: 87134,
    trend: "up",
    percentageChange: 31,
    timeframe: "This week",
  },
  {
    id: "2",
    hashtag: "p5js",
    title: "p5.js is a client-side JS platform for creative coding",
    category: "technology",
    posts: 52408,
    trend: "up",
    percentageChange: 48,
    timeframe: "This week",
  },
  {
    id: "3",
    hashtag: "VimAndroid",
    title: "Learning Vim and Vimscript doesn't have to be hard",
    category: "technology",
    posts: 14257,
    trend: "up",
    percentageChange: 23,
    timeframe: "This week",
  },
  {
    id: "4",
    hashtag: "AnkiDroid",
    title: "AnkiDroid: Anki flashcards on Android devices",
    category: "education",
    posts: 9390,
    trend: "up",
    percentageChange: 40,
    timeframe: "This week",
  },
  {
    id: "5",
    hashtag: "Processing",
    title: "Source code for the Processing Development Environment",
    category: "technology",
    posts: 6511,
    trend: "up",
    percentageChange: 18,
    timeframe: "This week",
  },
  {
    id: "6",
    hashtag: "EmailSender",
    title: "The recipient test: a simple test for email deliverability",
    category: "technology",
    posts: 4176,
    trend: "up",
    percentageChange: 34,
    timeframe: "Yesterday",
  },
  {
    id: "7",
    hashtag: "Thechroot",
    title: "Hotmail's Sabeer Bhatia Slams Indian Tech Education",
    category: "education",
    posts: 3742,
    trend: "up",
    percentageChange: 23,
    timeframe: "Yesterday",
  },
  {
    id: "8",
    hashtag: "Bootcamp",
    title: "The chroot Technique – a Swiss Army Knife for Developers",
    category: "technology",
    posts: 2975,
    trend: "up",
    percentageChange: 24,
    timeframe: "Today",
  },
  {
    id: "9",
    hashtag: "GlobalToy",
    title: "How University Students Use Class Time When Lectures",
    category: "education",
    posts: 1892,
    trend: "up",
    percentageChange: 14,
    timeframe: "Today",
  },
  {
    id: "10",
    hashtag: "AIStartups",
    title: "Global Toy Market Set to Soar to $230 Billion",
    category: "technology",
    posts: 1580,
    trend: "stable",
    percentageChange: 4,
    timeframe: "Yesterday",
    url: "https://example.com/global-toy-market",
  },
  {
    id: "11",
    hashtag: "HerFinances",
    title: "AI Startups: SignalFire Raises $1 Billion",
    category: "technology",
    posts: 3900,
    trend: "stable",
    percentageChange: 8,
    timeframe: "Yesterday",
    url: "https://example.com/signalfire-funding",
  },
  {
    id: "12",
    hashtag: "FinTech",
    title: "Her Finances Launches AI-Driven Financial Advisor",
    category: "technology",
    posts: 1580,
    trend: "stable",
    percentageChange: 8,
    timeframe: "Yesterday",
    url: "https://example.com/her-finances-ai-advisor",
  },
];
