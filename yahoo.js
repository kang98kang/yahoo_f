const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds
const END_DATE = Math.floor(Date.now() / 1000); // Current date in UNIX timestamp
const START_DATE = Math.floor((Date.now() - ONE_WEEK_MS) / 1000); // One week ago in UNIX timestamp
// const SYMBOL = "NVDA";
// const URL = `https://query1.finance.yahoo.com/v7/finance/download/${SYMBOL}?period1=${START_DATE}&period2=${END_DATE}&interval=1d&events=history`;
// const QUOTE_URL = `https://api.polygon.io/v3/reference/tickers/${SYMBOL}?apiKey=gISmRpMLyFDoLbhVYvSxn5jZxjPiByUf`;

async function retryFetch(url) {
  try {
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`; // CORS 우회용 프록시 URL
    const response = await fetch(proxyUrl);
    const data = await response.text();
    return data;
  } catch (error) {
    console.error(`데이터를 가져오는 중 에러가 발생했습니다.`, error);
  }
}
async function retryFetch1(url) {
  try {
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`; // CORS 우회용 프록시 URL
    const response = await fetch(proxyUrl);
    const data1 = await response.json();
    return data1;
  } catch (error) {
    console.error(`데이터를 가져오는 중 에러가 발생했습니다.`, error);
  }
}

function parseCSVData(csvData) {
  const rows = csvData.split("\n").slice(1); // 첫 줄은 헤더라서 무시
  return rows
    .map((row) => {
      const cols = row.split(",");
      let volume = cols[6] || null;
      if (volume) {
        volume = parseFloat(volume);
        if (volume >= 100000000) {
          volume = (volume / 100000000).toFixed(1) + "억"; // 억 단위로 표시
        } else if (volume >= 10000000) {
          volume = (volume / 10000000).toFixed(1) + "천만"; // 천만 단위로 표시
        } else if (volume >= 1000000) {
          volume = (volume / 1000000).toFixed(1) + "백만"; // 백만 단위로 표시
        } else {
          volume = Math.floor(volume / 100000) * 100000; // 십만 이하 버림
        }
      }
      return {
        date: cols[0] || null,
        open: cols[1] ? parseFloat(cols[1]).toFixed(2) + "" : null,
        high: cols[2] ? parseFloat(cols[2]).toFixed(2) + "" : null,
        low: cols[3] ? parseFloat(cols[3]).toFixed(2) + "" : null,
        close: cols[4] ? parseFloat(cols[4]).toFixed(2) + "" : null,
        volume: volume,
      };
    })
    .filter((item) => item.date && item.close); // 유효한 데이터만 반환
}

function populateStockTable(stockData) {
  const tableBody = document.querySelector("#stockTable tbody");
  tableBody.innerHTML = "";

  if (!stockData) {
    const errorMessageRow = tableBody.insertRow();
    const errorMessageCell = errorMessageRow.insertCell();
    errorMessageCell.colSpan = 6; // 테이블 전체 셀을 차지하도록 설정
    errorMessageCell.textContent = "주식 데이터를 불러오지 못했습니다.";
    return;
  }

  stockData.forEach((item) => {
    const newRow = tableBody.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);
    const cell6 = newRow.insertCell(5);

    cell1.textContent = item.date;
    cell2.textContent = item.open;
    cell3.textContent = item.high;
    cell4.textContent = item.low;
    cell5.textContent = item.close;
    cell6.textContent = item.volume;
  });
}

async function loadStockData() {
  const SYMBOL = document.getElementById("symbol").value || "TSLA";
  const URL = `https://query1.finance.yahoo.com/v7/finance/download/${SYMBOL}?period1=${START_DATE}&period2=${END_DATE}&interval=1d&events=history`;
  const QUOTE_URL = `https://api.polygon.io/v3/reference/tickers/${SYMBOL}?apiKey=gISmRpMLyFDoLbhVYvSxn5jZxjPiByUf`;
  try {
    const csvData = await retryFetch(URL);
    const stockData = parseCSVData(csvData);
    populateStockTable(stockData);
    console.log("주식 정보 가져오기 성공:");

    const namedata = await retryFetch1(QUOTE_URL);
    console.log(namedata);
    const stockName = namedata.results.name;
    console.log(stockName);
    document.getElementById("stock-name").textContent = `${stockName}`;
    console.log("주식 이름 불러오기 성공:");

    const urldata = await retryFetch1(QUOTE_URL);
    console.log(urldata);
    const stockUrl = urldata.results.homepage_url;
    console.log(stockUrl);
    document.getElementById("stock-url").href = stockUrl;
  } catch (error) {
    console.log("주식 정보 가져오기 실패:", error);
    populateStockTable(null); // 데이터를 null로 표시하여 테이블만 표시
    document.getElementById("stock-name").textContent =
      "주식 이름을 불러오지 못했습니다.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadStockData();
});
