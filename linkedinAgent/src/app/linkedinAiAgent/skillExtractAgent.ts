import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { skillExtractPrompt } from "./skillExtractPrompt";
import { ApiKeyService } from "./apiKeyService";
import { RateLimitError } from "./linkedinPostAgent";

export async function extractSkills(resumeText: string): Promise<any> {
    try {
        // Get API key (user-provided or environment)
        const apiKey = ApiKeyService.getApiKey();
        
        if (!apiKey) {
            return { error: "API key is not configured. Please set GOOGLE_API_KEY in your environment variables." };
        }

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-flash-latest",
            temperature: 0,
            apiKey: apiKey,
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

    } catch (error: any) {
        console.error("Error in extractSkills:", error);
        console.error("Error details:", {
            message: error?.message,
            status: error?.status,
            statusCode: error?.statusCode,
            response: error?.response,
            cause: error?.cause,
            stack: error?.stack
        });
        
        // Check if it's a rate limit error (429)
        if (ApiKeyService.isRateLimitError(error)) {
            console.log("Rate limit error detected, throwing RateLimitError");
            throw new RateLimitError("Daily API limit reached. Please use your own Google API key to continue.");
        }
        
        throw error;
    }
}
