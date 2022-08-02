let search = document.getElementById("search");
let taskNumber = 0;
let username = '0-jij-0';
let resultIndices = new Set();
let parser = new DOMParser();

 async function findFirstLanguagePage(language, L, R){
    while(L != R){
        var mid = (L + R) >> 1;
        var midSearchPage =  await axios.get(`https://cses.fi/problemset/hack/${taskNumber}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topLanguage = midSearchTable.children[0].children[2].textContent;
        var bottomLanguage = midSearchTable.children[midSearchTable.children.length-1].children[2].textContent;
        if(language < topLanguage) {R = mid - 1; continue;}
        if(language > bottomLanguage){L = mid + 1; continue;}
        if(language > topLanguage && language < bottomLanguage){return mid;}
        if(language == topLanguage || language == bottomLanguage){R = mid; continue;}
    }
    return L;
}

 async function findLastLanguagePage(language, L, R){
    while(L != R){
        var mid = (L + R + 1) >> 1;
        var midSearchPage =  await axios.get(`https://cses.fi/problemset/hack/${taskNumber}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topLanguage = midSearchTable.children[0].children[2].textContent;
        var bottomLanguage = midSearchTable.children[midSearchTable.children.length-1].children[2].textContent;
        if(language < topLanguage) {R = mid - 1; continue;}
        if(language > bottomLanguage){L = mid + 1; continue;}
        if(language > topLanguage && language < bottomLanguage){return mid;}
        if(language === topLanguage || language === bottomLanguage){L = mid; continue;}
    }
    return L;
}

 async function findFirstDatePage(date, L, R){
    while(L != R){
        var mid = (L + R) >> 1;
        var midSearchPage =  await axios.get(`https://cses.fi/problemset/hack/${taskNumber}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topDate = new Date(midSearchTable.children[0].children[0].textContent);
        var bottomDate = new Date(midSearchTable.children[midSearchTable.children.length-1].children[0].textContent);
        if(date > topDate){R = mid - 1; continue;}
        if(date < bottomDate){L = mid + 1; continue;}
        if(date < topDate && date > bottomDate){return mid;}
        if(date === topDate || date === bottomDate){R = mid; continue;}
    }
    return L;
}

 async function findLastDatePage(date, L, R){
    while(L != R){
        var mid = (L + R + 1) >> 1;
        var midSearchPage =  await axios.get(`https://cses.fi/problemset/hack/${taskNumber}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topDate = new Date(midSearchTable.children[0].children[0].textContent);
        var bottomDate = new Date(midSearchTable.children[midSearchTable.children.length-1].children[0].textContent);
        if(date > topDate){R = mid - 1; continue;}
        if(date < bottomDate){L = mid + 1; continue;}
        if(date < topDate && date > bottomDate){return mid;}
        if(date === topDate || date === bottomDate){L = mid; continue;}
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
    let firstLanguagePageIndex = await findFirstLanguagePage(language, firstPageIndex, lastPageIndex);
    let lastLanguagePageIndex = await findLastLanguagePage(language, firstLanguagePageIndex, lastPageIndex);
    processPages(firstLanguagePageIndex, firstLanguagePageIndex);
    processPages(lastLanguagePageIndex, lastLanguagePageIndex);
    if(lastLanguagePageIndex - firstLanguagePageIndex < 2){ displayRelevantPages(); return; }
    document.getElementById("pages").textContent = "Getting Date range";
    let firstDatePageIndex = await findFirstDatePage(startDate, firstLanguagePageIndex + 1, lastLanguagePageIndex - 1);
    let lastDatePageIndex = await findLastDatePage(lastDate, firstDatePageIndex, lastLanguagePageIndex - 1);
    document.getElementById("pages").textContent = "Parsing found pages";
    await processPages(firstDatePageIndex, lastDatePageIndex);

    displayRelevantPages();
});
