const displayValue = document.getElementById("display-value");
const zeroBtn = document.getElementById("btn-0");
const clearBtn = document.getElementById("btn-clear");
const delBtn = document.getElementById("btn-del");
const decimalBtn = document.getElementById("btn-decimal");
const equalsBtn = document.getElementById("btn-equals");


let object = { }


//EVENT LISTENERS

let numButtons = document.querySelectorAll(".num-btn");
numButtons.forEach(button => {
    button.addEventListener("click", () => {
       addNumber(button.textContent);
    })
})

let operatorButtons = document.querySelectorAll(".op-btn");
operatorButtons.forEach(button => {
    button.addEventListener("click", () => {
        addOperator(button.textContent);
    });
});

equalsBtn.addEventListener("click", () => {
    selectEquals();
    })

clearBtn.addEventListener("click", () => {
    clearAll();
    })

zeroBtn.addEventListener("click", () => {
    addZero();
    })

decimalBtn.addEventListener("click", () => {
    addDecimal();
    })

delBtn.addEventListener("click", () => {
    deleteLast();
    })

//RULES FOR OPERATIONS

const equalsRules = [
  // Regra 1: não tem numTwo → não faz nada
  {
    condition: obj => !('numTwo' in obj),
    action: () => false
  },

  // Regra 2: não tem product → opera com numOne
  {
    condition: obj => !('product' in obj),
    action: obj => {
      operate(obj.numOne, obj.operand, obj.numTwo);
    }
  },

  // Regra 3: tem product → opera com product
  {
    condition: obj => ('product' in obj),
    action: obj => {
      operate(obj.product, obj.operand, obj.numTwo);
    }
  }
];

const addZeroRules = [
  { condition: obj => ('product' in obj) && !('operand' in obj), action: obj => false },

  { condition: obj => !('operand' in obj) && !('numOne' in obj),
    action: obj => { obj.numOne = "0"; displayValue.textContent = obj.numOne; } 
  },

  { condition: obj => !('operand' in obj) && ('numOne' in obj) && obj.numOne.length < 10,
    action: obj => { 
      if (obj.numOne !== "0") obj.numOne += "0"; 
      displayValue.textContent = obj.numOne;
    }
  },

  { condition: obj => ('operand' in obj) && !('numTwo' in obj),
    action: obj => { obj.numTwo = "0"; displayValue.textContent = obj.numTwo; } 
  },

  { condition: obj => ('operand' in obj) && ('numTwo' in obj) && obj.numTwo.length < 10,
    action: obj => { 
      if (obj.numTwo !== "0") obj.numTwo += "0"; 
      displayValue.textContent = obj.numTwo;
    }
  }
];

const addNumberRules = [
  { condition: obj => ('product' in obj) && !('operand' in obj), action: obj => false },

  { condition: obj => !('operand' in obj) && !('numOne' in obj),
    action: (obj, value) => {
      obj.numOne = value.toString();
      displayValue.textContent = obj.numOne;
    }
  },

  { condition: obj => !('operand' in obj) && ('numOne' in obj) && obj.numOne.length < 10,
    action: (obj, value) => {
      if (obj.numOne === "0") { 
        obj.numOne = value.toString();
      } else {
        obj.numOne += value.toString();
      }
      displayValue.textContent = obj.numOne;
    }
  },

  { condition: obj => ('operand' in obj) && !('numTwo' in obj),
    action: (obj, value) => {
      obj.numTwo = value.toString();
      displayValue.textContent = obj.numTwo;
    }
  },

  { condition: obj => ('operand' in obj) && ('numTwo' in obj) && obj.numTwo.length < 10,
    action: (obj, value) => {
      if (obj.numTwo === "0") { 
        obj.numTwo = value.toString();
      } else {
        obj.numTwo += value.toString();
      }
      displayValue.textContent = obj.numTwo;
    }
  }
];

const addOperatorRules = [
  // Regra 1: não tem numOne nem product → não faz nada
  {
    condition: obj => !('numOne' in obj) && !('product' in obj),
    action: () => false
  },

  // Regra 2: tem product, operand e numTwo → calcula e continua
  {
    condition: obj => ('product' in obj) && ('operand' in obj) && ('numTwo' in obj),
    action: (obj, value) => {
      operate(obj.product, obj.operand, obj.numTwo);
      displayValue.textContent = obj.product + value;
      obj.operand = value;
      delete obj.numTwo;
    }
  },

  // Regra 3: tem numOne, operand e numTwo → calcula e continua
  {
    condition: obj => ('numOne' in obj) && ('operand' in obj) && ('numTwo' in obj),
    action: (obj, value) => {
      operate(obj.numOne, obj.operand, obj.numTwo);
      displayValue.textContent = obj.product + value;
      obj.operand = value;
      delete obj.numTwo;
    }
  },

  // Regra 4: tem numOne mas ainda não tem operand
  {
    condition: obj => ('numOne' in obj) && !('operand' in obj),
    action: (obj, value) => {
      obj.operand = value;
      displayValue.textContent = obj.numOne + value;
    }
  },

  // Regra 5: tem product mas não tem operand (veio de um cálculo anterior)
  {
    condition: obj => ('product' in obj) && !('operand' in obj),
    action: (obj, value) => {
      obj.operand = value;
      displayValue.textContent = obj.product + value;
    }
  }
];

