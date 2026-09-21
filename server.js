const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname)));

app.post("/generate", async (req, res) => {

    try {

        const {
            videoIdea,
            thumbnailText,
            style
        } = req.body;

        if (!videoIdea) {
            return res.status(400).json({
                error: "Please enter a video idea."
            });
        }

        const selectedStyle = style || "cinematic";

        const prompt = `
Create a premium, professional YouTube thumbnail image.

VIDEO CONCEPT:
${videoIdea}

VISUAL STYLE:
${selectedStyle}

Create ONE powerful visual scene that immediately communicates the video idea.

COMPOSITION:
- 16:9 widescreen YouTube thumbnail
- Designed to look excellent at small thumbnail size
- One dominant main subject
- Main subject large and easy to recognize
- Strong foreground and background depth
- Dynamic cinematic camera angle
- Strong visual storytelling
- Clear focal point
- Leave clean negative space on the LEFT side for large thumbnail text
- Keep the main subject primarily on the RIGHT side
- Subject should not be cropped awkwardly
- Make the scene understandable in less than one second
- Professional creator thumbnail composition

SUBJECT:
- Extremely detailed
- Photorealistic
- Strong emotion or dramatic body language when appropriate
- Natural anatomy
- Realistic materials and textures
- Sharp facial features when a person is present
- Strong separation from the background

LIGHTING:
- Dramatic cinematic lighting
- Strong highlights and shadows
- Realistic sunlight or environmental lighting
- Atmospheric depth
- Realistic reflections
- High contrast
- Professional color grading
- Vibrant but believable colors

VISUAL QUALITY:
- Ultra detailed
- Photorealistic
- Sharp
- High-end commercial photography
- Movie-quality visual effects
- Realistic depth of field
- Clean professional finish
- No blurry main subject

THUMBNAIL GOAL:
Make the viewer instantly think:
"What is happening here?"
The image should create curiosity and make the viewer want to click.

ABSOLUTELY DO NOT GENERATE:
- Text
- Letters
- Words
- Captions
- Subtitles
- Logos
- Watermarks
- UI elements
- Borders
- Collages
- Multiple unrelated scenes
- Random objects
- Fake writing
- Gibberish lettering

The thumbnail text will be added separately by the Thumora application.

Create only the cinematic visual scene.
`;

        console.log("");
        console.log("=================================");
        console.log("Generating Thumora thumbnail...");
        console.log("=================================");

        const response = await fetch(
            "https://api.pixazo.ai/api/v1/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.PIXAZO_API_KEY}`
                },

                body: JSON.stringify({
                    model: "flux-schnell",
                    prompt: prompt
                })
            }
        );

        const data = await response.json();

        console.log("Pixazo response:", data);

        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Pixazo API request failed."
            );
        }

        const imageUrl =
            data.image_url ||
            data.url ||
            data.output;

        if (!imageUrl) {

            throw new Error(
                "Pixazo did not return an image URL."
            );
        }

        res.json({
            success: true,
            image: imageUrl,
            thumbnailText: thumbnailText || ""
        });

    } catch (error) {

        console.error("Generation error:", error);

        res.status(500).json({
            error:
                error.message ||
                "Failed to generate thumbnail."
        });
    }

});

app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log("       THUMORA AI RUNNING");
    console.log("=================================");
    console.log("");
    console.log(`Open: http://localhost:${PORT}`);
    console.log("");

});
