import { addNewPage } from "./addNewPage.js";
import { addSecondTable } from "./addSecondTable.js";
import { getTableHeaders } from "../main.js";

let tableCounter = 1;

export async function addFirstTable(filteredData, options, subheader, tableTitle, valuesArray, isSecondTable, isSampleProfile) {
  const maxRowsPerPage = 20;
  let rowsProcessed = 0;
  let currentPage = 1;
  let tableNumberTitle = `Tabela ${tableCounter}: ${tableTitle}`;
  let lastSection = null;

  const columnTitles = [
    'Discriminação',
    'Total',
    'MAS', 'FEM',
    'Até 19', '20 a 29 anos', '30 a 29 anos', '40 a 49 anos', '50 a 59 anos', '60 ou mais anos',
    'Analfabeto', '1º Grau', '2º Grau', 'Superior',
    'Até 1 S.M.', 'De 1 a 3 S.M.', 'Mais de 3 S.M.'
  ];

  // Obter os cabeçalhos personalizados
  let headers = getTableHeaders();

  // Filtrar apenas os cabeçalhos selecionados
  headers = headers.filter(h => h.selected);

  // Se não houver cabeçalhos selecionados, usar os padrões
  if (headers.length === 0) {
    headers.push(
      { text: 'Discriminação', rowspan: 2, colspan: 1 },
      { text: 'Total', rowspan: 2, colspan: 1 },
      { text: 'Sexo', rowspan: 1, colspan: 2 },
      { text: 'Faixa etária', rowspan: 1, colspan: 5 },
      { text: 'Escolaridade', rowspan: 1, colspan: 4 },
      { text: 'Renda familiar', rowspan: 1, colspan: 3 }
    );
  }

  // Separar as colunas Discriminação e Total das demais
  const discrimTotalHeaders = headers.filter(h => h.text === 'Discriminação' || h.text === 'Total');
  const otherHeaders = headers.filter(h => h.text !== 'Discriminação' && h.text !== 'Total');

  // Calcular o número total de colunas baseado nos cabeçalhos selecionados (excluindo Discriminação e Total)
  const totalColumns = otherHeaders.reduce((sum, header) => sum + header.colspan, 0);

  while (rowsProcessed < filteredData.length) {
    const newA4Page = addNewPage(tableNumberTitle, isSampleProfile);
    const newTable = document.createElement('table');
    newTable.className = 'table';

    // Criar o cabeçalho da tabela
    const thead = document.createElement('thead');
    thead.className = 'tableHead';

    // Primeira linha do cabeçalho
    const firstRow = document.createElement('tr');

    // Adicionar Discriminação e Total primeiro
    discrimTotalHeaders.forEach(header => {
      const th = document.createElement('th');
      th.rowSpan = header.rowspan;
      th.colSpan = header.colspan;
      th.textContent = header.text;
      firstRow.appendChild(th);
    });

    // Adicionar os demais cabeçalhos
    otherHeaders.forEach(header => {
      const th = document.createElement('th');
      th.rowSpan = header.rowspan;
      th.colSpan = header.colspan;
      th.textContent = header.text;
      firstRow.appendChild(th);
    });
    thead.appendChild(firstRow);

    // Segunda linha do cabeçalho (apenas para cabeçalhos com rowspan = 1)
    if (otherHeaders.some(h => h.rowspan === 1)) {
      const secondRow = document.createElement('tr');
      // Mapear os títulos de cada grupo
      const groupTitles = {
        'Sexo': ['MAS', 'FEM'],
        'Faixa etária': ['Até 19', '20 a 29 anos', '30 a 29 anos', '40 a 49 anos', '50 a 59 anos', '60 ou mais anos'],
        'Graú de Instrução': ['Analfabeto', '1º Grau', '2º Grau', 'Superior'],
        'Graú de instrução': ['Analfabeto', '1º Grau', '2º Grau', 'Superior'],
        'Grau de Instrução': ['Analfabeto', '1º Grau', '2º Grau', 'Superior'],
        'Grau de instrução': ['Analfabeto', '1º Grau', '2º Grau', 'Superior'],
        'Escolaridade': ['Analfabeto', '1º Grau', '2º Grau', 'Superior'],
        'Renda familiar': ['Até 1 S.M.', 'De 1 a 3 S.M.', 'Mais de 3 S.M.']
      };
      otherHeaders.forEach(header => {
        if (header.rowspan === 1) {
          const titles = groupTitles[header.text] || [];
          for (let i = 0; i < header.colspan; i++) {
            const th = document.createElement('th');
            th.className = 'headerChild';
            th.textContent = titles[i] || '';
            secondRow.appendChild(th);
          }
        }
      });
      thead.appendChild(secondRow);
    }

    newTable.appendChild(thead);

    // Criar o corpo da tabela
    const tbody = document.createElement('tbody');
    tbody.className = 'tableBody';

    let pageData = filteredData.slice(rowsProcessed, rowsProcessed + maxRowsPerPage);
    let pageOptions = options.slice(rowsProcessed, rowsProcessed + maxRowsPerPage);

    if (isSampleProfile) {
      if (pageData.length > 2) {
        pageData = pageData.slice(-2);
        pageOptions = pageOptions.slice(-2);
      }
      pageOptions[0] = 'Absolutos';
      pageOptions[1] = 'Percentuais (%)';
    }

    for (let i = 0; i < pageData.length; i++) {
      const row = pageData[i];
      const tr = document.createElement('tr');

      // Adicionar a coluna Discriminação (opção)
      const tdDiscrim = document.createElement('td');
      const optionText = pageOptions[i] === 'Soma' || pageOptions[i] === 'SOMA' || pageOptions[i] === 'soma'
        ? 'Total'
        : pageOptions[i];
      tdDiscrim.textContent = optionText;
      tr.appendChild(tdDiscrim);

      // Adicionar a coluna Total
      const tdTotal = document.createElement('td');
      let totalValue = 0;
      const factor = 10;

      if (isSampleProfile) {
        if (i === 1) { // Segunda linha - Percentuais (%)
          const _value = row[1] !== null
            ? (row[1] === 0 ? '0,0' : (Math.round((parseFloat(row[1].toString().replace(',', '.'))) * factor) / factor).toFixed(1))
            : 'N/A';
          totalValue = _value.toString().replace('.', ',');
        } else if (i === 0) { // Primeira linha - Absolutos
          const _value = row[1] !== null
            ? (row[1] === 0 ? '0' : Math.round(parseFloat(row[1].toString().replace(',', '.'))).toString())
            : 'N/A';
          totalValue = _value.toString().replace('.', ',');
        } else {
          const _value = row[1] !== null
            ? (row[1] === 0 ? '0' : row[1].toString())
            : 'N/A';
          totalValue = _value.toString().replace('.', ',');
        }
      } else {
        const _value = row[1] !== null
          ? (row[1] === 0 ? '0,0' : row[1].toString().replace('.', ','))
          : 'N/A';

        if (!isNaN(parseFloat(_value))) {
          const val = parseFloat(_value.replace(',', '.')).toFixed(1);
          totalValue = val.toString().replace('.', ',');
        } else {
          totalValue = _value;
        }
      }
      tdTotal.textContent = totalValue;
      tr.appendChild(tdTotal);

      // Adicionar as demais colunas
      for (let j = 2; j < Math.min(row.length, totalColumns + 2); j++) {
        const td = document.createElement('td');
        let value = 0;
        const factor = 10;

        if (isSampleProfile) {
          if (i === 1) { // Segunda linha - Percentuais (%)
            const _value = row[j] !== null
              ? (row[j] === 0 ? '0,0' : (Math.round((parseFloat(row[j].toString().replace(',', '.'))) * factor) / factor).toFixed(1))
              : 'N/A';
            value = _value.toString().replace('.', ',');
          } else if (i === 0) { // Primeira linha - Absolutos
            const _value = row[j] !== null
              ? (row[j] === 0 ? '0' : Math.round(parseFloat(row[j].toString().replace(',', '.'))).toString())
              : 'N/A';
            value = _value.toString().replace('.', ',');
          } else {
            const _value = row[j] !== null
              ? (row[j] === 0 ? '0' : row[j].toString())
              : 'N/A';
            value = _value.toString().replace('.', ',');
          }
        } else {
          const _value = row[j] !== null
            ? (row[j] === 0 ? '0,0' : row[j].toString().replace('.', ','))
            : 'N/A';

          if (!isNaN(parseFloat(_value))) {
            const val = parseFloat(_value.replace(',', '.')).toFixed(1);
            value = val.toString().replace('.', ',');
          } else {
            value = _value;
          }
        }

        td.textContent = value;
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    const lastRow = tbody.lastElementChild;
    if (lastRow) {
      const firstCellText = lastRow.firstElementChild.textContent
        .trim()
        .toLocaleLowerCase();

      if (firstCellText === 'total') {
        lastRow.classList.add('totalRow');

        lastRow.querySelectorAll('td').forEach(cell => {
          cell.contentEditable = 'true';
          cell.classList.add('multiline-input');
        });
      }
    }

    newTable.appendChild(tbody);
    newA4Page.appendChild(newTable);
    lastSection = newA4Page.closest('section');
    rowsProcessed += maxRowsPerPage;
    currentPage++;

    if (rowsProcessed >= filteredData.length && valuesArray[1] > 0) {
      lastSection = addSecondTable(filteredData, subheader, tableNumberTitle, valuesArray, isSecondTable, isSampleProfile) || lastSection;
    }

    if (!isSampleProfile) {
      tableCounter++;
    }
  }
  return lastSection;
}

export function decrementTableCounter() {
  if (tableCounter > 1) {
    tableCounter--;
  }
}
