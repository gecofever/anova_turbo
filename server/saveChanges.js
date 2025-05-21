const floatingForm = document.getElementById('floatingForm')

const cityInput = document.getElementById('city')
const cityValueSpans = document.querySelectorAll('.cityValue')

const numberInterviewsInput = document.getElementById('numberInterviews')
const numberInterviewsValueSpan = document.getElementById('numberInterviewsValue')

const copyrightInput = document.getElementById('copyright')
const copyrightValueSpan = document.getElementById('copyrightValue')

export const saveChanges = () => {
  const cityValue = cityInput.value || 'Cidade'
  const numberInterviewsValue = numberInterviewsInput.value || '0'
  const copyrightValue = copyrightInput.value || ''

  cityValueSpans.forEach((span) => {
    span.textContent = cityValue
  })

  numberInterviewsValueSpan.textContent = numberInterviewsValue
  copyrightValueSpan.textContent = copyrightValue

  floatingForm.classList.add('hidden')
}
