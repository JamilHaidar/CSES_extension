let search = document.getElementById("search");
search.addEventListener("click", async () => {
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //     var activeTab = tabs[0];
    //     console.log(activeTab.url)
    //  });
    document.getElementById("pages").textContent = "Preparing";
    let task_number = document.getElementById('task_number').value;
    let username = document.getElementById('username').value;
    let start_date = new Date(document.getElementById('start_date').value+' 23:59:59');
    let end_date = new Date(document.getElementById('end_date').value+' 00:00:00');
    let language = document.getElementById('language').value;
    let max_submissions = parseInt(document.getElementById('max_submissions').value); 
    
    const response = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/1/`)
    const response_end = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/22/1/`)
    
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(response.data, 'text/html');
 
    var first_table = htmlDoc.getElementsByTagName("tbody")[0];
    var first_index = 1;
    var first_language = first_table.children[0].children[2].textContent;
    var first_date = new Date(first_table.children[0].children[0].textContent)
    if(start_date.toString()==="Invalid Date")
        start_date = first_date;

    var last_index = parseInt(htmlDoc.getElementsByClassName("pager full-width")[0].children[6].text);
    var last_table = parser.parseFromString(response_end.data, 'text/html').getElementsByTagName("tbody")[0];
    var last_language = last_table.children[last_table.children.length-1].children[2].textContent;
    var last_date = new Date(last_table.children[last_table.children.length-1].children[0].textContent)
    if(end_date.toString()==="Invalid Date")
        end_date = last_date;

    let left = first_index;
    let right = last_index;
    let mid = left;
    
    let start_index = 1;
    let end_index = last_index;
    
    let found_start = false;
    let found_end = false;
    let found_start_date = false;
    let found_end_date = false;
    let indices = new Set();
    document.getElementById("pages").textContent = "Finding language start index";
    while(left<=right){
        mid = (right+left)/2 >> 0;
        let mid_response = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
        let mid_table = parser.parseFromString(mid_response.data,'text/html').getElementsByTagName("tbody")[0];
        let top_language = mid_table.children[0].children[2].textContent;
        let bottom_language = mid_table.children[mid_table.children.length-1].children[2].textContent;
        let top_date = new Date(mid_table.children[0].children[0].textContent);
        let bottom_date = new Date(mid_table.children[mid_table.children.length-1].children[0].textContent);

        if (language<top_language){
            right = mid-1;
            end_index = mid-1;
            mid = mid-1;
        }
        if(language>bottom_language){
            left = mid+1;
            mid = mid+1;
        }
        if(language<bottom_language && language>top_language){
            start_index = mid;
            end_index = mid;
            found_start_date = true;
            found_end_date = true;
            found_start = true;
            found_end = true;
            break;
        }
        if(language===bottom_language && language>top_language){
            start_index = mid+1;
            found_start = true;
            for(var i=0;i<mid_table.children.length;i++)
                if(mid_table.children[i].children[1].textContent === username)
                    indices.add(i);
            break;
        }
        if(language===top_language && language<bottom_language){
            right=mid-1;
            end_index= mid-1;
            found_end = true;
            found_end_date = true;
            for(var i=0;i<mid_table.children.length;i++)
                if(mid_table.children[i].children[1].textContent === username)
                    indices.add(i);
        }
        if(language===top_language && language===bottom_language){
            if(top_date>=start_date && bottom_date<=end_date){
                start_index = mid;
                end_index = mid;
                found_start_date = true;
                found_end_date = true;
                found_start = true;
                found_end = true;
                break;
            }else if(bottom_date>start_date){
                start_index=mid+1;
                left = mid+1;
            }else if(top_date<end_date){
                right = mid-1;
                end_index = mid-1;
            }else{
                right = mid-1;
            }
        }
    }
    if(!found_start)
        start_index = mid;
        
    if(!found_end){
        left = start_index;
        right = end_index;
        document.getElementById("pages").textContent = "Finding language end index";
        while(left<=right){
            mid = (right+left)/2 >> 0;
            let mid_response = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
            let mid_table = parser.parseFromString(mid_response.data,'text/html').getElementsByTagName("tbody")[0];
            let top_language = mid_table.children[0].children[2].textContent;
            let bottom_language = mid_table.children[mid_table.children.length-1].children[2].textContent;
            let top_date = new Date(mid_table.children[0].children[0].textContent);
            let bottom_date = new Date(mid_table.children[mid_table.children.length-1].children[0].textContent);
            if(left==right){
                end_index = mid;
                found_end = true;
                break;
            }
            if (language<top_language){
                right = mid-1;
                end_index = mid-1;
                mid = mid-1;
            }
            if(language>bottom_language){
                left = mid+1;
                mid = mid+1;
            }
            if(language===top_language && language<bottom_language){
                right=mid-1;
                end_index= mid-1;
                for(var i=0;i<mid_table.children.length;i++)
                    if(mid_table.children[i].children[1].textContent === username)
                        indices.add(i);
                found_end = true;
                found_end_date = true;
                break;
            }
            if(language===top_language && language===bottom_language){
                if(top_date>=start_date && bottom_date<=end_date){
                    start_index = mid;
                    end_index = mid;
                    found_start_date = true;
                    found_end_date = true;
                    found_start = true;
                    found_end = true;
                    break;
                }else if(bottom_date>start_date){
                    start_index=mid+1;
                    left = mid+1;
                }else if(top_date<end_date){
                    right = mid-1;
                    end_index = mid-1;
                }else{
                    left = mid+1;
                }
            }
        }
    }
    if(!found_end)
        end_index = mid;
    
    if(!found_start_date){
        left = start_index;
        right = end_index;
        document.getElementById("pages").text = "Finding date start index";
        while(left<=right){
            mid = (right+left)/2 >> 0;
            let mid_response = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
            let mid_table = parser.parseFromString(mid_response.data,'text/html').getElementsByTagName("tbody")[0];
            let top_date = new Date(mid_table.children[0].children[0].textContent);
            let bottom_date = new Date(mid_table.children[mid_table.children.length-1].children[0].textContent);
            if(top_date>=start_date && bottom_date<=end_date){
                start_index = mid;
                end_index = mid;
                found_start_date = true;
                found_end_date = true;
                break;
            }else if(bottom_date>start_date){
                start_index=mid+1;
                left = mid+1;
            }else if(top_date<end_date){
                right = mid-1;
                end_index = mid-1;
            }else if(bottom_date<=end_date && top_date<=start_date){
                for(var i=0;i<mid_table.children.length;i++)
                    if(mid_table.children[i].children[1].textContent === username)
                        indices.add(i);    
                end_index = mid-1;
                right = mid-1;
                found_end_date = true;
            }else if(top_date>=start_date && bottom_date>=end_date){
                for(var i=0;i<mid_table.children.length;i++)
                    if(mid_table.children[i].children[1].textContent === username)
                        indices.add(i);
                start_index = mid+1;
                found_start_date = true;
                break;
            }else{
                right = mid-1;
            }
        }
    }
    if(!found_start_date)
        start_index = mid;
    
    if(!found_end_date){
        left = start_index;
        right = end_index;
        document.getElementById("pages").textContent = "Finding date end index";
        while(left<=right){
            mid = (right+left)/2 >> 0;
            let mid_response = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${mid}/`);
            let mid_table = parser.parseFromString(mid_response.data,'text/html').getElementsByTagName("tbody")[0];
            let top_date = new Date(mid_table.children[0].children[0].textContent);
            let bottom_date = new Date(mid_table.children[mid_table.children.length-1].children[0].textContent);
            if(top_date>=start_date && bottom_date<=end_date){
                start_index = mid;
                end_index = mid;
                found_start_date = true;
                found_end_date = true;
                break;
            }else if(bottom_date>start_date){
                start_index=mid+1;
                left = mid+1;
            }else if(top_date<end_date){
                right = mid-1;
                end_index = mid-1;
            }else if(bottom_date<=end_date && top_date<=start_date){
                for(var i=0;i<mid_table.children.length;i++)
                    if(mid_table.children[i].children[1].textContent === username)
                        indices.add(i)
                end_index = mid-1;
                right = mid-1;
                found_end_date = true;
                break;
            }else if(top_date>=start_date && bottom_date>=end_date){
                left = mid+1;
            }else{
                left = mid+1;
            }
        }
    }
    document.getElementById("pages").textContent = "Collecting page indices";
    let finished = false;
    let counter = indices.size;
    for(var i=start_index;i<=end_index;i++){
        let response = await axios.get(`https://cses.fi/problemset/hack/${task_number}/list/21/${i}/`);
        let table = parser.parseFromString(response.data,'text/html').getElementsByTagName("tbody")[0];
        for(var j=0;j<table.children.length;j++){
            if(table.children[j].children[1].textContent === username){
                indices.add(i);
                counter+=1;
                if (counter==max_submissions){
                    finished = true;
                    break;
                }
            }
        }
        if(finished)break;
    }
    indices.forEach((value) => {
        console.log(value);
        chrome.tabs.create({ url: `https://cses.fi/problemset/hack/${task_number}/list/21/${value}/`});
    });
   document.getElementById("pages").textContent = "Done!";

});
