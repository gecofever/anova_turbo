import { addNewPage } from "./addNewPage.js";
import { addExtraTable } from "./addExtraTable.js";

export function addSecondTable(data, subheader, tableTitle, valuesArray, isSecondTable, isSampleProfile) {
  const maxRowsPerPage = 20;

  let rowsProcessed = 0;
  let currentPage = 1;

  // Obter headers da Tabela 1 do localStorage e calcular o índice inicial correto
  let table1Headers = [];
  try {
    table1Headers = JSON.parse(localStorage.getItem('tableHeaders1')) || [];
  } catch (e) {
    table1Headers = [];
  }
  // Filtrar apenas os selecionados
  const selectedTable1Headers = table1Headers.filter(h => h.selected);
  // Somar todos os colspans dos headers selecionados
  const table1HeadersCount = selectedTable1Headers.reduce((sum, h) => sum + (h.colspan || 1), 0);

  // Filtrar headers da Tabela 2 para renderizar apenas os selecionados
  let table2Headers = [];
  try {
    table2Headers = JSON.parse(localStorage.getItem('tableHeaders2')) || [];
  } catch (e) {
    table2Headers = [];
  }
  const selectedTable2Headers = table2Headers.filter(h => h.selected);

  // Atualizar zoneColspan e ruralColspan conforme headers selecionados
  let zoneColspan = 0;
  let ruralColspan = 0;
  let ruralLocations = isSampleProfile ? 'Bairros / Sítios' : 'Localidades rurais';
  let hasZona = false;
  let hasRurais = false;
  selectedTable2Headers.forEach(h => {
    if (h.text === 'Zona') {
      hasZona = true;
    }
    if (h.text === 'Localidades rurais' || h.text === 'Sitios') {
      hasRurais = true;
    }
  });
  // Lógica para colspan dinâmico
  if (hasZona && hasRurais) {
    // Ambos marcados: cada um usa seu próprio colspan
    zoneColspan = selectedTable2Headers.find(h => h.text === 'Zona')?.colspan || 1;
    ruralColspan = selectedTable2Headers.find(h => h.text === 'Localidades rurais')?.colspan || 1;
  } else if (hasZona && !hasRurais) {
    // Só Zona: ocupa tudo
    zoneColspan = 18;
    ruralColspan = 0;
  } else if (!hasZona && hasRurais) {
    // Só Localidades rurais: ocupa tudo
    zoneColspan = 0;
    ruralColspan = 18;
  } else {
    // Nenhum: ambos zero
    zoneColspan = 0;
    ruralColspan = 0;
  }
  // Montar headers dinamicamente
  const headers = [];
  selectedTable2Headers.forEach(h => {
    if (h.text === 'Discriminação') {
      headers.push({ text: h.text, rowspan: 2 });
    } else if (h.text === 'Zona' && hasZona) {
      headers.push({ text: h.text, colspan: zoneColspan });
    } else if (h.text === 'Localidades rurais' && hasRurais) {
      headers.push({ text: ruralLocations, colspan: ruralColspan });
    } else {
      headers.push({ text: h.text, colspan: h.colspan || 1 });
    }
  });

  let lastSection = null;
  while (rowsProcessed < data.length) {
    const newA4Page = addNewPage(tableTitle, isSampleProfile);

    const newTable = document.createElement('table');
    newTable.classList.add('table');

    const thead = document.createElement('thead');
    thead.classList.add('tableHead');

    // Cabeçalho dinâmico conforme o código original do usuário
    const firstRow = document.createElement('tr');

    const hasUrbana = subheader.includes('Urbana') || subheader.includes('Urbano');
    const hasRural = subheader.includes('Rural');

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

    // Segunda linha do cabeçalho (subheaders para grupos)
    const secondRow = document.createElement('tr');
    secondRow.classList.add('headerChild');
    // Gerar subheaders para todos os headers com colspan > 1 (exceto Discriminação)
    let subheaderOffset = table1HeadersCount;
    headers.forEach(header => {
      if (header.text !== 'Discriminação' && header.colspan > 1) {
        for (let i = 0; i < header.colspan; i++) {
          const th = document.createElement('th');
          th.textContent = subheader[subheaderOffset + i] || '';
          secondRow.appendChild(th);
        }
        subheaderOffset += header.colspan;
      } else if (header.text !== 'Discriminação' && header.colspan === 1) {
        subheaderOffset += 1;
      }
    });

    thead.appendChild(firstRow);
    if (secondRow.children.length > 0) {
      thead.appendChild(secondRow);
    }

    newTable.appendChild(thead);

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
          ? row[0] === 'soma' || row[0] === 'SOMA' || row[0] === 'Soma'
            ? 'Total'
            : row[0]
          : 'N/A';

      td.textContent = options;
      tr.appendChild(td);

      if (isSecondTable) {
        row.forEach((value, index) => {
          if (index > valuesArray[0] && index <= ((valuesArray[0]) + (valuesArray[1]))) {
            const td = document.createElement('td');
            const factor = 10;
            if (isSampleProfile) {
              let formattedValue;
              if (rowIndex === 1) { // Percentuais (%)
                formattedValue = value !== null
                  ? (value === 0 ? '0,0' : (Math.round(parseFloat(value.toString().replace(',', '.')) * factor) / factor).toFixed(1))
                  : 'N/A';
              } else if (rowIndex === 0) { // Absolutos
                formattedValue = value !== null
                  ? (value === 0 ? '0' : Math.round(parseFloat(value.toString().replace(',', '.'))).toString())
                  : 'N/A';
              } else {
                formattedValue = value !== null
                  ? (value === 0 ? '0' : value.toString())
                  : 'N/A';
              }
              td.textContent = formattedValue.toString().replace('.', ',');
            } else {
              const _value = value !== null
                ? (value === 0 ? '0,0' : value.toString().replace('.', ','))
                : 'N/A';

              if (!isNaN(parseFloat(_value))) {
                const val = parseFloat(_value.replace(',', '.')).toFixed(1);
                td.textContent = val.toString().replace('.', ',');
              } else {
                td.textContent = _value;
              }
            }

            tr.appendChild(td);
          }
        });
      } else {
        let colIndex = table1HeadersCount;
        headers.forEach(header => {
          if (header.text !== 'Discriminação') {
            for (let i = 0; i < (header.colspan || 1); i++) {
              if (colIndex < row.length) {
                const value = row[colIndex];
                const td = document.createElement('td');
                const factor = 10;
                if (isSampleProfile) {
                  let formattedValue;
                  if (rowIndex === 1) { // Percentuais (%)
                    formattedValue = value !== null
                      ? (value === 0 ? '0,0' : (Math.round(parseFloat(value.toString().replace(',', '.')) * factor) / factor).toFixed(1))
                      : 'N/A';
                  } else if (rowIndex === 0) { // Absolutos
                    formattedValue = value !== null
                      ? (value === 0 ? '0' : Math.round(parseFloat(value.toString().replace(',', '.'))).toString())
                      : 'N/A';
                  } else {
                    formattedValue = value !== null
                      ? (value === 0 ? '0' : value.toString())
                      : 'N/A';
                  }
                  td.textContent = formattedValue.toString().replace('.', ',');
                } else {
                  const _value = value !== null
                    ? (value === 0 ? '0,0' : value.toString().replace('.', ','))
                    : 'N/A';

                  if (!isNaN(parseFloat(_value))) {
                    const val = parseFloat(_value.replace(',', '.')).toFixed(1);
                    td.textContent = val.toString().replace('.', ',');
                  } else {
                    td.textContent = _value;
                  }
                }
                tr.appendChild(td);
                colIndex++;
              }
            }
          }
        });
      }

      tbody.appendChild(tr);
    }

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

    newTable.appendChild(tbody);
    newA4Page.appendChild(newTable);

    // Salvar referência do último section criado
    lastSection = newA4Page.closest('section');

    rowsProcessed += maxRowsPerPage;
    currentPage++;
  }

  if (isSecondTable) {
    for (let i = 2; i <= 8; i++) {
      const showMap = {
        2: true, // Tabela 2 está ativa neste fluxo
        3: localStorage.getItem('showTable3') === '1',
        4: localStorage.getItem('showTable4') === '1',
        5: localStorage.getItem('showTable5') === '1',
        6: localStorage.getItem('showTable6') === '1',
        7: localStorage.getItem('showTable7') === '1',
        8: localStorage.getItem('showTable8') === '1',
      };
      if (valuesArray[i - 1] === 0) {
        return lastSection;
      }
      if (showMap[i]) {
        lastSection = addExtraTable(data, subheader, tableTitle, valuesArray, isSampleProfile, i, lastSection) || lastSection;
      }
    }
  }
  return lastSection;
}
