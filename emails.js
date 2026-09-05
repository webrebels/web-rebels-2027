// Newsletter archive: lists epost/emails.json and shows one email at a time.
// The markdown files are plain text, so we render paragraphs ourselves.

function cleanTitle(title) {
  return title
    .replace(/\s*\((newsletter (list|subscribers)|prev(ious)? ticket holders|copy \d+)\)\s*$/i, "")
    .replace(/^\S*\s*/, (m) => (/^[\p{L}\p{N}"']/u.test(m) ? m : ""))
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// The same email often went to two Mailchimp segments minutes apart, as two
// files with a 1/2 suffix. Show each of those once.
function dedupe(emails) {
  const seen = new Set();
  const out = [];
  for (const email of emails) {
    const key = email.sentAt.slice(0, 10) + " " + email.file.replace(/[12]\.md$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(email);
  }
  return out.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function linkify(escaped) {
  return escaped.replace(/https?:\/\/[^\s<]+[^\s<.,;:)!?]/g, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

function parseBody(text, title) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  while (lines.length && (/^(Subject|Preview):/i.test(lines[0]) || !lines[0].trim())) lines.shift();
  const normalise = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  if (lines.length && normalise(lines[0]) === normalise(title)) lines.shift();
  const paragraphs = lines
    .join("\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs.map((p) => `<p>${linkify(escapeHtml(p)).replace(/\n/g, "<br />")}</p>`).join("\n");
}

function formatDate(sentAt) {
  const [y, m, d] = sentAt.slice(0, 10).split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}

function slugOf(email) {
  return email.file.replace(/\.md$/, "");
}

if (typeof document !== "undefined") {
  (async function init() {
    const list = document.getElementById("email-list");
    const view = document.getElementById("email-view");
    const back = document.getElementById("email-back");
    let emails;
    try {
      const res = await fetch("/epost/emails.json");
      if (!res.ok) throw new Error(res.status);
      emails = dedupe((await res.json()).filter((e) => e.status === "sent" && e.file && e.sentAt));
    } catch (err) {
      list.innerHTML = '<li class="email-list-status">Couldn\'t load the archive. Try again in a bit.</li>';
      return;
    }

    list.innerHTML = emails
      .map(
        (e) =>
          `<li><a href="#${slugOf(e)}"><time datetime="${e.sentAt}">${formatDate(e.sentAt)}</time><span>${escapeHtml(cleanTitle(e.title))}</span></a></li>`
      )
      .join("\n");

    async function show() {
      const slug = location.hash.slice(1);
      const email = emails.find((e) => slugOf(e) === slug);
      if (!email) {
        view.hidden = true;
        list.hidden = false;
        return;
      }
      const title = cleanTitle(email.title);
      document.getElementById("email-title").textContent = title;
      document.getElementById("email-meta").textContent = `Sent ${formatDate(email.sentAt)}`;
      const body = document.getElementById("email-body");
      body.textContent = "Loading…";
      list.hidden = true;
      view.hidden = false;
      try {
        const res = await fetch(`/epost/${email.file}`);
        if (!res.ok) throw new Error(res.status);
        body.innerHTML = parseBody(await res.text(), title);
      } catch (err) {
        body.textContent = "Couldn't load this email.";
      }
      view.scrollIntoView({ block: "start" });
    }

    back.addEventListener("click", (event) => {
      event.preventDefault();
      history.pushState(null, "", location.pathname);
      show();
    });
    window.addEventListener("hashchange", show);
    show();
  })();
}

if (typeof module !== "undefined") module.exports = { cleanTitle, dedupe, parseBody, formatDate };
