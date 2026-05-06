import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzePhotoBody, SearchPhotosBody } from "@workspace/api-zod";

const router = Router();

router.post("/photos/analyze", async (req, res) => {
  const parseResult = AnalyzePhotoBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }

  const { imageBase64, photoId } = parseResult.data;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "low",
              },
            },
            {
              type: "text",
              text: `Analyze this photo and return ONLY valid JSON (no markdown, no code blocks) with these exact fields:
{
  "description": "1-2 sentences describing the scene, people, objects, activities, emotions, and setting",
  "tags": ["array", "of", "10-15", "specific", "searchable", "keywords", "including", "colors", "people", "places"],
  "sceneType": "indoor|outdoor|mixed",
  "timeOfDay": "day|night|dawn|dusk|unknown"
}`,
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let analysis: {
      description?: string;
      tags?: string[];
      sceneType?: string;
      timeOfDay?: string;
    };

    try {
      analysis = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    res.json({
      photoId,
      description: analysis.description ?? "Unable to analyze photo",
      tags: Array.isArray(analysis.tags) ? analysis.tags : [],
      sceneType: analysis.sceneType ?? "unknown",
      timeOfDay: analysis.timeOfDay ?? "unknown",
    });
  } catch (err) {
    req.log.error({ err }, "Photo analysis failed");
    res.status(500).json({ error: "Failed to analyze photo" });
  }
});

router.post("/photos/search", async (req, res) => {
  const parseResult = SearchPhotosBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.message });
    return;
  }

  const { query, photos } = parseResult.data;

  if (photos.length === 0) {
    res.json({ results: [] });
    return;
  }

  try {
    const photoList = photos
      .map(
        (p) =>
          `ID: ${p.id}\nDescription: ${p.description}\nTags: ${p.tags.join(", ")}\nScene: ${p.sceneType}, Time: ${p.timeOfDay}`,
      )
      .join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a semantic photo search engine. The user is searching for: "${query}"

Here are the indexed photos:
${photoList}

Return ONLY valid JSON (no markdown, no code blocks) — an array of matching results ranked by relevance. Only include photos with relevanceScore above 0.25. Format exactly:
[{"id": "photo_id", "relevanceScore": 0.0, "matchReason": "brief reason"}]

If nothing matches, return: []`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "[]";
    let results: Array<{
      id: string;
      relevanceScore: number;
      matchReason: string;
    }>;

    try {
      const parsed = JSON.parse(content);
      results = Array.isArray(parsed) ? parsed : [];
    } catch {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      results = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }

    res.json({ results });
  } catch (err) {
    req.log.error({ err }, "Photo search failed");
    res.status(500).json({ error: "Failed to search photos" });
  }
});

export default router;
