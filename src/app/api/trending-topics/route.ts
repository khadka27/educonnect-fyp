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

    // If all APIs failed, return an empty array instead of sample data
    if (allTrends.length === 0) {
      return NextResponse.json([]);
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
    // Return empty array instead of sample data
    return NextResponse.json([]);
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
    const apiKey = process.env.NEWS_API_KEY || "";
    if (!apiKey) {
      console.warn("NewsAPI key not found, skipping news fetch");
      return [];
    }

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
      const posts = Math.floor(100 + Math.random() * 900); // More realistic numbers
      const percentageChange =
        trend === "up"
          ? Math.floor(5 + Math.random() * 20) // More realistic percentage changes
          : trend === "down"
          ? Math.floor(2 + Math.random() * 10)
          : Math.floor(1 + Math.random() * 5);

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
      .slice(0, 10) // Get 10 stories to increase chances of finding education/tech related ones
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
        "computer",
        "online",
        "e-learning",
        "study",
      ];
      const title = story.title?.toLowerCase() || "";
      return keywords.some((keyword) => title.includes(keyword));
    });

    // Slice to get at most 5 stories
    const finalStories = educationTechStories.slice(0, 5);

    // Transform HackerNews data to our format
    return finalStories.map((story: any, index: number) => {
      // Create a hashtag from the title
      const hashtag = (story.title || "")
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
      const title = story.title?.toLowerCase() || "";
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
        title: (story.title || "Unknown title").substring(0, 60),
        category,
        posts: story.score || 0,
        trend: "up",
        percentageChange: Math.floor(5 + Math.random() * 20),
        timeframe: "Today",
        url: story.url,
      };
    });
  } catch (error) {
    console.error("Error fetching HackerNews trends:", error);
    return [];
  }
}
