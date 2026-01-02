import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getLinkedinContent } from "./linkedinPostContent";
import { ApiKeyService } from "./apiKeyService";

export class RateLimitError extends Error {
  constructor(message: string = "Daily API limit reached") {
    super(message);
    this.name = "RateLimitError";
  }
}

export async function generateLinkedInPost(skills: string[] = ["Frontend", "Angular", "JavaScript", "TypeScript"]): Promise<string> {
    try {
        // Get API key (user-provided or environment)
        const apiKey = ApiKeyService.getApiKey();
        
        if (!apiKey) {
            throw new Error("API key is not configured. Please set GOOGLE_API_KEY in your environment variables.");
        }

        // 1. Initialize the model
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-flash-latest",
            temperature: 0.7,
            apiKey: apiKey,
        });

        const systemPrompt = new SystemMessage(getLinkedinContent(skills));
        const userMessage = new HumanMessage(`Generate a post focused on: ${skills.join(', ')}`);

        const result = await llm.invoke([systemPrompt, userMessage]);

        if (result && result.content) {
            let content = result.content as string;
            // Remove markdown code blocks if present
            if (content.includes('```')) {
                content = content.replace(/```[a-z]*|```/g, '').trim();
            }
            return content;
        }

        return "Failed to generate post.";

    } catch (error: any) {
        console.error("Error in generateLinkedInPost:", error);
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
