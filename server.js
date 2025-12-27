const express = require('express');
const cors = require('cors');
const path = require('path');
const { Groq } = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Configurar Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'TU_API_KEY_AQUI'
});

// Servir index.html en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta del chatbot API
app.post('/api/chat', async (req, res) => {
    try {
        const { message, clinicName = "Clínica Dental", clinicInfo = "Horarios: Lunes a Viernes 9am-6pm" } = req.body;
        
        const prompt = `Eres asistente de ${clinicName}. Información: ${clinicInfo}.
        Responde preguntas sobre horarios, precios, citas. Para emergencias deriva al teléfono.
        Pregunta: ${message}
        Respuesta:`;
        
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "mixtral-8x7b-32768",
            temperature: 0.7,
            max_tokens: 200
        });
        
        const reply = chatCompletion.choices[0]?.message?.content || 
                    "Disculpa, hubo un error. Por favor llama al consultorio.";
        
        res.json({ reply });
        
    } catch (error) {
        console.error('Error:', error);
        res.json({ reply: "Error técnico. Por favor contacta al consultorio directamente." });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor funcionando en puerto ${PORT}`);
});
