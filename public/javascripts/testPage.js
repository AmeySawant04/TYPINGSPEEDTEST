const bttn = document.querySelector("#test-click");
const inputArea = document.querySelector("#input-field");
const paragraphBox = document.querySelector("#paragraph-box");
const startBttn = document.querySelector("#start-bttn");
const wpm_container = document.querySelector("#wpm_con");
const time_container = document.querySelector("#time_con");
const accuracy_container = document.querySelector("#acc_con");
const testlength = document.querySelector("#length");
const go = document.querySelector("#go");
const wait = document.querySelector("#wait");

let index_no = 0;
let mainArray = [];
let spanArray = [];
let modArray = [];
let typedChar;
let r_time = 0;
let curr_input = "";
let middle_char = 30;
let scroll_amnt = 10;
let curr_input_array = [];
let latest_arr_count = 0;

let char_typedCount = 0;
let char_typedWrong = 0;
let char_typedCorrect = 0;

let timer;
let count = 0;
let array_count = 0;

let typedChar_arr = [];
let charCheckWrong = false;

// const words = [
//     "JavaScript is the only language that I'm aware of that people feel they don't need to learn before they start using it.",
//     "Be humble, communicate clearly, and respect others. It costs nothing to be kind, but the impact is priceless.",
//     "If people do not believe that mathematics is simple, it is only because they do not realize how complicated life is.",
//     "I make mistakes because I'm always operating at my limit. If I only stay in comfortable territory all the time, that's not so much fun.",
//     "If you learn how to solve problems, you can go through life and do pretty well.",
//     "To be successful, you want to surround yourself with very talented folks whose skills blend very well. That's the secret of success.",
//     "Good judgement comes from experience. Experience comes from bad judgement."
// ]
words = [];

async function initializeWords() {
  try {
    const response = await fetch("/testsentences/" + testlength.value);
    if (!response.ok) {
      throw new Error("API request failed");
    }
    words = await response.json(); // Wait for data before assigning
    console.log(words); // Debugging: Check if words is populated
  } catch (error) {
    console.error(error);
  }
}

async function again() {
  wait.classList.toggle("hidden"); //display wait
  resetVal();
  inputArea.focus();
  startBttn.innerHTML = "Again";

  await initializeWords(); // Wait until words are fetched
  if (words.length > 0) {
    init(); // Call init() only when words is populated
    check();
    time_counter();
  } else {
    console.error("Error: Words array is still empty.");
  }
}

function resetVal() {
  paragraphBox.scrollLeft = 0;
  clearInterval(timer);
  inputArea.value = "";
  latest_arr_count = 0;
  time_container.innerText = "0";
  wpm_container.innerText = "";
  accuracy_container.innerText = "";
  char_typedWrong = 0;
  count = 0;
  charCheckWrong = false;
  array_count = 0;
  typedChar_arr = [];
}

function focus_now() {
  inputArea.focus();
}

function start() {
  startBttn.innerHTML = "Start";
  inputArea.value = "";
  resetVal();
  paragraphBox.innerHTML = "Press Start button to begin......";
}

function randomWords() {
  return Math.floor(Math.random() * words.length);
}

function init() {
  wait.classList.toggle("hidden"); //remove wait msg
  go.classList.toggle("hidden"); //display ready to go
  paragraphBox.innerHTML = "";
  words[randomWords()].split("").forEach((ch) => {
    const span_char = document.createElement("span");
    span_char.innerText = ch;
    paragraphBox.appendChild(span_char);
    // array_count += 1
  });
}

function changeSpace(s) {
  if (s == " ") {
    s = "&nbsp;";
  }
  return s;
}

function create_Array() {
  curr_input = inputArea.value;
  curr_input_array = curr_input.split("").map(changeSpace);

  spanArray = paragraphBox.querySelectorAll("span");
  spanArray.forEach((e) => {
    if (e.innerHTML == " ") {
      e.innerHTML = "&nbsp;";
    }
  });
}

