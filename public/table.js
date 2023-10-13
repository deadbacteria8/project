document.addEventListener('DOMContentLoaded', function () {
  const tableElements = document.querySelectorAll('.reportItem')
  for (const item of tableElements) {
    item.addEventListener('click', () => {
      const statusElement = item.querySelector('.rowStatus')

      if (statusElement.innerHTML === reportStatus) {
        let link = item.getAttribute('data-link')
        console.log(link)
        link = window.location.href + '/' + link
        window.location.href = link
      }
    })
  }
})
