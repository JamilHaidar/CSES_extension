let search = document.getElementById("search");
let task_number = document.getElementById('task_number').value;
let username = document.getElementById('username').value;
let resultIndices = new Set();
let parser = new DOMParser();

function findFirstLanguagePage(language, L, R){
    while(L != R){
        var mid = (L + R) >> 1;
        var midSearchPage = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topLanguage = midSearchTable.children[0].children[2].textContent;
        var bottomLanguage = midSearchTable.children[mid_table.children.length-1].children[2].textContent;
        if(language < topLanguage) {R = mid - 1; continue;}
        if(language > bottomLanguage){L = mid + 1; continue;}
        if(language > topLanguage && language < bottomLanguage){return mid;}
        if(language == topLanguage || language == bottomLanguage){R = mid; continue;}
    }
    return L;
}

function findLastLanguagePage(language, L, R){
    while(L != R){
        var mid = (L + R + 1) >> 1;
        var midSearchPage = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topLanguage = midSearchTable.children[0].children[2].textContent;
        var bottomLanguage = midSearchTable.children[mid_table.children.length-1].children[2].textContent;
        if(language < topLanguage) {R = mid - 1; continue;}
        if(language > bottomLanguage){L = mid + 1; continue;}
        if(language > topLanguage && language < bottomLanguage){return mid;}
        if(language === topLanguage || language === bottomLanguage){L = mid; continue;}
    }
    return L;
}

function findFirstDatePage(date, L, R){
    while(L != R){
        var mid = (L + R) >> 1;
        var midSearchPage = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topDate = new Date(midSearchTable.children[0].children[0].textContent);
        var bottomDate = new Date(midSearchTable.children[mid_table.children.length-1].children[0].textContent);
        if(date > topDate){R = mid - 1; continue;}
        if(date < bottomDate){L = mid + 1; continue;}
        if(date < topDate && date > bottomDate){return mid;}
        if(date === topDate || date === bottomDate){R = mid; continue;}
    }
    return L;
}

function findLastDatePage(date, L, R){
    while(L != R){
        var mid = (L + R + 1) >> 1;
        var midSearchPage = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
        var midSearchTable = parser.parseFromString(midSearchPage.data,'text/html').getElementsByTagName("tbody")[0];
        var topDate = new Date(midSearchTable.children[0].children[0].textContent);
        var bottomDate = new Date(midSearchTable.children[mid_table.children.length-1].children[0].textContent);
        if(date > topDate){R = mid - 1; continue;}
        if(date < bottomDate){L = mid + 1; continue;}
        if(date < topDate && date > bottomDate){return mid;}
        if(date === topDate || date === bottomDate){L = mid; continue;}
    }
    return L;
}

function processPages(firstPage, lastPage){
    for(var page = firstPage; page <= lastPage; page++){
        let searchPage = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${page}/`);
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
        chrome.tabs.create({ url: `https://cses.fi/problemset/hack/${task_number}/list/21/${pageIDX}/`});
    });
   document.getElementById("pages").textContent = "Done!";
}

search.addEventListener("click", async () => {
    document.getElementById("pages").textContent = "Preparing";
    let startDate = new Date(document.getElementById('start_date').value+' 23:59:59');
    let lastDate = new Date(document.getElementById('end_date').value+' 00:00:00');
    let language = document.getElementById('language').value;
    
    const response = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/1/`)
    var htmlDoc = parser.parseFromString(response.data, 'text/html');
 
    var firstPageIndex = 1;
    var lastPageIndex = parseInt(htmlDoc.getElementsByClassName("pager full-width")[0].children[6].text);

    let firstLanguagePageIndex = findFirstLanguagePage(language, firstPageIndex, lastPageIndex);
    let lastLanguagePageIndex = findLastLanguagePage(language, firstLanguagePageIndex, lastPageIndex);
    processPages(firstLanguagePageIndex, firstLanguagePageIndex);
    processPages(lastLanguagePageIndex, lastLanguagePageIndex);
    if(lastLanguagePageIndex - firstLanguagePageIndex < 2){ displayRelevantPages(); return; }

    let firstDatePageIndex = findFirstDatePage(startDate, firstLanguagePageIndex + 1, lastLanguagePageIndex - 1);
    let lastDatePageIndex = findLastDatePage(lastDate, firstDatePageIndex, lastDatePageIndex - 1);
    processPages(firstDatePageIndex, lastDatePageIndex);

    displayRelevantPages();
});
