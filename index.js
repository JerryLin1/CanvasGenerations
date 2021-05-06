// https://medium.com/analytics-vidhya/maze-generations-algorithms-and-visualizations-9f5e88a3ae37
// https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/
var tileSize = 10;

var cW;
var mCan;
var mCtx;
var cCan;
var cCtx;

var col;
var row;
var afps = 60;
var fps = 60;
var randDens = 0.50;
var useColor = true;
var showProcess = true;

const gen = Object.freeze({
    none: 0,
    CaveCA: 1,
    binaryTree: 2,
    dfs: 3,
    kruskals: 4
})

var cgen = gen.none;

var timer;
var timerStartValue;
var timerValue;

var inpCol;
var inpRow;
var inpSize
var inpGenType;
var inpFps;
var inpColour;
var inpShowProcess;

const smiley = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0]
];
var arr = smiley;
var clrs = {};

const clrBlank = "rgba(0, 0, 0, 0)"
const clrHistory = "rgba(2, 64, 150, 1)"
const clrHistoryFaded = "rgba(2, 64, 150, 0.5)";
const clrStart = "rgba(252, 186, 3, 1)";
const clrImp = "rgba(207, 0, 0, 1)";
window.onload = function Init() {
    mCan = document.getElementById("mCan");
    mCtx = mCan.getContext("2d");
    cCan = document.getElementById("cCan");
    cCtx = cCan.getContext("2d");
    cW = document.getElementById("canWrapper");

    timer = document.getElementById("timer");

    // Runs at 60fps (cannot be edited), but actual iterations per second can be adjusted (i still call fps)
    setTimeout(Update, 1000 / afps);
    setTimeout(IterateMethod, 1000 / fps);
    inpCol = document.getElementById("col");
    inpRow = document.getElementById("row")
    inpSize = document.getElementById("size")
    inpGenType = document.getElementById("genType");
    inpFps = document.getElementById("fps");
    inpColour = document.getElementById("colour");
    inpShowProcess = document.getElementById("process");

    col = smiley.length;
    row = smiley[0].length;

    RedrawAll();
}
function Generate() {
    UpdateGenOptions();
    UpdateOptions();
    StartMethod();
    RedrawAll();
}
function RedrawAll() {
    mCtx.clearRect(0, 0, mCan.width, mCan.height);
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            DrawTile(r, c);
        }
    }
}
function RedrawTile(r, c) {
    if (showProcess) {
        mCtx.clearRect(c * tileSize, r * tileSize, tileSize, tileSize);
        DrawTile(r, c);
    }
}
function DrawTile(r, c) {
    let t = arr[r][c];
    switch (t) {
        case 0:
            break;
        case 1:
            mCtx.fillStyle = "black";
            mCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            break;
        case 2:
            mCtx.fillStyle = clrStart;
            mCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
            break;
    }
}
function DrawColors() {
    if (useColor && showProcess) {
        cCtx.clearRect(0, 0, cCan.width, cCan.height);
        for (let [key, value] of Object.entries(clrs)) {
            let [r, c] = StringToArray(key);
            let clr = value;

            cCtx.fillStyle = clr;
            cCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);

            // if history blue color fade it away
            if (ChangeTransparency(clr, 1) === clrHistory) {
                clr = DecreaseTransparency(clr)
                SetColor(r, c, clr);
                if (GetTransparency(clr) <= 0) {
                    delete clrs[[r, c]];
                }
            }
        }
    }
}

