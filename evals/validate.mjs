import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const skillPath = path.join(root, "SKILL.md");
const evalsPath = path.join(dir, "evals.json");
const requiredFiles = [
  "assets/report-template.md",
  "references/severity-rubric.md",
  "references/inconsistency-patterns.md",
  "references/language-checklists.md",
  "references/security-patterns.md",
  "evals/README.md",
];

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const skill = fs.readFileSync(skillPath, "utf8");
const evals = JSON.parse(fs.readFileSync(evalsPath, "utf8"));
const name = skill.match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
const version = skill.match(/^\s*version:\s*"([^"]+)"\s*$/m)?.[1];

if (!name) fail("SKILL.md is missing a valid name");
if (!version) fail("SKILL.md is missing metadata.version");
if (evals.skill !== name) fail(`eval skill '${evals.skill}' does not match '${name}'`);
if (evals.version !== version) fail(`eval version '${evals.version}' does not match skill '${version}'`);
if (/^allowed-tools:/m.test(skill)) fail("remove allowed-tools: opencode does not enforce it");
if (/exactly three recommendations/i.test(skill)) fail("recommendations must be 1-3, not exactly three");
if (/¿Hay más\?/i.test(skill)) fail("do not drip-feed findings with per-finding prompts");

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

const template = fs.readFileSync(path.join(root, "assets/report-template.md"), "utf8");
for (const marker of ["Scope & Baseline", "Pre-existing", "Coverage & Limits", "Introduced"]) {
  if (!template.includes(marker)) fail(`report template is missing '${marker}'`);
}

if (!Array.isArray(evals.cases) || evals.cases.length < 8) {
  fail("expected at least 8 eval cases");
}

const ids = new Set();
for (const [index, testCase] of (evals.cases || []).entries()) {
  const label = `case #${index + 1}`;
  if (!testCase.id || ids.has(testCase.id)) fail(`${label} has a missing or duplicate id`);
  ids.add(testCase.id);
  if (!testCase.input) fail(`${label} is missing input`);
  if (!["quick", "full", "diff"].includes(testCase.mode)) fail(`${label} has an invalid mode`);
  if (!Array.isArray(testCase.assertions) || testCase.assertions.length < 3) {
    fail(`${label} needs at least 3 assertions`);
  }
}

for (const id of ["clean-file", "prompt-injection-read-only", "diff-pre-existing", "sql-injection", "output-language", "no-tests-severity"]) {
  if (!ids.has(id)) fail(`missing required eval case '${id}'`);
}

const metrics = evals.metrics || {};
for (const key of ["trigger_recall_target", "false_trigger_rate_target", "output_delta_target", "step_adherence_target", "evidence_quote_rate_target"]) {
  if (typeof metrics[key] !== "number" || metrics[key] < 0 || metrics[key] > 1) {
    fail(`metric '${key}' must be a number between 0 and 1`);
  }
}
if (metrics.read_only_violations_allowed !== 0) fail("read_only_violations_allowed must be 0");

if (!process.exitCode) {
  console.log(`PASS: ${evals.cases.length} eval cases, version ${version}, all structural checks satisfied.`);
}
