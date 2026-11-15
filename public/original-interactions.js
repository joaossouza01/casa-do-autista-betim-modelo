
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const hero = document.querySelector('[data-hero]')
if (hero) {
  const slides = [...hero.querySelectorAll('[data-slide]')]
  const control = hero.querySelector('[data-carousel-toggle]')
  const count = hero.querySelector('#banner-count')
  let index = 0
  let paused = reducedMotion.matches
  let pointerInside = false
  let timer

  function showSlide(next) {
    index = (next+slides.length)%slides.length
    slides.forEach((slide,i)=>{
      const active = i===index
      slide.classList.toggle('is-active',active)
      slide.inert = !active
      slide.setAttribute('aria-hidden',String(!active))
    })
    count.textContent = (index+1)+' / '+slides.length
  }
  function schedule() {
    clearTimeout(timer)
    if (paused || pointerInside || document.hidden || document.activeElement.closest('[data-slide]')) return
    timer = setTimeout(()=>{
      showSlide(index+1)
      schedule()
    },5500)
  }
  function updateControl() {
    control.textContent = paused?'▶':'Ⅱ'
    control.setAttribute('aria-label',paused?'Reproduzir banners':'Pausar banners')
    schedule()
  }
  hero.querySelectorAll('[data-carousel-move]').forEach(button=>{
    button.addEventListener('click',()=>{
      showSlide(index+Number(button.dataset.carouselMove))
      schedule()
    })
  })
  control.addEventListener('click',()=>{
    paused = !paused
    if (!paused) pointerInside = false
    updateControl()
  })
  hero.addEventListener('pointerenter',event=>{
    if (event.pointerType==='mouse') { pointerInside=true; schedule() }
  })
  hero.addEventListener('pointerleave',()=>{ pointerInside=false; schedule() })
  hero.addEventListener('focusin',schedule)
  hero.addEventListener('focusout',()=>queueMicrotask(schedule))
  document.addEventListener('visibilitychange',schedule)
  reducedMotion.addEventListener('change',event=>{paused=event.matches;updateControl()})

  let touch
  hero.addEventListener('touchstart',event=>{
    if (event.target.closest('a,button')) return
    touch = event.changedTouches[0]
  },{passive:true})
  hero.addEventListener('touchend',event=>{
    if (!touch) return
    const point = event.changedTouches[0]
    const dx = point.clientX-touch.clientX
    const dy = point.clientY-touch.clientY
    touch = undefined
    if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)) {
      showSlide(index+(dx<0?1:-1))
      schedule()
    }
  },{passive:true})
  hero.addEventListener('touchcancel',()=>{touch=undefined})
  updateControl()
}

const tablist = document.querySelector('.about-tabs')
if (tablist) {
  const tabs = [...tablist.querySelectorAll('[role=tab]')]
  function selectTab(index) {
    tabs.forEach((tab,i)=>{
      const active=i===index
      tab.setAttribute('aria-selected',String(active))
      tab.tabIndex=active?0:-1
      document.getElementById(tab.getAttribute('aria-controls')).hidden=!active
    })
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectTab(index))
    tab.addEventListener('keydown',event=>{
      const next={ArrowLeft:(index+tabs.length-1)%tabs.length,ArrowRight:(index+1)%tabs.length,Home:0,End:tabs.length-1}[event.key]
      if (next===undefined) return
      event.preventDefault()
      selectTab(next)
      tabs[next].focus()
    })
  })
}

const gallery = document.querySelector('#gallery-dialog')
const galleryLinks = [...document.querySelectorAll('[data-gallery-image]')]
if (gallery && galleryLinks.length) {
  let selected = 0
  let trigger
  const image=gallery.querySelector('#gallery-photo')
  const counter=gallery.querySelector('#gallery-count')
  function showPhoto(index) {
    selected=(index+galleryLinks.length)%galleryLinks.length
    image.src=galleryLinks[selected].href
    image.alt='Foto '+(selected+1)+' da galeria da Casa dos Autistas'
    counter.textContent=(selected+1)+' / '+galleryLinks.length
  }
  galleryLinks.forEach((link,index)=>{
    link.addEventListener('click',event=>{
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      trigger=link
      showPhoto(index)
      gallery.showModal()
    })
  })
  gallery.querySelector('[data-gallery-close]').addEventListener('click',()=>gallery.close())
  gallery.querySelectorAll('[data-gallery-move]').forEach(button=>
    button.addEventListener('click',()=>showPhoto(selected+Number(button.dataset.galleryMove))))
  gallery.addEventListener('keydown',event=>{
    if (event.key==='ArrowLeft' || event.key==='ArrowRight') {
      event.preventDefault()
      showPhoto(selected+(event.key==='ArrowRight'?1:-1))
    }
  })
  gallery.addEventListener('close',()=>trigger?.focus())
}

const bookCarousel=document.querySelector('.book-carousel')
if (bookCarousel) {
  const row=bookCarousel.querySelector('.book-grid')
  const controls=[...bookCarousel.querySelectorAll('[data-book-move]')]
  function updateBooks() {
    controls[0].disabled=row.scrollLeft<4
    controls[1].disabled=row.scrollLeft+row.clientWidth>row.scrollWidth-4
  }
  controls.forEach(button=>{
    button.addEventListener('click',()=>{
      const first=row.firstElementChild
      const width=first.getBoundingClientRect().width+parseFloat(getComputedStyle(row).columnGap)
      row.scrollBy({left:width*Number(button.dataset.bookMove),behavior:reducedMotion.matches?'instant':'smooth'})
    })
  })
  row.addEventListener('scroll',updateBooks,{passive:true})
  new ResizeObserver(updateBooks).observe(row)
  updateBooks()
}

const topButton=document.querySelector('.back-top')
function updateTopButton() { topButton.hidden=window.scrollY<450 }
window.addEventListener('scroll',updateTopButton,{passive:true})
topButton.addEventListener('click',()=>{
  const heading=document.querySelector('main h1')
  heading.setAttribute('tabindex','-1')
  heading.focus({preventScroll:true})
  window.scrollTo({top:0,behavior:reducedMotion.matches?'instant':'smooth'})
})
updateTopButton()
