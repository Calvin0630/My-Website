var scene;
var camera;
var renderer;
var container;
var container_height;
var container_width;
//used in mouse events
var container_rect;
var frames_per_second = 30;
//a list of objects in the scene
var scene_objects = [];
//a list of velocioties (THREE.Vector3) coresponding to the objectss in scene_objects
var scene_object_velocities = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var frame_index;

var sun;
var bq_quad;

init();
animate();

function init() {
    frame_index = 0;
    //init scene, renderer, camera
    scene = new THREE.Scene();
    //background texture
    var bg_tex = new THREE.TextureLoader().load("images/textures/A_Horseshoe_Einstein_Ring_from_Hubble.jpg");
    scene.background = bg_tex;
    container = document.getElementsByClassName('webgl')[0];
    container_width = container.offsetWidth;
    container_height = container.offsetHeight;
    //console.log("(w, h): (" + container_width + ", " + container_height + ")");
    renderer = new THREE.WebGLRenderer({ canvas: container });
    renderer.setSize(container_width, container_height);
    var fov = 75;
    var aspect = container_width / container_height;  // the canvas default
    var near = 0.1;
    var far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0,0,10);

    //create sun
    var sun_geo = new THREE.SphereGeometry();
    var sun_mat = new THREE.ShaderMaterial({
        uniforms: {
            colorB: { type: 'vec3', value: new THREE.Color(0Xff0a47) },
            colorA: { type: 'vec3', value: new THREE.Color(0xff2b0a) }
        },
        vertexShader: sunVertexShader(),
        fragmentShader: sunFragmentShader()
    });
    sun = new THREE.Mesh(sun_geo, sun_mat);
    sun.position.set(0, 0, 2);
    scene.add(sun);
    //sun.position.z=-10;

    //create bg quad
    //first find the correct scale of the quad to cover the canvas
    console.log("camera.position: "+vector3ToString(camera.position));
    //gotta render the scene for the raycaster to work
    renderer.render(scene, camera);
    
    raycaster.setFromCamera(new THREE.Vector2(1, 1), camera);
    //a constant for calculating the intersection of the top right corner with the xy plane (z=0)
    //console.log("raycaster.ray.origin.z: "+raycaster.ray.origin.z);
    //console.log("raycaster.ray.direction.z: "+raycaster.ray.direction.z);
    c_top_right = -raycaster.ray.origin.z / raycaster.ray.direction.z;
    console.log("c_top_right: "+c_top_right);
    //the position of the top right corner in world space 
    var xy_top_right = raycaster.ray.origin.add(raycaster.ray.direction.multiplyScalar(c_top_right));
    console.log("xy_top_right: "+vector3ToString(xy_top_right));

    raycaster.setFromCamera(new THREE.Vector2(-1, -1), camera);
    //a constant for calculating the intersection of the bottom left corner with the xy plane (z=0)
    c_btm_left = -raycaster.ray.origin.z / raycaster.ray.direction.z;
    //the position of the top right corner in world space 
    var xy_btm_left = raycaster.ray.origin.add(raycaster.ray.direction.multiplyScalar(c_btm_left));
    console.log("xy_btm_left: "+vector3ToString(xy_btm_left));

    var bg_world_width = 16;
    var bg_world_height = 8;
    var bg_quad_geo = new THREE.PlaneGeometry(bg_world_width, bg_world_height);
    var bg_quad_mat = new THREE.ShaderMaterial({
        uniforms: {
            bg_tex: { type: "t", value: (new THREE.TextureLoader()).load( "images/textures/A_Horseshoe_Einstein_Ring_from_Hubble.jpg" ) }
        },
        vertexShader: bgVertexShader(),
        fragmentShader: bgFragmentShader()
    });
    bg_quad_mat.transparent = true;
    bg_quad = new THREE.Mesh(bg_quad_geo, bg_quad_mat);
    bg_quad.position.set(0, 0, 0);
    scene.add(bg_quad);

    //set up event listeners


    container.addEventListener('resize', onWindowResize, false);
    container.addEventListener('mousedown', onMouseDown, false);

    document.onkeydown = function (e) {
        //console.log(String.fromCharCode(e.keyCode));
        switch (String.fromCharCode(e.keyCode)) {
            default:
                //console.log(String.fromCharCode(e.keyCode));
                return;
        }
    };
}

