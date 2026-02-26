// ============================================================
// CALCULADORA - CÓDIGO COMENTADO PARA INICIANTES
// ============================================================

// ---- REFERÊNCIAS AOS ELEMENTOS DO HTML ----
// Aqui pegamos os elementos da página pelo ID para podermos
// manipulá-los com JavaScript
const displayValue = document.getElementById("display-value"); // Tela da calculadora
const zeroBtn = document.getElementById("btn-0");              // Botão do 0 (tem regra especial)
const clearBtn = document.getElementById("btn-clear");         // Botão C (limpa tudo)
const delBtn = document.getElementById("btn-del");             // Botão DEL (apaga último caractere)
const decimalBtn = document.getElementById("btn-decimal");     // Botão de vírgula/ponto decimal
const equalsBtn = document.getElementById("btn-equals");       // Botão = (calcula o resultado)

// ---- OBJETO PRINCIPAL ----
// Este objeto funciona como a "memória" da calculadora.
// Ele guarda temporariamente os números e operadores enquanto o usuário digita.
// Propriedades possíveis:
//   object.numOne   → primeiro número digitado (ex: "5")
//   object.operand  → operador escolhido (ex: "+", "-", "*", "/")
//   object.numTwo   → segundo número digitado (ex: "3")
//   object.product  → resultado do último cálculo (ex: "8")
let object = {}

// ============================================================
// EVENT LISTENERS (Ouvintes de Eventos)
// ============================================================
// Event Listeners "escutam" quando o usuário clica em um botão
// e chamam a função correspondente.

// Pega TODOS os botões numéricos (classe .num-btn) de uma vez
// e adiciona o listener em cada um
let numButtons = document.querySelectorAll(".num-btn");
numButtons.forEach(button => {
    button.addEventListener("click", () => {
       addNumber(button.textContent); // Passa o número clicado (ex: "7") para a função
    })
})

// Mesma ideia para os botões de operação (+, -, *, /)
let operatorButtons = document.querySelectorAll(".op-btn");
operatorButtons.forEach(button => {
    button.addEventListener("click", () => {
        addOperator(button.textContent); // Passa o operador clicado para a função
    });
});

// Listeners individuais para os botões especiais
equalsBtn.addEventListener("click", () => { selectEquals(); })
clearBtn.addEventListener("click",  () => { clearAll();     })
zeroBtn.addEventListener("click",   () => { addZero();      })
decimalBtn.addEventListener("click",() => { addDecimal();   })
delBtn.addEventListener("click",    () => { deleteLast();   })


// ============================================================
// SISTEMA DE REGRAS
// ============================================================
// Esta calculadora usa um padrão chamado "tabela de regras".
// Cada regra tem duas partes:
//   condition: uma função que verifica SE a regra se aplica
//   action:    uma função que define O QUE fazer se a regra se aplicar
//
// As funções de ação sempre percorrem a lista e executam
// APENAS A PRIMEIRA regra cuja condição for verdadeira.
// Isso evita um monte de if/else aninhados e deixa o código mais organizado.

// ---- REGRAS DO BOTÃO "=" ----
const equalsRules = [
  // Regra 1: Se não há segundo número, não faz nada (cálculo incompleto)
  {
    condition: obj => !('numTwo' in obj),
    action: () => false
  },

  // Regra 2: Se há numOne e numTwo mas ainda não houve cálculo anterior
  {
    condition: obj => !('product' in obj),
    action: obj => {
      operate(obj.numOne, obj.operand, obj.numTwo);
    }
  },

  // Regra 3: Se já houve um cálculo anterior (product existe), usa o resultado como base
  {
    condition: obj => ('product' in obj),
    action: obj => {
      operate(obj.product, obj.operand, obj.numTwo);
    }
  }
];