function Update() {
    DrawColors();
    UpdateTimer();

    setTimeout(Update, 1000 / afps);
}
function StartMethod() {
    if (cgen != gen.none) cgen.Start();
    if (showProcess) RedrawAll();
    timerStartValue = new Date().getTime();
}
function IterateMethod() {
    if (cgen != gen.none) cgen.Iterate();
    if ((!showProcess && cgen != gen.none)) { IterateMethod(); }
    else {
        if (fps != 0)
            setTimeout(IterateMethod, 1000 / fps);
    }
}
function GetGenType() {
    let t = inpGenType.value;
    switch (t) {
        case "caveCA":
            cgen = CaveCA;
            break;
        case "binaryTree":
            cgen = BinaryTree;
            break;
        case "dfs":
            cgen = DFS;
            break;
        case "kruskals":
            cgen = Kruskals;
            break;
        case "prims":
            cgen = Prims;
            break;
    }
}
class Generations {
    static IsMaze = true;
    static Start() { }
    static Iterate() { }
}
class CaveCA extends Generations {
    static IsMaze = false;
    static Start() {
        GenerateRandom();
    }
    static Iterate() {
        var changeCount = 0;
        for (let r = 0; r < row; r++) {
            for (let c = 0; c < col; c++) {
                var wCount = 0;
                var eCount = 0;
                for (let j = r - 1; j <= r + 1; j++) {
                    for (let k = c - 1; k <= c + 1; k++) {
                        if (IsPosValid(j, k)) {
                            if (j != r || k != c) {
                                if (arr[j][k] === 1) wCount++;
                                else if (arr[j][k] === 0) eCount++;
                            }
                        }
                        else {
                            wCount++;
                        }
                    }
                }
                if (wCount > eCount && arr[r][c] != 1) {
                    arr[r][c] = 1;
                    changeCount++;
                    SetColor(r, c, clrHistoryFaded);
                }
                else if (wCount < eCount && arr[r][c] != 0) {
                    arr[r][c] = 0;
                    changeCount;
                    SetColor(r, c, clrHistoryFaded);
                }
                else {

                }
            }
        }
        if (changeCount === 0) {
            StopGen();
        }
        if (showProcess) RedrawAll();
    }
}
var bar = 1;
var bac = 1;
class BinaryTree extends Generations {
    static Start() {
        GenerateFilled();
        bar = 1;
        bac = 1;
        SetCell(bar, bac, 2);
    }
    static Iterate() {
        let n = new Array();
        if (IsPosValid(bar - 2, bac) && arr[bar - 2][bac] != 1) {
            n.push([bar - 1, bac]);
        }
        if (IsPosValid(bar, bac - 2) && arr[bar][bac - 2] != 1) {
            n.push([bar, bac - 1]);
        }
        if (n.length === 1) {
            arr[n[0][0]][n[0][1]] = 0;
            arr[bar][bac] = 0;

            RedrawTile(n[0][0], n[0][1]);
            RedrawTile(bar, bac);

            SetColor(n[0][0], n[0][1], clrHistory);
            SetColor(bar, bac, clrHistory);
        }
        else if (n.length === 2) {
            let rand = GetRndInt(0, 2);
            arr[n[rand][0]][n[rand][1]] = 0;
            arr[bar][bac] = 0;

            RedrawTile(n[rand][0], n[rand][1]);
            RedrawTile(bar, bac);

            SetColor(n[rand][0], n[rand][1], clrHistory);
            SetColor(bar, bac, clrHistory);
        }
        else {
            // nothing
        }
        bac += 2;
        if (bac > col - 1) {
            bar += 2;
            if (bar > row - 1) {
                SetCell(bar - 2, bac - 2, 2);
                StopGen();
                RedrawAll();
            }
            bac = 1;
        }
    }
}
var dfsStack = [];
var dfsVisited = [];
class DFS extends Generations {
    static Start() {
        dfsStack = [[1, 1]];
        dfsVisited = [];
        dfsVisited.push(dfsStack[0]);
        GenerateFilled();
        SetCell(dfsStack[0][0], dfsStack[0][1], 2);
    }
    static Iterate() {
        let cell = dfsStack.pop();
        let [r, c] = cell;
        if (r === row - 2 && c === col - 2) {
            SetCell(r, c, 2);
        }
        SetColor(r, c, clrHistory);
        let n = new Array();
        if (IsPosValid(r + 2, c) && !IsArrayInArray(dfsVisited, [r + 2, c])) {
            n.push([r + 2, c]);
        }
        if (IsPosValid(r - 2, c) && !IsArrayInArray(dfsVisited, [r - 2, c])) {
            n.push([r - 2, c]);
        }
        if (IsPosValid(r, c + 2) && !IsArrayInArray(dfsVisited, [r, c + 2])) {
            n.push([r, c + 2]);
        }
        if (IsPosValid(r, c - 2) && !IsArrayInArray(dfsVisited, [r, c - 2])) {
            n.push([r, c - 2]);
        }
        // Visit and connect all neighbour cells
        for (let i = 0; i < n.length; i++) {
            dfsVisited.push(n[i]);
            let ir = n[i][0];
            let ic = n[i][1];
            SetCell(ir, ic, 0);
            SetCell(ir + (r - ir) / 2, ic + (c - ic) / 2, 0);

            RedrawTile(ir, ic);
            RedrawTile(ir + (r - ir) / 2, ic + (c - ic) / 2);

            SetColor(ir, ic, clrHistory);
            SetColor(ir + (r - ir) / 2, ic + (c - ic) / 2, clrHistory);
        }
        // Push neighbour cells to stack randomly
        let ilength = n.length;
        for (let i = 0; i < ilength; i++) {
            let rand = GetRndInt(0, n.length);
            dfsStack.push(n[rand]);
            SetColor(n[rand][0], n[rand][1], clrImp)
            n.splice(rand, 1);
        }
        if (dfsStack.length === 0) {
            StopGen();
        }
    }
}
// Edges stores cell: id
// EdgesReverse stores id: cell(s), used for optimized connecting
// without having to iterate through all edges
var kruskalsEdges = {};
var kruskalsEdgesReverse = {};
var kruskalsIdCount;
class Kruskals extends Generations {
    static Start() {
        GenerateFilled();
        kruskalsEdges = {};
        let idPool = [];
        for (let i = 0; i < ((row - 1) / 2) * ((col - 1) / 2); i++) {
            idPool[i] = i;
        }
        kruskalsIdCount = idPool.length - 1;
        let count = 0;
        for (let r = 1; r < row; r += 2) {
            for (let c = 1; c < col; c += 2) {
                let rand = GetRndInt(0, idPool.length);
                kruskalsEdges[[r, c]] = count;
                kruskalsEdgesReverse[count] = [[r, c]];
                idPool.splice(rand, 1);
                count++;
            }
        }
    }
    static Iterate() {
        let t = GetRandomKey(kruskalsEdges);
        let r = parseInt(t[0]);
        let c = parseInt(t[1]);
        
        let edge = kruskalsEdges[[r, c]];
        let neighbourCells = new Array();
        if (IsPosValid(r + 2, c) && kruskalsEdges[[r + 2, c]] != edge) {
            neighbourCells.push([r + 2, c]);
        }
        if (IsPosValid(r - 2, c) && kruskalsEdges[[r - 2, c]] != edge) {
            neighbourCells.push([r - 2, c]);
        }
        if (IsPosValid(r, c + 2) && kruskalsEdges[[r, c + 2]] != edge) {
            neighbourCells.push([r, c + 2]);
        }
        if (IsPosValid(r, c - 2) && kruskalsEdges[[r, c - 2]] != edge) {
            neighbourCells.push([r, c - 2]);
        }
        if (neighbourCells.length > 0) {
            let rand = GetRndInt(0, neighbourCells.length);
            let ir = neighbourCells[rand][0];
            let ic = neighbourCells[rand][1];

            SetCell(r, c, 0);
            SetCell(ir, ic, 0);
            SetCell(ir + (r - ir) / 2, ic + (c - ic) / 2, 0);

            RedrawTile(r, c);
            RedrawTile(ir, ic);
            RedrawTile(ir + (r - ir) / 2, ic + (c - ic) / 2);

            SetColor(r, c, clrHistory);
            SetColor(ir, ic, clrHistory);
            SetColor(ir + (r - ir) / 2, ic + (c - ic) / 2, clrHistory);

            let idOld = kruskalsEdges[[ir, ic]];
            let idNew = kruskalsEdges[[r, c]];
            for (let cell = 0; cell < kruskalsEdgesReverse[idOld].length; cell++) {
                kruskalsEdges[kruskalsEdgesReverse[idOld][cell]] = idNew;
            }
            kruskalsEdgesReverse[idNew] = kruskalsEdgesReverse[idNew].concat(kruskalsEdgesReverse[idOld]);
            delete kruskalsEdgesReverse[idOld]

            kruskalsIdCount--;
            if (kruskalsIdCount <= 0) {
                StopGen();
            }
        }
        else {
            this.Iterate();
        }
    }
}
var primsCells = [];
var primsUC = [];
class Prims extends Generations {
    static Start() {
        GenerateFilled();
        primsCells = [];
        primsUC = [];
        for (let r = 1; r < row; r++) {
            for (let c = 1; c < col; c++) {
                primsCells.push([r, c]);
            }
        }
        SetCell(1, 1, 0);
        primsUC.push([1, 3]);
        primsUC.push([3, 1]);
        SetColor(1, 3, clrImp);
        SetColor(3, 1, clrImp);
    }
    static Iterate() {
        if (primsUC.length > 0) {
            let rand = GetRndInt(0, primsUC.length);
            let [r, c] = primsUC[rand];
            primsUC.splice(rand, 1);
            // FOR SOME REASON arr[r][c] IS A NONWALLED TILE??? WTF
            if (arr[r][c] === 1) {

                delete clrs[[r, c]];

                // Loop through adjacent not-walled areas to connect to
                let possibleConnect = [];
                if (IsPosValid(r + 2, c) && arr[r + 2][c] != 1) {
                    possibleConnect.push([r + 2, c]);
                }
                if (IsPosValid(r - 2, c) && arr[r - 2][c] != 1) {
                    possibleConnect.push([r - 2, c]);
                }
                if (IsPosValid(r, c + 2) && arr[r][c + 2] != 1) {
                    possibleConnect.push([r, c + 2]);
                }
                if (IsPosValid(r, c - 2) && arr[r][c - 2] != 1) {
                    possibleConnect.push([r, c - 2]);
                }

                if (possibleConnect.length > 0) {
                    let randC = GetRndInt(0, possibleConnect.length);
                    let [ir, ic] = possibleConnect[randC];

                    SetCell(r, c, 0);
                    SetCell(ir, ic, 0);
                    SetCell(ir + (r - ir) / 2, ic + (c - ic) / 2, 0);

                    RedrawTile(r, c);
                    RedrawTile(ir, ic);
                    RedrawTile(ir + (r - ir) / 2, ic + (c - ic) / 2);

                    SetColor(r, c, clrHistory);
                    SetColor(ir, ic, clrHistory);
                    SetColor(ir + (r - ir) / 2, ic + (c - ic) / 2, clrHistory);

                    let pushToUc = [];
                    if (IsPosValid(r + 2, c) && arr[r + 2][c] === 1) {
                        pushToUc.push([r + 2, c]);
                    }
                    if (IsPosValid(r - 2, c) && arr[r - 2][c] === 1) {
                        pushToUc.push([r - 2, c]);
                    }
                    if (IsPosValid(r, c + 2) && arr[r][c + 2] === 1) {
                        pushToUc.push([r, c + 2]);
                    }
                    if (IsPosValid(r, c - 2) && arr[r][c - 2] === 1) {
                        pushToUc.push([r, c - 2]);
                    }
                    for (let p = 0; p < pushToUc.length; p++) {
                        primsUC.push(pushToUc[p]);
                        SetColor(pushToUc[p][0], pushToUc[p][1], clrImp);
                    }
                }
            }
            else this.Iterate();
        }
        else {
            cgen = gen.none;
        }
    }
}

