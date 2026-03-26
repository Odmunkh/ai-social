"use client";

function toArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  return [];
}

function formatMonth(value) {
  if (!value) return "";
  return value;
}

export default function ResumePreview({ data }) {
  const skills = toArray(data && data.skills);
  const languages = toArray(data && data.languages);

  const experiences = (data && data.experience ? data.experience : []).filter(
    function (item) {
      return item.company || item.role || item.start || item.end;
    },
  );

  const educationList = (data && data.education ? data.education : []).filter(
    function (item) {
      return item.school || item.degree || item.start || item.end;
    },
  );

  return (
    <div
      className="mx-auto w-full max-w-4xl p-8 md:p-10"
      style={{
        backgroundColor: "#ffffff",
        color: "#111827",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            fontWeight: "700",
            lineHeight: "1.2",
            color: "#111827",
          }}
        >
          {data && data.fullName ? data.fullName : "Your Name"}
        </h1>

        <div
          className="mt-3 flex flex-wrap gap-x-4 gap-y-2"
          style={{
            fontSize: "14px",
            color: "#4b5563",
          }}
        >
          {data && data.email ? <span>{data.email}</span> : null}
          {data && data.phone ? <span>{data.phone}</span> : null}
          {data && data.location ? <span>{data.location}</span> : null}
        </div>

        {data && data.summary && data.summary.trim() ? (
          <p
            className="mt-4"
            style={{
              fontSize: "14px",
              lineHeight: "1.7",
              color: "#374151",
            }}
          >
            {data.summary}
          </p>
        ) : null}
      </header>

      <div className="mt-8 space-y-8">
        {experiences.length > 0 ? (
          <section>
            <h2
              className="mb-4"
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#6b7280",
              }}
            >
              Ажлын туршлага
            </h2>

            <div className="space-y-5">
              {experiences.map(function (item, index) {
                return (
                  <div key={index}>
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {item.role || "Албан тушаал"}
                        </h3>

                        <p
                          style={{
                            fontSize: "14px",
                            color: "#4b5563",
                          }}
                        >
                          {item.company || "Компанийн нэр"}
                        </p>
                      </div>

                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        {formatMonth(item.start)}
                        {item.start || item.end ? " - " : ""}
                        {formatMonth(item.end) || "Одоог хүртэл"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {educationList.length > 0 ? (
          <section>
            <h2
              className="mb-4"
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#6b7280",
              }}
            >
              Боловсрол
            </h2>

            <div className="space-y-5">
              {educationList.map(function (item, index) {
                return (
                  <div key={index}>
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827",
                          }}
                        >
                          {item.degree || "Зэрэг / Мэргэжил"}
                        </h3>

                        <p
                          style={{
                            fontSize: "14px",
                            color: "#4b5563",
                          }}
                        >
                          {item.school || "Сургуулийн нэр"}
                        </p>
                      </div>

                      <p
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        {formatMonth(item.start)}
                        {item.start || item.end ? " - " : ""}
                        {formatMonth(item.end)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {skills.length > 0 ? (
          <section>
            <h2
              className="mb-4"
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#6b7280",
              }}
            >
              Ур чадвар
            </h2>

            <div className="flex flex-wrap gap-2">
              {skills.map(function (skill, index) {
                return (
                  <span
                    key={skill + index}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "9999px",
                      padding: "6px 12px",
                      fontSize: "14px",
                      color: "#1f2937",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </section>
        ) : null}

        {languages.length > 0 ? (
          <section>
            <h2
              className="mb-4"
              style={{
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#6b7280",
              }}
            >
              Хэл
            </h2>

            <div className="flex flex-wrap gap-2">
              {languages.map(function (language, index) {
                return (
                  <span
                    key={language + index}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "9999px",
                      padding: "6px 12px",
                      fontSize: "14px",
                      color: "#1f2937",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {language}
                  </span>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
