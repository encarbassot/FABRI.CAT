const overlay = document.getElementById('overlay')
const ctx = overlay.getContext('2d')

overlay.width = window.innerWidth
overlay.height = window.innerHeight

const profile = new Image()
profile.src = './assets/fabricat.jpg'
const igTag = '@fabricat_studio'


const IG_URL = 'https://www.instagram.com/elioputo'

// Physics state
let pos = { x: overlay.width / 2, y: overlay.height / 2 }
let vel = { x: 0, y: 0 }
let target = { x: pos.x, y: pos.y }

window.addEventListener('mousemove', e => {
  target.x = e.clientX
  target.y = e.clientY
})


function updatePosition() {
  // very slow, heavy movement
  const Kp = 0.05   // proportional gain (smaller = slower)
  const damping = 0.09 // stronger damping = heavier

  // acceleration toward cursor
  const ax = (target.x - pos.x) * Kp
  const ay = (target.y - pos.y) * Kp

  vel.x += ax
  vel.y += ay

  // apply damping
  vel.x *= damping
  vel.y *= damping

  pos.x += vel.x
  pos.y += vel.y
}

function draw() {
  ctx.clearRect(0, 0, overlay.width, overlay.height)

  // profile circle
  const radius = 50
  ctx.save()
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(profile, pos.x - radius, pos.y - radius, radius * 2, radius * 2)
  ctx.restore()

  // Instagram label
  const padding = 8
  ctx.font = '16px Fraunces'
  const textWidth = ctx.measureText(igTag).width
  const textHeight = 20

  const boxX = pos.x - textWidth / 2 - padding
  const boxY = pos.y + radius + 10
  const boxWidth = textWidth + padding * 2
  const boxHeight = textHeight + padding

  ctx.fillStyle = 'rgba(200,200,200,0.8)'
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = 'black'
  ctx.fillText(igTag, boxX + padding, boxY + textHeight)
}

function loop() {
  updatePosition()
  draw()
  requestAnimationFrame(loop)
}

profile.onload = loop

window.addEventListener('resize', () => {
  overlay.width = window.innerWidth
  overlay.height = window.innerHeight
})




// canvas click handler
overlay.addEventListener('click', e => {
  const rect = overlay.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // check distance from profile center
  const dx = mouseX - pos.x
  const dy = mouseY - pos.y
  const distance = Math.sqrt(dx*dx + dy*dy)

  if (distance <= 50) { // radius of profile circle
    window.open(IG_URL, '_blank')
  }
})
