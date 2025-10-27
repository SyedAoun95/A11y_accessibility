const express = require("express");
const axios = require("axios");
const { JSDOM } = require("jsdom");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/analyze", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // 1️⃣ Heading structure
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const missingHeadings = headings.length === 0;

    // 2️⃣ External link warnings
    const links = [...document.querySelectorAll("a[href]")];
    const externalLinks = links.filter(
      (a) => a.href.startsWith("http") && !a.href.includes(url)
    );

    // 3️⃣ Landmarks
    const landmarks = {
      header: !!document.querySelector("header"),
      main: !!document.querySelector("main"),
      nav: !!document.querySelector("nav"),
      footer: !!document.querySelector("footer"),
    };

    // 4️⃣ Broken links (status check)
    const brokenLinks = [];
    for (const link of links.slice(0, 10)) { // limit for speed
      try {
        const resp = await axios.head(link.href);
        if (resp.status >= 400) brokenLinks.push(link.href);
      } catch {
        brokenLinks.push(link.href);
      }
    }

    res.json({
      totalHeadings: headings.length,
      missingHeadings,
      totalLinks: links.length,
      externalLinks: externalLinks.length,
      landmarks,
      brokenLinks,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or analyze site" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
