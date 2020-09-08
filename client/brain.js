wakeUpServer();

let tmr;
let tries = 0;
// let serverUrlStart = "http://localhost:3000/fetch";
let serverUrlStart = "https://sourcefetch-server.glitch.me/fetch";
let code = "";
let spd = 50;

$(".copyBtn").hide(spd);
$("#snippet").hide(spd);
$("#language")
  .hide(spd)
  .mouseover(function () {
    $(this).focus();
  });
$("#words")
  .focus()
  .mouseover(function () {
    $(this).focus();
  });

function wakeUpServer() {
  fetch("https://sourcefetch-server.glitch.me");
}

function triggerFetch() {
  clearTimeout(tmr);
  $("#code").text("...");
  $("#language").css("visibility", "visible");
  $("#language").show(spd);
  $("#feedback").css("visibility", "visible");
  $("#feedback").show(spd);
  tmr = setTimeout(function () {
    fetchCode();
  }, 1000);
}

function userWantsAnswerNow(event, kd) {
  if (event.keyCode == 13) {
    // key code for "enter"
    clearTimeout(tmr);
    fetchCode();
  }
}

function fetchCode() {
  $(".copyBtn").hide(spd);
  $("#snippet").hide(spd);
  let words = $("#words").val();
  if (words === "") return;
  let lang = $("#language").val();
  let url = serverUrlStart + "/?" + "q=" + words + "&lang=" + lang;
  msgWaitForAPIServer();
  $.getJSON(url, function (response) {
    if (response.code) {
      // document.getElementById("snippet").innerHTML = response.code;
      clearCodeSnippet();
      replaceNewLines(response.code);
      $("#wait").text("");
      $(".copyBtn").css("visibility", "visible");
      $("#snippet").css("visibility", "visible");
      $(".copyBtn").show(spd);
      $("#snippet").show(spd);
    } else {
      msgNoSnippetFound();
    }

    var urlElements = Array.from(document.getElementsByClassName("url"));
    if (response.url) {
      urlElements.forEach(function (item) {
        item.setAttribute("data-url", response.url);
      });
    } else {
      var query = words + " in " + lang + " site:stackoverflow.com";
      urlElements.forEach(function (item) {
        item.setAttribute(
          "data-url",
          "https://www.google.com/search?q=" + query
        );
      });
    }
  });
}

function replaceNewLines(codeString) {
  code = codeString;
  let splitCode = codeString.split("\n");
  let newElem;
  let newText;
  let addTo = document.getElementById("snippet");
  // loop through lines of code
  splitCode.forEach(function (line) {
    newElem = document.createElement("p");
    newText = document.createTextNode(line);
    newElem.appendChild(newText);
    addTo.appendChild(newElem);
  });
}

function clearCodeSnippet() {
  code = "";
  var myNode = document.getElementById("snippet");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
}

function copyCodeToClipboard() {
  try {
    // create temp input element
    var $temp = $("<input>");
    $("body").append($temp);
    // put value of desired text into temp input element, and select the input
    $temp.val($("#snippet").text()).select();
    // copy the value
    document.execCommand("copy");
    // remove that temp input element
    $temp.remove();
  } catch (err) {
    // otherwise try to save code to a file
    saveCode();
  }
}

function saveCode() {
  try {
    var searchString = cleanupString($("#words").val());
    var filename = searchString + ".txt";
    var temporaryElem = document.createElement("a");
    temporaryElem.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(code)
    );
    temporaryElem.setAttribute("download", filename);
    if (document.createEvent) {
      var event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      temporaryElem.dispatchEvent(event);
    } else {
      temporaryElem.click();
    }
  } catch (err) {
    // if the previous code returns an error or isn't supported, try using this instead:
    var content = fullOutputString;
    window.open("data:text/txt;charset=utf-8," + escape(content), "newdoc");
  }
}

function cleanupString(name) {
  return name.replace(" ", "_").replace(/[.,;:'"\/\\<>?!]/g, "");
}

function goToUrl(url) {
  window.open(url);
}

function msgWaitForAPIServer() {
  let choice = getRandomInt(1, 4);
  let msg = "";
  switch (choice) {
    case 1:
      msg = "The API server awakens...";
      break;
    case 2:
      msg = "Firing up the API server...";
      break;
    case 3:
      msg = "Just a sec. Calling API server...";
      break;
    default:
      msg = "Please wait while I wake up the API server...";
  }
  $("#wait").text(msg);
}

function msgNoSnippetFound() {
  let choice = getRandomInt(1, 2);
  let msg = "";
  switch (choice) {
    case 1:
      msg = "Sorry, nothing found.";
      break;
    case 2:
      msg = "Sorry, no result found.";
      break;
    default:
      msg = "Sorry, I couldn't find an example code snippet for that.";
  }
  $("#wait").text(msg);
}

function getRandomInt(min, max) {
  // inclusive min/max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
