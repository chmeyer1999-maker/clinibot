const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');

// Crear la aplicación
const app = express();
app.use(cors());
app.use(express.json());

// Configurar Groq (IA)
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'TU_API_KEY_AQUI'
});

// Ruta principal
app.get('/', (req, res) => {
    res.send('¡CliniBot está funcionando!');
});

// Ruta del chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const { message, clinicName, clinicInfo } = req.body;
        
        // Crear el prompt (instrucciones para la IA)
        const prompt = `
        Eres el asistente virtual de "${clinicName}". 
        Información de la clínica: ${clinicInfo}
        
        REGLAS IMPORTANTES:
        1. Sé amable y profesional
        2. Si preguntan por citas, ofrece horarios disponibles
        3. Si preguntan precios, da rangos aproximados
        4. Para emergencias, deriva al teléfono
        5. Mantén respuestas cortas y útiles
        
        PREGUNTA DEL USUARIO: ${message}
        
        RESPUESTA:`;
        
        // Obtener respuesta de la IA
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "mixtral-8x7b-32768",
            temperature: 0.7,
            max_tokens: 300
        });
        
        const reply = chatCompletion.choices[0]?.message?.content || 
                    "Lo siento, no pude procesar tu pregunta. Por favor contacta al 555-1234";
        
        res.json({ reply });
        
    } catch (error) {
        console.error('Error:', error);
        res.json({ reply: "Disculpa, estoy teniendo dificultades técnicas. Por favor llama al 555-1234 para asistencia inmediata." });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en puerto ${PORT}`);
});