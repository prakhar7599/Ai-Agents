import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getLinkedinContent } from "./linkdeinPostContent";
import { environment } from "../../environments/environment";

export async function generateLinkedInPost(skills: string[] = ["Frontend", "Angular", "JavaScript", "TypeScript"]): Promise<string> {
    try {
        // 1. Initialize the model
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-flash-latest",
            temperature: 0.7,
            apiKey: environment.googleApiKey,
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

    } catch (error) {
        console.error("Error in generateLinkedInPost:", error);
        throw error;
    }
}
