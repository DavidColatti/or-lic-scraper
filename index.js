const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function scrapeLic(page) {
  const html = await page.content();
  const $ = cheerio.load(html);

  let bizName = $("#MainContent_contractornamelabel").text() || "N/A";
  let phoneNumber = $("#MainContent_phonelabel").text() || "N/A";
  let address = $("#MainContent_addresslabel").text() || "N/A";
  let type = $("#MainContent_endorsementlabel").text() || "N/A";
  let licNum = $("#MainContent_licenselabel").text() || "N/A";
  let dateIssued = $("#MainContent_datefirstlabel").text() || "N/A";

  let data = {
    bizName: bizName,
    phoneNumber: phoneNumber,
    address: address,
    type: type,
    licNum: licNum,
    dateIssued: dateIssued,
  };

  console.log(data);
  return data;
}

async function main(id, times) {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  let results = [];
  for (let i = 0; i < times; i++) {
    let newId = (Number(id) + i).toString();
    console.log(newId);
    await page.goto(`https://www.ccb.state.or.us/search/`);
    await page.waitFor(5000);
    await page.type("#MainContent_searchBox", newId);
    await page.click("#MainContent_submitbtn");
    await page.waitFor(5000);
    await page.type("#MainContent_searchBox", newId);
    await page.click("#MainContent_GridView1 input[type=button]");
    await page.waitFor(5000);
    await page.click("#pagecontent div a");
    await page.waitFor(5000);

    let data = await scrapeLic(page);
    results.push(data);
  }

  await browser.close();
}

main("231181", 2);

// OREGON LIC SEARCH: 231181;
// https://www.ccb.state.or.us/search/list_results.aspx
