---
name: add-certification
description: "Use when adding a new certification exam/practice-app to this repo (cert-practice-exam, née aws-saa-c03-practice-exam) — scaffolds the folder, wires it into the picker page and README, and keeps styling/conventions consistent with the existing certs (SAA-C03, CCAO-F, CCAR-F)."
---

# Adding a new certification

This repo is a static, offline, multi-certification practice-exam site. `index.html` at the
root is a picker page; each certification lives in its own top-level folder and is otherwise
fully self-contained (no backend, no build step, no shared JS between certs).

## Repo layout

| Path | Role |
|---|---|
| `index.html` | Root picker page — one `<a class="cert-card">` per cert |
| `README.md` | Human-facing overview — one `### <Cert name>` section + one file-structure table row per cert |
| `<slug>/index.html` | The cert's practice app itself |
| `<slug>/cheatsheet.html` | Optional separate cheat sheet (only if not already a tab inside `index.html`) |
| `<slug>/question-data.js`, `question.json`, `explanations-data.js` | Optional split data files — only used by `saa-c03/` because of its question volume (1019 Qs). Everything smaller (CCAO-F: 119, CCAR-F: 60+210) embeds its question array directly as a JS literal inside `<slug>/index.html` instead. Prefer the single-file approach unless the question count makes the file unwieldy. |

## Steps

1. **Pick a slug** — short, lowercase, matches the cert's Pearson/official code style already used (`saa-c03`, `ccao-f`, `ccar-f`). Create `<slug>/`.

2. **Build or copy the app** into `<slug>/index.html`. If you already iterated on it elsewhere (e.g. under a personal `practice/` scratch folder outside this repo), copy only the final polished single-file app — do **not** bring in raw source drafts (question-set `.txt`/`.md` dumps, `*.backup.html`, scratch `other/`/`practice/` subfolders). Those stay in the scratch location; this repo only tracks the finished product.

3. **Match the existing design system.** CCAO-F and CCAR-F already share one CSS variable theme (cool blue, light **and** dark mode via `prefers-color-scheme` + `data-theme` override) — reuse that `:root` block verbatim for a new cert rather than inventing a new palette. `saa-c03/` predates this and uses an older warm palette without dark-mode support; don't propagate that older style to new certs.

4. **Wire it into the root `index.html` picker:**
   - Add a new `.cert-badge.<slug>` CSS rule using a color not already taken (`saa`→blue/accent, `ccao`→amber, `ccar`→green — pick the next distinct hue).
   - Add a new `<a class="cert-card" href="<slug>/index.html">` block, copying the structure of an existing card: badge, `<h2>` with full cert name + code in parens, one-line `<p>` description, `.meta` chip row (question count / format / extras), `.cta` link text.
   - Update the `<meta name="description">` tag at the top to mention the new cert alongside the existing ones.

5. **Update `README.md`:**
   - Add a `### <Full cert name> (<CODE>) — [\`<slug>/\`](<slug>/)` section with a bullet list mirroring the existing certs' level of detail (question count, modes, cheat sheet y/n).
   - Add one row to the file-structure table.
   - Add one line to "Nguồn dữ liệu" describing where the questions came from and how trustworthy the answer key is (community-sourced vs official, AI-inferred vs verified) — this repo is explicit about that distinction per cert, keep it that way.

6. **Validate before committing** — these apps embed their question bank as one giant single-line JS array literal, which is too large for normal file-reading tools to open (Read/Edit will refuse with a token-limit error on the data line). To sanity-check or to patch a data bug after the fact:
   - Validate syntax: extract every `<script>...</script>` block and run it through `new Function(src)` in Node — a parse error there means a broken quote/escape in the data.
   - To edit a specific question's field, use a small Node script that does an exact, uniqueness-checked `String#split/join` replace directly on the file (verify the match count is exactly 1 before writing), rather than trying to open the file in an editor. Remember the data string is itself a double-quoted JS string literal — any literal `"` you insert into a field's HTML (e.g. `style="..."` or a quoted word) must be escaped as `\"`, or the array literal will fail to parse.

7. **Don't commit/push automatically** — stage and commit when asked, same as the rest of this repo's workflow; confirm before pushing.
