var dbfCols;

function header(data) {
    dbfCols = data;
    var dest = document.getElementsByTagName("thead");
    dest = dest[0].children[0];

    var cell = document.createElement("th");
    cell.className = "noborder";
    dest.appendChild(cell);

    for (let id = 0; id < data.length; id++) {
        /** @type {HTMLElement} */
        var cell = document.createElement("th");
        cell.textContent = data[id].name;
        cell.title = data[id].name;
        cell.style.width = cell.style.maxWidth = cell.style.minWidth = data[id].len+"ch";
        cell.style.overflow = "hidden";
        switch(data[id].type) {
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
        dest.appendChild(cell);
    }
    var body = document.getElementsByTagName("tbody")[0];
    body.innerHTML="";
    var h1 = /*screen.height*/document.getElementsByTagName("body")[0].clientHeight;
    var h2 = document.getElementsByTagName("thead")[0].children[0].clientHeight;
    getRows(1,Math.floor(h1/h2)-1,h1,h2);
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
        switch(dbfCols[id].type) {
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

