const express = require("express"),
  app = express(),
  puppeteer = require("puppeteer"),
  fs = require("fs");

app.get("/screenshot", async (request, response) => {
  const url = request.query.url;

  if (!url) {
    return response
      .status(400)
      .json({ error: "URL query parameter is required." });
  }

  console.log(`Taking screenshot of ${url}`);

  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const screenshotBuffer = await page.screenshot();
    await browser.close();

    const fileName = `screenshot_${Date.now()}.png`;
    fs.writeFileSync(fileName, screenshotBuffer);

    response.download(fileName, () => {
      // Delete the file after it's been downloaded
      fs.unlinkSync(fileName);
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return response
      .status(500)
      .json({ error: "Failed to take screenshot.", message: error });
  }
});

app.post("/pdf", async (request, response) => {
    const html = request.body.html;

    if (!html) {
        return response
            .status(400)
            .json({ error: "HTML content is required in the request body." });
    }

    console.log('Generating PDF from HTML content');

    try {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox"],
            headless: true
        });
        const page = await browser.newPage();
    
        await page.setContent(html, { waitUntil: "networkidle2" });

        const pdf = await page.pdf({ format: 'letter' });

        await browser.close();

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="document.pdf"`);
        response.send(pdf);

    } catch (error) {
        console.error("Error occurred:", error);
        return response
            .status(500)
            .json({ error: "Failed to generate PDF.", message: error });
    }
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
