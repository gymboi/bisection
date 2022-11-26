$(document).ready(function () {
    let header = $('#header');
    let buttonWrapper = $('#button-wrapper');
    let menuButton = $('#hamburger');
    let discussionButton = $('#discussion');
    let exampleButton = $('#example');
    let aboutButton = $('#about');

    menuButton.on('click', () => {
        header.toggleClass('open');
        buttonWrapper.toggleClass('open');
    });

    let tableHeaders = ['i', 'x<sub>l</sub>', 'x<sub>u</sub>', 'f(x<sub>l</sub>)', 'f(x<sub>u</sub>)', 'x<sub>r</sub>', 'f(x<sub>r</sub>)', 'ε<sub>a</sub>'];
    let results = $("#results");

    let hr = $('<tr></tr>');
    tableHeaders.forEach(e => {
        hr.append($(`<th>${e}</th>`));
    });
    results.append(hr);

    // Function code
    let functionText = $("#function");
    let formula = "";
    functionText.on('input', (ev) => {
        formula = (ev.target.getValue());
    });

    const ce = new ComputeEngine.ComputeEngine();
    ce.numericMode = 'machine';

    MathLive.renderMathInDocument();

    let calculate = $("#calculate");

    calculate.on("click", () => {
        results.empty();
        hr = $('<tr></tr>');
        tableHeaders.forEach(e => {
            hr.append($(`<th>${e}</th>`));
        });
        results.append(hr);

        let iterations = [];
        console.log(iterations);
        let repetitions = $("#repetitions").val();
        console.log(repetitions);
        iterations = bisectionMethod(ce, formula, $("#xl").val(), $("#xu").val(), repetitions);

        //clears iterations-wrapper content
        let clearIteration = document.querySelector(".iterations-wrapper");
        clearIteration.innerHTML = "";

        //add iterations-wrapper content
        let iterationsWrapper = $(".iterations-wrapper");

        let iterationDiv = $('<div class="iteration"></div>');
        iterationsWrapper.append($('<span class="solution-title">Solution</span>'));
        for (let i = 0; i < repetitions; i++) {
            // iterations.push([i + 2, xl, xu, fxl, fxu, xr, fxr, ea]);
            let xl = iterations[i][1];
            let xu = iterations[i][2];
            let fxl = iterations[i][3];
            let fxu = iterations[i][4];
            let xr = iterations[i][5];
            let fxr = iterations[i][6];
            let ea = iterations[i][7];

            iterationDiv.append($(`<h3 class="iteration-header">Iteration ${i + 1}:</h3>`));
            let iterationContent = $('<p class="iteration-content"></p>');

            iterationContent.append($(`<span><strong>Step 1:</strong> x<sub>l</sub> = ${xl}, x<sub>u</sub> = ${xu}</span>`))
            iterationContent.append($(`<br><span><strong>Step 2:</strong> Determine the estimate of the root using the formula: x<sub>r</sub> = (x<sub>l</sub> + x<sub>u</sub>)/2
                <br><strong>x<sub>r</sub> =</strong> (${xl} + ${xu})/2
                <br><strong>x<sub>r</sub></strong> = ${xr}</span>`))

            if (fxl * fxr < 0) {
                iterationContent.append($(`<br><span><strong>Step 3:</strong> The root lies in the lower subinterval. Therefore, x<sub>u</sub> = x<sub>r</sub>.
                    <br><strong>x<sub>u</sub></strong> = ${xr}</span>`));
            }
            else if (fxl * fxr > 0) {
                iterationContent.append($(`<br><span><strong>Step 3:</strong> The root lies in the upper subinterval. Therefore, x<sub>l</sub> = x<sub>r</sub>.
                    <br><strong>x<sub>l</sub></strong> = ${xr}</span>`));
            }
            else if (fxl * fxr == 0) {
                iterationContent.append($(`<br><span><strong>Step 3:</strong> The root is ${xr}.</span>`));
            }

            let tr = $('<tr class="table-data"></tr>');
            iterations[i].forEach(e => {
                // Table
                let th = $(`<td>${e}</td>`);
                tr.append(th);

                // Steps

            });
            iterationContent.append(`<br><br>`);
            iterationDiv.append(iterationContent);
            iterationsWrapper.append(iterationDiv);
            results.append(tr);
        }
        console.log(iterations);
    });
});

// xli = initial lower bound, xui = initial upper bound
function bisectionMethod(ce, formula, xli, xui, repetitions) {
    let iterations = [];

    // Clear table data
    $(`.table-data`).empty();

    let xl = parseFloat(xli);
    let xu = parseFloat(xui);

    console.log(formula);
    let fn = ce.parse(formula);
    fn = fn.subs({ x: ce.box(xl) });
    let fxl = fn.N().machineValue;
    fxl = parseFloat(fxl.toFixed(6));

    fn = ce.parse(formula);
    fn = fn.subs({ x: ce.box(xu) });
    let fxu = fn.N().machineValue;
    fxu = parseFloat(fxu.toFixed(6));

    let xr = (xl + xu) / 2;
    xr = parseFloat(xr.toFixed(6));

    fn = ce.parse(formula);
    fn = fn.subs({ x: ce.box(xr) });
    let fxr = fn.N().machineValue;
    fxr = parseFloat(fxr.toFixed(6));

    let ea = "100%";

    iterations = [[1, xl, xu, fxl, fxu, xr, fxr, ea]];
    for (let i = 0; i < repetitions; i++) {
        if (fxl * fxr < 0) xu = xr;
        else if (fxl * fxr > 0) xl = xr;
        else if (fxl * fxr == 0) {
            break;
        };

        fn = ce.parse(formula);
        fn = fn.subs({ x: ce.box(xl) });
        fxl = fn.N().machineValue;
        fxl = parseFloat(fxl.toFixed(6));

        fn = ce.parse(formula);
        fn = fn.subs({ x: ce.box(xu) });
        fxu = fn.N().machineValue;
        fxu = parseFloat(fxu.toFixed(6));

        // xr old
        let xro = xr;

        xr = (xl + xu) / 2;
        xr = parseFloat(xr.toFixed(6));

        fn = ce.parse(formula);
        fn = fn.subs({ x: ce.box(xr) });
        fxr = fn.N().machineValue;
        fxr = parseFloat(fxr.toFixed(6));

        ea = calculateApproximateError(xr, xro);

        iterations.push([i + 2, xl, xu, fxl, fxu, xr, fxr, ea]);
    }

    return iterations;
}

// xr = approximate root, xro = old approximate root
function calculateApproximateError(xr, xro) {
    let e = Math.abs((xr - xro) / xr) * 100;
    e = parseFloat(e.toFixed(4)) + "%";
    return e;
}

var modal = document.getElementById("modal-wrapper");
var discussionBtn = document.getElementById("discussion");
var closeBtn = document.getElementsByClassName("close")[0];


discussionBtn.onclick = function() {
  modal.style.display = "block";
}

closeBtn.onclick = function() {
  modal.style.display = "none";
}
// prevents modal bar from closing when clicking outside the div box
$('#modal-wrapper').modal({
    backdrop: 'static',
    keyboard: false
});

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}