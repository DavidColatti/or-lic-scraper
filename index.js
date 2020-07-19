const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeLic(id, page, writeStream) {
  const html = await page.content();
  const $ = cheerio.load(html);

  try {
    let bizName = $("#MainContent_contractornamelabel").text() || "N/A";
    let phoneNumber = $("#MainContent_phonelabel").text() || "N/A";
    let address = $("#MainContent_addresslabel").text() || "N/A";
    let type = $("#MainContent_endorsementlabel").text() || "N/A";
    let licNum = id;
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

    writeStream.write(
      `${data.bizName} ~ ${data.phoneNumber} ~ ${data.address} ~ ${data.type} ~ ${data.licNum} ~ ${data.dateIssued} \n`
    );

    return data;
  } catch (e) {
    console.log("nothing found");
  }
}

async function main(id, times) {
  const rawDate = new Date().toString().split(" ");
  const date = `${rawDate[1]}-${rawDate[2]}-${rawDate[3]}`;
  const writeStream = fs.createWriteStream(`OR-${date}.txt`);
  const pathName = writeStream.path;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  let results = [];
  for (let i = 0; i < times; i++) {
    let newId = (Number(id) + i).toString();
    console.log(newId);

    try {
      await page.goto(`https://www.ccb.state.or.us/search/`);
      await page.waitFor(2000);
      await page.type("#MainContent_searchBox", newId);
      await page.click("#MainContent_submitbtn");
      await page.waitFor(2000);
      await page.type("#MainContent_searchBox", newId);
      await page.click("#MainContent_GridView1 input[type=button]");
      await page.waitFor(2000);
      await page.click("#pagecontent div a");
      await page.waitFor(2000);

      let data = await scrapeLic(newId, page, writeStream);

      if (data) results.push(data);
    } catch (e) {
      console.log("no search found");
    }

    continue;
  }

  await browser.close();
}

main("231481", 300);

// OREGON LIC SEARCH: 231181;
// https://www.ccb.state.or.us/search/list_results.aspx
