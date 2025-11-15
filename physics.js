const { Engine, Runner, Bodies, Composite, Body, Events, Vector, Render } = Matter




export class PhysicsSection {
  constructor(selector, options = {}) {
    this.section = document.querySelector(selector)
    this.width = window.innerWidth
    this.height = options.height ? (window.innerHeight * options.height) / 100 : window.innerHeight
    this.gravity = options.gravity ?? 0
    this.DISPLAY_CANVAS = options.displayCanvas ?? true
    this.DISPLAY_DOM = options.displayDOM ?? true

    this.scrollForce = options.scrollForce ?? 1
    this.mouseForce = options.mouseForce ?? 1
    this.clickForce = options.clickForce ?? 1

    this.spaceDrag = options.spaceDrag ?? 0
    this.randomAngle = options.randomAngle ?? 0
    this.randomForce = options.randomForce ?? 0.01
    this.initialKick = options.initialKick ?? false

    this.restitution = options.restitution ?? 0.25      // rebote de los cuerpos
    this.frictionAir = options.frictionAir ?? 0.15    // fricción del aire
    this.positionIterations = options.positionIterations ?? 10
    this.velocityIterations = options.velocityIterations ?? 10
    this.timeScale = options.timeScale ?? 0.98
    this.maxVelocity = options.maxVelocity ?? 10
    this.maxAngularVelocity = options.maxAngularVelocity ?? 0.5

    this.anchors = this.normalizeAnchors(options.anchors || []) 
    this.anchorsMap = Object.fromEntries(this.anchors.map(a => [a.key, a]))


    this.bodies = []
    this.domElements = []

    this.section.style.position = 'relative'
    this.section.style.height = `${this.height}px`

    // Physics engine
    this.engine = Engine.create()
    this.world = this.engine.world
    this.engine.gravity.y = this.gravity

    this.engine.positionIterations = this.positionIterations
    this.engine.velocityIterations = this.velocityIterations
    this.engine.timing.timeScale = this.timeScale

    Runner.run(Runner.create(), this.engine)

    // Canvas
    if (this.DISPLAY_CANVAS) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.canvas.style.position = 'absolute'
      this.canvas.style.top = 0
      this.canvas.style.left = 0
      this.canvas.style.zIndex = 0
      this.section.appendChild(this.canvas)

      this.render = Render.create({
        canvas: this.canvas,
        engine: this.engine,
        options: { width: this.width, height: this.height, wireframes: false, background: 'transparent' }
      })
      Render.run(this.render)
    }

    // Walls
    const t = 200
    Composite.add(this.world, [
      Bodies.rectangle(this.width / 2, -t / 2, this.width, t, { isStatic: true }),
      Bodies.rectangle(this.width / 2, this.height + t / 2, this.width, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, this.height / 2, t, this.height, { isStatic: true }),
      Bodies.rectangle(this.width + t / 2, this.height / 2, t, this.height, { isStatic: true })
    ])

    // Crear los bodies
    this.createBodies()
    this.createSprings()
    
    // Interacciones con mouse/touch
    this.initInteractions()

    // Loop
    this.lastScroll = window.scrollY
    this.animate()

