//import flatpickr from 'flatpickr';

document.addEventListener('DOMContentLoaded', function () {
    const defaultPickers = document.getElementsByClassName('special');
    const toggleButton = document.getElementById('toggleButton');
    const ulItem = document.getElementById('items');
    const span = document.getElementById('span');
    let dateSelected;
    let rangeDateSelected;
    const submit = document.getElementById('submit');
    const reportFrequencySelect = document.getElementById('report-frequency');
    const reportFrequencyParent = reportFrequencySelect.parentNode;
    const selectElement = document.createElement('select');

    for (let i = 0; i < 24; i++) {
        const option = document.createElement('option');
        let hour = i.toString();
        hour = i < 10 ? `0${hour}:00` : `${hour}:00`;
        option.value = hour;
        option.innerHTML = hour;
        selectElement.appendChild(option);
    }

    reportFrequencyParent.appendChild(selectElement);
    
    toggleButton.addEventListener('click', function () {
        for (const defaultPicker of defaultPickers) {
            if (defaultPicker.style.display === 'block') {
                defaultPicker.style.display = 'none';
            } else {
                defaultPicker.style.display = 'block';
            }
        }
    
        toggleButton.innerHTML = (toggleButton.innerHTML === 'Default date-selection') ? 'Customized date-selection' : 'Default date-selection';
    });
    
    
    span.addEventListener('click', function () {
        ulItem.classList.toggle('hidden');
    })
    
    flatpickr("#date-picker", {
        dateFormat: "Y-m-d",
        minDate: "today",
        mode: "multiple",
        altInput: true,
        static: true,
        inline: true,
        enableTime: true,
        time_24hr: true,
        onChange: function(selectedDates, dateStr, instance) {
            dateSelected = [selectedDates];
            console.log(dateSelected);
        }
    });
    


    flatpickr("#range-picker", {
        dateFormat: "Y-m-d",
        minDate: "today",
        altInput: true,
        static: true,
        inline: true,
        mode: "range",
        onClose: function(selectedDates, dateStr, instance) {
            rangeDateSelected = [selectedDates[0],selectedDates[1]];
        }
    });



    reportFrequencySelect.addEventListener('change', function () {
        const selectedValue = reportFrequencySelect.value;
        const daysOfWeekSelect = document.getElementById('daysOfWeekSelect');
        console.log(daysOfWeekSelect);
        if (selectedValue !== "daily" && !daysOfWeekSelect) {
            const daysOfWeekSelect = document.createElement('select');
            daysOfWeekSelect.id = 'daysOfWeekSelect';
            const daysOfWeekOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            daysOfWeekOptions.forEach(function (day) {
                const option = document.createElement('option');
                option.value = day.toLowerCase();
                option.textContent = day;
                daysOfWeekSelect.appendChild(option);
            });

            reportFrequencyParent.appendChild(daysOfWeekSelect);
        } else {
            if (selectedValue == "daily" && daysOfWeekSelect) {
                daysOfWeekSelect.remove();
            }
        }
    });



    

    submit.addEventListener('click', () => {
        const itemsList = document.getElementById('items');

        const checkboxes = itemsList.querySelectorAll('#items input[type="checkbox"]:checked');
        const data = {
            employees_id: checkboxes,
            customized: false,
            dateRange: rangeDateSelected,
            frequency: reportFrequencySelect.value,
            hour: selectElement.value,
            dayOfWeek: document.getElementById('daysOfWeekSelect')
        }
        fetch('/createproject', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    });
});





