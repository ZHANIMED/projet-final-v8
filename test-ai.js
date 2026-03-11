require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function test() {
    try {
        console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const responseImg = await fetch("https://res.cloudinary.com/dzuntw7wi/image/upload/v1711234567/sample.jpg");
        const arrayBuffer = await responseImg.arrayBuffer();
        const bufferStr = Buffer.from(arrayBuffer).toString('base64');

        console.log("Calling Gemini...");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { data: bufferStr, mimeType: "image/jpeg" } },
                        { text: "Rédige une belle description commerciale et concise pour ce produit." }
                    ]
                }
            ]
        });
        console.log("Success:", response.text);
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.error(await e.response.text());
    }
}
test();