    window.addEventListener('resize', this.handleResize.bind(this))
  }




  resolveCoord(value, max) {
    if (typeof value === 'string' && value.trim().endsWith('%')) {
      return (parseFloat(value) / 100) * max
    }
    return Number(value)
  }
  
  normalizeAnchors(list) {
    return (list || []).map(a => {
      return {
        key: a.key,
        mode: a.mode || 'force', // 'force' | 'spring'
        x: this.resolveCoord(a.x, this.width),
        y: this.resolveCoord(a.y, this.height),
        // force-mode
        strength: a.strength ?? 0.001,
        falloff: a.falloff || 'inverseSquare', // 'none' | 'inverse' | 'inverseSquare'
        range: a.range ?? null,
        // spring-mode
        stiffness: a.stiffness ?? 0.02,
        damping: a.damping ?? 0.1,
        length: a.length ?? 0
      }
    })
  }
  
  createBodies(configs) {
    const children = Array.from(this.section.children)

    children.forEach(child => {
      child.style.position = 'absolute'
      child.style.top = '0px'
      child.style.left = '0px'
      child.style.pointerEvents = 'auto'
      child.style.zIndex = 1
      child.style.userSelect = 'none'
      child.style.cursor = 'grab'

      const rect = child.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      const type = child.dataset.type || (child.tagName === 'IMG' ? 'image' : 'text')

      const x = Math.random() * this.width
      const y = Math.random() * this.height

      const body = type === 'ball'
        ? Bodies.circle(x, y, Math.max(width, height) / 2, {
            restitution: this.restitution,
            frictionAir: this.frictionAir,
            friction: this.friction ?? 0.1,
            frictionStatic: this.frictionStatic ?? 0.1
          })
        : Bodies.rectangle(x, y, width, height, {
            restitution: this.restitution,
            frictionAir: this.frictionAir,
            friction: this.friction ?? 0.1,
            frictionStatic: this.frictionStatic ?? 0.1
          })

      Composite.add(this.world, body)
      this.bodies.push(body)
      this.domElements.push(child)

      // 🌟 Initial kick
      if (this.initialKick && this.initialKick > 0) {
        const angle = Math.random() * Math.PI * 2
        const magnitude = Math.random() * this.initialKick
        const force = { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude }
        Body.applyForce(body, body.position, force)

        if (this.randomAngle > 0) {
          const angleVel = (Math.random() - 0.5) * 2 * this.randomAngle
          Body.setAngularVelocity(body, angleVel)
        }
      }
    })
  }
  

  initInteractions() {
    if (!this.DISPLAY_DOM) return

    this.domElements.forEach((el, i) => {
      // Shared state
      let dragging = null
      let dragOffset = null

      const startDrag = (e, i) => {
        e.preventDefault()
        dragging = i
        const body = this.bodies[i]

        // straighten body
        Body.setAngle(body, 0)
        Body.setAngularVelocity(body, 0)

        // pointer position
        const point = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }

        // store drag offset on the body
        dragOffset = Vector.sub(point, body.position)
        body.isBeingDragged = true

        const el = this.domElements[i]
        if (el) el.style.cursor = 'grabbing'
      }

      const moveDrag = e => {
        if (dragging !== null && dragOffset) {
          const body = this.bodies[dragging]
          const point = e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }
      
          // target position adjusted by dragOffset
          let target = Vector.sub(point, dragOffset)
      
          // clamp target inside the canvas / world bounds
          const radius = body.circleRadius || Math.max(body.bounds.max.x - body.bounds.min.x, body.bounds.max.y - body.bounds.min.y) / 2
          target.x = Math.min(Math.max(target.x, radius), window.innerWidth - radius)
          target.y = Math.min(Math.max(target.y, radius), window.innerHeight - radius)
      
          // calculate velocity toward target
          const velocity = Vector.sub(target, body.position)
          Body.setVelocity(body, velocity)
          Body.setAngularVelocity(body, 0) // optional: prevent spinning while dragging
        }
      }
      const endDrag = e => {
        e.preventDefault()
        if (dragging !== null && dragOffset) {
          const body = this.bodies[dragging]
          if (!body) return
      
          body.isBeingDragged = false
      
          const point = e.changedTouches 
            ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY } 
            : { x: e.clientX, y: e.clientY }
      
          // 1️⃣ Impulso según movimiento del drag
          const impulseVector = Vector.sub(point, Vector.add(body.position, dragOffset))
          const forceMultiplier = this.randomForce ?? 0.005
          Body.applyForce(body, Vector.add(body.position, dragOffset), Vector.mult(impulseVector, forceMultiplier))
      
          // 2️⃣ Velocidad angular random
          const randAngle = this.randomAngle ?? 0
          if (randAngle > 0) {
            const angleVel = (Math.random() - 0.5) * 2 * randAngle // -rand..+rand
            Body.setAngularVelocity(body, angleVel)
          }
      
          // 3️⃣ Empujito random tipo "space drag"
          if (this.spaceDrag) {
            const angle = Math.random() * Math.PI * 2
            const magnitude = Math.random() * this.spaceDrag
            const force = { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude }
            Body.applyForce(body, body.position, force)
          }
      
          // 4️⃣ Abrir link si no se ha arrastrado demasiado
          const el = this.domElements[dragging]
          const startPos = Vector.add(body.position, dragOffset)
          const distance = Vector.magnitude(Vector.sub(point, startPos))
          if (distance < 50) {
            const link = el?.closest('a') ?? el.querySelector('a')
            if (link?.href) window.open(link.href, '_blank')
          }
        }
      
        dragging = null
        dragOffset = null
        this.domElements.forEach(el => { if (el) el.style.cursor = 'grab' })
      }
      
      
      
      // Event listeners
      this.domElements.forEach((el, i) => {
        el.addEventListener('mousedown', e => startDrag(e, i))
        el.addEventListener('touchstart', e => startDrag(e, i))
      })

      window.addEventListener('mousemove', moveDrag)
      window.addEventListener('touchmove', moveDrag, { passive: false })
      window.addEventListener('mouseup', endDrag)
      window.addEventListener('touchend', endDrag)

      

    })
  }

  animate() {
    const scroll = window.scrollY
    const delta = scroll - this.lastScroll
    this.lastScroll = scroll

    this.frameCount = (this.frameCount ?? 0) + 1

    //scroll force
    this.bodies.forEach(b => {
      Body.applyForce(b, b.position, {
        x: (Math.random() - 0.5) * 0.0003 * Math.abs(delta) * this.scrollForce,
        y: -delta * 0.0006 * this.scrollForce
      })
    })
  
    // Comprobar bounds cada 10 frames
    if (this.frameCount % 10 === 0) {
      const padding = -50 // margen de seguridad
      this.bodies.forEach(b => {
        const pos = b.position

        if (
          pos.x < padding ||
          pos.x > this.width - padding ||
          pos.y < padding ||
          pos.y > this.height - padding
        ) {
          // Teleport random dentro de los límites con padding
          const x = padding + Math.random() * (this.width - 2 * padding)
          const y = padding + Math.random() * (this.height - 2 * padding)
          Body.setPosition(b, { x, y })

          // Kick random al reaparecer
          if (this.initialKick > 0) {
            const angle = Math.random() * Math.PI * 2
            const magnitude = Math.random() * this.initialKick
            const force = { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude }
            Body.applyForce(b, b.position, force)
          }
        }
      })
    }


    if (this.DISPLAY_DOM) {
      this.bodies.forEach((b, i) => {
        // 🌟 Limitar velocidades
        b.velocity.x = Math.max(Math.min(b.velocity.x, this.maxVelocity), -this.maxVelocity)
        b.velocity.y = Math.max(Math.min(b.velocity.y, this.maxVelocity), -this.maxVelocity)
        b.angularVelocity = Math.max(Math.min(b.angularVelocity, this.maxAngularVelocity), -this.maxAngularVelocity)
    
        const el = this.domElements[i]
        const { x, y } = b.position
        const width = el.offsetWidth
        const height = el.offsetHeight
        const angleDeg = (b.angle * 180) / Math.PI
    
        el.style.transformOrigin = '50% 50%'
        el.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) rotate(${angleDeg}deg)`
      })
    }
    

    requestAnimationFrame(this.animate.bind(this))
  }

  handleResize() {
    this.width = window.innerWidth
    if (this.DISPLAY_CANVAS) {
      this.canvas.width = this.width
      this.canvas.height = this.height
    }
  }



  createSprings() {
    // Map spring-data a los bodies correspondientes
    const springMap = {}
  
    this.domElements.forEach((el, i) => {
      const key = el.getAttribute('spring-data')
      if (!key) return
      if (!springMap[key]) springMap[key] = []
      springMap[key].push(i)
    })
  
    // Crear constraints entre todos los pares del mismo grupo
    Object.values(springMap).forEach(indices => {
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          const a = this.bodies[indices[i]]
          const b = this.bodies[indices[j]]
          const spring = Matter.Constraint.create({
            bodyA: a,
            bodyB: b,
            length: 100,       // distancia natural
            stiffness: 0.05,   // rigidez del resorte
            damping: 0.1       // freno del resorte
          })
          Composite.add(this.world, spring)
        }
      }
    })
  }

  
}














