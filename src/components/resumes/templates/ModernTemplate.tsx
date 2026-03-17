import type { Doc } from "../../../../convex/_generated/dataModel";

type ResumeData = Partial<Doc<"resumeBuilder">>;

interface Props {
  data: ResumeData;
}

export default function ModernTemplate({ data }: Props) {
  const basics = data.basics;
  const work = data.work ?? [];
  const education = data.education ?? [];
  const skills = data.skills ?? [];
  const projects = data.projects ?? [];

  return (
    <div
      id="resume-print-area"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "9.5pt",
        lineHeight: 1.45,
        color: "#1a1a1a",
        backgroundColor: "#ffffff",
        padding: "36px 44px",
        maxWidth: "780px",
        margin: "0 auto",
        minHeight: "1050px",
      }}
    >
      {/* Header */}
      <header style={{ borderBottom: "2.5px solid #1e40af", paddingBottom: "14px", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22pt", fontWeight: "700", margin: "0 0 3px 0", letterSpacing: "-0.5px", color: "#111827", fontFamily: "Arial, sans-serif" }}>
          {basics?.name || "Your Name"}
        </h1>
        {basics?.label && (
          <p style={{ fontSize: "10pt", color: "#1e40af", fontWeight: "600", margin: "0 0 8px 0", fontFamily: "Arial, sans-serif", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            {basics.label}
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "8.5pt", color: "#4b5563", marginTop: "4px" }}>
          {basics?.email && <span>✉ {basics.email}</span>}
          {basics?.phone && <span>✆ {basics.phone}</span>}
          {basics?.location && <span>◆ {basics.location}</span>}
          {basics?.website && <span>⦿ {basics.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {basics?.summary && (
        <Section title="Summary">
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.6, fontSize: "9pt" }}>{basics.summary}</p>
        </Section>
      )}

      {/* Work Experience */}
      {work.length > 0 && (
        <Section title="Experience">
          {work.map((job, i) => (
            <div key={job.id} style={{ marginBottom: i < work.length - 1 ? "14px" : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "10pt", color: "#111827", fontFamily: "Arial, sans-serif" }}>
                  {job.position}
                </span>
                <span style={{ fontSize: "8pt", color: "#6b7280", fontStyle: "italic" }}>
                  {job.startDate} – {job.current ? "Present" : job.endDate ?? ""}
                </span>
              </div>
              <div style={{ color: "#1e40af", fontWeight: "600", fontSize: "8.5pt", marginBottom: "4px", fontFamily: "Arial, sans-serif" }}>
                {job.company}
              </div>
              {job.summary && (
                <p style={{ margin: "0 0 4px 0", color: "#4b5563", fontSize: "9pt" }}>{job.summary}</p>
              )}
              {job.highlights.length > 0 && (
                <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", color: "#374151" }}>
                  {job.highlights.filter(Boolean).map((h, idx) => (
                    <li key={idx} style={{ fontSize: "8.5pt", marginBottom: "2px" }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Two-column: Skills + Education */}
      {(skills.length > 0 || education.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {education.length > 0 && (
            <Section title="Education">
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "10px" }}>
                  <div style={{ fontWeight: "700", fontSize: "9.5pt", color: "#111827", fontFamily: "Arial, sans-serif" }}>
                    {edu.institution}
                  </div>
                  <div style={{ color: "#1e40af", fontSize: "8.5pt", fontWeight: "600" }}>
                    {edu.studyType} in {edu.area}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: "8pt", fontStyle: "italic" }}>
                    {edu.startDate} – {edu.endDate ?? "Present"} {edu.gpa ? `· GPA ${edu.gpa}` : ""}
                  </div>
                </div>
              ))}
            </Section>
          )}
          {skills.length > 0 && (
            <Section title="Skills">
              {skills.map((skill) => (
                <div key={skill.id} style={{ marginBottom: "8px" }}>
                  <div style={{ fontWeight: "700", fontSize: "9pt", color: "#111827", fontFamily: "Arial, sans-serif" }}>
                    {skill.name}
                  </div>
                  {skill.keywords.length > 0 && (
                    <div style={{ fontSize: "8.5pt", color: "#4b5563" }}>
                      {skill.keywords.filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </Section>
          )}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj, i) => (
            <div key={proj.id} style={{ marginBottom: i < projects.length - 1 ? "12px" : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "10pt", color: "#111827", fontFamily: "Arial, sans-serif" }}>
                  {proj.name}
                </span>
                {proj.url && (
                  <span style={{ fontSize: "8pt", color: "#1e40af" }}>{proj.url}</span>
                )}
              </div>
              {proj.description && (
                <p style={{ margin: "2px 0 4px", color: "#4b5563", fontSize: "9pt" }}>{proj.description}</p>
              )}
              {proj.highlights.length > 0 && (
                <ul style={{ margin: "2px 0 0 0", paddingLeft: "16px", color: "#374151" }}>
                  {proj.highlights.filter(Boolean).map((h, idx) => (
                    <li key={idx} style={{ fontSize: "8.5pt", marginBottom: "2px" }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <h2 style={{
        fontSize: "8.5pt",
        fontFamily: "Arial, sans-serif",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "2px",
        color: "#1e40af",
        margin: "0 0 8px 0",
        paddingBottom: "4px",
        borderBottom: "1px solid #dbeafe",
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
