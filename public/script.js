document.getElementById("checkBtn").addEventListener("click", async () => {
  const url = document.getElementById("urlInput").value.trim();
  const resultsDiv = document.getElementById("results");

  if (!url) {
    resultsDiv.textContent = "Please enter a valid URL.";
    return;
  }

  resultsDiv.textContent = "Analyzing site... please wait.";

  try {
    const res = await fetch(`/analyze?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.error) {
      resultsDiv.textContent = `Error: ${data.error}`;
      return;
    }

    resultsDiv.innerHTML = `
      ✅ Headings found: ${data.totalHeadings} ${data.missingHeadings ? "(⚠️ None found)" : ""}
      🌐 Total Links: ${data.totalLinks}
      🔗 External Links: ${data.externalLinks}
      🧭 Landmarks:
        - Header: ${data.landmarks.header ? "✔️" : "❌"}
        - Main: ${data.landmarks.main ? "✔️" : "❌"}
        - Nav: ${data.landmarks.nav ? "✔️" : "❌"}
        - Footer: ${data.landmarks.footer ? "✔️" : "❌"}
      ❌ Broken Links: ${data.brokenLinks.length}
      ${data.brokenLinks.map(l => "   " + l).join("\n")}
    `;
  } catch (err) {
    resultsDiv.textContent = "Error fetching site data.";
  }
});
