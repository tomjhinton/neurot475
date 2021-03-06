import React from 'react'
import axios from 'axios'

const THREE = require('three')
const CANNON = require('cannon')
const world = new CANNON.World()
world.gravity.set(0,-3,0)
world.broadphase = new CANNON.NaiveBroadphase()
world.solver.iterations = 10
const timeStep =1/60
let boxMeshes = []
let boxes = []

import * as vertexShader from './vertexShader.vert'
import * as fragmentShader from './fragmentShader.frag'


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
    axios.get('/api/works')
      .then(res => {
        this.setState({works: res.data})
        const arr = []
        let texture, texture2
        if(this.state.works){
          texture = new THREE.TextureLoader().load( `data:image/png;base64,  ${this.state.works[0].dat.slice(2).slice(0, -1)}` )
          texture2 = new THREE.TextureLoader().load( `data:image/png;base64,  ${this.state.works[1].dat.slice(2).slice(0, -1)}` )
        }
        let img =  new THREE.TextureLoader().load( './assets/texture.png')
        for(let i=0;i<25;i++){
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
        renderer.domElement.addEventListener('click', onclick, true)
        var raycaster = new THREE.Raycaster()
        var mouse = new THREE.Vector2(0,0)

        function onMouseMove( event ) {

          // calculate mouse position in normalized device coordinates
          // (-1 to +1) for both components

          mouse.x = ((event.clientX - renderer.domElement.offsetLeft + 0.5) / window.innerWidth) * 2 - 1
          mouse.y = -((event.clientY - renderer.domElement.offsetTop + 0.5) / window.innerHeight) * 2 + 1

        }


        function onclick(event) {

          raycaster.setFromCamera( mouse, camera )


          //console.log(world.bodies)
          var intersects = raycaster.intersectObjects( scene.children )

          for ( var i = 0; i < intersects.length; i++ ) {

            // intersects[ i ].object.material.color.set( `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`)

            boxes.filter(x=>x.name ===intersects[i].object.uuid )[0].velocity.z-=10

            console.log(boxes.filter(x=>x.name ===intersects[i].object.uuid )[0])
          }
        }


        const camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 3000 )
        camera.position.z = 10
        camera.position.x = 5
        camera.position.y = 5

        camera.updateProjectionMatrix()
        camera.updateMatrixWorld()
        camera.updateWorldMatrix()

        // get the matrices from the camera so they're fixed in camera's original position
        const viewMatrixCamera = camera.matrixWorldInverse.clone()
        const projectionMatrixCamera = camera.projectionMatrix.clone()
        const modelMatrixCamera = camera.matrixWorld.clone()

        const projPosition = camera.position.clone()



        const floorMaterial = new CANNON.Material('floorMaterial')
        const groundShape = new CANNON.Box(new CANNON.Vec3(300,300,2))
        const groundBody = new CANNON.Body({ mass: 0, material: floorMaterial })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
        groundBody.position.set(0,0,0)
        groundBody.position.y = -2.5
        world.addBody(groundBody)


        function boxCreate(x,y, z, text){
          const materialBox = new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 1,
            transparent: true , map: img } )

            var material = new THREE.ShaderMaterial( {

              uniforms : {
                      color: { value: new THREE.Color('white') },
                      texture: { value: text },
                      viewMatrixCamera: { type: 'm4', value: viewMatrixCamera },
                      projectionMatrixCamera: { type: 'm4', value: projectionMatrixCamera },
                      modelMatrixCamera: { type: 'mat4', value: modelMatrixCamera },
                      // we will set this later when we will have positioned the object
                      savedModelMatrix: { type: 'mat4', value: new THREE.Matrix4() },
                      projPosition: { type: 'v3', value: projPosition },
                    },

    	vertexShader: vertexShader,

    	fragmentShader: fragmentShader

    } );

          const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
          const boxMesh = new THREE.Mesh( boxGeometry, material )
          boxMesh.name = 'box'
          scene.add(boxMesh)
          boxMeshes.push(boxMesh)


          boxMesh.updateMatrixWorld()

      // we save the object model matrix so it's projected relative
      // to that position, like a snapshot
      boxMesh.material.uniforms.savedModelMatrix.value.copy(boxMesh.matrixWorld)

          const boxShape =  new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5))
          const boxBody = new CANNON.Body({ mass: 1, material: materialBox })
          boxBody.name = boxMesh.uuid
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
                boxCreate(index-10, indexY, 0, texture)

              )
            })
          )
        })

        arr.map((x,index)=>{
          return(
            x.map((y,indexY)=>{

              return(
                boxCreate(index-10, indexY, -40, texture2)

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
          scene.rotation.y+=0.009
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

                  boxMeshes[j].updateMatrixWorld()

              // we save the object model matrix so it's projected relative
              // to that position, like a snapshot
              boxMeshes[j].material.uniforms.savedModelMatrix.value.copy(boxMeshes[j].matrixWorld)
          }
        }

        window.addEventListener( 'mousemove', onMouseMove, false );
        window.addEventListener( 'click', onclick, false );

        requestAnimationFrame(animate)
      })
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
