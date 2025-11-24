import { GoogleGenAI } from "@google/genai";
import { HighwayAssistanceInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findRoadsideAssistance = async (lat: number, lng: number): Promise<HighwayAssistanceInfo> => {
  try {
    const systemInstruction = `Eres UHsos, un operador de asistencia vial global inteligente.
    Tu misión es asistir a conductores en CUALQUIER PARTE DEL MUNDO.
    
    PROTOCOLO GLOBAL:
    1. IDENTIFICA EL PAÍS Y REGIÓN según las coordenadas.
    2. PRIORIDAD DE CONTACTO:
       - Nivel 1 (Ideal): Número directo de la concesionaria de peaje o auxilio mecánico de la autopista específica.
       - Nivel 2 (Oficial): Policía de carreteras o guardia civil de la región.
       - Nivel 3 (Universal): El número de emergencias nacional CORRECTO para el país detectado (ej: 112 en Europa, 911 en América, 999 en UK, 000 en Australia).
    
    IDIOMA:
    - La respuesta debe ser en ESPAÑOL.
    - Traduce la descripción de la ubicación.
    - MANTÉN los nombres propios de las vías en su idioma local.
    `;

    const prompt = `
      COORDENADAS: ${lat}, ${lng}
      
      TAREA:
      1. Analiza la ubicación exacta (Autopista, Km, Sentido, Ciudad, País).
      2. Busca el número de emergencia más específico y directo disponible.
      3. Genera la respuesta en este formato estricto:

      NOMBRE_VIA: [Nombre local de la vía]
      TELEFONO: [Número marcable]
      DESCRIPCION: [Explica dónde está el usuario]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const text = response.text || "";
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.flatMap((c: any) => {
      const s = [];
      if (c.web?.uri) s.push({ uri: c.web.uri, title: c.web.title || 'Fuente Web' });
      if (c.maps?.uri) s.push({ uri: c.maps.uri, title: c.maps.title || 'Ubicación Maps' });
      return s;
    });

    // 1. Pre-limpieza: Eliminar asteriscos y formato markdown globalmente antes de buscar
    const cleanRawText = text.replace(/[*_#`]/g, '');

    // 2. Función auxiliar para limpiar el valor extraído
    const cleanValue = (str: string) => str.trim();

    // 3. Regex captura toda la línea después de la etiqueta
    const nameMatch = cleanRawText.match(/NOMBRE_VIA:?(.+)/i);
    const phoneMatch = cleanRawText.match(/TELEFONO:?(.+)/i);
    const descMatch = cleanRawText.match(/DESCRIPCION:?(.+)/i);

    let rawPhone = phoneMatch ? cleanValue(phoneMatch[1]) : "911";
    
    // 4. Limpieza agresiva para el teléfono:
    // Mantiene números, +, -, y espacios. Elimina paréntesis si están vacíos o mal formados después.
    // Ej: "911 (Emergencias)" -> "911 " -> "911"
    let phoneNumber = rawPhone.replace(/[^\d\+]/g, ' ').trim(); 
    // Si quedó muy vacío o corto, intentamos una búsqueda de respaldo en el texto
    if (phoneNumber.replace(/\D/g, '').length < 3) {
        if (text.includes("112")) phoneNumber = "112";
        else if (text.includes("911")) phoneNumber = "911";
        else if (text.includes("999")) phoneNumber = "999";
        else if (text.includes("066")) phoneNumber = "066"; // Mexico
        else phoneNumber = "911";
    }

    return {
      highwayName: nameMatch ? cleanValue(nameMatch[1]) : "Vía Detectada",
      phoneNumber: phoneNumber,
      description: descMatch ? cleanValue(descMatch[1]) : text.slice(0, 150) + "...",
      sources: sources.length > 0 ? sources : undefined
    };

  } catch (error) {
    console.error("Error contacting Gemini:", error);
    throw new Error("No se pudo obtener información de asistencia.");
  }
};