let index_char = -1;
function check() {
  create_Array();

  let s = [];
  spanArray.forEach((e) => {
    s.push(e.innerHTML);
  });

  spanArray[0].classList.add("cursor-highlight");

  spanArray.forEach((char, index) => {
    typedChar = curr_input_array[index];

    // Cheking if latest char is the same with the text
    if (typedChar == null) {
      //If the test have not yet started
      char.classList.remove("wrong");
      char.classList.remove("correct");
    } else if (typedChar == char.innerHTML) {
      //If the char typed match
      char.classList.remove("wrong");
      char.classList.add("correct");
      charCheckWrong = false;
      // typedChar_arr[index_char] = 1
    } else if (typedChar != char.innerHTML) {
      //If the char do not match
      char.classList.remove("correct");
      char.classList.add("wrong");
      charCheckWrong = true;
      // typedChar_arr[index_char] = 0
    }

    // Highlighting the wrong and cursor-highlight
    if (index == curr_input_array.length) {
      if (char === " ") char.classList.add("space-wrong");
      char.classList.add("cursor-highlight");
    } else char.classList.remove("cursor-highlight");

    if (curr_input_array.length == spanArray.length) {
      if (timer) {
        clearInterval(timer);
        timer = null; // ✅ Stop further calls

        char_typedWrong = determine_wrong_counts();

        console.log(char_typedWrong, "= wrong counts");
        let calculated_wpm = calculate_wpm();
        let calculated_acc = calculate_acc();

        startBttn.focus();
        go.classList.toggle("hidden");

        // ✅ Ensure correct data before sending
        if (!isNaN(calculated_wpm) && !isNaN(calculated_acc)) {
          newTest(calculated_wpm, calculated_acc);
        } else {
          console.error("Invalid WPM or ACC:", calculated_wpm, calculated_acc);
        }
      }
    }
  });

  typedChar_arr.push(charCheckWrong);
}

function calculate_acc() {
  let acc = Math.round(
    ((spanArray.length - char_typedWrong) / spanArray.length) * 100
  );
  accuracy_container.innerText = acc + "%";
  return acc;
}

function time_counter() {
  timer = setInterval(() => {
    count++;
    time_container.innerText = count;
  }, 1002);
}

function calculate_wpm() {
  let wpm_score = Math.round(spanArray.length / 5 / (count / 60));
  wpm_container.innerText = wpm_score;
  return wpm_score;
}

function determine_wrong_counts() {
  let typedWrong = 0;
  for (let i = 0; i < typedChar_arr.length; i++) {
    if (typedChar_arr[i] == true) {
      typedWrong += 1;
    }
  }
  return typedWrong;
}

function ignored_Key(e_key) {
  const ignore_keys = {
    Shift: 0,
    Alt: 0,
    Control: 0,
  };
  return ignore_keys[e_key] ?? -1;
}

let scroll_actual_val = 0;
inputArea.addEventListener(
  "keydown",
  (e) => {
    let name = e.key;
    if (name == "Backspace") {
      if (curr_input_array.length > spanArray.length * 0.9) {
        paragraphBox.scrollLeft -= 0;
      } else {
        paragraphBox.scrollLeft -= spanArray.length / 10;
      }
    } else if (ignored_Key(name) == 0) paragraphBox.scrollLeft += 0;
    else if (name == "ArrowLeft")
      paragraphBox.scrollLeft -= spanArray.length / 10;
    else {
      // scroll_left_val += spanArray.length / 10
      paragraphBox.scrollLeft += spanArray.length / 10;
      scroll_actual_val += spanArray.length / 10;
    }
  },
  false
);

function newTest(calculated_wpm, calculated_acc) {

  if (!user) {
    console.log("User is not logged in. Test data will not be saved.");
    return;
}

  test = {
    wpm: calculated_wpm,
    acc: calculated_acc,
  };

  console.log("Sending test data:", test); // Debugging log before sending

  fetch("/newtest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Send JSON data
    },
    body: JSON.stringify(test), // Convert JS object to JSON string
  })
    .then((response) => response.json())
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}

start();
