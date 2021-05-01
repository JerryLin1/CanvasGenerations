var tileSize = 10;

var cW;
var mCan;
var mCtx;
var cCan;
var cCtx;

var col;
var row;
var afps = 60;
var fps = 1;
var randDens = 0.50;
var useColor = true;

const gen = Object.freeze({
    none: 0,
    CaveCA: 1,
    binaryTree: 2,
})
var cgen = gen.none;

var inpCol;
var inpRow;
var inpSize
var inpGenType;
var inpFps;
var inpColour;

const smiley = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0]
];
var arr = smiley;
var clrs = [];

const colorBlank = "rgba(0, 0, 0, 0)"
const colorHistory = "rgba(2, 64, 150, 1)"
const colorStart = "rgba(252, 186, 3, 1)";
window.onload = function Init() {
    mCan = document.getElementById("mCan");
    mCtx = mCan.getContext("2d");
    cCan = document.getElementById("cCan");
    cCtx = cCan.getContext("2d");
    cW = document.getElementById("canWrapper");

    // Runs at 60fps (cannot be edited), but actual iterations per second can be adjusted (i still call fps)
    setTimeout(Update, 1000 / afps);
    setTimeout(IterateMethod, 1000 / fps);
    inpCol = document.getElementById("col");
    inpRow = document.getElementById("row")
    inpSize = document.getElementById("size")
    inpGenType = document.getElementById("genType");
    inpFps = document.getElementById("fps");
    inpColour = document.getElementById("colour");

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
            let t = arr[r][c];
            switch (t) {
                case 0:
                    break;
                case 1:
                    mCtx.fillStyle = "black";
                    if (cgen === gen.binaryTree && r === bar && c === bac) {
                        mCtx.fillStyle = "red";
                    }
                    mCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                    break;
            }
        }
    }
}
function DrawColors() {
    cCtx.clearRect(0, 0, cCan.width, cCan.height);
    for (let i = clrs.length - 1; i >= 0; i--) {
        let r = clrs[i].key[0];
        let c = clrs[i].key[1];
        let clr = clrs[i].value;
        if (r == 1 && c == 2) console.log(clr);

        cCtx.fillStyle = clr;
        cCtx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);

        // if history blue color fade it away
        if (ChangeTransparency(clr, 1) === colorHistory) {
            clr = DecreaseTransparency(clr)
            SetColor(r, c, clr);
            clrs.splice(i, 1)
            if (GetTransparency(clr) <= 0) {
                clrs.splice(i, 1);
            }
        }
    }
}

function Update() {
    //move draw behaviour to iterate
    RedrawAll();
    if (useColor) DrawColors();

    setTimeout(Update, 1000 / afps);
}
function StartMethod() {
    switch (cgen) {
        case gen.none:
            break;
        case gen.CaveCA:
            StartCaveCA();
            break;
        case gen.binaryTree:
            StartBinaryTree();
            break;
    }
}
function IterateMethod() {
    switch (cgen) {
        case gen.none:
            break;
        case gen.CaveCA:
            IterateCaveCA();
            break;
        case gen.binaryTree:
            IterateBinaryTree();
            break;
    }
    setTimeout(IterateMethod, 1000 / fps);
}
function StartCaveCA() {
    GenerateRandom();
}
function IterateCaveCA() {
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
            if (wCount > eCount) {
                arr[r][c] = 1;
            }
            else if (wCount < eCount) {
                arr[r][c] = 0;
            }
            else {

            }
        }
    }
}
var bar = 1;
var bac = 1;
function StartBinaryTree() {
    GenerateFilled();
    arr[1][1] = 0;
    bar = 1;
    bac = 1;
    SetColor(bar, bac, colorStart);
}
function IterateBinaryTree() {
    let n = new Array();
    if (IsPosValid(bar - 2, bac) && arr[bar - 2][bac] === 0) {
        n.push([bar - 1, bac]);
    }
    if (IsPosValid(bar, bac - 2) && arr[bar][bac - 2] === 0) {
        n.push([bar, bac - 1]);
    }
    if (n.length === 1) {
        arr[n[0][0]][n[0][1]] = 0;
        arr[bar][bac] = 0;

        SetColor(n[0][0], n[0][1], colorHistory);
        SetColor(bar, bac, colorHistory);
    }
    else if (n.length === 2) {
        let rand = GetRndInt(0, 2);
        arr[n[rand][0]][n[rand][1]] = 0;
        arr[bar][bac] = 0;

        SetColor(n[rand][0], n[rand][1], colorHistory);
        SetColor(bar, bac, colorHistory);
    }
    else {
        // nothing
    }
    bac += 2;
    if (bac > col - 1) {
        bar += 2;
        if (bar > row - 1) {
            SetColor(bar - 2, bac - 2, colorStart);
            cgen = gen.none;
        }
        bac = 1;
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
}
// normal UpdateOptions is called manually
function UpdateOptions() {
    tileSize = parseInt(inpSize.value);

    let tcols = col * tileSize;
    let trows = row * tileSize
    cW.style.width = tcols + "px";
    cW.style.height = trows + "px";
    mCan.width = tcols;
    mCan.height = trows;
    cCan.width = tcols;
    cCan.height = trows;

    fps = parseInt(inpFps.value);
    useColor = inpColour.checked;
}
function IsPosValid(j, k) {
    if (j >= 0 && j < row && k >= 0 && k < col) {
        return true;
    }
    else return false;
}
function UpdateGenOptions() {
    col = parseInt(inpCol.value);
    row = parseInt(inpRow.value);
    GetGenType();
}
function GetGenType() {
    let t = inpGenType.value;
    switch (t) {
        case "caveCA":
            cgen = gen.CaveCA;
            break;
        case "binaryTree":
            cgen = gen.binaryTree;
            break;
    }
}
function NewArr() {
    arr = Array.from(Array(row), _ => Array(col).fill(0));
    ResetArrC();
}
function ResetArrC() {
    clrs = [];
}
function SetColor(r, c, color) {
    clrs.push({
        key: [r, c],
        value: color
    });
}
function GetRndInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
function DecreaseTransparency(rgba) {
    let nt = GetTransparency(rgba) - 0.1;
    if (nt < 0) nt = 0;
    return ChangeTransparency(rgba, nt);
}
function GetTransparency(rgba) {
    return rgba.match(/[^,]+(?=\))/);
}
function ChangeTransparency(rgba, transparency) {
    return rgba.replace(/[^,]+(?=\))/, " " + transparency);
}