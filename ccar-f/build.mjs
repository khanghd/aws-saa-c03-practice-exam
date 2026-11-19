// Regenerates question-data.js, explanations-data.js, and full-exams/*.html
// from question.json + explanations.json.
//
// Run after editing question.json or explanations.json:
//   node build.mjs
//
// This keeps index.html and all full-exams/ pages in sync with a single
// source of truth, instead of hand-editing embedded JS literals.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

const questionData = JSON.parse(fs.readFileSync(path.join(DIR, 'question.json'), 'utf8'));
const explanations = JSON.parse(fs.readFileSync(path.join(DIR, 'explanations.json'), 'utf8'));

// ---- 1. question-data.js / explanations-data.js (script-tag-loadable wrappers) ----

fs.writeFileSync(
  path.join(DIR, 'question-data.js'),
  'window.QUESTION_DATA = ' + JSON.stringify(questionData) + ';\n'
);
fs.writeFileSync(
  path.join(DIR, 'explanations-data.js'),
  'window.EXPLANATIONS_DATA = ' + JSON.stringify(explanations) + ';\n'
);
console.log('Wrote question-data.js, explanations-data.js');

// ---- 2. Reconstruct full question objects (why merged back in) for full-exams/ ----

const DOMAINS = [
  { id: 1, name: 'Agentic Architecture &amp; Orchestration', weight: 27, chapter: 2 },
  { id: 2, name: 'Tool Design &amp; MCP Integration', weight: 18, chapter: 4 },
  { id: 3, name: 'Claude Code Configuration &amp; Workflows', weight: 20, chapter: 3 },
  { id: 4, name: 'Prompt Engineering &amp; Structured Output', weight: 20, chapter: 5 },
  { id: 5, name: 'Context Management &amp; Reliability', weight: 15, chapter: 6 },
];
const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map(d => [d.id, d]));

const SCENARIOS = [
  { id: 1, title: 'Customer Support Resolution Agent',
    desc: 'You are building a customer support resolution agent with the Claude Agent SDK. It handles high-ambiguity requests (returns, billing disputes, account issues) via custom MCP tools — get_customer, lookup_order, process_refund, escalate_to_human — targeting 80%+ first-contact resolution while knowing when to escalate.' },
  { id: 2, title: 'Code Generation with Claude Code',
    desc: 'Your team uses Claude Code for code generation, refactoring, debugging, and documentation, integrated into daily development with custom slash commands and CLAUDE.md configuration — and you must judge when plan mode beats direct execution.' },
  { id: 3, title: 'Multi-Agent Research System',
    desc: 'A coordinator agent built on the Claude Agent SDK delegates to specialized subagents — web search, document analysis, synthesis, and report generation — to research topics and produce comprehensive, cited reports.' },
  { id: 4, title: 'Developer Productivity with Claude',
    desc: 'You are building developer productivity tooling on the Claude Agent SDK: helping engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate, and automate repetitive tasks — using the built-in tools (Read, Write, Edit, Bash, Grep, Glob) plus MCP servers.' },
  { id: 5, title: 'Claude Code for Continuous Integration',
    desc: 'You are integrating Claude Code into a CI/CD pipeline for automated code review, test generation, and pull-request feedback — designing prompts that produce actionable findings while minimizing false positives.' },
  { id: 6, title: 'Structured Data Extraction',
    desc: 'You are building a structured data extraction system: pulling information from unstructured documents, validating output against JSON schemas, handling edge cases gracefully, and integrating with downstream systems.' },
];

const EXAM_RAW = questionData.examRaw.map(q => ({
  ...q,
  scenario: parseInt(q.id.split('.')[0]),
  why: explanations.examRaw[String(q.id)],
}));
const EXAM2 = questionData.exam2.map(q => ({
  ...q,
  why: explanations.exam2[String(q.id)],
}));

