const tableSection = document.getElementById("tableSection");
const chartSection = document.getElementById("chartSection");
const sampleProfileSection = document.getElementById("sampleProfileSection");
import { decrementTableCounter } from "./addFirstTable";

let idInt = 0;

export function addNewPage(tableTitle, isSampleProfile) {
  const section = document.createElement("section");
  section.classList.add("container");

  const a4 = document.createElement("div");
  a4.classList.add("a4");

  const info = document.createElement("div");
  info.classList.add("infoBottom");

  const deleteButton = document.createElement("button");
  deleteButton.classList.add('delete-button')
  deleteButton.classList.add('material-icons')
  deleteButton.innerText = "delete"

  a4.appendChild(deleteButton);

  a4.appendChild(info);

  const inputTitle = document.createElement('div');
  inputTitle.setAttribute('contenteditable', 'True');
  inputTitle.classList.add('multiline-input-no-margin');
  inputTitle.classList.add('text-center');
  inputTitle.innerText = tableTitle;

  a4.appendChild(inputTitle);

  a4.setAttribute('id', 'id_' + idInt + 1);
  idInt++

  section.appendChild(a4);

  if (isSampleProfile) {
    return sampleProfileSection
  } else {
    tableSection.appendChild(section);
    return a4
  }
};

tableSection.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-button')) {
    const pageToRemoveId = event.target.closest('.a4').id;
    const pageToRemove = document.getElementById(pageToRemoveId);
    if (pageToRemove) {
      pageToRemove.remove();
    }
  }
});

chartSection.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-button')) {
    const pageToRemoveId = event.target.closest('.a4').id;
    const pageToRemove = document.getElementById(pageToRemoveId);
    if (pageToRemove) {
      pageToRemove.remove();
    }
  }
});
