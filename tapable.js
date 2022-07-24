import { SyncHook, AsyncParallelHook } from "tapable";

class List {
  getRoutes () {

  }
}
class Car {
  constructor() {
    this.hooks = {
      accelerate: new SyncHook(["newSpeed"]),
      brake: new SyncHook(),
      calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
    };
  }
  setSpeed (newSpeed) {
    // following call returns undefined even when you returned values
    this.hooks.accelerate.call(newSpeed);
  }

  useNavigationSystemPromise (source, target) {
    const routesList = new List();
    return this.hooks.calculateRoutes.promise(source, target, routesList).then((res) => {
      // res is undefined for AsyncParallelHook
      return routesList.getRoutes();
    });
  }

  useNavigationSystemAsync (source, target, callback) {
    const routesList = new List();
    this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
      if (err) return callback(err);
      callback(null, routesList.getRoutes());
    });
  }
}


const car = new Car()

//注册
car.hooks.accelerate.tap('accelerate', (speed) => {
  console.log('accelerate------', speed);
})

car.hooks.calculateRoutes.tapPromise('calculateRoutes', (soucre, target) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('calculateRoutes------', soucre, target);
      resolve()
    }, 0);
  })
})



//触发
car.setSpeed("10")

car.useNavigationSystemPromise([1, 2, 3], 1)
