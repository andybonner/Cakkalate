window.onkeydown = function(e) {
  var keyID;
  switch (e.key) { // .key returns the "printed" character, so top-row and num pad digits are the same. In the html, the IDs of number buttons are the number in question. However, for clarity and because jQuery can't handle non-alphanumeric IDs, the operators and function buttons are given word IDs, assigned below.
    case "%":
      keyID = "percent";
      break;
    case ".":
      keyID = "dot";
      break;
    case "/":
      keyID = "divide";
      break;
    case "*":
      keyID = "multiply";
      break;
    case "-":
      keyID = "subtract";
      break;
    case "+":
      keyID = "add";
      break;
    default:
      keyID = e.key;
  }
  $("#" + keyID).click();
}

var valDone = true; //This, set to false, will translate to "we're in the middle of inputting a number here!"
var equationDone = true; //This, set to false, will translate to "we're in the middle of an equation here!"
var currentVal = 0;
var holdingVal = 0;
var currentOperator = "";

function operation(a, b) {
  if (currentOperator === "divide") {
    if (b === 0) { //throw error on divide by 0
      $("#display").html("E&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
      setTimeout(escape, 1500); //escape is the function activated by the "AC" key, defined below
    } else {
      return +(a / b).toFixed(10); //fixing the result to 10 decimal places (max display can accomodate) fixes peculiarities of 64-bit representation of floating point decimals. The leading "+" turns the string back into a number.
    }
  } else if (currentOperator === "multiply") {
    return +(a * b).toFixed(10);
  } else if (currentOperator === "subtract") {
    return +(a - b).toFixed(10);
  } else { //if the current operator "", meaning the start of an equation, we still want to add the currentVal to holdingVal
    return +(a + b).toFixed(10);
  }
}

// To emulate the action of a physical calculator, and to give some feedback on pressing an operator button for the first time (not changing the displayed number) I introduced this function  to momentarily hide and then show the text. Rather than use a .hide, .show, or add and remove a visibility or opacity class (I wanted to keep the element's bgcolor), I just made the text color match the background.
var blink = function() {
  $("#display").addClass("lime-text text-lighten-4");
  setTimeout("$('#display').removeClass('lime-text text-lighten-4');", 100);
}

// I want different actions depending on whether the display is FULL vs an equation returning an overflowing value
var displayFull = function() {
  // The decimal doesn't count in the "character count"
  if ($("#display").text().replace('.', '').length === 11) {
    return true;
  } else {
    return false;
  }
}

function checkOverflow() {
  if ($("#display").text().replace('.', '').length <= 11) {
    return;
  } else {
    // display "E" at the far left of the display, like early calculators
    $("#display").html("E&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    setTimeout(escape, 1500);
  }
}

var checkSpelling = function() {
  switch ($("#display").text()) {
    case "0.7734":
      Materialize.toast("Well hello to you to!", 4000);
      break;
    case "5318008":
      Materialize.toast("Seriously? Classy.", 4000);
      break;
    case "53045.3080": // http://hrwiki.org/wiki/Cakkalate
      Materialize.toast("\"Look! I can make mine say... oboe shoes!\"", 4000);
      break;
    default:
      return;
  }
}

$(".num").click(function() {
  // are we starting a number from scratch, or adding digits to one?
  if (valDone === true || $("#display").text() === "0") { //Why both? You could have just finished an operation, leaving a number on the screen, and be starting to input a new number, or you could be showing "0" from having backspaced. OR you could be a moron and trying to start your number by pressing 0 a bunch of times. Moron. Saw you comin.
    blink();
    $("#display").text(this.id);
  } else if (displayFull()) {
    blink(); // and do nuttin
  } else {
    blink();
    $("#display").append(this.id);
  }
  currentVal = Number($("#display").text());
  valDone = false;
  checkSpelling();
});

var escape = function() { //a named function, so the overflow error function can use it too
  currentVal = 0;
  holdingVal = 0;
  blink();
  $("#display").text(currentVal);
  valDone = true;
  equationDone = true;
}

$("#Escape").click(escape);

$("#Backspace").click(function() {
  currentVal = Number($("#display").text().slice(0, -1));
  blink();
  $("#display").text(currentVal);
  if (currentVal === 0) {
    valDone = true;
  }
});

$("#dot").click(function() {
  if (valDone === true) {
    blink();
    $("#display").text("0.");
  } else if (displayFull()) {
    blink();
  } else {
    currentVal = $("#display").text();
    currentVal += ".";
    blink();
    $("#display").text(currentVal);
  }
  valDone = false;
});

$(".operator").click(function() {
  if (equationDone === true) {
    var result = currentVal;
  } else {
    result = operation(holdingVal, currentVal);
  }
  currentVal = result;
  holdingVal = result;
  currentOperator = this.id;
  blink();
  $("#display").text(currentVal);
  checkOverflow();
  equationDone = false;
  valDone = true;
});

$("#Enter").click(function() {
  var result = operation(holdingVal, currentVal);
  currentVal = result;
  holdingVal = result;
  currentOperator = "";
  blink();
  $("#display").text(currentVal);
  checkOverflow();
  valDone = true;
  equationDone = true;
});

// What does the percent key DO anyway? see https://blogs.msdn.microsoft.com/oldnewthing/20080110-00/?p=23853
$("#percent").click(function() {
  var percentage = holdingVal * currentVal / 100;
  currentVal = percentage;
  blink();
  $("#display").text(currentVal);
  checkOverflow();
});