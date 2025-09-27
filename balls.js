const { Engine, Render, Runner, Bodies, Composite, Body } = Matter

// Crear motor y mundo
const engine = Engine.create()
const world = engine.world
engine.gravity.y = 0 // desactivamos gravedad para controlarla con scroll

// Canvas render
const canvas = document.getElementById('world')
const render = Render.create({
  canvas,
  engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    background: 'transparent',
    wireframes: false
  }
})
Render.run(render)
Runner.run(Runner.create(), engine)

// Bordes invisibles para rebotes
const thickness = 200
Composite.add(world, [
  Bodies.rectangle(window.innerWidth / 2, -thickness / 2, window.innerWidth, thickness, { isStatic: true }),
  Bodies.rectangle(window.innerWidth / 2, window.innerHeight + thickness / 2, window.innerWidth, thickness, { isStatic: true }),
  Bodies.rectangle(-thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, { isStatic: true }),
  Bodies.rectangle(window.innerWidth + thickness / 2, window.innerHeight / 2, thickness, window.innerHeight, { isStatic: true })
])

// Crear objetos flotantes
const balls = Array.from({ length: 6 }).map(() =>
  Bodies.circle(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 40 + Math.random() * 40, {
    restitution: 0.8,
    frictionAir: 0.02
  })
)
Composite.add(world, balls)

// Aplicar fuerzas según scroll
let lastScroll = window.scrollY
function tick() {
  const scroll = window.scrollY
  const delta = scroll - lastScroll
  lastScroll = scroll

  // Aplicar fuerza a todos los cuerpos según dirección del scroll
  balls.forEach(ball => {
    Body.applyForce(ball, ball.position, {
      x: (Math.random() - 0.5) * 0.0005 * Math.abs(delta), // un poco de caos horizontal
      y: -delta * 0.0008 // fuerza vertical inversa al scroll
    })
  })

  requestAnimationFrame(tick)
}
tick()

// 🔄 Responsivo
window.addEventListener('resize', () => {
  render.canvas.width = window.innerWidth
  render.canvas.height = window.innerHeight
})
























