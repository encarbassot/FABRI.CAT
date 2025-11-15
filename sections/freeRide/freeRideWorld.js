

import FreeRideAsset from "./freeRideAsset.js"

const SAFE_MARGIN = 100

export default class FreeRideWorld{

  constructor(){
    // this.x = 0
    this.height=0
    this.width=0
    this.assets=[]
  }

  start(w,h){
    this.height = h
    this.width = w
    this.assets.push(new FreeRideAsset(this.w))
  }





  step(){
    // this.x ++
    // console.log(this.x)


    for (const asset of this.assets) {
      asset.step()
      if(asset.x < -SAFE_MARGIN){

      }
    }
  }



  draw(cv){

    for (const asset of this.assets) {
      asset.draw(cv,this.width,this.height)
    }

  }



  
}