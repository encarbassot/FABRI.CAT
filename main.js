// main.js
import { PhysicsSection } from './physics.js'


const options = {
  gravity: 1.5,
  scrollForce: 20,   // scroll stronger
  mouseForce: 0.2,    // dragging lighter
  clickForce: 0.5,    // clicks mild
  height:60,
  displayCanvas: false,
  displayDOM: true,
  spaceDrag: 0.002,
  randomAngle: 0.1,
  randomForce: 0.01
}

// Para cada sección que quieras con físicas:
new PhysicsSection('#introduction', {
  ...options,
  gravity: 0.09,
  displayCanvas: false,
  displayDOM: true,
  initialKick: 1,
  randomAngle: 0.1,
  randomForce: 0.01,
  frictionAir: 0,
  anchors: [
    // Campo gravitatorio con caída por distancia
    { key: 'physics-text', x: '15%', y: '85%', mode: 'force', strength: 0.002, falloff: 'inverseSquare', range: 800 },

    // Alternativa: resorte a punto fijo
    // { key: 'instagram', x: '15%', y: '85%', mode: 'spring', stiffness: 0.03, damping: 0.2, length: 0 }
  ]
})



new PhysicsSection('#about', {
  ...options,
  gravity:0,
  scrollForce: 5,
  initialKick: 0.5,
})


new PhysicsSection('#tshirt', {
  ...options,
  gravity:0,
  scrollForce: 5,
  initialKick: 0.5,
})
