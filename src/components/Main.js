import React from 'react'

const THREE = require('three')
const CANNON = require('cannon')
const world = new CANNON.World()
world.gravity.set(0,-1,0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10
const timeStep =1/60
let boxMeshes = []
let boxes = []
class Main extends React.Component{
  constructor(){
    super()
    this.state = {
      data: {},
      error: ''

    }
    this.componentDidMount = this.componentDidMount.bind(this)
    this.mouseMove = this.mouseMove.bind(this)






  }


  componentDidMount(){
    const arr = []
    let img =  new THREE.TextureLoader().load( './assets/texture.png')
    for(let i=0;i<10;i++){
      arr.push([])
      for(let j=0;j<10;j++){
        arr[i].push(i.toString()+':'+j)
      }
    }
    // arr = arr.reverse()
    console.log(arr)
    this.setState({arr: arr})
    const scene = new THREE.Scene()

    const light = new THREE.DirectionalLight( 0xffffff )
    light.position.set( 40, 10, 40 )
    light.castShadow = true
    scene.add(light)
    var aLight = new THREE.AmbientLight( 0x404040 ); // soft white aLight
    scene.add( aLight );

    //console.log(scene.scene)

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( renderer.domElement )
    renderer.domElement.addEventListener("click", onclick, true);
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(0,0);

  function onMouseMove( event ) {

  	// calculate mouse position in normalized device coordinates
  	// (-1 to +1) for both components

  	mouse.x = ((event.clientX - renderer.domElement.offsetLeft + 0.5) / window.innerWidth) * 2 - 1
  	mouse.y = -((event.clientY - renderer.domElement.offsetTop + 0.5) / window.innerHeight) * 2 + 1

  }


 function onclick(event) {

   raycaster.setFromCamera( mouse, camera );

// calculate objects intersecting the picking ray
var intersects = raycaster.intersectObjects( scene.children )

for ( var i = 0; i < intersects.length; i++ ) {

 intersects[ i ].object.material.color.set( `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`)
 console.log(intersects[ i ])
 boxes[i].velocity.z+=10
}
  }


    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 3000 )
    camera.position.z = 30
    camera.position.x = 5
    const floorMaterial = new CANNON.Material('floorMaterial')
    const groundShape = new CANNON.Box(new CANNON.Vec3(300,300,2))
    const groundBody = new CANNON.Body({ mass: 0, material: floorMaterial })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
    groundBody.position.set(0,0,0)
    groundBody.position.y = -2.5
    world.addBody(groundBody)
    function boxCreate(x,y, z){
      const materialBox = new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
        transparent: true , map: img } )

      const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
      const boxMesh = new THREE.Mesh( boxGeometry, materialBox )
      boxMesh.name = 'box'
      scene.add(boxMesh)
      boxMeshes.push(boxMesh)




      const boxShape =  new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5))
      const boxBody = new CANNON.Body({ mass: 1, material: materialBox })
      boxBody.addShape(boxShape)
      boxBody.linearDamping = 0
      world.addBody(boxBody)
      boxes.push(boxBody)
      boxBody.position.set(x,y,z)
      boxBody.angularVelocity.y = 0
      boxBody.addEventListener('collide',function(e){



      })
    }


    arr.map((x,index)=>{
      return(
        x.map((y,indexY)=>{

          return(
            boxCreate(index, indexY, 0)

          )
        })
      )
    })


    const update = function() {







      updatePhysics()

    // if(cannonDebugRenderer){
    //   //cannonDebugRenderer.update()
    // }
    }
    // const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
    function animate() {

      update()
      /* render scene and camera */
      renderer.render(scene,camera)
      requestAnimationFrame(animate)
    }
    function updatePhysics() {
      // Step the physics world
      world.step(timeStep)

      for(var j=0; j<boxes.length; j++){
        boxMeshes[j].position.copy(boxes[j].position)
        boxMeshes[j].quaternion.copy(boxes[j].quaternion)
      }
    }

    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'click', onclick, false );

    requestAnimationFrame(animate)
  }

  componentDidUpdate(){



  }

  mouseMove(e){


  }




  render() {
    console.log(this.state)


    return (
      <div onMouseMove={this.mouseMove} className="body">



      </div>




    )
  }
}
export default Main
