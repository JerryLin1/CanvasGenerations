var tileSize = 10;
var c;
var ctx;
var col;
var row;
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

const smiley = [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0]
];
var arr = smiley;
var arrC;

const colorBlank = "rgba(0, 0, 0, 0)"
const colorHistory = "rgba(2, 64, 150, 1)"
const colorStart = "rgba(252, 186, 3, 1)";
window.onload = function Init() {
    c = document.getElementById("sCan");
    ctx = c.getContext("2d");
    setTimeout(Update, 1000 / 60);
    setTimeout(IterateMethod, 1000 / fps);
    inpCol = document.getElementById("col");
    inpRow = document.getElementById("row")
    inpSize = document.getElementById("size")
    inpGenType = document.getElementById("genType");
    inpFps = document.getElementById("fps");

    col = smiley.length;
    row = smiley[0].length;

    Draw();
}
function Generate() {
    GenerateOptions();
    UpdateOptions();
    StartMethod();
    Draw();
}
function Draw() {
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            let t = arr[r][c];
            switch (t) {
                case 0:
                    break;
                case 1:
                    ctx.fillStyle = "black";
                    if (cgen === gen.binaryTree && r === bar && c === bac) {
                        ctx.fillStyle = "red";
                    }
                    ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                    break;
            }
            if (arrC != null && useColor === true) {
                ctx.fillStyle = arrC[r][c];
                ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                // if history blue color fade it away
                if (ChangeTransparency(arrC[r][c], 1) === colorHistory) {
                    arrC[r][c] = DecreaseTransparency(arrC[r][c]);
                }
            }
        }
    }

}

function Update() {
    ctx.clearRect(0, 0, c.width, c.height);
    Draw();

    setTimeout(Update, 1000 / 60);
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
    arrC[bar][bac] = colorStart;
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

        arrC[n[0][0]][n[0][1]] = colorHistory
        arrC[bar][bac] = colorHistory;
    }
    else if (n.length === 2) {
        let rand = GetRndInt(0, 2);
        arr[n[rand][0]][n[rand][1]] = 0;
        arr[bar][bac] = 0;

        arrC[n[rand][0]][n[rand][1]] = colorHistory
        arrC[bar][bac] = colorHistory;
    }
    else {
        // nothing
    }
    bac += 2;
    if (bac > col - 1) {
        bar += 2;
        if (bar > row - 1) {
            arrC[bar - 2][bac - 2] = colorStart;
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
function UpdateOptions() {
    tileSize = parseInt(inpSize.value);

    c.width = col * tileSize;
    c.height = row * tileSize;

    fps = parseInt(inpFps.value);
}
function IsPosValid(j, k) {
    if (j >= 0 && j < row && k >= 0 && k < col) {
        return true;
    }
    else return false;
}
function GenerateOptions() {
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
    arrC = Array.from(Array(row), _ => Array(col).fill(colorBlank));
}
function ResetArrC() {
    arrC = Array.from(Array(row), _ => Array(col).fill(colorBlank));
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