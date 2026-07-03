

const toolButtons = document.querySelectorAll(".tool-btn");
const toolPanels = document.querySelectorAll(".tool-panel");

toolButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedTool = button.getAttribute("data-tool");

    // Hide every tool panel, then reveal only the one we want.
    toolPanels.forEach(function (panel) {
      panel.classList.add("hidden");
    });
    document.getElementById(selectedTool + "Tool").classList.remove("hidden");

    // Update which tab button looks "active".
    toolButtons.forEach(function (btn) {
      btn.classList.remove("active-tool");
    });
    button.classList.add("active-tool");
  });
});


/* ===========================================================
   2. CALCULATOR (Basic + Scientific)
   =========================================================== */

// ----- 2a. State -----
let currentInput = "0";        // the number currently shown on screen
let previousInput = "";        // the first number in a calculation (the "12" in 12 + 5)
let operator = null;           // the active operation: +, -, ×, ÷ or ^
let shouldResetScreen = false; // true = the next number typed should start fresh
let isDegreeMode = true;       // true = angles in degrees, false = radians

// ----- 2b. Elements -----
const mainDisplay = document.getElementById("mainDisplay");
const expressionText = document.getElementById("expressionText");

const numberButtons = document.querySelectorAll(".num-btn");
const operatorButtons = document.querySelectorAll(".op-btn");
const functionButtons = document.querySelectorAll(".func-btn");

const clearBtn = document.getElementById("clearBtn");
const deleteBtn = document.getElementById("deleteBtn");
const equalsBtn = document.getElementById("equalsBtn");
const degRadBtn = document.getElementById("degRadBtn");

const basicModeBtn = document.getElementById("basicModeBtn");
const scientificModeBtn = document.getElementById("scientificModeBtn");
const scientificPanel = document.getElementById("scientificPanel");

// ----- 2c. Switching between Basic and Scientific view -----
basicModeBtn.addEventListener("click", function () {
  scientificPanel.classList.add("hidden");
  basicModeBtn.classList.add("active-mode");
  scientificModeBtn.classList.remove("active-mode");
});

scientificModeBtn.addEventListener("click", function () {
  scientificPanel.classList.remove("hidden");
  scientificModeBtn.classList.add("active-mode");
  basicModeBtn.classList.remove("active-mode");
});

// ----- 2d. Number buttons (0-9 and the decimal point) -----
numberButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const number = button.getAttribute("data-number");
    appendNumber(number);
    updateDisplay();
  });
});

function appendNumber(number) {
  // If we just finished a calculation, typing a number starts a new entry.
  if (shouldResetScreen) {
    currentInput = "";
    shouldResetScreen = false;
  }

  // Don't allow a second decimal point in the same number.
  if (number === "." && currentInput.includes(".")) {
    return;
  }

  // Replace the starting "0" instead of turning it into "05".
  if (currentInput === "0" && number !== ".") {
    currentInput = number;
  } else {
    currentInput = currentInput + number;
  }
}

// ----- 2e. Operator buttons (+, -, ×, ÷, x^y) -----
operatorButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedOperator = button.getAttribute("data-operator");
    chooseOperator(selectedOperator);
    updateDisplay();
  });
});

function chooseOperator(selectedOperator) {
  // If a calculation is already waiting, solve it first.
  // This is what lets us chain calculations like 5 + 3 + 2.
  if (operator !== null && !shouldResetScreen) {
    calculate();
  }

  previousInput = currentInput;
  operator = selectedOperator;
  shouldResetScreen = true;
}

// ----- 2f. Equals button -----
equalsBtn.addEventListener("click", function () {
  calculate();
  updateDisplay();
});

function calculate() {
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);

  // If we don't have two full numbers yet, there's nothing to do.
  if (operator === null || isNaN(prev) || isNaN(current)) {
    return;
  }

  let result;

  if (operator === "+") {
    result = prev + current;
  } else if (operator === "-") {
    result = prev - current;
  } else if (operator === "×") {
    result = prev * current;
  } else if (operator === "÷") {
    if (current === 0) {
      alert("You can't divide by zero!");
      return;
    }
    result = prev / current;
  } else if (operator === "^") {
    result = Math.pow(prev, current);
  }

  currentInput = formatNumber(result);
  operator = null;
  previousInput = "";
  shouldResetScreen = true;
}

