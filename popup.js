let search = document.getElementById("search");
let taskNumber = 0;
let username = '';
let resultIndices = new Set();
let parser = new DOMParser();

function getDateFromTable(table, i){
    new Date(table.children[i].children[0].textContent);
}

function getLanguageFromTable(table, i){
    table.children[i].children[2].textContent;
}

 async function findPage(target, L, R, getFromTable, FIRST){
    while(L != R){
        var mid = (L + R + (FIRST == 0)) >> 1;
        var midSearchPage =  await axios.get(`https://cses.fi/problemset/hack/${taskNumber}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var top = getFromTable(midSearchTable, 0);
        var bottom = getFromTable(midSearchTable, midSearchTable.children.length-1);
        if(target < top) {R = mid - 1; continue;}
        if(target > bottom){L = mid + 1; continue;}
        if(target > top && target < bottom){return mid;}
        if(target == top || target == bottom){ (FIRST ? R : L) = mid; continue;}
    }
    return L;
}

 async function processPages(firstPage, lastPage){
    for(var page = firstPage; page <= lastPage; page++){
        let searchPage =  await axios.get(`https://cses.fi/problemset/hack/${taskNumber}/list/21/${page}/`);
        let searchTable = parser.parseFromString(searchPage.data,'text/html').getElementsByTagName("tbody")[0];
        for(var i=0;i<searchTable.children.length;i++){
            let curUsername = searchTable.children[i].children[1].textContent
            if(curUsername === username){resultIndices.add(page); break;}
        }
    }
}

function displayRelevantPages(){
    resultIndices.forEach((pageIDX) => {
        console.log(pageIDX);
        chrome.tabs.create({ url: `https://cses.fi/problemset/hack/${taskNumber}/list/21/${pageIDX}/`});
    });
   document.getElementById("pages").textContent = "Done!";
}

search.addEventListener("click", async () => {
    document.getElementById("pages").textContent = "Preparing";
    taskNumber = document.getElementById('taskNumber').value;
    username = document.getElementById('username').value;
    let startDate = new Date(document.getElementById('startDate').value+' 23:59:59');
    let lastDate = new Date(document.getElementById('lastDate').value+' 00:00:00');
    let language = document.getElementById('language').value;
    
    const response = await axios.get(`https://cses.fi/problemset/hack/${taskNumber}/list/21/1/`)
    var htmlDoc = parser.parseFromString(response.data, 'text/html');
 
    var firstPageIndex = 1;
    var lastPageIndex = parseInt(htmlDoc.getElementsByClassName("pager full-width")[0].children[6].text);

    document.getElementById("pages").textContent = "Getting Language range";
    let firstLanguagePageIndex = await findPage(language, firstPageIndex, lastPageIndex, getLanguageFromTable, true);
    let lastLanguagePageIndex = await findPage(language, firstLanguagePageIndex, lastPageIndex, getLanguageFromTable, false);
    processPages(firstLanguagePageIndex, firstLanguagePageIndex);
    processPages(lastLanguagePageIndex, lastLanguagePageIndex);
    if(lastLanguagePageIndex - firstLanguagePageIndex < 2){ displayRelevantPages(); return; }

    document.getElementById("pages").textContent = "Getting Date range";
    let firstDatePageIndex = await findPage(startDate, firstLanguagePageIndex + 1, lastLanguagePageIndex - 1, getDateFromTable, true);
    let lastDatePageIndex = await findLastDatePage(lastDate, firstDatePageIndex, lastLanguagePageIndex - 1, getDateFromTable, false);

    document.getElementById("pages").textContent = "Parsing found pages";
    await processPages(firstDatePageIndex, lastDatePageIndex);

    displayRelevantPages();
});