// ---- REGRAS DO BOTÃO "0" ----
// O zero tem regra separada para evitar números como "007"
const addZeroRules = [
  // Regra 1: Resultado já calculado e sem operador → ignora (não deixa continuar digitando no resultado)
  { condition: obj => ('product' in obj) && !('operand' in obj), action: obj => false },

  // Regra 2: Nenhum número ainda → inicia numOne com "0"
  { condition: obj => !('operand' in obj) && !('numOne' in obj),
    action: obj => { obj.numOne = "0"; displayValue.textContent = obj.numOne; } 
  },

  // Regra 3: Já tem numOne e ainda não tem operador → adiciona "0" ao final (se não for "0" sozinho)
  { condition: obj => !('operand' in obj) && ('numOne' in obj) && obj.numOne.length < 10,
    action: obj => { 
      if (obj.numOne !== "0") obj.numOne += "0"; // Evita "00", "000", etc.
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 4: Tem operador mas ainda não tem numTwo → inicia numTwo com "0"
  { condition: obj => ('operand' in obj) && !('numTwo' in obj),
    action: obj => { obj.numTwo = "0"; displayValue.textContent = obj.numTwo; } 
  },

  // Regra 5: Já tem numTwo → adiciona "0" ao final do numTwo
  { condition: obj => ('operand' in obj) && ('numTwo' in obj) && obj.numTwo.length < 10,
    action: obj => { 
      if (obj.numTwo !== "0") obj.numTwo += "0";
      displayValue.textContent = obj.numTwo;
    }
  }
];

// ---- REGRAS PARA NÚMEROS (1-9) ----
const addNumberRules = [
  // Regra 1: Resultado calculado e sem operador → ignora (não deixa continuar no resultado)
  { condition: obj => ('product' in obj) && !('operand' in obj), action: obj => false },

  // Regra 2: Sem número nenhum ainda → cria numOne com o dígito clicado
  { condition: obj => !('operand' in obj) && !('numOne' in obj),
    action: (obj, value) => {
      obj.numOne = value.toString();
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 3: Já tem numOne e sem operador → adiciona dígito ao final do numOne
  { condition: obj => !('operand' in obj) && ('numOne' in obj) && obj.numOne.length < 10,
    action: (obj, value) => {
      if (obj.numOne === "0") { 
        obj.numOne = value.toString(); // Substitui "0" em vez de virar "07"
      } else {
        obj.numOne += value.toString();
      }
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 4: Tem operador mas sem numTwo → cria numTwo com o dígito clicado
  { condition: obj => ('operand' in obj) && !('numTwo' in obj),
    action: (obj, value) => {
      obj.numTwo = value.toString();
      displayValue.textContent = obj.numTwo;
    }
  },

  // Regra 5: Já tem numTwo → adiciona dígito ao final do numTwo
  { condition: obj => ('operand' in obj) && ('numTwo' in obj) && obj.numTwo.length < 10,
    action: (obj, value) => {
      if (obj.numTwo === "0") { 
        obj.numTwo = value.toString(); // Substitui "0" em vez de virar "07"
      } else {
        obj.numTwo += value.toString();
      }
      displayValue.textContent = obj.numTwo;
    }
  }
];

// ---- REGRAS PARA OPERADORES (+, -, *, /) ----
const addOperatorRules = [
  // Regra 1: Sem nenhum número → não faz nada (não dá pra começar com operador)
  {
    condition: obj => !('numOne' in obj) && !('product' in obj),
    action: () => false
  },

  // Regra 2: Cálculo em cadeia com product → calcula o resultado atual e troca o operador
  // Ex: usuário fez "5 + 3 =" (product = 8) e agora clicou "*"
  {
    condition: obj => ('product' in obj) && ('operand' in obj) && ('numTwo' in obj),
    action: (obj, value) => {
      operate(obj.product, obj.operand, obj.numTwo);
      displayValue.textContent = obj.product + value;
      obj.operand = value;
      delete obj.numTwo;
    }
  },

  // Regra 3: Cálculo em cadeia com numOne → calcula e troca o operador
  // Ex: usuário digitou "5 + 3" e clicou "*" antes de apertar "="
  {
    condition: obj => ('numOne' in obj) && ('operand' in obj) && ('numTwo' in obj),
    action: (obj, value) => {
      operate(obj.numOne, obj.operand, obj.numTwo);
      displayValue.textContent = obj.product + value;
      obj.operand = value;
      delete obj.numTwo;
    }
  },

  // Regra 4: Tem numOne mas sem operador → só registra o operador clicado
  {
    condition: obj => ('numOne' in obj) && !('operand' in obj),
    action: (obj, value) => {
      obj.operand = value;
      displayValue.textContent = obj.numOne + value;
    }
  },

  // Regra 5: Tem product (resultado anterior) sem operador → usa product como base
  {
    condition: obj => ('product' in obj) && !('operand' in obj),
    action: (obj, value) => {
      obj.operand = value;
      displayValue.textContent = obj.product + value;
    }
  }
];

// ---- REGRAS PARA O PONTO DECIMAL ----
const addDecimalRules = [
  // Regra 1: Sem nenhum número → começa numOne com "0." 
  {
    condition: obj => !('numOne' in obj) && !('product' in obj),
    action: obj => {
      obj.numOne = "0.";
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 2: Tem numOne sem operador → adiciona ponto se numOne ainda não tiver ponto
  {
    condition: obj => ('numOne' in obj) && !('operand' in obj),
    action: obj => {
      if (!obj.numOne.includes('.')) { // Evita "5.." 
        obj.numOne += ".";
        displayValue.textContent = obj.numOne;
      }
    }
  },

  // Regra 3: Tem operador mas sem numTwo → começa numTwo com "0."
  {
    condition: obj => ('numOne' in obj) && ('operand' in obj) && !('numTwo' in obj),
    action: obj => {
      obj.numTwo = "0.";
      displayValue.textContent = obj.numTwo;
    }
  },

  // Regra 4: Mesma situação mas vindo de um product (resultado anterior)
  {
    condition: obj => ('product' in obj) && ('operand' in obj) && !('numTwo' in obj),
    action: obj => {
      obj.numTwo = "0.";
      displayValue.textContent = obj.numTwo;
    }
  },

  // Regra 5: Já tem numTwo → adiciona ponto se numTwo ainda não tiver ponto
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

// ---- REGRAS PARA O BOTÃO DELETE (apaga último caractere) ----
const deleteLastRules = [
  // Regra 1: Tem numOne sem operador → remove o último caractere do numOne
  {
    condition: obj => ('numOne' in obj) && !('operand' in obj),
    action: obj => {
      obj.numOne = obj.numOne.slice(0, -1); // slice(0, -1) remove o último caractere
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 2: Tem numOne e operador mas sem numTwo → remove o operador
  {
    condition: obj => ('numOne' in obj) && ('operand' in obj) && !('numTwo' in obj),
    action: obj => {
      delete obj.operand;
      displayValue.textContent = obj.numOne;
    }
  },

  // Regra 3: Tem operador e numTwo → remove o último caractere do numTwo
  {
    condition: obj => ('operand' in obj) && ('numTwo' in obj),
    action: obj => {
      obj.numTwo = obj.numTwo.slice(0, -1);
      displayValue.textContent = obj.numTwo;
    }
  }
];

// ============================================================
// FUNÇÕES DE AÇÃO
// ============================================================
// Cada função percorre sua lista de regras e executa
// a primeira que tiver condição verdadeira.
// O "return" garante que só UMA regra seja executada.

function selectEquals() {
  for (const rule of equalsRules) {
    if (rule.condition(object)) {
      return rule.action(object); // Para na primeira regra verdadeira
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

// Limpa TODO o estado da calculadora e esvazia a tela
function clearAll() {
  delete object.numOne;
  delete object.operand;
  delete object.numTwo;
  delete object.product;
  displayValue.textContent = "";
}

// ============================================================
// OPERAÇÕES MATEMÁTICAS
// ============================================================

// Recebe dois números (como strings) e o operador,
// e direciona para a função aritmética correta
function operate(a, operator, b) {
  if (operator === "+") {
    arithmetic(a, b, (x, y) => x + y);
  } else if (operator === "-") {
    arithmetic(a, b, (x, y) => x - y);
  } else if (operator === "*") {
    arithmetic(a, b, (x, y) => x * y);
  } else if (operator === "/" && (a == 0 || b == 0)) {
    displayValue.textContent = "!error"; // Divisão por zero (ou zero dividido) → erro
  } else if (operator === "/") {
    arithmetic(a, b, (x, y) => x / y);
  }
}

// Realiza o cálculo de fato:
// 1. Converte as strings para Number
// 2. Aplica a operação (fn é uma função passada como argumento — ex: (x,y) => x + y)
// 3. Formata o resultado com até 2 casas decimais, removendo zeros desnecessários
// 4. Exibe na tela e salva no objeto como "product"
function arithmetic(a, b, fn) {
  let result = fn(Number(a), Number(b));
  
  // toFixed(2) → garante 2 casas decimais: ex: 8.00
  // replace(/\.?0+$/, "") → remove zeros à direita: 8.00 → "8", 8.50 → "8.5"
  let formatted = result.toFixed(2).replace(/\.?0+$/, "");
  
  displayValue.textContent = formatted;
  object.product = formatted; // Salva o resultado para possíveis cálculos em cadeia
  
  // Limpa os dados usados no cálculo (o result ficou em "product")
  delete object.numOne;
  delete object.numTwo;
  delete object.operand;
}