// ----- 2g. Clear (AC) and backspace (⌫) -----
clearBtn.addEventListener("click", function () {
  currentInput = "0";
  previousInput = "";
  operator = null;
  shouldResetScreen = false;
  updateDisplay();
});

deleteBtn.addEventListener("click", function () {
  currentInput = currentInput.slice(0, -1);

  if (currentInput === "" || currentInput === "-") {
    currentInput = "0";
  }

  updateDisplay();
});

// ----- 2h. Scientific functions (sin, cos, tan, √, log, etc.) -----
// These work on the ONE number on screen and show the result right
// away, unlike + - × ÷ which need two numbers.
functionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const chosenFunction = button.getAttribute("data-function");
    handleScientificFunction(chosenFunction);
    updateDisplay();
  });
});

function handleScientificFunction(chosenFunction) {
  const current = parseFloat(currentInput);
  let result;

  if (chosenFunction === "percent") {
    result = current / 100;

  } else if (chosenFunction === "sqrt") {
    if (current < 0) {
      alert("Can't take the square root of a negative number!");
      return;
    }
    result = Math.sqrt(current);

  } else if (chosenFunction === "square") {
    result = current * current;

  } else if (chosenFunction === "reciprocal") {
    if (current === 0) {
      alert("You can't divide by zero!");
      return;
    }
    result = 1 / current;

  } else if (chosenFunction === "sin") {
    result = Math.sin(toRadiansIfNeeded(current));

  } else if (chosenFunction === "cos") {
    result = Math.cos(toRadiansIfNeeded(current));

  } else if (chosenFunction === "tan") {
    result = Math.tan(toRadiansIfNeeded(current));

  } else if (chosenFunction === "log") {
    if (current <= 0) {
      alert("Log only works with positive numbers!");
      return;
    }
    result = Math.log10(current);

  } else if (chosenFunction === "ln") {
    if (current <= 0) {
      alert("Ln only works with positive numbers!");
      return;
    }
    result = Math.log(current);

  } else if (chosenFunction === "factorial") {
    result = calculateFactorial(current);
    if (isNaN(result)) {
      return;
    }

  } else if (chosenFunction === "pi") {
    result = Math.PI;

  } else if (chosenFunction === "e") {
    result = Math.E;
  }

  currentInput = formatNumber(result);
  shouldResetScreen = true;
}

// sin, cos and tan in JavaScript always expect radians, but most
// people think in degrees. This switches between the two.
function toRadiansIfNeeded(degreesOrRadians) {
  if (isDegreeMode) {
    return degreesOrRadians * (Math.PI / 180);
  }
  return degreesOrRadians;
}

// Works out a factorial using a simple loop.
// Example: factorial(5) = 5 × 4 × 3 × 2 × 1 = 120
function calculateFactorial(number) {
  if (number < 0) {
    alert("Factorial doesn't work with negative numbers!");
    return NaN;
  }
  if (number !== Math.floor(number)) {
    alert("Factorial only works with whole numbers!");
    return NaN;
  }

  let result = 1;
  for (let i = 2; i <= number; i++) {
    result = result * i;
  }
  return result;
}

// ----- 2i. Degrees / Radians toggle -----
degRadBtn.addEventListener("click", function () {
  isDegreeMode = !isDegreeMode;

  if (isDegreeMode) {
    degRadBtn.textContent = "DEG";
  } else {
    degRadBtn.textContent = "RAD";
  }
});

// ----- 2j. Helper functions used across the calculator -----

// Rounds long decimals so we avoid messy floating-point results
// like 0.1 + 0.2 = 0.30000000000000004
function formatNumber(number) {
  const rounded = Math.round(number * 1000000000) / 1000000000;
  return rounded.toString();
}

// Updates the screen so it always matches the current state above.
function updateDisplay() {
  mainDisplay.textContent = currentInput;

  if (operator !== null) {
    expressionText.textContent = previousInput + " " + operator;
  } else {
    expressionText.textContent = "";
  }
}


