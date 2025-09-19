import { addNewPage } from "./addNewPage.js";

function getColunasAnteriores(position) {
  let total = 0;
  for (let t = 1; t < position; t++) {
    let headers = [];
    try {
      headers = JSON.parse(localStorage.getItem('tableHeaders' + t)) || [];
    } catch (e) { headers = []; }
    // Só soma se a tabela está ativada (checkbox Exibir)
    const showMap = {
      3: localStorage.getItem('showTable3') === '1',
      4: localStorage.getItem('showTable4') === '1',
      5: localStorage.getItem('showTable5') === '1',
      6: localStorage.getItem('showTable6') === '1',
      7: localStorage.getItem('showTable7') === '1',
      8: localStorage.getItem('showTable8') === '1'
    };
    const showTable = t <= 2 ? true : !!showMap[t];
    if (showTable) {
      total += headers.filter(h => h.selected && h.text !== 'Discriminação').reduce((sum, h) => sum + (h.colspan || 1), 0);
    }
  }
  return total;
}

export function addExtraTable(data, subheader, tableTitle, valuesArray, isSampleProfile, position, referenceSection) {
  const maxRowsPerPage = 20;
  const colunasAnteriores = getColunasAnteriores(position);

  let rowsProcessed = 0;
  let lastSection = null;

  while (rowsProcessed < data.length) {
    // Usa o título já numerado recebido
    const newA4Page = addNewPage(tableTitle, isSampleProfile);

    const table = document.createElement('table');
    table.classList.add('table');

    const thead = document.createElement('thead');
    thead.classList.add('tableHead');

    const firstRow = document.createElement('tr');

    let extraTableHeaders = [];
    try {
      extraTableHeaders = JSON.parse(localStorage.getItem('tableHeaders' + position)) || [];
    } catch (e) { extraTableHeaders = []; }
    const selectedHeaders = extraTableHeaders.filter(h => h.selected && h.text !== 'Discriminação');

    const headers = [
      { text: 'Discriminação', rowspan: 2 },
      ...selectedHeaders.map(h => ({ text: h.text, colspan: h.colspan || 1 }))
    ];

    headers.forEach((headerData) => {
      const th = document.createElement('th');
      if (headerData.rowspan) th.setAttribute('rowspan', headerData.rowspan);
      if (headerData.colspan) th.setAttribute('colspan', headerData.colspan);
      const editableInput = document.createElement('input');
      editableInput.setAttribute('type', 'text');
      editableInput.value = headerData.text;
      editableInput.classList.add('editableHeader');
      th.appendChild(editableInput);
      firstRow.appendChild(th);
    });

    const secondRow = document.createElement('tr');
    secondRow.classList.add('headerChild');
    let colIndex = colunasAnteriores + 1;
    selectedHeaders.forEach(header => {
      for (let i = 0; i < header.colspan; i++) {
        const th = document.createElement('th');
        th.textContent = subheader[colIndex] || '';
        secondRow.appendChild(th);
        colIndex++;
      }
    });

    thead.appendChild(firstRow);
    thead.appendChild(secondRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.classList.add('tableBody');

    let pageData = data.slice(rowsProcessed, rowsProcessed + maxRowsPerPage);

    if (isSampleProfile) {
      if (pageData.length > 2) {
        pageData = pageData.slice(-2); // Mantém apenas as duas últimas linhas
      }
      pageData[0][0] = 'Absolutos';
      pageData[1][0] = 'Percentuais (%)';
    }

    for (const [rowIndex, row] of pageData.entries()) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      const options =
        row[0] !== null
          ? row[0].toString().trim().toLowerCase() === 'soma'
            ? 'Total'
            : row[0]
          : 'N/A';
      td.textContent = options;
      tr.appendChild(td);

      const isTotalRow = (options?.toString().trim().toLowerCase() === 'total');

      let colIndex = colunasAnteriores + 1;
      selectedHeaders.forEach(header => {
        for (let i = 0; i < header.colspan; i++) {
          const value = row[colIndex];
          const td = document.createElement('td');

          let formattedValue = '';
          if (isSampleProfile && rowIndex === 0) {
            // Lógica para 'Absolutos' - sem casas decimais
            formattedValue = value !== undefined && value !== null
              ? (value === 0 ? '0' : Math.round(parseFloat(value.toString().replace(',', '.'))).toString())
              : 'N/A';
          } else if (isSampleProfile && rowIndex === 1) {
            // Lógica para 'Percentuais' - com uma casa decimal
            const factor = 10;
            formattedValue = value !== undefined && value !== null
              ? (value === 0 ? '0,0' : (Math.round((parseFloat(value.toString().replace(',', '.'))) * factor) / factor).toFixed(1).replace('.', ','))
              : 'N/A';
          } else if (isTotalRow) {
            // Lógica para a linha 'Total'
            const raw = value !== undefined && value !== null ? value.toString() : '';
            const asNumber = raw !== '' && !isNaN(parseFloat(raw.replace(',', '.')))
              ? parseFloat(raw.replace(',', '.'))
              : null;
            formattedValue = asNumber !== null
              ? asNumber.toFixed(1).replace('.', ',')
              : (value !== undefined && value !== null ? value : '');
          } else {
            // Lógica padrão para as outras linhas
            const _value = value !== undefined && value !== null
              ? (value === 0 ? '0,0' : value.toString().replace('.', ','))
              : 'N/A';
            if (!isNaN(parseFloat(_value.replace(',', '.')))) {
              formattedValue = parseFloat(_value.replace(',', '.')).toFixed(1).replace('.', ',');
            } else {
              formattedValue = _value;
            }
          }
          td.textContent = formattedValue;
          tr.appendChild(td);
          colIndex++;
        }
      });
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    const lastRow = tbody.lastElementChild;
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

    newA4Page.appendChild(table);
    lastSection = newA4Page.closest('section');
    rowsProcessed += maxRowsPerPage;
  }
  return lastSection;
}
