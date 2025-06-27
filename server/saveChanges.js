const floatingForm = document.getElementById('floatingForm')

const cityInput = document.getElementById('city')
const cityValueSpans = document.querySelectorAll('.cityValue')

const numberInterviewsInput = document.getElementById('numberInterviews')
const numberInterviewsValueSpan = document.getElementById('numberInterviewsValue')

const copyrightInput = document.getElementById('copyright')
const copyrightValueSpan = document.getElementById('copyrightValue')

export const saveChanges = () => {
  const cityValue = cityInput?.value || 'Cidade'
  const numberInterviewsValue = numberInterviewsInput?.value || '0'
  const copyrightValue = copyrightInput?.value || ''

  if (cityValueSpans) {
    cityValueSpans.forEach((span) => {
      span.textContent = cityValue
    })
  }

  if (numberInterviewsValueSpan) {
    numberInterviewsValueSpan.textContent = numberInterviewsValue
  }
  if (copyrightValueSpan) {
    copyrightValueSpan.textContent = copyrightValue
  }
}

if (cityInput) cityInput.addEventListener('input', saveChanges)
if (numberInterviewsInput) numberInterviewsInput.addEventListener('input', saveChanges)
if (copyrightInput) copyrightInput.addEventListener('input', saveChanges)
