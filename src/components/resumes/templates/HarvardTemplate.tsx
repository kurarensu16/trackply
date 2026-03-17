import type { Doc } from "../../../../convex/_generated/dataModel";

type ResumeData = Partial<Doc<"resumeBuilder">>;

interface Props {
  data: ResumeData;
}

export default function HarvardTemplate({ data }: Props) {
  const basics = data.basics;
  const work = data.work ?? [];
  const education = data.education ?? [];
  const skills = data.skills ?? [];
  const projects = data.projects ?? [];

  return (
    <div
      id="resume-print-area"
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "10pt",
        lineHeight: 1.4,
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: "40px 52px",
        maxWidth: "780px",
        margin: "0 auto",
        minHeight: "1050px",
      }}
    >
      {/* ── Header: Centered Name + Contact ── */}
      <header style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1 style={{
          fontSize: "18pt",
          fontWeight: "700",
          fontFamily: "'Times New Roman', Times, serif",
          margin: "0 0 6px 0",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: "#000",
        }}>
          {basics?.name || "Your Name"}
        </h1>

        {/* Contact line */}
        <div style={{ fontSize: "9pt", color: "#111", lineHeight: 1.6 }}>
          {[basics?.location, basics?.phone, basics?.email, basics?.website]
            .filter(Boolean)
            .join("  ·  ")}
        </div>
      </header>

      {/* ── Thick top rule ── */}
      <hr style={{ border: "none", borderTop: "1.5px solid #000", margin: "8px 0 4px 0" }} />

      {/* Summary */}
      {basics?.summary && (
        <Section title="Summary">
          <p style={{ margin: 0, color: "#111", lineHeight: 1.65, fontSize: "9.5pt" }}>
            {basics.summary}
          </p>
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education">
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "10pt" }}>{edu.institution}</span>
                <span style={{ fontSize: "9pt", color: "#333", fontStyle: "italic" }}>
                  {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
                </span>
              </div>
              <div style={{ fontSize: "9.5pt", fontStyle: "italic", color: "#222" }}>
                {edu.studyType} in {edu.area}{edu.gpa ? `, GPA: ${edu.gpa}` : ""}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Work Experience */}
      {work.length > 0 && (
        <Section title="Experience">
          {work.map((job) => (
            <div key={job.id} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "10.5pt" }}>{job.company}</span>
                <span style={{ fontSize: "9pt", fontStyle: "italic", color: "#333" }}>
                  {job.startDate} – {job.current ? "Present" : job.endDate ?? ""}
                </span>
              </div>
              <div style={{ fontStyle: "italic", fontSize: "9.5pt", color: "#222", marginBottom: "3px" }}>
                {job.position}
              </div>
              {job.summary && (
                <p style={{ margin: "2px 0 4px 0", fontSize: "9.5pt", color: "#111" }}>{job.summary}</p>
              )}
              {job.highlights.filter(Boolean).length > 0 && (
                <ul style={{ margin: "3px 0 0 0", paddingLeft: "18px" }}>
                  {job.highlights.filter(Boolean).map((h, i) => (
                    <li key={i} style={{ fontSize: "9.5pt", marginBottom: "2px", color: "#111" }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects">
          {projects.map((proj) => (
            <div key={proj.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "10pt" }}>{proj.name}</span>
                {proj.url && <span style={{ fontSize: "9pt", color: "#333", fontStyle: "italic" }}>{proj.url}</span>}
              </div>
              {proj.description && (
                <p style={{ margin: "2px 0 3px 0", fontSize: "9.5pt", color: "#111" }}>{proj.description}</p>
              )}
              {proj.highlights.filter(Boolean).length > 0 && (
                <ul style={{ margin: "3px 0 0 0", paddingLeft: "18px" }}>
                  {proj.highlights.filter(Boolean).map((h, i) => (
                    <li key={i} style={{ fontSize: "9.5pt", marginBottom: "2px", color: "#111" }}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills">
          {skills.map((skill) => (
            <div key={skill.id} style={{ display: "flex", gap: "8px", marginBottom: "4px", fontSize: "9.5pt" }}>
              <span style={{ fontWeight: "700", minWidth: "110px" }}>{skill.name}:</span>
              <span style={{ color: "#222" }}>{skill.keywords.filter(Boolean).join(", ")}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ borderBottom: "1px solid #000", marginBottom: "6px" }}>
        <h2 style={{
          fontSize: "10pt",
          fontFamily: "'Times New Roman', Times, serif",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          margin: "0 0 3px 0",
          color: "#000",
        }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
