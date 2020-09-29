var dbfInfo,dbfCols;

document.addEventListener('DOMContentLoaded', (event) => {
});

function header(info,data) {
    dbfInfo = info;
    dbfCols = data;
    var dest = document.getElementsByTagName("thead");
    dest = dest[0].children[0];

    var cell = document.createElement("th");
    cell.className = "noborder";
    dest.appendChild(cell);

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
        dest.appendChild(cell);
    }
    var h2 = document.getElementsByTagName("thead")[0].children[0].clientHeight;;
    document.getElementById("empty-scroll").style.height = (h2*(dbfInfo.nRecord+2)).toFixed(0)+"px";
    document.body.onscroll = askCurrentRows;
    window.onresize = askCurrentRows;
    askCurrentRows();
}

function askCurrentRows() {
    var body = document.getElementsByTagName("tbody")[0];
    body.innerHTML="";
    var h1 = /*screen.height*/document.getElementsByTagName("body")[0].clientHeight;
    var h2 = document.getElementsByTagName("thead")[0].children[0].clientHeight;
    var firstPos = Math.floor(document.body.scrollTop / h2);
    var maxTop = ((dbfInfo.nRecord+3)*h2)-h1;
    document.body.children[0].style.top=Math.max(0,Math.min(maxTop,document.body.scrollTop))+"px";
    getRows(firstPos+1,Math.floor(h1/h2),h1,h2);

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
        setOrder(index);
    } else
        setOrder(-1);
    askCurrentRows();
}
