var dbfInfo,dbfCols;

document.addEventListener('DOMContentLoaded', (event) => {
    //header({nRecord:1000},[["ciao","C",10,0]]);
    document.body.addEventListener("keydown", (evt) => {
        //console.log("keydown:"+evt.key+"-"+evt.char+"-"+evt.charCode+"-"+evt.keyCode+"-"+evt.code)
        var scrollZone = document.getElementById("scrolling-zone");
        switch(evt.keyCode) {//(evt.key) {
            case 33://"PageUp":
                scrollZone.scrollTo({top:scrollZone.scrollTop-scrollZone.clientHeight});
                break;
            case 34://"PageDown":
                scrollZone.scrollTo({top:scrollZone.scrollTop+scrollZone.clientHeight});
                break;
            case 35://"End":
                if(evt.ctrlKey) {
                    scrollZone.scrollTo({top:scrollZone.scrollHeight});
                    askCurrentRows();
                } else
                scrollZone.scrollTo({left:scrollZone.scrollWidth});
                break;
            case 36: //"Home":
                if(evt.ctrlKey) {
                    scrollZone.scrollTo({top:0});
                    askCurrentRows();
                } else
                scrollZone.scrollTo({left:0});
                break;
            }
    });
    document.body.addEventListener("wheel", (evt) => {
        //console.log("whell:"+evt.deltaX+","+evt.deltaY+","+evt.deltaZ)
        if(evt.deltaX==0)
            evt.preventDefault()
        var scrollZone = document.getElementById("scrolling-zone");
        scrollZone.scrollTo({top:scrollZone.scrollTop+evt.deltaY});
    })
});

function header(info,data) {
    dbfInfo = info;
    dbfCols = data;
    var dest = document.getElementsByTagName("thead")[0].children;

    for(let i=0;i<2;i++) {
        var cell = document.createElement("th");
        cell.className = "noborder";
        cell.style.width = cell.style.maxWidth = cell.style.minWidth = (info.nRecord+"").length+"ch";
        dest[i].appendChild(cell);
    }

    for (let id = 0; id < data.length; id++) {
        /** @type {HTMLElement} */
        var cell = document.createElement("th");
        cell.textContent = data[id][0];
        cell.title = data[id][0];
        cell.style.width = cell.style.maxWidth = cell.style.minWidth = data[id][2]+"ch";
        cell.style.overflow = "hidden";
        switch(data[id][1]) {
            case "D":
                cell.style.width = cell.style.maxWidth = cell.style.minWidth = "10ch";
                break;
            case "T":
                cell.style.width = cell.style.maxWidth = cell.style.minWidth = "8ch";
                break;
            case "@":
                cell.style.width = cell.style.maxWidth = cell.style.minWidth = "22ch";
                break;
            }
        cell.onclick = changeOrder
        dest[0].appendChild(cell);
        var cell = document.createElement("td");
        var textBox = document.createElement("input");
        textBox.addEventListener("keyup",applyFilter);
        cell.appendChild(textBox);
        dest[1].appendChild(cell);
    }
    var h2 = document.getElementsByTagName("thead")[0].children[0].clientHeight;
    document.getElementById("empty-scroll").style.height = (h2*(dbfInfo.nRecord+2)).toFixed(0)+"px";
    document.getElementById("scrolling-zone").onscroll = askCurrentRows;
    window.onresize = askCurrentRows;
    askCurrentRows();
}

function setHeight(nRow) {
    var h2 = document.getElementsByTagName("thead")[0].children[0].clientHeight;
    //console.log(h2+":"+nRow+"=>"+document.getElementById("empty-scroll").style.height+" = "+(h2*(nRow+2)).toFixed(0)+"px")
    document.getElementById("empty-scroll").style.height = (h2*(nRow+2)).toFixed(0)+"px";
}

function askCurrentRows() {
    var body = document.getElementsByTagName("tbody")[0];
    body.innerHTML="";
    var h1 = /*screen.height*/document.body.clientHeight-16;
    var h2 = document.getElementsByTagName("thead")[0].children[0].clientHeight;
    var firstPos = Math.floor(document.getElementById("scrolling-zone").scrollTop / h2);
    var maxTop = ((dbfInfo.nRecord+3)*h2)-h1;
    //document.body.children[0].style.top=(Math.max(0,Math.min(maxTop,document.body.scrollTop))+8)+"px";
    getRows(firstPos+1,Math.floor(h1/h2)-2,h1,h2);

}

function onRow(idx,data) {
    var body = document.getElementsByTagName("tbody")[0];
    var dest = document.createElement("tr");
    //dest.id = "row"+idx;
    dest.className="empty";
    var cell = document.createElement("td");
    cell.textContent = idx+"";
    cell.style.textAlign = "right"
    dest.appendChild(cell);
    for (let id = 0; id < dbfCols.length; id++) {
        /** @type {HTMLElement} */
        var cell = document.createElement("td");
        cell.textContent = data[id];
        switch(dbfCols[id][1]) {
            case "C":
                cell.className = "cCol";
                break;
            case "N":
                cell.style.textAlign = "right"
                cell.className = "nCol";
                break;
            case "L":
                cell.className = "lCol";
                break;
            }
        dest.appendChild(cell);
    }
    body.appendChild(dest);
}

var updateOrderTimeout;
/**
 *
 * @param {MouseEvent} evt
 */
function changeOrder(evt) {
    /** @type{HTMLElement} */
    var element = evt.target;
    var index = Array.prototype.indexOf.call(element.parentNode.children, element);
    var sortOrder = "asc"
    if(element.classList.contains("sort-asc"))
        sortOrder = "desc"
    else if(element.classList.contains("sort-desc"))
        sortOrder = ""
    Array.prototype.forEach.call(element.parentNode.children, ele => {
        ele.classList.remove("sort-asc");
        ele.classList.remove("sort-desc");
    });

    if(sortOrder!="") {
        element.classList.add("sort-"+sortOrder);
    }
    clearTimeout(updateOrderTimeout);
    updateOrder();
}

/**
 *
 * @param {KeyboardEvent} evt
 */
function applyFilter(evt) {
    clearTimeout(updateOrderTimeout);
    updateOrderTimeout = setTimeout(updateOrder,100)
}

function updateOrder() {
    var dest = document.getElementsByTagName("thead")[0].children;
    var index = Array.prototype.findIndex.call(dest[0].children,
        (e)=> e.classList.contains("sort-dest") || e.classList.contains("sort-asc"));
    var sortOrder = ""
    if(index>=0) {
        var sortHeader = dest[0].children[index];
        if (sortHeader.classList.contains("sort-dest"))
            sortOrder = "desc"; else sortOrder = "asc";
    }
    var filters = [];
    for(let i=1;i<dest[1].children.length;++i) {
        /** @type {HTMLInputElement} */
        var txt = dest[1].children[i].children[0];
        filters.push( txt.value );
    }
    setOrder(index,sortOrder,filters);
    askCurrentRows();
}