export const removeChart = () => {
  const chartSection = document.getElementById('chartSection')
  if (chartSection) {    
    const divs = chartSection.querySelectorAll('.a4')
    const lastDiv = divs[divs.length - 1]

    if (lastDiv) {
      lastDiv.remove()
    }    
  }
}
