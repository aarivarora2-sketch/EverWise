import React, { useEffect, useState } from "react";
import {
  fetchPartnerReport,
  rotatePartnerInvite,
} from "../services/partnerAccess.js";
import { PartnerLogo } from "../components/PartnerBrand.jsx";

const MINIMUM_GROUP_RESPONSES = 5;

const DISTRIBUTION_LABELS = {
  ageBand: "Age range",
  internetUse: "Internet use",
  primaryDevice: "Primary device",
  confidence: "Online confidence",
  scamFrequency: "Scam experience",
  concerns: "Main concerns",
  bankSafetyCategory: "Bank-message response",
  aiExperience: "AI experience",
  accessibilityNeeds: "Accessibility needs",
};

function count(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function percentage(value, total) {
  if (!total) return 0;
  return Math.round((count(value) / total) * 1000) / 10;
}

function csvField(value) {
  const text = String(value ?? "");
  const safeText = /^[=+@-]/.test(text) ? `'${text}` : text;
  return /[",\r\n ]/.test(safeText)
    ? `"${safeText.replaceAll('"', '""')}"`
    : safeText;
}

function groupBreakdownsAvailable(research) {
  return Boolean(
    count(research?.consentedCount) >= MINIMUM_GROUP_RESPONSES &&
      research?.suppressed === false &&
      research.distributions &&
      typeof research.distributions === "object",
  );
}

function aggregateRows(report) {
  const seats = report?.seats || {};
  const research = report?.research || {};
  const seatLimit = count(seats.limit);
  const consentedCount = count(research.consentedCount);
  const rows = [
    ["seats", "claimed", count(seats.claimed), percentage(seats.claimed, seatLimit)],
    ["seats", "available", count(seats.available), percentage(seats.available, seatLimit)],
    [
      "research",
      "consented",
      consentedCount,
      count(research.consentedPercentage),
    ],
  ];

  if (groupBreakdownsAvailable(research)) {
    for (const metric of Object.keys(DISTRIBUTION_LABELS)) {
      const distribution = research.distributions[metric];
      if (!distribution || typeof distribution !== "object") continue;
      for (const [category, categoryCount] of Object.entries(distribution)) {
        if (typeof category !== "string" || !Number.isFinite(categoryCount)) continue;
        rows.push([
          metric,
          category,
          count(categoryCount),
          percentage(categoryCount, consentedCount),
        ]);
      }
    }
  }
  return rows;
}

// oxlint-disable-next-line react/only-export-components -- exercised directly by the CSV privacy regression
export function buildPartnerReportCsv(report) {
  const lines = ["metric,category,count,percentage"];
  for (const row of aggregateRows(report)) {
    lines.push(row.map(csvField).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function downloadReport(report) {
  const blob = new Blob([buildPartnerReportCsv(report)], {
    type: "text/csv;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "everwise-partner-report.csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function formattedUpdatedAt(updatedAt) {
  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function learnerLink(inviteToken) {
  const url = new URL(window.location.href);
  url.hash = `partner=${inviteToken}`;
  return url.toString();
}

function invitationStatusLabel(status) {
  if (status === "active") return "Active";
  if (status === "suspended") return "Paused";
  return "Unavailable";
}

export default function PartnerDashboard({ adminToken }) {
  const [status, setStatus] = useState(adminToken ? "loading" : "invalid");
  const [report, setReport] = useState(null);
  const [dashboardUpdatedAt, setDashboardUpdatedAt] = useState(null);
  const [rotationStep, setRotationStep] = useState("idle");
  const [replacementLink, setReplacementLink] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!adminToken) return undefined;
    let cancelled = false;
    fetchPartnerReport({ adminToken })
      .then((nextReport) => {
        if (cancelled) return;
        setReport(nextReport);
        setDashboardUpdatedAt(nextReport.updatedAt);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setReport(null);
        setStatus("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [adminToken]);

  const confirmRotation = async () => {
    if (rotationStep === "rotating") return;
    setRotationStep("rotating");
    setCopyStatus("");
    try {
      const result = await rotatePartnerInvite({ adminToken });
      if (typeof result?.inviteToken !== "string") throw new Error("invalid response");
      setReplacementLink(learnerLink(result.inviteToken));
      setDashboardUpdatedAt(new Date().toISOString());
      setRotationStep("revealed");
    } catch {
      setReplacementLink("");
      setRotationStep("error");
    }
  };

  const copyReplacement = async () => {
    try {
      await navigator.clipboard.writeText(replacementLink);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Select the link and copy it manually.");
    }
  };

  if (status === "loading") {
    return (
      <main className="partner-dashboard partner-dashboard-status">
        <p role="status">Loading the aggregate report…</p>
      </main>
    );
  }

  if (status !== "ready" || !report) {
    return (
      <main className="partner-dashboard partner-dashboard-status">
        <img
          src="/everwise-logo-192.png"
          alt=""
          aria-hidden="true"
          className="partner-dashboard-logo"
        />
        <h1>Everwise partner reporting</h1>
        <p>This admin link is not available.</p>
      </main>
    );
  }

  const partnerName =
    typeof report.branding?.name === "string" && report.branding.name.trim()
      ? report.branding.name.trim()
      : typeof report.name === "string"
        ? report.name.trim()
        : "Partner organization";
  const claimed = count(report.seats?.claimed);
  const available = count(report.seats?.available);
  const limit = count(report.seats?.limit);
  const consentedCount = count(report.research?.consentedCount);
  const updatedAt = formattedUpdatedAt(dashboardUpdatedAt);
  const showGroupBreakdowns = groupBreakdownsAvailable(report.research);
  const invitationStatus = invitationStatusLabel(report.invitation?.status);

  return (
    <main className="partner-dashboard">
      <header className="partner-dashboard-header">
        <div className="partner-dashboard-brand">
          <img
            src="/everwise-logo-192.png"
            alt=""
            aria-hidden="true"
            className="partner-dashboard-logo"
          />
          <div>
            <p className="partner-dashboard-wordmark">Everwise</p>
            <div className="partner-dashboard-partner-lockup">
              <PartnerLogo
                partner={report.branding}
                className="partner-dashboard-partner-logo"
              />
              <p className="partner-dashboard-partner">
                Reporting for {partnerName}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h1>Partner overview</h1>
          <p className="partner-dashboard-privacy">
            This page shows combined group totals only.
          </p>
        </div>
      </header>

      <section className="partner-dashboard-section" aria-labelledby="seat-summary">
        <h2 id="seat-summary">Sponsored access</h2>
        <p className="partner-dashboard-lead">{claimed} of {limit} seats in use</p>
        <p>{available} seats available</p>
      </section>

      <section className="partner-dashboard-section" aria-labelledby="research-summary">
        <h2 id="research-summary">Optional research</h2>
        <div className="partner-dashboard-summary-line">
          <p>
            <strong>{consentedCount}</strong> research responses
          </p>
          <p>
            <strong>{count(report.research?.consentedPercentage)}%</strong> of learners chose to participate
          </p>
        </div>

        {!showGroupBreakdowns ? (
          <p className="partner-dashboard-threshold">
            More responses are needed before group breakdowns can be shown.
          </p>
        ) : (
          <div className="partner-dashboard-distributions">
            {Object.entries(DISTRIBUTION_LABELS).map(([metric, label]) => {
              const distribution = report.research.distributions[metric];
              if (!distribution || typeof distribution !== "object") return null;
              const entries = Object.entries(distribution).filter(
                ([category, value]) =>
                  typeof category === "string" && Number.isFinite(value),
              );
              if (entries.length === 0) return null;
              return (
                <section key={metric} className="partner-dashboard-breakdown">
                  <h3>{label}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Group</th>
                        <th scope="col">Responses</th>
                        <th scope="col">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(([category, value]) => (
                        <tr key={category}>
                          <th scope="row">{category}</th>
                          <td>{count(value)}</td>
                          <td>{percentage(value, consentedCount)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              );
            })}
          </div>
        )}
      </section>

      <section className="partner-dashboard-section partner-dashboard-actions" aria-labelledby="report-actions">
        <div>
          <h2 id="report-actions">Report actions</h2>
          {updatedAt ? (
            <p>
              Last updated <time dateTime={dashboardUpdatedAt}>{updatedAt}</time>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="partner-dashboard-button"
          onClick={() => downloadReport(report)}
        >
          Download aggregate CSV
        </button>
      </section>

      <section className="partner-dashboard-section" aria-labelledby="learner-link-title">
        <h2 id="learner-link-title">Learner invitation</h2>
        <p className="partner-dashboard-invitation-status">
          Learner invitation status: {invitationStatus}
        </p>
        <p>Replace the learner link only if the current link should no longer work.</p>

        {rotationStep === "idle" ? (
          <button
            type="button"
            className="partner-dashboard-button partner-dashboard-button-secondary"
            onClick={() => setRotationStep("confirm")}
          >
            Replace learner link
          </button>
        ) : null}

        {rotationStep === "confirm" || rotationStep === "rotating" ? (
          <div className="partner-dashboard-confirmation" role="alert">
            <p>
              The previous learner link will stop working as soon as you replace it.
            </p>
            <div className="partner-dashboard-button-row">
              <button
                type="button"
                className="partner-dashboard-button partner-dashboard-button-secondary"
                onClick={() => setRotationStep("idle")}
                disabled={rotationStep === "rotating"}
              >
                Cancel
              </button>
              <button
                type="button"
                className="partner-dashboard-button"
                onClick={confirmRotation}
                disabled={rotationStep === "rotating"}
              >
                {rotationStep === "rotating" ? "Replacing…" : "Replace link now"}
              </button>
            </div>
          </div>
        ) : null}

        {rotationStep === "revealed" ? (
          <div className="partner-dashboard-replacement">
            <p>
              Save this replacement link now. It is kept only in this open dashboard.
            </p>
            <label htmlFor="replacement-learner-link">Replacement learner link</label>
            <input
              id="replacement-learner-link"
              type="text"
              readOnly
              value={replacementLink}
              onFocus={(event) => event.currentTarget.select()}
            />
            <button
              type="button"
              className="partner-dashboard-button"
              onClick={copyReplacement}
            >
              Copy replacement link
            </button>
            {copyStatus ? <p role="status">{copyStatus}</p> : null}
          </div>
        ) : null}

        {rotationStep === "error" ? (
          <p role="alert">The learner link could not be replaced. Please try again later.</p>
        ) : null}
      </section>
    </main>
  );
}