/* ===========================================================
   3. BMI CALCULATOR
   =========================================================== */

// ----- 3a. State -----
let isMetric = true; // true = kg/cm, false = lb/in

// ----- 3b. Elements -----
const metricBtn = document.getElementById("metricBtn");
const imperialBtn = document.getElementById("imperialBtn");
const weightUnitLabel = document.getElementById("weightUnitLabel");
const heightUnitLabel = document.getElementById("heightUnitLabel");
const bmiWeight = document.getElementById("bmiWeight");
const bmiHeight = document.getElementById("bmiHeight");
const bmiCalculateBtn = document.getElementById("bmiCalculateBtn");
const bmiResult = document.getElementById("bmiResult");
const bmiValue = document.getElementById("bmiValue");
const bmiCategory = document.getElementById("bmiCategory");

// ----- 3c. Switching between Metric and Imperial -----
metricBtn.addEventListener("click", function () {
  isMetric = true;
  metricBtn.classList.add("active-mode");
  imperialBtn.classList.remove("active-mode");
  weightUnitLabel.textContent = "kg";
  heightUnitLabel.textContent = "cm";
});

imperialBtn.addEventListener("click", function () {
  isMetric = false;
  imperialBtn.classList.add("active-mode");
  metricBtn.classList.remove("active-mode");
  weightUnitLabel.textContent = "lb";
  heightUnitLabel.textContent = "in";
});

// ----- 3d. Calculate button -----
bmiCalculateBtn.addEventListener("click", function () {
  const weight = parseFloat(bmiWeight.value);
  const height = parseFloat(bmiHeight.value);

  if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
    alert("Please enter your weight and height first!");
    return;
  }

  let bmi;

  if (isMetric) {
    // BMI = weight (kg) / height (m) squared
    const heightInMeters = height / 100;
    bmi = weight / (heightInMeters * heightInMeters);
  } else {
    // BMI = 703 × weight (lb) / height (in) squared
    bmi = (703 * weight) / (height * height);
  }

  bmiValue.textContent = bmi.toFixed(1);
  bmiCategory.textContent = getBmiCategory(bmi);
  bmiResult.classList.remove("hidden");
});

// Standard BMI categories used by the WHO
function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return "Underweight";
  } else if (bmi < 25) {
    return "Normal weight";
  } else if (bmi < 30) {
    return "Overweight";
  } else {
    return "Obese";
  }
}


/* ===========================================================
   4. AGE CALCULATOR
   =========================================================== */

// ----- 4a. Elements -----
const birthDateInput = document.getElementById("birthDate");
const ageCalculateBtn = document.getElementById("ageCalculateBtn");
const ageResult = document.getElementById("ageResult");
const ageValue = document.getElementById("ageValue");
const ageNextBirthday = document.getElementById("ageNextBirthday");

// ----- 4b. Calculate button -----
ageCalculateBtn.addEventListener("click", function () {
  if (!birthDateInput.value) {
    alert("Please choose your date of birth first!");
    return;
  }

  // Splitting the date ourselves (instead of "new Date(birthDateInput.value)")
  // avoids a timezone quirk where the date can shift by a day.
  const dateParts = birthDateInput.value.split("-");
  const birthDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const today = new Date();

  if (birthDate > today) {
    alert("That date is in the future!");
    return;
  }

  const age = calculateAge(birthDate, today);
  ageValue.textContent = age.years + " years, " + age.months + " months, " + age.days + " days";

  const daysLeft = daysUntilNextBirthday(birthDate, today);
  ageNextBirthday.textContent = daysLeft + " days until your next birthday";

  ageResult.classList.remove("hidden");
});

// Works out full years, months and days between two dates.
function calculateAge(birthDate, today) {
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months = months - 1;
    const daysInPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days = days + daysInPreviousMonth;
  }

  if (months < 0) {
    years = years - 1;
    months = months + 12;
  }

  return { years: years, months: months, days: days };
}

