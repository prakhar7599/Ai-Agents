import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { skillExtractPrompt } from "./skillExtractPrompt";
import { environment } from "../../environments/environment";

export async function extractSkills(resumeText: string): Promise<any> {
    try {
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-flash-latest",
            temperature: 0,
            apiKey: environment.googleApiKey,
        });

        const systemPrompt = new SystemMessage(skillExtractPrompt);
        const userMessage = new HumanMessage(resumeText);

        const result = await llm.invoke([systemPrompt, userMessage]);

        if (result && result.content) {
            try {
                let content = result.content as string;

                // Find the first '{' and the last '}' to extract the JSON object
                const firstBrace = content.indexOf('{');
                const lastBrace = content.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1) {
                    content = content.substring(firstBrace, lastBrace + 1);
                }

                return JSON.parse(content);
            } catch (e) {
                console.error("Failed to parse AI response as JSON:", result.content);
                return { error: "Failed to parse skills" };
            }
        }
        return { error: "No response from AI" };

    } catch (error) {
        console.error("Error in extractSkills:", error);
        throw error;
    }
}
