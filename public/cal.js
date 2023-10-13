document.addEventListener('DOMContentLoaded', function () {
  const defaultPickers = document.getElementsByClassName('default')
  const specialPickers = document.getElementsByClassName('special')
  const toggleButton = document.getElementById('toggleButton')
  const ulItem = document.getElementById('items')
  const span = document.getElementById('span')
  let dateSelected
  let rangeDateSelected
  const submit = document.getElementById('submit')
  const submitCustomized = document.getElementById('submitCustomized')
  const reportFrequencySelect = document.getElementById('report-frequency')
  const reportFrequencyParent = reportFrequencySelect.parentNode
  const selectElement = document.createElement('select')
  const titleElement = document.getElementById('title')

  changeAppearance(specialPickers, 'none')

  for (let i = 0; i < 24; i++) {
    const option = document.createElement('option')
    let hour = i.toString()
    hour = i < 10 ? `0${hour}:00` : `${hour}:00`
    option.value = hour
    option.innerHTML = hour
    selectElement.appendChild(option)
  }

  reportFrequencyParent.appendChild(selectElement)

  toggleButton.addEventListener('click', function () {
    if (defaultPickers[0].style.display !== 'none') {
      changeAppearance(defaultPickers, 'none')
      changeAppearance(specialPickers, 'block')
    } else {
      changeAppearance(specialPickers, 'none')
      changeAppearance(defaultPickers, 'block')
    }

    toggleButton.innerHTML =
      toggleButton.innerHTML === 'Default date-selection'
        ? 'Customized date-selection'
        : 'Default date-selection'
  })

  span.addEventListener('click', function () {
    ulItem.classList.toggle('hidden')
  })

  flatpickr('#date-picker', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    mode: 'multiple',
    altInput: true,
    static: true,
    inline: true,
    enableTime: true,
    time_24hr: true,
    onChange: function (selectedDates, dateStr, instance) {
      dateSelected = [selectedDates]
    },
  })

  flatpickr('#range-picker', {
    dateFormat: 'Y-m-d',
    minDate: 'today',
    altInput: true,
    static: true,
    inline: true,
    mode: 'range',
    onClose: function (selectedDates, dateStr, instance) {
      rangeDateSelected = [selectedDates[0], selectedDates[1]]
    },
  })

  reportFrequencySelect.addEventListener('change', function () {
    const selectedValue = reportFrequencySelect.value
    const daysOfWeekSelect = document.getElementById('daysOfWeekSelect')
    if (selectedValue !== 'daily' && !daysOfWeekSelect) {
      const daysOfWeekSelect = document.createElement('select')
      daysOfWeekSelect.id = 'daysOfWeekSelect'
      const daysOfWeekOptions = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]

      daysOfWeekOptions.forEach(function (day) {
        const option = document.createElement('option')
        option.value = day.toLowerCase()
        option.textContent = day
        daysOfWeekSelect.appendChild(option)
      })

      reportFrequencyParent.appendChild(daysOfWeekSelect)
    } else {
      if (selectedValue === 'daily' && daysOfWeekSelect) {
        daysOfWeekSelect.remove()
      }
    }
  })

  function sendPostRequest(data) {
    const messageDiv = document.createElement('div')
    messageDiv.className = 'msg'
    const pInsideElement = document.createElement('p')
    const mainDiv = document.getElementsByClassName('maindiv')[0]
    const existingMsgDiv = mainDiv.querySelector('.msg')
    if (existingMsgDiv) {
      mainDiv.removeChild(existingMsgDiv)
    }
    fetch('/createproject', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response.json()
      })
      .then((responseData) => {
        pInsideElement.innerHTML = responseData.success
      })
      .catch((error) => {
        pInsideElement.innerHTML = 'unsuccessful'
        console.log(error)
      })
    messageDiv.appendChild(pInsideElement)
    mainDiv.insertBefore(messageDiv, mainDiv.firstChild)
  }

  submit.addEventListener('click', () => {
    const itemsList = document.getElementById('items')
    const day = document.getElementById('daysOfWeekSelect')?.value || ''
    const checkboxes = Array.from(
      itemsList.querySelectorAll('#items input[type="checkbox"]:checked'),
    )
    const selectedValues = checkboxes.map((checkbox) => checkbox.value)

    const data = {
      employees_id: selectedValues,
      customized: false,
      dateRange: rangeDateSelected,
      frequency: reportFrequencySelect.value,
      hour: selectElement.value,
      dayOfWeek: day,
      title: titleElement.value,
    }

    sendPostRequest(data)
  })

  function changeAppearance(elements, appearance) {
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = appearance
    }
  }

  submitCustomized.addEventListener('click', () => {
    const itemsList = document.getElementById('items')
    const checkboxes = Array.from(
      itemsList.querySelectorAll('#items input[type="checkbox"]:checked'),
    )
    const selectedValues = checkboxes.map((checkbox) => checkbox.value)

    const data = {
      employees_id: selectedValues,
      customized: true,
      dateSelected,
      title: titleElement.value,
    }

    sendPostRequest(data)
  })
})