// Counts the days until the next birthday (this year or next).
function daysUntilNextBirthday(birthDate, today) {
  const thisYear = today.getFullYear();
  let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());

  if (nextBirthday < today) {
    nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.round((nextBirthday - today) / msPerDay);
  return daysLeft;
}


/* ===========================================================
   5. TIP CALCULATOR
   =========================================================== */

// ----- 5a. State -----
let selectedTipPercent = 15; // matches the button marked "selected" in the HTML

// ----- 5b. Elements -----
const billAmountInput = document.getElementById("billAmount");
const tipPercentButtons = document.querySelectorAll(".tip-percent-btn");
const customTipPercent = document.getElementById("customTipPercent");
const splitCountInput = document.getElementById("splitCount");
const tipCalculateBtn = document.getElementById("tipCalculateBtn");
const tipResult = document.getElementById("tipResult");
const tipAmount = document.getElementById("tipAmount");
const tipTotal = document.getElementById("tipTotal");
const tipPerPerson = document.getElementById("tipPerPerson");

// ----- 5c. Quick-select tip percentage buttons -----
tipPercentButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedTipPercent = parseFloat(button.getAttribute("data-percent"));
    customTipPercent.value = "";

    tipPercentButtons.forEach(function (btn) {
      btn.classList.remove("selected-percent");
    });
    button.classList.add("selected-percent");
  });
});

// ----- 5d. Typing a custom percentage overrides the quick-select buttons -----
customTipPercent.addEventListener("input", function () {
  if (customTipPercent.value !== "") {
    selectedTipPercent = parseFloat(customTipPercent.value);

    tipPercentButtons.forEach(function (btn) {
      btn.classList.remove("selected-percent");
    });
  }
});

// ----- 5e. Calculate button -----
tipCalculateBtn.addEventListener("click", function () {
  const bill = parseFloat(billAmountInput.value);
  const people = parseFloat(splitCountInput.value) || 1;

  if (isNaN(bill) || bill <= 0) {
    alert("Please enter the bill amount first!");
    return;
  }

  const tip = bill * (selectedTipPercent / 100);
  const total = bill + tip;
  const perPerson = total / people;

  tipAmount.textContent = tip.toFixed(2);
  tipTotal.textContent = total.toFixed(2);
  tipPerPerson.textContent = perPerson.toFixed(2);

  tipResult.classList.remove("hidden");
});


/* ===========================================================
   6. UNIT CONVERTER
   =========================================================== */

// ----- 6a. State -----
let currentConvertCategory = "length"; // "length", "weight" or "temperature"

// ----- 6b. Elements: category switch -----
const lengthCatBtn = document.getElementById("lengthCatBtn");
const weightCatBtn = document.getElementById("weightCatBtn");
const tempCatBtn = document.getElementById("tempCatBtn");

const lengthConvert = document.getElementById("lengthConvert");
const weightConvert = document.getElementById("weightConvert");
const tempConvert = document.getElementById("tempConvert");

const convertResult = document.getElementById("convertResult");
const convertValueDisplay = document.getElementById("convertValue");

// ----- 6c. Switching between Length / Weight / Temperature -----
lengthCatBtn.addEventListener("click", function () {
  showConvertCategory("length");
});

weightCatBtn.addEventListener("click", function () {
  showConvertCategory("weight");
});

tempCatBtn.addEventListener("click", function () {
  showConvertCategory("temperature");
});

function showConvertCategory(category) {
  currentConvertCategory = category;
  convertResult.classList.add("hidden");

  if (category === "length") {
    lengthConvert.classList.remove("hidden");
    weightConvert.classList.add("hidden");
    tempConvert.classList.add("hidden");

    lengthCatBtn.classList.add("active-mode");
    weightCatBtn.classList.remove("active-mode");
    tempCatBtn.classList.remove("active-mode");

  } else if (category === "weight") {
    lengthConvert.classList.add("hidden");
    weightConvert.classList.remove("hidden");
    tempConvert.classList.add("hidden");

    lengthCatBtn.classList.remove("active-mode");
    weightCatBtn.classList.add("active-mode");
    tempCatBtn.classList.remove("active-mode");

  } else {
    lengthConvert.classList.add("hidden");
    weightConvert.classList.add("hidden");
    tempConvert.classList.remove("hidden");

    lengthCatBtn.classList.remove("active-mode");
    weightCatBtn.classList.remove("active-mode");
    tempCatBtn.classList.add("active-mode");
  }
}