//event listeners
function onMouseDown(event) {
    //get the mouse pos relative to the top left corner of the webgl div
    container_rect = event.target.getBoundingClientRect();
    pixel_loc_x = event.clientX - container_rect.left;
    pixel_loc_y = event.clientY - container_rect.top;
    //console.log("pixel_loc: ("+pixel_loc_x + ", " + pixel_loc_y + ")");
    //translate to screen coordinates. ie [-1, 1]
    mouse.x = (pixel_loc_x / container_rect.width) * 2 - 1;
    mouse.y = - (pixel_loc_y / container_rect.height) * 2 + 1;
    //console.log("mouse down @ ("+ mouse.x+", "+mouse.y+")");
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene_objects, true);
    if (intersects.length > 0) {
        for (var i = 0; i < intersects.length; i++) {
            console.log(intersects[i].point);
        }
    }
    else {
        //console.log("clicked outside the mesh");
        //create a planet
        //get the rays intersection with the xy plane (z=0)
        c = -raycaster.ray.origin.z / raycaster.ray.direction.z;
        var xy_intersect = raycaster.ray.origin.add(raycaster.ray.direction.multiplyScalar(c));
        console.log("ray intersect w xy plane is (" + xy_intersect.x + ", " + xy_intersect.y, ", " + xy_intersect.z + ")");
    }

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
}

function onMouseMove(event) {
    pixel_loc_x = event.clientX - container_rect.left;
    pixel_loc_y = event.clientY - container_rect.top;
    //console.log("pixel_loc: ("+pixel_loc_x + ", " + pixel_loc_y + ")");
    //translate to screen coordinates. ie [-1, 1]
    mouse.x = (pixel_loc_x / container_rect.width) * 2 - 1;
    mouse.y = - (pixel_loc_y / container_rect.height) * 2 + 1;
    //console.log("mouse move @ ("+ mouse.x+", "+mouse.y+")");
}

function onMouseUp(event) {
    //console.log("mouse up!");
    container.removeEventListener('mousemove', onMouseMove);
}

function onWindowResize() {

    camera.aspect = container.innerWidth / container.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.innerWidth, container.innerHeight);

}


function animate() {
    sun.rotation.x += 0.01;
    sun.rotation.y += 0.02;
    sun.rotation.z += 0.03;
    //requestAnimationFrame(animate);
    //limit the framerate to 30fps
    setTimeout(function () {
        requestAnimationFrame(animate);
    }, 1000 / frames_per_second);
    //console.log("frame: " + frame_index);
    frame_index += 1;
    renderer.render(scene, camera);
}

/* #region Shaders */

function sunVertexShader() {
    return `
        varying vec3 vUv; 

        void main() {
            vUv = position; 

            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
        }
    `
}

function sunFragmentShader() {
    return `
        uniform vec3 colorA; 
        uniform vec3 colorB; 
        varying vec3 vUv;

        void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
        }
    `
}

function bgVertexShader() {
    return `
        varying vec2 vUv; 

        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            vUv = uv;
        }
    `
}

function bgFragmentShader() {
    return `
        uniform sampler2D bg_tex;

        varying vec2 vUv;

        void main() {
            //gl_FragColor = vec4(0, 1, 0.5, 0.5);
            gl_FragColor = texture2D(bg_tex, vUv);
            gl_FragColor.b = 0.99;
        }
    `
}

/* #endregion */

function vector3ToString(v) {
    return "(" + v.x + ", " + v.y + ", " + v.z + ")";
}
