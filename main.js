import addNewChart from './server/addNewChart.js'
import { saveChanges } from './server/saveChanges.js'
import { addFirstTable } from "./server/addFirstTable.js"

const openFormButton = document.getElementById('openForm')
const addPageButton = document.getElementById('addPage')
const chartOptions = document.getElementById('chart-options')

const closeTableOptions = document.getElementById('close-table-options')
const closeChartOptions = document.getElementById('close-chart-options')

const saveChangesButton = document.getElementById('saveChanges')
const closeFormButton = document.getElementById('closeForm')
const floatingForm = document.getElementById('floatingForm')
const tableOptions = document.getElementById('table-options')
const tableButton1 = document.getElementById('model1')
const tableButton2 = document.getElementById('model2')
const addSecondTableButton = document.getElementById('add-second-table')
const sampleProfileButton = document.getElementById('sample-profile')

const tableHeaderSelector = document.getElementById('tableHeaderSelector');
const tableHeaderNumber = document.getElementById('tableHeaderNumber');

// Adicionar lógica para mostrar/ocultar Tabela 3 conforme checkbox
const showTable3Checkbox = document.getElementById('show-table-3-config');
const headersSection3 = document.querySelector('.table-headers-section:nth-child(4)');

// Adicionar lógica para mostrar/ocultar Tabela 4 e 5 conforme checkbox
const showTable4Checkbox = document.getElementById('show-table-4-config');
const showTable5Checkbox = document.getElementById('show-table-5-config');

// Função para salvar o estado do checkbox
function saveShowTable3State() {
  localStorage.setItem('showTable3', showTable3Checkbox.checked ? '1' : '0');
}

// Função para restaurar o estado do checkbox
function restoreShowTable3State() {
  const state = localStorage.getItem('showTable3');
  showTable3Checkbox.checked = state === '1';
  // Exibe ou oculta o bloco de configuração da Tabela 3
  document.getElementById('headers-container-3').style.display = showTable3Checkbox.checked ? 'block' : 'none';
}

// Listener para salvar e exibir/ocultar ao clicar
showTable3Checkbox.addEventListener('change', () => {
  saveShowTable3State();
  document.getElementById('headers-container-3').style.display = showTable3Checkbox.checked ? 'block' : 'none';
});

// Restaurar ao abrir o formulário
restoreShowTable3State();

// Função para salvar o estado do checkbox
function saveShowTable4State() {
  localStorage.setItem('showTable4', showTable4Checkbox.checked ? '1' : '0');
}

// Função para salvar o estado do checkbox
function saveShowTable5State() {
  localStorage.setItem('showTable5', showTable5Checkbox.checked ? '1' : '0');
}

// Função para restaurar o estado do checkbox
function restoreShowTable4State() {
  const state = localStorage.getItem('showTable4');
  showTable4Checkbox.checked = state === '1';
  document.getElementById('headers-container-4').style.display = showTable4Checkbox.checked ? 'block' : 'none';
}

// Função para restaurar o estado do checkbox
function restoreShowTable5State() {
  const state = localStorage.getItem('showTable5');
  showTable5Checkbox.checked = state === '1';
  document.getElementById('headers-container-5').style.display = showTable5Checkbox.checked ? 'block' : 'none';
}

// Listener para salvar e exibir/ocultar ao clicar
showTable4Checkbox.addEventListener('change', () => {
  saveShowTable4State();
  document.getElementById('headers-container-4').style.display = showTable4Checkbox.checked ? 'block' : 'none';
});

// Listener para salvar e exibir/ocultar ao clicar
showTable5Checkbox.addEventListener('change', () => {
  saveShowTable5State();
  document.getElementById('headers-container-5').style.display = showTable5Checkbox.checked ? 'block' : 'none';
});

// Restaurar ao abrir o formulário
restoreShowTable4State();
restoreShowTable5State();

// Ao salvar, também salva o estado dos novos checkboxes
saveChangesButton.addEventListener('click', () => {
  saveAllTableHeaders();
  saveShowTable3State();
  saveShowTable4State();
  saveShowTable5State();
  floatingForm.classList.add('hidden');
});

