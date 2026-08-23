import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  app.post("/api/suggest-description", async (req, res) => {
    try {
      const { position, company, type, experiences } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key is missing" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = "";
      
      if (type === "experience") {
         if (!position) {
           return res.status(400).json({ error: "Position is required" });
         }
         prompt = `Actúa como un experto en redacción de currículums. Escribe una descripción profesional en español para la experiencia laboral de un '${position}'${company ? ` en la empresa '${company}'` : ''}. Resalta logros y responsabilidades típicas. Sé conciso, usa viñetas (formato de guiones -), máximo 4 puntos. No uses lenguaje introductorio ni conclusiones, solo las viñetas.`;
      } else {
         let expContext = experiences ? ` Experiencia previa y años: ${experiences}. Basa la redacción del resumen estrictamente en estos cargos y años de experiencia.` : '';
         prompt = `Actúa como un experto en redacción de currículums. Escribe un resumen profesional (perfil) en español para un candidato con el título de '${position || 'Profesional'}'.${expContext} Debe ser atractivo, destacar la trayectoria basándose únicamente en la información proporcionada y ser de un solo párrafo (máximo 5 líneas). No uses lenguaje introductorio ni comillas, solo el párrafo final.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ text: response.text?.trim() });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Error generating description" });
    }
  });

  app.post("/api/generate-cover-letter", async (req, res) => {
    try {
      const { cvData, targetJob, targetCompany } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key is missing" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const skillsStr = cvData.skills.map((s: any) => s.name).join(', ');
      const expStr = cvData.experience.map((e: any) => `${e.position} en ${e.company}`).join(', ');
      
      const prompt = `Escribe una carta de presentación profesional en español para postular al puesto de '${targetJob}' en la empresa '${targetCompany}'. Utiliza los siguientes datos del candidato:
Nombre: ${cvData.personalInfo.fullName}
Experiencia destacada: ${expStr}
Habilidades: ${skillsStr}
La carta debe ser persuasiva, destacar los puntos fuertes del candidato que encajen con el puesto, tener 3 a 4 párrafos y un tono formal pero moderno. No incluyas marcadores de posición [como este], invéntate los datos que falten si es estrictamente necesario o asúmelos. Devuelve únicamente el texto de la carta.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ text: response.text?.trim() });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Error generating cover letter" });
    }
  });

  app.post("/api/suggest-skills", async (req, res) => {
    try {
      const { sector, keyword } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key is missing" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = `Actúa como un experto en RRHH. Sugiere 5 habilidades clave (skills) muy cortas y precisas para un currículum en el sector/puesto '${sector}'.`;
      if (keyword) prompt += ` Específicamente relacionadas con o complementarias a: '${keyword}'.`;
      prompt += ` Devuelve SOLO una lista separada por comas, sin números, sin viñetas, sin texto introductorio.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      const text = response.text?.trim() || "";
      const skills = text.split(',').map(s => s.trim()).filter(s => s);
      res.json({ skills });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Error suggesting skills" });
    }
  });

  app.post("/api/check-grammar", async (req, res) => {
    try {
      const { text, data, isObject } = req.body;
      if (!isObject && !text) {
        return res.status(400).json({ error: "Text or data is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "API key is missing" });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = "";

      if (isObject && data) {
        prompt = `Actúa como un experto corrector ortográfico y gramatical. Corrige los errores ortográficos, gramaticales y de capitalización (mayúsculas iniciales, etc) en los valores del siguiente objeto JSON en español. Devuelve ÚNICAMENTE un objeto JSON válido con las mismas claves, sin explicaciones ni bloques de código markdown (no uses \`\`\`json).\n\nJSON:\n${JSON.stringify(data)}`;
      } else {
        prompt = `Actúa como un experto corrector ortográfico y gramatical. Revisa el siguiente texto en español y corrige cualquier error ortográfico, gramatical o de puntuación. Devuelve ÚNICAMENTE el texto corregido. Si el texto no tiene errores, devuélvelo tal cual. No incluyas explicaciones, comillas ni ningún otro texto adicional.\n\nTexto:\n${text}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      let resultText = response.text?.trim() || "";

      if (isObject) {
        resultText = resultText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(resultText);
        res.json({ data: parsed });
      } else {
        res.json({ text: resultText });
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Error checking grammar" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
