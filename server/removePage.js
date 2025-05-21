export const removePage = (valuesArray) => {
  const tableSection = document.getElementById('tableSection')
  if (tableSection) {
    const divs = tableSection.querySelectorAll('.a4')
    const div_1 = divs[divs.length - 1]
    const div_2 = divs[divs.length - 2]
    const div_3 = divs[divs.length - 3]
    const div_4 = divs[divs.length - 4]

    if (div_1) {
      div_1.remove()
      div_2.remove()
      if (valuesArray[2] !== 0) div_3.remove()
      if (valuesArray[3] !== 0) div_4.remove()
    }
  }
}