// ----- 6d. Conversion tables -----
// Each table stores "how many of the base unit is 1 of this unit worth".
// Example: 1 foot = 0.3048 meters, so converting is just multiplying
// and dividing by these numbers.

const lengthUnitsInMeters = {
  meters: 1,
  kilometers: 1000,
  centimeters: 0.01,
  feet: 0.3048,
  inches: 0.0254,
  miles: 1609.34
};

const weightUnitsInKg = {
  kilograms: 1,
  grams: 0.001,
  pounds: 0.453592,
  ounces: 0.0283495
};

// Short labels to display next to the result
const unitSymbols = {
  meters: "m",
  kilometers: "km",
  centimeters: "cm",
  feet: "ft",
  inches: "in",
  miles: "mi",
  kilograms: "kg",
  grams: "g",
  pounds: "lb",
  ounces: "oz",
  celsius: "°C",
  fahrenheit: "°F",
  kelvin: "K"
};

// ----- 6e. Elements: values, from/to dropdowns -----
const lengthValue = document.getElementById("lengthValue");
const lengthFrom = document.getElementById("lengthFrom");
const lengthTo = document.getElementById("lengthTo");

const weightValue = document.getElementById("weightValue");
const weightFrom = document.getElementById("weightFrom");
const weightTo = document.getElementById("weightTo");

const tempValue = document.getElementById("tempValue");
const tempFrom = document.getElementById("tempFrom");
const tempTo = document.getElementById("tempTo");

const convertCalculateBtn = document.getElementById("convertCalculateBtn");

// ----- 6f. Calculate button -----
convertCalculateBtn.addEventListener("click", function () {
  let result;
  let unitLabel;

  if (currentConvertCategory === "length") {
    const value = parseFloat(lengthValue.value);
    if (isNaN(value)) {
      alert("Please enter a value to convert!");
      return;
    }
    result = convertUsingTable(value, lengthFrom.value, lengthTo.value, lengthUnitsInMeters);
    unitLabel = unitSymbols[lengthTo.value];

  } else if (currentConvertCategory === "weight") {
    const value = parseFloat(weightValue.value);
    if (isNaN(value)) {
      alert("Please enter a value to convert!");
      return;
    }
    result = convertUsingTable(value, weightFrom.value, weightTo.value, weightUnitsInKg);
    unitLabel = unitSymbols[weightTo.value];

  } else {
    const value = parseFloat(tempValue.value);
    if (isNaN(value)) {
      alert("Please enter a value to convert!");
      return;
    }
    result = convertTemperature(value, tempFrom.value, tempTo.value);
    unitLabel = unitSymbols[tempTo.value];
  }

  convertValueDisplay.textContent = formatNumber(result) + " " + unitLabel;
  convertResult.classList.remove("hidden");
});

// Converts a value between two units using a lookup table of
// "how many base units is 1 of this unit worth".
function convertUsingTable(value, fromUnit, toUnit, table) {
  const valueInBaseUnit = value * table[fromUnit];
  const result = valueInBaseUnit / table[toUnit];
  return result;
}

// Temperature can't use the multiply/divide table trick above because
// Celsius, Fahrenheit and Kelvin don't all start counting from zero
// at the same point — so this uses the real conversion formulas instead.
function convertTemperature(value, fromUnit, toUnit) {
  // Step 1: convert whatever we were given into Celsius.
  let celsius;

  if (fromUnit === "celsius") {
    celsius = value;
  } else if (fromUnit === "fahrenheit") {
    celsius = (value - 32) * 5 / 9;
  } else {
    celsius = value - 273.15;
  }

  // Step 2: convert from Celsius into whatever unit we want.
  let result;

  if (toUnit === "celsius") {
    result = celsius;
  } else if (toUnit === "fahrenheit") {
    result = celsius * 9 / 5 + 32;
  } else {
    result = celsius + 273.15;
  }

  return result;
}