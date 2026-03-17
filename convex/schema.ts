import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  profile: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    title: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    github: v.optional(v.string()),
    pictureStorageId: v.optional(v.id("_storage")),
    skills: v.array(v.string()),
  }).index("by_user", ["userId"]),

  applications: defineTable({
    userId: v.string(),
    company: v.string(),
    role: v.string(),
    jobUrl: v.optional(v.string()),
    source: v.string(),
    stage: v.union(
      v.literal("saved"),
      v.literal("applied"),
      v.literal("interview"),
      v.literal("offer"),
      v.literal("rejected")
    ),
    salaryMin: v.optional(v.number()),
    salaryMax: v.optional(v.number()),
    notes: v.optional(v.string()),
    appliedAt: v.optional(v.number()),
    rawJD: v.optional(v.string()),
    aiSummary: v.optional(v.object({
      overview: v.string(),
      responsibilities: v.array(v.string()),
      requiredSkills: v.array(v.string()),
    })),
    skillGaps: v.optional(v.array(v.string())),
    interviewPrep: v.optional(v.object({
      questions: v.array(v.object({
        question: v.string(),
        rationale: v.string(),
        suggestedPoint: v.string(),
      })),
      smartQuestions: v.array(v.string()),
      strategy: v.string(),
    })),
  })
  .index("by_user", ["userId"])
  .index("by_stage", ["stage"])
  .index("by_user_stage", ["userId", "stage"]),

  activities: defineTable({
    userId: v.string(),
    applicationId: v.id("applications"),
    type: v.union(
      v.literal("created"),
      v.literal("stage_change"),
      v.literal("note_updated"),
      v.literal("ai_analysis"),
      v.literal("edited"),
      v.literal("deleted")
    ),
    description: v.string(),
    metadata: v.optional(v.object({
      fromStage: v.optional(v.string()),
      toStage: v.optional(v.string()),
      field: v.optional(v.string()),
    })),
    timestamp: v.number(),
  })
  .index("by_application", ["applicationId"])
  .index("by_user", ["userId"])
  .index("by_user_timestamp", ["userId", "timestamp"]),

  interviews: defineTable({
    userId: v.string(),
    applicationId: v.id("applications"),
    scheduledAt: v.number(),
    type: v.union(
      v.literal("phone"),
      v.literal("video"),
      v.literal("onsite"),
      v.literal("technical"),
      v.literal("behavioral"),
      v.literal("other")
    ),
    title: v.string(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    prepNotes: v.optional(v.string()),
    status: v.union(
      v.literal("upcoming"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  })
  .index("by_application", ["applicationId"])
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"]),

  resumes: defineTable({
    userId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    label: v.string(),
    version: v.number(),
    skills: v.optional(v.array(v.string())),
    isDefault: v.optional(v.boolean()),
    uploadedAt: v.number(),
  })
  .index("by_user", ["userId"]),

  resumeBuilder: defineTable({
    userId: v.string(),
    title: v.string(),
    templateId: v.string(),
    basics: v.object({
      name: v.string(),
      label: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      location: v.optional(v.string()),
      summary: v.optional(v.string()),
    }),
    work: v.array(v.object({
      id: v.string(),
      company: v.string(),
      position: v.string(),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      current: v.optional(v.boolean()),
      summary: v.optional(v.string()),
      highlights: v.array(v.string()),
    })),
    education: v.array(v.object({
      id: v.string(),
      institution: v.string(),
      area: v.string(),
      studyType: v.string(),
      startDate: v.string(),
      endDate: v.optional(v.string()),
      gpa: v.optional(v.string()),
    })),
    skills: v.array(v.object({
      id: v.string(),
      name: v.string(),
      keywords: v.array(v.string()),
    })),
    projects: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      url: v.optional(v.string()),
      highlights: v.array(v.string()),
    })),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"]),

  userSettings: defineTable({
    userId: v.string(),
    appearance: v.object({
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
      accentColor: v.optional(v.string()),
    }),
    ai: v.object({
      matchStrictness: v.union(v.literal("relaxed"), v.literal("strict")),
      summaryDepth: v.union(v.literal("bullet_points"), v.literal("executive_summary"), v.literal("in_depth")),
      interviewPersona: v.union(v.literal("friendly_recruiter"), v.literal("technical_lead"), v.literal("rigorous_hiring_manager")),
      focusAreas: v.array(v.string()),
    }),
    defaults: v.object({
      currency: v.string(),
      defaultSources: v.array(v.string()),
    }),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"]),
});