console.log('Reconstructed EXAM_RAW:', EXAM_RAW.length, 'EXAM2:', EXAM2.length);

// ---- 3. Shared CSS + quiz-player template for every standalone full-exams/ page ----
// (copied verbatim from ccar-f/index.html's <style> block + the player logic shared by
// its renderPractice()/renderPractice2() functions, generalized to handle both pools.)

const PAGE_CSS = `
:root{
  --bg:#f6f7fb; --surface:#ffffff; --surface-2:#eef0f5; --text:#1a1d23; --muted:#646c78;
  --border:#dfe3ea; --accent:#3a5bf0; --accent-hover:#2d49d6; --accent-soft:#e8edfe;
  --ok:#1a8f55; --ok-soft:#e4f6ec; --bad:#d13b3b; --bad-soft:#fcebeb; --warn:#b4790a; --warn-soft:#fff3db;
  --shadow:0 1px 2px rgba(16,24,40,.04),0 4px 14px rgba(16,24,40,.06);
  --shadow-sm:0 1px 2px rgba(16,24,40,.05);
  color-scheme: light;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#101217; --surface:#1a1d24; --surface-2:#22262f; --text:#e9ebef; --muted:#9aa2b1;
    --border:#2e333d; --accent:#8aa6ff; --accent-hover:#a6bcff; --accent-soft:#1f2a44;
    --ok:#53d591; --ok-soft:#163327; --bad:#ff8585; --bad-soft:#3a1d1f; --warn:#f2bb57; --warn-soft:#3a2d13;
    --shadow:none; --shadow-sm:none;
    color-scheme: dark;
  }
}
:root[data-theme="dark"]{
  --bg:#101217; --surface:#1a1d24; --surface-2:#22262f; --text:#e9ebef; --muted:#9aa2b1;
  --border:#2e333d; --accent:#8aa6ff; --accent-hover:#a6bcff; --accent-soft:#1f2a44;
  --ok:#53d591; --ok-soft:#163327; --bad:#ff8585; --bad-soft:#3a1d1f; --warn:#f2bb57; --warn-soft:#3a2d13;
  --shadow:none; --shadow-sm:none;
  color-scheme: dark;
}
*{box-sizing:border-box}
html,body{margin:0}
body{
  background:var(--bg);color:var(--text);
  font:15px/1.65 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  -webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
}
button,select{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
a{color:var(--accent)}
.wrap{max-width:1180px;margin:0 auto;padding:20px 18px 60px}
header.top{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;margin-bottom:12px}
header.top h1{font-size:21px;margin:0;letter-spacing:-.015em;font-weight:700;background:linear-gradient(135deg,var(--accent),var(--accent-hover));-webkit-background-clip:text;background-clip:text;color:transparent}
header.top .sub{color:var(--muted);font-size:13px;margin-top:2px}
.callout{border-radius:12px;padding:13px 16px;margin:14px 0;font-size:14px;line-height:1.6;border:1px solid var(--border)}
.callout.tip{background:var(--warn-soft);border-color:var(--warn)}
.callout b{display:block;margin-bottom:4px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:22px;box-shadow:var(--shadow)}
.toolbar{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-bottom:16px}
.toolbar label{display:flex;align-items:center;gap:6px;font-size:13.5px;color:var(--muted);cursor:pointer}
.stats{display:flex;gap:8px;flex-wrap:wrap}
.stat{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:7px 14px;min-width:76px;text-align:center;box-shadow:var(--shadow-sm)}
.stat b{display:block;font-size:18px;font-variant-numeric:tabular-nums}
.stat span{font-size:12px;color:var(--muted)}
.stat.ok b{color:var(--ok)} .stat.bad b{color:var(--bad)}
.progress{height:6px;background:var(--surface-2);border-radius:99px;overflow:hidden;margin:6px 0 16px}
.progress i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-hover));width:0;transition:width .3s ease}
.plyt{display:grid;grid-template-columns:230px 1fr;gap:18px;align-items:start}
.side{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px;position:sticky;top:14px;box-shadow:var(--shadow);max-height:calc(100vh - 28px);overflow-y:auto}
.side h2{font-size:12px;margin:4px 6px 8px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.pgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}
.cell{border:1px solid var(--border);background:var(--surface-2);border-radius:7px;height:32px;cursor:pointer;font-size:12.5px;font-variant-numeric:tabular-nums;position:relative;padding:0}
.cell:hover{border-color:var(--accent)}
.cell.ok{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
.cell.bad{background:var(--bad-soft);border-color:var(--bad);color:var(--bad)}
.cell.cur{outline:2px solid var(--accent);outline-offset:1px}
.cell.flag::after{content:"";position:absolute;top:3px;right:3px;width:6px;height:6px;border-radius:50%;background:var(--warn)}
.legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px;font-size:11.5px;color:var(--muted)}
.legend span::before{content:"";display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px;border:1px solid var(--border);background:var(--surface-2)}
.legend .l-ok::before{background:var(--ok-soft);border-color:var(--ok)}
.legend .l-bad::before{background:var(--bad-soft);border-color:var(--bad)}
.legend .l-flag::before{background:var(--warn);border-radius:50%;border:none}
.qhead{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px}
.qnum{font-weight:700;font-size:17px}
.flagbtn{margin-left:auto;background:none;border:1px solid var(--border);border-radius:9px;padding:5px 11px;cursor:pointer;font-size:13px}
.flagbtn:hover{border-color:var(--warn);color:var(--warn)}
.flagbtn.on{border-color:var(--warn);color:var(--warn);background:var(--warn-soft)}
.chip{font-size:12px;padding:3px 11px;border-radius:99px;background:var(--accent-soft);color:var(--accent);font-weight:600}
.chip.muted{background:var(--surface-2);color:var(--muted);font-weight:500}
.opts{display:flex;flex-direction:column;gap:9px;margin:16px 0}
.opt{display:flex;gap:11px;align-items:flex-start;border:1px solid var(--border);border-radius:11px;padding:11px 13px;cursor:pointer;background:var(--surface);transition:border-color .15s,transform .15s}
.opt:hover{border-color:var(--accent);transform:translateX(2px)}
.opt.sel{border-color:var(--accent);background:var(--accent-soft)}
.opt .key{flex:0 0 26px;height:26px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;background:var(--surface-2)}
.opt.sel .key{background:var(--accent);border-color:var(--accent);color:#fff}
.opt.multi .key{border-radius:7px}
.opt .txt{flex:1;min-width:0}
.locked .opt{cursor:default}
.locked .opt:hover{transform:none}
.opt.right{border-color:var(--ok);background:var(--ok-soft)}
.opt.right .key{background:var(--ok);border-color:var(--ok);color:#fff}
.opt.wrong{border-color:var(--bad);background:var(--bad-soft)}
.opt.wrong .key{background:var(--bad);border-color:var(--bad);color:#fff}
.scenario-banner{background:var(--surface-2);border:1px solid var(--border);border-radius:11px;padding:12px 15px;margin-bottom:16px;font-size:13.5px;line-height:1.6}
.scenario-banner b{color:var(--accent);display:block;font-size:12px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}
.typehint{font-size:11.5px;color:var(--warn);font-weight:700;background:var(--warn-soft);padding:3px 9px;border-radius:99px}
.domainsum{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-bottom:16px}
.dsum-item{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:9px 12px;font-size:12.5px}
.dsum-item .name{color:var(--muted);margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsum-item .bar{height:6px}
.dsum-item .nums{display:flex;justify-content:space-between;margin-top:4px;font-variant-numeric:tabular-nums;color:var(--muted)}
.bar{height:8px;background:var(--surface-2);border-radius:99px;overflow:hidden;min-width:80px}
.bar i{display:block;height:100%;background:var(--ok)}
.verdict{margin:18px 0 6px;padding:11px 15px;border-radius:11px;font-weight:700}
.verdict.ok{background:var(--ok-soft);color:var(--ok)}
.verdict.bad{background:var(--bad-soft);color:var(--bad)}
.why-box{border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:0 11px 11px 0;padding:12px 15px;margin-top:12px;font-size:14px;background:var(--surface)}
.why-box b{color:var(--accent)}
.why-box.rich{line-height:1.6}
.why-intro{font-weight:600;color:var(--text);margin-bottom:2px}
.why-sectiontitle{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:12px 0 6px}
.why-translation{color:var(--text)}
.why-keywords{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.kw-chip{font-size:11.5px;background:var(--accent-soft);color:var(--accent);padding:3px 10px;border-radius:99px;font-weight:600}
.why-options{display:flex;flex-direction:column;gap:8px}
.why-opt{border:1px solid var(--border);border-radius:9px;padding:9px 12px;font-size:13.5px;background:var(--surface)}
.why-opt b{display:block;margin-bottom:3px;font-size:12px;letter-spacing:.02em}
.why-opt.ok{border-color:var(--ok);background:var(--ok-soft)}
.why-opt.ok b{color:var(--ok)}
.why-opt.no{border-color:var(--bad);background:var(--bad-soft)}
.why-opt.no b{color:var(--bad)}
.why-tip{margin-top:12px;padding:10px 13px;border-radius:9px;background:var(--warn-soft);border:1px solid var(--warn);font-size:13.5px}
.why-tip b{color:var(--warn)}
.btn{background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:8px 14px;cursor:pointer;transition:border-color .15s,background .15s,transform .15s;font-size:13.5px;font-weight:600}
.btn:hover{border-color:var(--accent);transform:translateY(-1px)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.primary:hover{background:var(--accent-hover);border-color:var(--accent-hover)}
.actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.actions .spacer{flex:1}
.empty{color:var(--muted);text-align:center;padding:44px 10px}
footer.legal{margin-top:34px;border-top:1px solid var(--border);padding-top:14px;font-size:11.5px;color:var(--muted);line-height:1.6}
@media (max-width:860px){
  .plyt{grid-template-columns:1fr}
  .side{position:static;max-height:none}
  .pgrid{grid-template-columns:repeat(10,1fr)}
}
@media (max-width:480px){
  .wrap{padding:14px 14px 40px}
  .card{padding:16px}
}
`;