sampleProfileButton.addEventListener('click', () => {
  tableOptions.classList.remove('hidden')
  // table2.classList.remove('hidden')
  fileInput.isSampleProfile = true
})

const table2 = document.getElementById('table2')

// addSecondTableButton.addEventListener('click', () => {
//   if (radioButtons[0].checked) {
//     fileInput.isBar = true
//     fileInput.isPie = false
//   }
//
//   if (radioButtons[1].checked) {
//     fileInput.isBar = false
//     fileInput.isPie = true
//   }
//
//   fileInput.isSecondTable = true
//   fileInput.click()
// })

function getNumberOfColumnsFromHeaders() {
  const containers = [
    'headers-container-1',
    'headers-container-2',
    'headers-container-3',
    'headers-container-4',
    'headers-container-5'
  ];
  const valuesArray = [];
  containers.forEach(id => {
    const inputs = document.querySelectorAll(`#${id} .header-colspan`);
    let sum = 0;
    inputs.forEach(input => {
      if (input.closest('.header-item').querySelector('.header-selected').checked) {
        sum += Number(input.value) || 0;
      }
    });
    valuesArray.push(sum);
  });
  return valuesArray;
}

openFormButton.addEventListener('click', () => {
  floatingForm.classList.remove('hidden')
  loadAllTableHeaders();
})

closeFormButton.addEventListener('click', () => {
  floatingForm.classList.add('hidden')
})

closeChartOptions.addEventListener('click', () => {
  chartOptions.classList.add('hidden')
})

const radioButtons = document.getElementsByName("chartType")

const fileInput = document.getElementById('fileInput')

fileInput.addEventListener('change', function (event) {
  const files = event.target.files;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = function (e) {
        const buffer = e.target.result;

        addTableAndChart(buffer);
      };

      reader.readAsArrayBuffer(file);
    }

    fileInput.value = '';
  }
});

async function addTableAndChart(buffer) {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });

  const isSecondTable = fileInput.isSecondTable;
  const isBar = fileInput.isBar;
  const isPie = fileInput.isPie;
  const isSampleProfile = fileInput.isSampleProfile;

  workbook.SheetNames.forEach(async (sheetName) => {
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    });

    await addTableFromWorkbook(buffer, isSecondTable, isSampleProfile);
  });
}

// Garante que sempre pega o valor ATUAL dos inputs ao gerar as tabelas
async function addTableFromWorkbook(buffer, isSecondTable, isSampleProfile) {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
  });

  const tableTitle = data.shift()[0];
  const dataArray = data.map((object) => Object.values(object));
  const subheader = dataArray[1];
  dataArray.shift();
  dataArray.shift();

  const filteredData = dataArray.filter((row) =>
    row.some((value) => value !== null)
  );

  const options = filteredData.map((row) => row[0]);

  // Força a leitura do valor ATUAL dos inputs
  const valuesArray = getNumberOfColumnsFromHeaders();

  // Adicionar first table
  let lastSection = await addFirstTable(filteredData, options, subheader, tableTitle, valuesArray, isSecondTable, isSampleProfile);

  // Adicionar second table (se houver)
  // (Já está incluída dentro de addFirstTable, mas garantimos a referência)

  // Adicionar extra table se o checkbox estiver marcado
  if (localStorage.getItem('showTable3') === '1') {
    const module = await import('./server/addExtraTable.js');
    lastSection = module.addExtraTable(filteredData, subheader, tableTitle, valuesArray, isSampleProfile, 3, lastSection) || lastSection;
  }
  // Adicionar tabela 4 se o checkbox estiver marcado
  if (localStorage.getItem('showTable4') === '1') {
    const module = await import('./server/addExtraTable.js');
    lastSection = module.addExtraTable(filteredData, subheader, tableTitle, valuesArray, isSampleProfile, 4, lastSection) || lastSection;
  }
  // Adicionar tabela 5 se o checkbox estiver marcado
  if (localStorage.getItem('showTable5') === '1') {
    const module = await import('./server/addExtraTable.js');
    lastSection = module.addExtraTable(filteredData, subheader, tableTitle, valuesArray, isSampleProfile, 5, lastSection) || lastSection;
  }

  // Adicionar gráfico após todas as tabelas
  if (!isSampleProfile) {
    const chartSection = document.getElementById('tableSection');
    // Cria um marcador temporário para inserir o gráfico na posição correta
    const marker = document.createElement('div');
    if (lastSection && lastSection.parentNode) {
      lastSection.parentNode.insertBefore(marker, lastSection.nextSibling);
    } else {
      chartSection.appendChild(marker);
    }
    // Adiciona o gráfico normalmente
    const addChartAndMove = () => {
      addChart(buffer, fileInput.isBar, fileInput.isPie);
      // Move apenas o último gráfico criado
      const chartSections = Array.from(chartSection.querySelectorAll('section')).filter(sec => sec.querySelector('.div-chart'));
      const lastGraphSection = chartSections[chartSections.length - 1];
      if (lastGraphSection) {
        chartSection.insertBefore(lastGraphSection, marker.nextSibling);
      }
      marker.remove();
    };
    setTimeout(addChartAndMove, 0);
  }
}

