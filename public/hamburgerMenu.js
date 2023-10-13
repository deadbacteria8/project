document.addEventListener('DOMContentLoaded', function () {
  const nav = document.getElementsByClassName('nav')[0]
  const barsIcon = document.querySelector('i.fa.fa-bars')
  const aElements = document.querySelectorAll('nav ul li a')
  barsIcon.addEventListener('click', function () {
    const existingNavDiv = document.getElementById('navDiv')
    const newDiv = document.createElement('div')
    newDiv.id = 'navDiv'
    if (!existingNavDiv) {
      aElements.forEach((anchor) => {
        const divInside = document.createElement('div')
        divInside.className = 'hamburger-div-item'
        const newAnchor = document.createElement('a')

        newAnchor.href = anchor.href

        newAnchor.textContent = anchor.textContent
        divInside.appendChild(newAnchor)
        newDiv.appendChild(divInside)
      })
      const header = nav.parentElement

      header.insertBefore(newDiv, nav.nextSibling)
    } else {
      existingNavDiv.parentElement.removeChild(existingNavDiv)
    }
  })
})
