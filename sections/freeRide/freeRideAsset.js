


export default class FreeRideAsset{

  constructor(x){
    this.x = x
  }


  step(){
    this.x--
  }

  draw(cv,w,h){
    const triangleW = 20
    const triangleH = 50
    cv.makeShape([
      [this.x,h/2],
      [this.x + triangleW/2, h/2 - triangleH],
      [this.x + triangleW, h/2]
    ])


  }
}