const addChart = (buffer, isBar, isPie) => {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
  });

  const dataArray = data.map((object) => Object.values(object));

  const tableTitle = data.shift()[0];

  const opcoes = dataArray.map(row => row[0]);
  opcoes.shift();
  opcoes.shift();
  opcoes.shift();
  opcoes.pop();

  const pontos = dataArray.map(row => row[1]);
  pontos.shift();
  pontos.shift();
  pontos.shift();
  pontos.pop();

  if (isBar) {
    const type = 'bar'
    addNewChart(opcoes, pontos, tableTitle, type)
  }

  if (isPie) {
    const type = 'pie'
    addNewChart(opcoes, pontos, tableTitle, type)
  }
}

closeTableOptions.addEventListener('click', () => {
  tableOptions.classList.add('hidden')
  // table2.classList.add('hidden')
})

addPageButton.addEventListener('click', () => {
  fileInput.isSampleProfile = false
  tableOptions.classList.remove('hidden')
})

tableButton1.addEventListener('click', () => {
  if (radioButtons[0].checked) {
    fileInput.isBar = true
    fileInput.isPie = false
  }

  if (radioButtons[1].checked) {
    fileInput.isBar = false
    fileInput.isPie = true
  }

  fileInput.isSecondTable = false
  fileInput.click()
})

// tableButton2.addEventListener('click', () => {
//   table2.classList.remove('hidden')
// })

// Função para obter o número da tabela atualmente selecionada
function getCurrentTableHeaderKey() {
  return 'tableHeaders' + tableHeaderSelector.value;
}

// Atualizar o número exibido no título
if (tableHeaderSelector) {
  tableHeaderSelector.addEventListener('change', () => {
    tableHeaderNumber.textContent = tableHeaderSelector.value;
    loadAllTableHeaders();
  });
}

// Função para criar dinamicamente os blocos de header-items para cada tabela
function renderHeaderItems(containerId, tableKey) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const savedHeaders = localStorage.getItem(tableKey);
  const defaultValues = [
    { text: 'Discriminação', rowspan: 2, colspan: 1, selected: true },
    { text: 'Total', rowspan: 2, colspan: 1, selected: true },
    { text: 'Sexo', rowspan: 1, colspan: 2, selected: true },
    { text: 'Faixa etária', rowspan: 1, colspan: 5, selected: true },
    { text: 'Escolaridade', rowspan: 1, colspan: 4, selected: true },
    { text: 'Renda familiar', rowspan: 1, colspan: 3, selected: true },
    { text: '', rowspan: 1, colspan: 1, selected: false },
    { text: '', rowspan: 1, colspan: 1, selected: false }
  ];
  const headers = savedHeaders ? JSON.parse(savedHeaders) : defaultValues;
  headers.forEach((header, index) => {
    const div = document.createElement('div');
    div.className = 'header-item';

    // Campo de texto editável
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.value = header.text;
    textInput.className = 'header-text';

    // Campo de número editável
    const colspanInput = document.createElement('input');
    colspanInput.type = 'number';
    colspanInput.value = header.colspan;
    colspanInput.className = 'header-colspan';

    // Checkbox editável
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'header-selected';

    // Tabela 1: dois primeiros desabilitados
    if (containerId === 'headers-container-1' && (index === 0 || index === 1)) {
      checkbox.checked = true;
      checkbox.disabled = true;
    }
    // Tabela 2 e 3: apenas o primeiro desabilitado
    else if ((containerId === 'headers-container-2' || containerId === 'headers-container-3') && index === 0) {
      checkbox.checked = true;
      checkbox.disabled = true;
    } else {
      checkbox.checked = !!header.selected;
      checkbox.disabled = false;
    }

    div.appendChild(textInput);
    div.appendChild(colspanInput);
    div.appendChild(checkbox);
    container.appendChild(div);
  });
}