const addDecimalRules = [
  // Regra 1: não tem numOne nem product → começa numOne com "0."
  {
    condition: obj => !('numOne' in obj) && !('product' in obj),
    action: obj => {
      obj.numOne = "0.";
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 2: tem numOne, sem operand → adiciona ponto ao numOne se ainda não tiver
  {
    condition: obj => ('numOne' in obj) && !('operand' in obj),
    action: obj => {
      if (!obj.numOne.includes('.')) {
        obj.numOne += ".";
        displayValue.textContent = obj.numOne;
      }
    }
  },

  // Regra 3: tem numOne e operand, sem numTwo → começa numTwo com "0."
  {
    condition: obj => ('numOne' in obj) && ('operand' in obj) && !('numTwo' in obj),
    action: obj => {
      obj.numTwo = "0.";
      displayValue.textContent = obj.numTwo;
    }
  },

  // Regra 4: tem product e operand, sem numTwo → começa numTwo com "0."
  {
    condition: obj => ('product' in obj) && ('operand' in obj) && !('numTwo' in obj),
    action: obj => {
      obj.numTwo = "0.";
      displayValue.textContent = obj.numTwo;
    }
  },

  // Regra 5: tem numTwo → adiciona ponto ao numTwo se ainda não tiver
  {
    condition: obj => ('numTwo' in obj),
    action: obj => {
      if (!obj.numTwo.includes('.')) {
        obj.numTwo += ".";
        displayValue.textContent = obj.numTwo;
      }
    }
  }
];

const deleteLastRules = [
  // Regra 1: tem numOne, sem operand → remove último caractere do numOne
  {
    condition: obj => ('numOne' in obj) && !('operand' in obj),
    action: obj => {
      obj.numOne = obj.numOne.slice(0, -1);
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 2: tem numOne e operand, sem numTwo → remove o operand
  {
    condition: obj => ('numOne' in obj) && ('operand' in obj) && !('numTwo' in obj),
    action: obj => {
      delete obj.operand;
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 3: tem operand e numTwo → remove último caractere do numTwo
  {
    condition: obj => ('operand' in obj) && ('numTwo' in obj),
    action: obj => {
      obj.numTwo = obj.numTwo.slice(0, -1);
      displayValue.textContent = obj.numTwo;
    }
  }
];

//ACTION FUNCTIONS

function selectEquals() {
  for (const rule of equalsRules) {
    if (rule.condition(object)) {
      return rule.action(object);
    }
  }
}

function deleteLast() {
  for (const rule of deleteLastRules) {
    if (rule.condition(object)) {
      return rule.action(object);
    }
  }
}

function addDecimal() {
  for (const rule of addDecimalRules) {
    if (rule.condition(object)) {
      return rule.action(object);
    }
  }
}

function addNumber(value) {
  for (const rule of addNumberRules) {
    if (rule.condition(object)) {
      return rule.action(object, value);
    }
  }
}

function addZero() {
  for (const rule of addZeroRules) {
    if (rule.condition(object)) {
      return rule.action(object);
    }
  }
}

function addOperator(value) {
  for (const rule of addOperatorRules) {
    if (rule.condition(object)) {
      return rule.action(object, value);
    }
  }
}

function clearAll() {
  delete object.numOne;
  delete object.operand;
  delete object.numTwo;
  delete object.product;
  displayValue.textContent = "";
}

//ARITIMETIC OPERATIONS

function operate(a, operator, b) {
  if (operator === "+") {
    arithmetic(a, b, (x, y) => x + y);
  } else if (operator === "-") {
    arithmetic(a, b, (x, y) => x - y);
  } else if (operator === "*") {
    arithmetic(a, b, (x, y) => x * y);
  } else if (operator === "/" && (a == 0 || b == 0)) {
    displayValue.textContent = "!error";
  } else if (operator === "/") {
    arithmetic(a, b, (x, y) => x / y);
  }
}

function arithmetic(a, b, fn) {
  let result = fn(Number(a), Number(b));
  let formatted = result.toFixed(2).replace(/\.?0+$/, "");
  displayValue.textContent = formatted;
  object.product = formatted;
  delete object.numOne;
  delete object.numTwo;
  delete object.operand;
}