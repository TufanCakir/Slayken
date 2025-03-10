// src/logic/NewsLogic.js
import { useState, useEffect } from "react";

// Local news content
const contentNews = [
  {
    id: "news-001",
    title: "Welcome",
    content: "Welcome to Slayken. Are you ready for your adventure?",
    image:
      "https://github.com/TufanCakir/slayken-assets/blob/main/players/withBackground/player1.png?raw=true",
    date: new Date().toISOString().split("T")[0], // current system date
  },
];

export const useNewsLogic = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // URLs for the data
  const playersUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/players.json";
  const eventBossesUrl =
    "https://raw.githubusercontent.com/TufanCakir/slayken-assets/refs/heads/main/eventBoss.json";

  useEffect(() => {
    async function loadNews() {
      try {
        // First, load the players data – we only use it here to ensure the fetch is successful.
        const playerRes = await fetch(playersUrl);
        if (!playerRes.ok) {
          throw new Error("Players data not reachable.");
        }
        await playerRes.json();

        // Load the event boss data
        const bossRes = await fetch(eventBossesUrl);
        let eventBossData = [];
        if (bossRes.ok) {
          eventBossData = await bossRes.json();
        } else {
          throw new Error("Event boss data not reachable.");
        }

        // Map the loaded event boss data into a news format.
        // You can adjust the presentation as needed:
        const mappedEventBosses = eventBossData.map((boss) => ({
          id: boss.id,
          title: boss.name,
          content: `Are you ready to face ${boss.name}?`,
          image: boss.image, // Use the boss image from the JSON
          date: new Date().toISOString().split("T")[0], // current date
          characterBackground: boss.image, // used as background
        }));

        // Merge the local news and the mapped event boss news.
        // You can adjust the order here as desired (e.g., sort them).
        const mergedNews = [...contentNews, ...mappedEventBosses];

        // For each news item: if no image is provided, use a fallback.
        const newsWithBackground = mergedNews.map((news) => ({
          ...news,
          characterBackground:
            news.image && news.image.trim() !== ""
              ? news.image
              : "https://via.placeholder.com/600x300?text=Default+Background",
        }));

        setNewsItems(newsWithBackground);
        setLoading(false);
      } catch (error) {
        console.error("Error loading news:", error);
        const newsWithFallback = contentNews.map((news) => ({
          ...news,
          characterBackground:
            "https://via.placeholder.com/600x300?text=Default+Background",
        }));
        setNewsItems(newsWithFallback);
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  return { newsItems, loading };
};
