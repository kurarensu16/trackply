import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", // The latest supported fast and free Llama model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Keep it deterministic for JSON output
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export const summarizeJD = action({
  args: {
    applicationId: v.id("applications"),
    rawJD: v.string(),
  },
  handler: async (ctx, args) => {
    // @ts-ignore
    const apiKey: string = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set in Convex environment variables. Please add it in your Convex dashboard.");

    // Fetch settings for AI tuning
    const settings = await ctx.runQuery(api.settings.get);
    const summaryDepth = settings?.ai?.summaryDepth || "executive_summary";
    const depthInstructions: Record<string, string> = {
      bullet_points: "Format the 'overview' strictly as 2-3 extremely concise bullet points for rapid scanning.",
      executive_summary: "Format the 'overview' as a short executive summary paragraph followed by 2-3 key highlights.",
      in_depth: "Format the 'overview' as an in-depth professional analysis, extracting sub-text, potential culture aspects, and any implicit requirements or red flags.",
    };

    // Fetch user profile for context
    const profile = await ctx.runQuery(api.profile.getProfile);
    const userContext = profile
      ? `Title: ${profile.title}\nBio: ${profile.bio}\nSkills: ${profile.skills.join(", ")}`
      : "No profile bio available.";

    const prompt = `
      You are an elite Tech Career Coach. Analyze this job description specifically for the candidate described below.
      Return ONLY a valid JSON object with no markdown formatting.

      Required JSON format:
      { 
        "overview": "A brief summary of the role tailored to how it fits this specific candidate's background.", 
        "responsibilities": ["key task 1", "key task 2"], 
        "requiredSkills": ["skill 1", "skill 2"] 
      }

      Formatting Instruction for the 'overview' field:
      ${depthInstructions[summaryDepth]}

      Candidate Profile:
      ${userContext}

      Job Description:
      ${args.rawJD}
    `;

    try {
      let text = await callGroq(apiKey, prompt);
      
      // Robust JSON Extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not find JSON object in AI response.");
      }
      
      const aiSummary = JSON.parse(jsonMatch[0]);

      await ctx.runMutation(api.applications.saveAIResults, {
        id: args.applicationId,
        aiSummary,
      });

      return aiSummary;
    } catch (error: any) {
      console.error("Groq Error:", error);
      throw new Error(`AI Analysis failed: ${error.message || "Unknown error"}`);
    }
  },
});

export const detectSkillGaps = action({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // @ts-ignore
    const apiKey: string = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

    // 1. Context: App + Profile + Settings
    const apps = await ctx.runQuery(api.applications.listApplications);
    const app = apps.find((a: any) => a._id === args.applicationId);
    if (!app || !app.aiSummary) return [];

    const profile = await ctx.runQuery(api.profile.getProfile);
    const userSkills: string[] = profile?.skills || [];
    const requiredSkills: string[] = app.aiSummary.requiredSkills;

    const settings = await ctx.runQuery(api.settings.get);
    const strictness = settings?.ai?.matchStrictness || "relaxed";

    // 3. Compare
    let skillGaps: string[] = [];
    if (strictness === "strict") {
      // Very strict exact keyword matching (ATS simulation)
      skillGaps = requiredSkills.filter(
        (reqSkill) => !userSkills.some((us: string) => us.toLowerCase() === reqSkill.toLowerCase())
      );
    } else {
      // Relaxed / Conceptual matching (Use AI to determine gaps safely)
      const prompt = `
        You are a Tech Talent Matcher.
        Compare the "Required Skills" from a job against the "Candidate Skills".
        Determine which required skills the candidate genuinely lacks. Allow for conceptual matches (e.g., if required is 'Frontend Development' and candidate has 'React', they do NOT lack it. If required is 'AWS' and candidate has 'GCP', they probably still lack AWS specifically.)
        
        Required Skills: ${requiredSkills.join(", ")}
        Candidate Skills: ${userSkills.join(", ")}

        Return a valid JSON object with NO markdown:
        { "gaps": ["missing skill 1", "missing skill 2"] }
      `;

      try {
        const text = await callGroq(apiKey, prompt);
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
           const res = JSON.parse(match[0]);
           skillGaps = res.gaps || [];
        } else {
           skillGaps = requiredSkills; // fallback
        }
      } catch (e) {
        console.error("Conceptual gap analysis failed fallback to strict", e);
        skillGaps = requiredSkills.filter(
          (reqSkill) => !userSkills.some((us: string) => us.toLowerCase() === reqSkill.toLowerCase())
        );
      }
    }

    // 4. Save
    await ctx.runMutation(api.applications.saveAIResults, {
      id: args.applicationId,
      skillGaps,
    });

    return skillGaps;
  },
});

export const generateInterviewPrep = action({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    // @ts-ignore
    const apiKey: string = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

    // 1. Get Context (App + Profile)
    const apps = await ctx.runQuery(api.applications.listApplications);
    const app = apps.find((a: any) => a._id === args.applicationId);
    if (!app || !app.rawJD) throw new Error("Application JD not found.");

    const profile = await ctx.runQuery(api.profile.getProfile);
    const userContext = profile 
      ? `Title: ${profile.title}\nBio: ${profile.bio}\nSkills: ${profile.skills.join(", ")}`
      : "No profile bio available.";

    // Fetch Persona
    const settings = await ctx.runQuery(api.settings.get);
    const persona = settings?.ai?.interviewPersona || "friendly_recruiter";
    const personaDescriptions: Record<string, string> = {
      friendly_recruiter: "an empathetic, friendly Recruiter focusing heavily on behavioral questions, culture fit, and motivation.",
      technical_lead: "a rigorous Technical Lead focusing heavily on the tech stack, system design abstractions, and deep technical probing.",
      rigorous_hiring_manager: "a high-pressure Hiring Manager asking strategic, situational, and business-impact questions.",
    };

    // 2. Build Prompt
    const prompt = `
      You are an elite Tech Interview Coach, and during the mock generation you will act as ${personaDescriptions[persona]}

      Analyze the Job Description (JD) and the Candidate's Profile.
      Generate a tailored interview prep kit as a valid JSON object.
      
      Output MUST be this JSON structure:
      {
        "questions": [
          { "question": "string", "rationale": "why they ask this based on JD", "suggestedPoint": "specific project/skill from candidate bio to mention" }
        ],
        "smartQuestions": ["3 questions for the candidate to ask the interviewer"],
        "strategy": "A 2-sentence overarching strategy for this specific role."
      }

      Candidate Profile:
      ${userContext}

      Job Description:
      ${app.rawJD}
    `;

    try {
      let text = await callGroq(apiKey, prompt);
      
      // Robust JSON Extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
         throw new Error(`Could not find JSON object in AI response. Raw output: ${text.substring(0, 100)}...`);
      }
      
      const interviewPrep = JSON.parse(jsonMatch[0]);

      await ctx.runMutation(api.applications.saveAIResults, {
        id: args.applicationId,
        interviewPrep,
      });

      return interviewPrep;
    } catch (error: any) {
      console.error("Prep Generation Error:", error);
      throw new Error(`Prep generation failed: ${error.message}`);
    }
  },
});