const LEGAL_FOOTER = `Đây là tài liệu ôn tập cá nhân, tự biên soạn dựa trên outline công khai của kỳ thi, không liên kết hay được xác nhận bởi đơn vị tổ chức kỳ thi. Tên chứng chỉ/kỳ thi chỉ dùng để mô tả nội dung ôn tập, không hàm ý được tài trợ hay phê duyệt. Các câu hỏi luyện tập ở đây là mô phỏng tự biên soạn, không phải câu hỏi thật/được nhớ lại/do nhà tài trợ cung cấp. Độ phủ, định dạng và độ khó có thể khác đề thi thật. Vui lòng xác nhận lại thông tin lệ phí, điều kiện thi với đơn vị tổ chức chính thức.`;

function buildPage({ title, subtitle, note, questions }) {
  const needsScenario = questions.some(q => q.scenario !== undefined);
  const domainsPresent = DOMAINS.filter(d => questions.some(q => q.domain === d.id));
  const needsDomainFilter = domainsPresent.length > 1;
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="wrap">
  <header class="top">
    <div>
      <h1>${title}</h1>
      <div class="sub">${subtitle} · <a href="../index.html">&larr; Về trang luyện đề chính</a></div>
    </div>
    <button class="btn" id="theme-toggle" title="Đổi giao diện sáng/tối"></button>
  </header>

  <div class="callout tip" style="margin-top:0"><b>Về đề này</b>${note}</div>

  <div class="toolbar">
    ${needsDomainFilter ? `<select id="p-filter"></select>` : ''}
    <label><input type="checkbox" id="p-shuffle"> Trộn thứ tự câu</label>
    <button class="btn" id="p-restart">&#8635; Làm lại</button>
    <div class="spacer" style="flex:1"></div>
    <div class="stats">
      <div class="stat"><b id="st-total">0</b><span>đã làm</span></div>
      <div class="stat ok"><b id="st-ok">0</b><span>đúng</span></div>
      <div class="stat bad"><b id="st-bad">0</b><span>sai</span></div>
    </div>
  </div>
  <div class="progress"><i id="p-progress"></i></div>
  <div id="p-domainsum"></div>

  <div class="plyt">
    <aside class="side">
      <h2>Danh sách câu</h2>
      <div class="pgrid" id="p-grid"></div>
      <div class="legend">
        <span class="l-ok">Đúng</span><span class="l-bad">Sai</span><span class="l-flag">Đã đánh dấu</span>
      </div>
    </aside>
    <main class="card" id="p-card"></main>
  </div>

  <footer class="legal">${LEGAL_FOOTER}</footer>
</div>

<script>
const DOMAINS = ${JSON.stringify(DOMAINS)};
const DOMAIN_BY_ID = {}; DOMAINS.forEach(d=>DOMAIN_BY_ID[d.id]=d);
${needsScenario ? `const SCENARIOS = ${JSON.stringify(SCENARIOS)};\nconst SCENARIO_BY_ID = {}; SCENARIOS.forEach(s=>SCENARIO_BY_ID[s.id]=s);` : ''}
const QUESTIONS = ${JSON.stringify(questions)};
const NEEDS_DOMAIN_FILTER = ${needsDomainFilter};

if(NEEDS_DOMAIN_FILTER){
  const sel = document.getElementById('p-filter');
  sel.innerHTML = \`<option value="all">Toàn bộ \${QUESTIONS.length} câu</option>\`;
  sel.innerHTML += DOMAINS.filter(d=>QUESTIONS.some(q=>q.domain===d.id)).map(d=>{
    const count = QUESTIONS.filter(q=>q.domain===d.id).length;
    return \`<option value="\${d.id}">Domain \${d.id}: \${d.name.replace(/&amp;/g,'&')} (\${count} câu)</option>\`;
  }).join('');
}
function currentSet(){
  if(!NEEDS_DOMAIN_FILTER) return QUESTIONS.map((_,i)=>i);
  const f = document.getElementById('p-filter').value;
  let idxs = QUESTIONS.map((_,i)=>i);
  if(f!=='all'){
    const did = parseInt(f);
    idxs = idxs.filter(i=>QUESTIONS[i].domain===did);
  }
  return idxs;
}

function loadLS(key, fallback){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } }
function saveLS(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

function getEffectiveTheme(){
  const saved = loadLS('ccarf_theme', null);
  if(saved==='light' || saved==='dark') return saved;
  try{ return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }catch(e){ return 'light'; }
}
function updateThemeButton(theme){
  const btn = document.getElementById('theme-toggle');
  if(btn) btn.textContent = theme==='dark' ? '☀️ Sáng' : '🌙 Tối';
}
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  saveLS('ccarf_theme', theme);
  updateThemeButton(theme);
}
applyTheme(getEffectiveTheme());
document.getElementById('theme-toggle').addEventListener('click', ()=>{
  const cur = document.documentElement.getAttribute('data-theme')==='dark' ? 'dark' : 'light';
  applyTheme(cur==='dark' ? 'light' : 'dark');
});

let practiceOrder = [];
let practiceIdx = 0;
let answers = {};
let flags = {};
let pendingPick = [];

function arraysEqualAsSets(a,b){
  if(a.length!==b.length) return false;
  const sa=[...a].sort(), sb=[...b].sort();
  return sa.every((v,i)=>v===sb[i]);
}

function renderWhy(why){
  if(!why) return '';
  if(typeof why === 'string') return \`<div class="why-box"><b>Giải thích:</b> \${why}</div>\`;
  const kw = (why.keywords||[]).map(k=>\`<span class="kw-chip">\${k}</span>\`).join('');
  const opts = (why.optionAnalysis||[]).map(o=>\`<div class="why-opt \${o.correct?'ok':'no'}"><b>\${o.key}. \${o.correct?'ĐÚNG':'SAI'}</b><div>\${o.explanation||''}</div></div>\`).join('');
  return \`<div class="why-box rich">
    \${why.intro?\`<div class="why-intro">\${why.intro}</div>\`:''}
    \${why.requirementTranslation?\`<div class="why-sectiontitle">Phân tích yêu cầu</div><div class="why-translation">\${why.requirementTranslation}</div>\`:''}
    \${kw?\`<div class="why-keywords">\${kw}</div>\`:''}
    \${opts?\`<div class="why-sectiontitle">Phân tích từng đáp án</div><div class="why-options">\${opts}</div>\`:''}
    \${why.tip?\`<div class="why-tip"><b>Mẹo làm bài:</b> \${why.tip}</div>\`:''}
  </div>\`;
}

function restartPractice(){
  practiceOrder = currentSet();
  if(document.getElementById('p-shuffle').checked){
    for(let i=practiceOrder.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [practiceOrder[i],practiceOrder[j]] = [practiceOrder[j],practiceOrder[i]];
    }
  }
  practiceIdx = 0; answers = {}; flags = {}; pendingPick = [];
  renderPractice();
}
if(NEEDS_DOMAIN_FILTER) document.getElementById('p-filter').addEventListener('change', restartPractice);
document.getElementById('p-shuffle').addEventListener('change', restartPractice);
document.getElementById('p-restart').addEventListener('click', restartPractice);

function renderPGrid(){
  const grid = document.getElementById('p-grid');
  grid.innerHTML = practiceOrder.map((qi,pos)=>{
    const a = answers[qi];
    let cls = '';
    if(a) cls = a.correct ? 'ok' : 'bad';
    if(pos===practiceIdx) cls += ' cur';
    if(flags[qi]) cls += ' flag';
    return \`<button class="cell \${cls}" data-pos="\${pos}" title="Câu \${QUESTIONS[qi].id}">\${pos+1}</button>\`;
  }).join('');
  grid.querySelectorAll('.cell').forEach(c=>{
    c.addEventListener('click', ()=>{ practiceIdx = parseInt(c.dataset.pos); pendingPick=[]; renderPractice(); });
  });
}

function renderStats(){
  const total = Object.keys(answers).length;
  const ok = Object.values(answers).filter(a=>a.correct).length;
  const bad = total-ok;
  document.getElementById('st-total').textContent = total;
  document.getElementById('st-ok').textContent = ok;
  document.getElementById('st-bad').textContent = bad;
  document.getElementById('p-progress').style.width = (total/practiceOrder.length*100||0)+'%';

  const dsum = document.getElementById('p-domainsum');
  if(total===0){ dsum.innerHTML=''; return; }
  const byDomain = {};
  practiceOrder.forEach(qi=>{
    const d = QUESTIONS[qi].domain;
    byDomain[d] = byDomain[d] || {total:0, answered:0, ok:0};
    byDomain[d].total++;
    if(answers[qi]){ byDomain[d].answered++; if(answers[qi].correct) byDomain[d].ok++; }
  });
  dsum.innerHTML = '<div class="domainsum">' + DOMAINS.filter(d=>byDomain[d.id]).map(d=>{
    const s = byDomain[d.id];
    const pct = s.answered ? Math.round(s.ok/s.answered*100) : 0;
    return \`<div class="dsum-item"><div class="name">D\${d.id} · \${d.name.replace(/&amp;/g,'&')}</div>
      <div class="bar"><i style="width:\${pct}%"></i></div>
      <div class="nums"><span>\${s.ok}/\${s.answered} đúng</span><span>\${s.answered}/\${s.total} làm</span></div></div>\`;
  }).join('') + '</div>';
}

function renderPractice(){
  renderPGrid();
  renderStats();
  const qi = practiceOrder[practiceIdx];
  if(qi===undefined){
    document.getElementById('p-card').innerHTML = '<div class="empty">Không có câu hỏi nào.</div>';
    return;
  }
  const q = QUESTIONS[qi];
  const dom = DOMAIN_BY_ID[q.domain];
  const a = answers[qi];
  const locked = !!a;
  const isMulti = q.type===2;

  const optsHtml = Object.keys(q.opts).map(k=>{
    let cls = isMulti ? 'multi' : '';
    let mark = isMulti ? '☐' : k;
    if(locked){
      if(q.correct.includes(k)) { cls+=' right'; mark='✓'; }
      else if(a.picked.includes(k)) { cls+=' wrong'; mark='✗'; }
    } else if(isMulti && pendingPick.includes(k)){
      cls += ' sel'; mark = '☑';
    }
    return \`<div class="opt \${cls}" data-k="\${k}"><span class="key">\${mark}</span><span class="txt">\${q.opts[k]}</span></div>\`;
  }).join('');

  const typeHint = isMulti
    ? \`<span class="typehint">Multiple response · select \${q.selectN}</span>\`
    : \`<span class="typehint" style="color:var(--accent);background:var(--accent-soft)">Multiple choice · select ONE</span>\`;

  const scenarioBanner = (q.scenario !== undefined && typeof SCENARIO_BY_ID !== 'undefined')
    ? \`<div class="scenario-banner"><b>Scenario \${q.scenario}: \${SCENARIO_BY_ID[q.scenario].title}</b>\${SCENARIO_BY_ID[q.scenario].desc}</div>\`
    : '';
  const originChip = q.origin ? \`<span class="chip muted">\${q.origin}</span>\` : '';

  document.getElementById('p-card').innerHTML = \`
    <div class="qhead">
      <span class="qnum">Câu \${practiceIdx+1} / \${practiceOrder.length}</span>
      <span class="chip muted">\${q.id}</span>
      \${originChip}
      <span class="chip muted">Domain \${dom.id} · \${dom.name.replace(/&amp;/g,'&')}</span>
      \${typeHint}
      <button class="flagbtn \${flags[qi]?'on':''}" id="flagbtn">\${flags[qi]?'★ Đã đánh dấu':'☆ Đánh dấu'}</button>
    </div>
    <div class="actions" style="margin-bottom:14px">
      <button class="btn" id="btn-pprev-top" \${practiceIdx===0?'disabled':''}>← Câu trước</button>
      <div class="spacer" style="flex:1"></div>
      <button class="btn primary" id="btn-pnext-top" \${practiceIdx===practiceOrder.length-1?'disabled':''}>Câu tiếp →</button>
    </div>
    \${scenarioBanner}
    <div class="stem"><p>\${q.q}</p></div>
    <div class="opts \${locked?'locked':''}" id="opts">\${optsHtml}</div>
    \${isMulti && !locked ? \`<button class="btn primary" id="btn-submit" style="margin-top:4px" \${pendingPick.length!==q.selectN?'disabled':''}>Nộp đáp án (\${pendingPick.length}/\${q.selectN} đã chọn)</button>\` : ''}
    \${locked? \`<div class="verdict \${a.correct?'ok':'bad'}">\${a.correct?'✓ Chính xác':'✗ Chưa đúng — đáp án đúng là '+q.correct.join(', ')}</div>
    \${renderWhy(q.why)}\` : ''}
  \`;

  document.getElementById('flagbtn').addEventListener('click', ()=>{ flags[qi] = !flags[qi]; renderPractice(); });

  if(!locked){
    document.querySelectorAll('#opts .opt').forEach(opt=>{
      opt.addEventListener('click', ()=>{
        const k = opt.dataset.k;
        if(isMulti){
          const idx = pendingPick.indexOf(k);
          if(idx>=0) pendingPick.splice(idx,1);
          else if(pendingPick.length<q.selectN) pendingPick.push(k);
          renderPractice();
        } else {
          answers[qi] = {picked:[k], correct:q.correct.includes(k)};
          pendingPick = [];
          renderPractice();
        }
      });
    });
    if(isMulti){
      const sb = document.getElementById('btn-submit');
      if(sb) sb.addEventListener('click', ()=>{
        answers[qi] = {picked:[...pendingPick], correct:arraysEqualAsSets(pendingPick, q.correct)};
        pendingPick = [];
        renderPractice();
      });
    }
  }

  const goPrev = ()=>{ practiceIdx--; pendingPick=[]; renderPractice(); };
  const goNext = ()=>{ practiceIdx++; pendingPick=[]; renderPractice(); };
  if(practiceIdx>0){
    document.getElementById('btn-pprev-top').addEventListener('click', goPrev);
  }
  if(practiceIdx<practiceOrder.length-1){
    document.getElementById('btn-pnext-top').addEventListener('click', goNext);
  }
}

restartPractice();
</script>
</body>
</html>
`;
}

// ---- 4. Page definitions ----

const fullExamsDir = path.join(DIR, 'full-exams');
fs.mkdirSync(fullExamsDir, { recursive: true });

const BATCH_SIZE = 30;
const batches = [];
for (let i = 0; i < EXAM2.length; i += BATCH_SIZE) batches.push(EXAM2.slice(i, i + BATCH_SIZE));

const pages = [];

batches.forEach((batch, i) => {
  pages.push({
    file: `batch-${i + 1}.html`,
    title: `CCAR-F — Lượt ${i + 1}/${batches.length}`,
    subtitle: `Câu ${batch[0].id}–${batch[batch.length - 1].id} / ${EXAM2.length}`,
    note: `Lượt ${i + 1} trong bộ ${EXAM2.length} câu mở rộng (30 câu/lượt), trích từ <code>full-exams/</code> để luyện độc lập, không cần mở trang chính.`,
    questions: batch,
  });
});

pages.push({
  file: 'mock-exam.html',
  title: 'CCAR-F — Đề mock đầy đủ (60 câu)',
  subtitle: '6 scenario · 60 câu',
  note: '60 câu chia thành 6 scenario sản phẩm, bám sát định dạng đề thi thật (120 phút, 720/1000 điểm đạt — lưu ý thang điểm không quy đổi tuyến tính ra %). Có cả multiple choice và multiple response.',
  questions: EXAM_RAW,
});

DOMAINS.forEach(d => {
  const qs = [...EXAM_RAW, ...EXAM2].filter(q => q.domain === d.id);
  pages.push({
    file: `domain-${d.id}.html`,
    title: `CCAR-F — Luyện theo Domain ${d.id}`,
    subtitle: `${d.name.replace(/&amp;/g, '&')} · ${qs.length} câu`,
    note: `Gộp toàn bộ câu hỏi thuộc domain "${d.name.replace(/&amp;/g, '&')}" (trọng số ${d.weight}% trong đề thi thật) từ cả 2 bộ đề (60 câu mock + ${EXAM2.length} câu mở rộng) để luyện tập trung.`,
    questions: qs,
  });
});

pages.forEach(p => {
  fs.writeFileSync(path.join(fullExamsDir, p.file), buildPage(p));
});

console.log(`Wrote ${pages.length} pages to full-exams/:`, pages.map(p => p.file).join(', '));
