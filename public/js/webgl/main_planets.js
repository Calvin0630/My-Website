var scene;
var camera;
var renderer;
var container;
var container_height;
var container_width;
//used in mouse events
var container_rect;
var frames_per_second = 3;
//a list of objects in the scene
var scene_objects = [];
//a list of velocioties (THREE.Vector3) coresponding to the objectss in scene_objects
var scene_object_velocities = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var frame_index;

var sun;

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

    //init geometry
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
    sun.position.set(0, 0, 0);
    //scene.add(sun);
    //sun.position.z=-10;
    camera.position.z = 5;

    //set up event listeners


    container.addEventListener('resize', onWindowResize, false);
    container.addEventListener('mousedown', onMouseDown, false);

    document.onkeydown = function (e) {
        //console.log(String.fromCharCode(e.keyCode));
        switch (String.fromCharCode(e.keyCode)) {
            case "A":
                debug_print_scene_object_position();
                break;
            default:
                return;
        }
    };
}

function debug_print_scene_object_position() {
    console.log("positions:");
    for (var i = 0; i < scene_objects.length; i++) {
        console.log("i = " + i);
        console.log("pos: (" + scene_objects[i].position.x + ", " + scene_objects[i].position.y + ")");
        console.log("vel: (" + scene_object_velocities[i].x + ", " + scene_object_velocities[i].y + ")");
    }
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
        //console.log("ray intersect w xy plane is (" + xy_intersect.x + ", " + xy_intersect.y, ", " + xy_intersect.z + ")");
        color_a = Math.random() * 0xffffff;
        color_b = Math.random() * 0xffffff;
        newest_planet = createPlanet(xy_intersect, new THREE.Vector3(0.1, 0.1, 0.1), color_a, color_b);

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
    sun.rotation.y += 0.03;
    sun.rotation.z += 0.02;
    //requestAnimationFrame(animate);
    //limit the framerate to 30fps
    setTimeout(function () {

        requestAnimationFrame(animate);

    }, 1000 / frames_per_second);
    //rotate all objects in scene_objects
    //console.log("scene_objects.length: " + scene_objects.length);
    for (var i of scene_objects) {
        i.rotation.x += 0.01;
        i.rotation.y += 0.01;
    }
    console.log("frame: "+frame_index);
    frame_index+=1;
    physics();
    renderer.render(scene, camera);
}

function physics() {
    //calculate the force on each object in scene_objects
    var g_forces = calculateGForces();
    //apply the acceleration to each object velocity
    applyForces(g_forces);
}

function calculateGForces() {
    if (scene_objects.length == 0) return [];
    if (scene_objects.length == 1) return [new THREE.Vector3(0, 0, 0)];
    //a list of vectors representing the newtons to apply to the corelating object in scene_object
    var forces = [];
    for (var i = 0; i < scene_objects.length; i++) {
        var f = new THREE.Vector3(0, 0, 0);
        for (var j = 0; j < scene_objects.length; j++) {
            if (i == j) continue;
            //j-i normalized
            var i_to_j = scene_objects[j].position.clone().sub(scene_objects[i].position.clone());
            //var i_to_j = scene_objects[j].position.sub(scene_objects[i].position);
            //multiply by gravitational constant (fG = g*m1*m2/(r^2))
            //calculate mass based on scale
            var m1 = scene_objects[i].scale.length();
            var m2 = scene_objects[j].scale.length();
            var fG = grav_constant * m1 * m2 / (i_to_j.length() ^ 2);
            //the force (in newtons from i to j) vector3
            var f_ij = i_to_j.normalize().multiplyScalar(fG);
            f = f.add(f_ij);
        }
        forces.push(f);
    }
    //console.log(forces);
    return forces;
}
//forces is a list of vector3s representiong acceleration of the coresponding object in scene_objects
function applyForces(forces) {
    //console.log("applying forces.");
    for (var i = 0; i < forces.length; i++) {
        //the acceleration on i
        // f=ma
        // a=f/m
        console.log("f_"+i+" = "+ vector3ToString(forces[i]));
        var m = scene_objects[i].scale.length();
        console.log("m_"+i+" = "+m);
        var a = forces[i].multiplyScalar(1 / m);
        console.log("a_"+i+" = "+vector3ToString(a));
        //add a / delta time to velocity
        //scene_objects[i].velocity.set(scene_objects[i].velocity.add(a.multiplyScalar(1/frames_per_second)));
        scene_object_velocities[i] = scene_object_velocities[i].add(a.multiplyScalar(1 / frames_per_second ));
        console.log("v_"+i+" = "+ vector3ToString(scene_object_velocities[i].add(a.multiplyScalar(1 / frames_per_second ))));
    }

    //update positions based on velocity
    for (var i = 0; i < scene_objects.length; i++) {
        //scene_objects[i].position.set(scene_objects[i].position.add(scene_object_velocities[i].multiplyScalar(1 / frames_per_second)));
    }
}

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

function vector3ToString(v) {
    return "(" + v.x + ", " + v.y + ", " + v.z + ")";
}

function createPlanet(position, scale, color_a, color_b) {
    var geo = new THREE.SphereGeometry();
    var mat = new THREE.ShaderMaterial({
        uniforms: {
            colorB: { type: 'vec3', value: new THREE.Color(color_b) },
            colorA: { type: 'vec3', value: new THREE.Color(color_a) }
        },
        vertexShader: sunVertexShader(),
        fragmentShader: sunFragmentShader()
    });
    planet = new THREE.Mesh(geo, mat);
    planet.position.set(position.x,
        position.y,
        position.z);
    planet.scale.set(scale.x,
        scale.y,
        scale.z);
    //planet.velocity = new THREE.Vector3(0,0,0);
    scene.add(planet);
    scene_objects.push(planet);
    scene_object_velocities.push(new THREE.Vector3(0, 0, 0));
}