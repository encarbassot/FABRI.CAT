
import ElioCanvas from "../../lib/elioCanvas.js"
import FreeRideWorld from "./freeRideWorld.js"

const dom = makeDOM({
  section:".freeRide",
  canvas: '.freeRide canvas',
  btnStart: '#freeRideStartBtn',
  btnExit:".freeRide button.exit"
})


let started = false



dom.btnStart.addEventListener("click",()=>{
  started = true
  dom.section.classList.add("started")
  dom.section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    dom.section.classList.add("inmersive")
    // dom.section.classList.remove("started")
    // document.body.classList.add("ride-free-focus")
  },1300)
})


dom.btnExit.addEventListener("click",exit)


function exit(){
  started = false
  dom.section.classList.remove("started")
  dom.section.classList.remove("inmersive")
  dom.section.scrollIntoView({ behavior: 'smooth', block: 'start' });

}


const cv = new ElioCanvas(undefined, undefined, dom.canvas)
const world = new FreeRideWorld()

cv.setup = function (){
  //here code is executed once
  cv.noStroke()

  world.start(
    cv.canvas.height,
    cv.canvas.width,
  )

  console.log(cv.canvas)
}

cv.draw = function (){
  //here code is executed before every frame
  // cv.background(200,200,200)
  // cv.fill("#0f0")
  // cv.circle(cv.mouseX,cv.mouseY,20)

  // cv.fill("#f00")
  // cv.circle(cv.width/2,cv.height/2,20)


  // cv.line(cv.width/2,0,cv.width/2,cv.height)
  // cv.line(0,cv.height/2,cv.width,cv.height/2)


  cv.makeShape([
    [100,100],
    [150,0],
    [200,100]
  ])


  if(started){
    world.step()
    world.draw(cv)
  }
}

//this triggers the signal to run setup and draw
cv.start()