function renderAllHeaderBlocks() {
  renderHeaderItems('headers-container-1', 'tableHeaders1');
  renderHeaderItems('headers-container-2', 'tableHeaders2');
  renderHeaderItems('headers-container-3', 'tableHeaders3');
  renderHeaderItems('headers-container-4', 'tableHeaders4');
  renderHeaderItems('headers-container-5', 'tableHeaders5');
}

// Função para obter os cabeçalhos da tabela do formulário de um container
function getTableHeadersFromContainer(containerId) {
  const headerItems = document.querySelectorAll(`#${containerId} .header-item`);
  const headers = [];
  headerItems.forEach((item, index) => {
    const text = item.querySelector('.header-text').value;
    const colspan = parseInt(item.querySelector('.header-colspan').value);
    let selected = item.querySelector('.header-selected').checked;
    let rowspan = (index === 0 || index === 1) ? 2 : 1;
    // Tabela 1: dois primeiros sempre selecionados
    if (containerId === 'headers-container-1' && (index === 0 || index === 1)) {
      selected = true;
    }
    // Tabela 2 e 3: apenas o primeiro sempre selecionado
    else if ((containerId === 'headers-container-2' || containerId === 'headers-container-3') && index === 0) {
      selected = true;
    }
    headers.push({
      text,
      rowspan,
      colspan,
      selected
    });
  });
  return headers;
}

// Função para salvar todos os headers
function saveAllTableHeaders() {
  localStorage.setItem('tableHeaders1', JSON.stringify(getTableHeadersFromContainer('headers-container-1')));
  localStorage.setItem('tableHeaders2', JSON.stringify(getTableHeadersFromContainer('headers-container-2')));
  localStorage.setItem('tableHeaders3', JSON.stringify(getTableHeadersFromContainer('headers-container-3')));
  localStorage.setItem('tableHeaders4', JSON.stringify(getTableHeadersFromContainer('headers-container-4')));
  localStorage.setItem('tableHeaders5', JSON.stringify(getTableHeadersFromContainer('headers-container-5')));
}

// Função para carregar todos os headers
function loadAllTableHeaders() {
  renderAllHeaderBlocks();
}

// Atualizar export para a primeira tabela
export function getTableHeaders() {
  return getTableHeadersFromContainer('headers-container-1');
}

const sampleProfileDiv = document.querySelector('.sample-profile');

export function addNewPage(tableTitle, isSampleProfile) {
  const a4 = document.createElement("div");
  a4.classList.add("a4");

  const info = document.createElement("div");
  info.classList.add("infoBottom");

  const deleteButton = document.createElement("button");
  deleteButton.classList.add('delete-button');
  deleteButton.classList.add('material-icons');
  deleteButton.innerText = "delete";

  a4.appendChild(deleteButton);
  a4.appendChild(info);

  const inputTitle = document.createElement('div');
  inputTitle.setAttribute('contenteditable', 'True');
  inputTitle.classList.add('multiline-input-no-margin');
  inputTitle.classList.add('text-center');
  inputTitle.innerText = tableTitle;

  a4.appendChild(inputTitle);

  a4.setAttribute('id', 'id_' + (idInt + 1));
  idInt++;

  if (isSampleProfile) {
    sampleProfileDiv.appendChild(a4);
  } else {
    const section = document.createElement("section");
    section.classList.add("container");
    section.appendChild(a4);
    tableSection.appendChild(section);
  }

  return a4;
}

window.addEventListener('DOMContentLoaded', () => {
  saveChanges();
});

