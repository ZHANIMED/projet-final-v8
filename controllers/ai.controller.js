const { GoogleGenAI } = require("@google/genai");

// Initialisation avec vérification
let ai = null;
try {
    if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        console.log("✅ Google Gemini AI initialisé !");
    } else {
        console.log("⚠️ Aucune clé GEMINI_API_KEY trouvée dans .env");
    }
} catch (error) {
    console.log("❌ Erreur init Gemini:", error.message);
}

exports.chat = async (req, res, next) => {
    try {
        if (!process.env.GEMINI_API_KEY) return res.status(503).json({ message: "L'IA n'est pas configurée (clé API Gemini manquante dans .env)." });
        if (!ai) return res.status(503).json({ message: "Erreur d'initialisation de l'IA. Vérifiez les logs serveur." });

        const { message } = req.body;
        if (!message) return res.status(400).json({ message: "Le message est requis" });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
            config: {
                systemInstruction: "Tu es un assistant virtuel pour une boutique éco-responsable appelée My Ecodeco. Tu réponds de manière courte, polie et utile pour aider les clients à naviguer ou choisir des produits.",
            }
        });

        res.json({ response: response.text });
    } catch (err) {
        console.error("Erreur Gemini Chat:", err);
        next(err);
    }
};

exports.describeImage = async (req, res, next) => {
    try {
        if (!ai) return res.status(503).json({ message: "L'IA n'est pas configurée (clé API Gemini manquante dans .env)." });

        const imagePath = req.file ? req.file.path : req.body.imageUrl;
        if (!imagePath) return res.status(400).json({ message: "Aucune image fournie." });

        let mimeType = "image/jpeg";
        if (imagePath.toLowerCase().endsWith(".png")) mimeType = "image/png";
        else if (imagePath.toLowerCase().endsWith(".webp")) mimeType = "image/webp";

        // L'image uploadée vient de Cloudinary (URL) ou d'une source locale
        const isUrl = imagePath.startsWith('http');
        let bufferStr;

        if (isUrl) {
            // Utiliser axios ou fetch dynamique
            const responseImg = await fetch(imagePath);
            if (!responseImg.ok) throw new Error("Erreur lors de la récupération de l'image (URL invalide).");
            const arrayBuffer = await responseImg.arrayBuffer();
            bufferStr = Buffer.from(arrayBuffer).toString('base64');
        } else {
            // Fichier local uploads/
            const fs = require('fs');
            const buffer = fs.readFileSync(imagePath);
            bufferStr = buffer.toString('base64');
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { data: bufferStr, mimeType } },
                        { text: "Rédige une belle description commerciale et concise pour ce produit que je veux vendre sur ma boutique. Maximum 3 phrases." }
                    ]
                }
            ]
        });

        res.json({ description: response.text });
    } catch (err) {
        next(err);
    }
};