function GenerateRandom() {
    NewArr();
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            if (Math.random() <= randDens) {
                arr[r][c] = 1;
            }
        }
    }
}
function GenerateFilled() {
    NewArr();
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            arr[r][c] = 1;
        }
    }
}
function GenerateEmpty() {
    NewArr();
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            arr[r][c] = 0;
        }
    }
}

// Autoupdate is called when options are changed.. pre cringe imo
function AutoUpdateOptions() {
    // this if statement prevents it from instantly changing at beginning
    if (arr != smiley) {
        UpdateOptions();
    }
    RedrawAll();
}
// normal UpdateOptions is called manually
function UpdateOptions() {
    tileSize = parseInt(inpSize.value);

    let w = col * tileSize;
    let h = row * tileSize
    cW.style.width = w + "px";
    cW.style.height = h + "px";
    mCan.width = w;
    mCan.height = h;
    cCan.width = w;
    cCan.height = h;

    fps = parseInt(inpFps.value);
    useColor = inpColour.checked;
    showProcess = inpShowProcess.checked;
}
function IsPosValid(j, k) {
    if (j >= 0 && j < row && k >= 0 && k < col) {
        return true;
    }
    else return false;
}
function UpdateGenOptions() {
    GetGenType();
    col = parseInt(inpCol.value);
    row = parseInt(inpRow.value);

    // Mazes should have odd number of columns and rows
    if (cgen.IsMaze === true) {
        if (col % 2 === 0) col++;
        if (row % 2 === 0) row++
    }
}
function UpdateTimer() {
    if (cgen != gen.none) {
        timer.innerHTML = "Time Elapsed: " + ((new Date().getTime() - timerStartValue) / 1000) + "s";
    }
}
function StopGen() {
    RedrawAll();
    UpdateTimer();
    cgen = gen.none;
}
function NewArr() {
    arr = Array.from(Array(row), _ => Array(col).fill(0));
    ResetArrC();
}
function ResetArrC() {
    clrs = {};
}
function SetCell(r, c, int) {
    arr[r][c] = int;
}
function SetColor(r, c, color) {
    if (useColor && showProcess) clrs[[r, c]] = color;
}
function StringToArray(pair) {
    return pair.split(",");
}
function GetRndInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
function DecreaseTransparency(rgba) {
    let nt = GetTransparency(rgba) - 0.05;
    if (nt < 0) nt = 0;
    return ChangeTransparency(rgba, nt);
}
function GetTransparency(rgba) {
    return rgba.match(/[^,]+(?=\))/);
}
function ChangeTransparency(rgba, transparency) {
    return rgba.replace(/[^,]+(?=\))/, " " + transparency);
}

// modified from //https://stackoverflow.com/a/41661388/8280780
function IsArrayInArray(arr, item) {
    var item_as_string = JSON.stringify(item);

    var contains = arr.some(function (ele) {
        return JSON.stringify(ele) === item_as_string;
    });
    return contains;
}

function GetRandomKey(obj) {
    var keys = Object.keys(obj);
    return StringToArray(keys[GetRndInt(0, keys.length)]);
};