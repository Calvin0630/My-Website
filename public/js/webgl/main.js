class LFO {
    constructor(origin = new THREE.Vector2(0, 0), freq = 1) {
        //a vector2 in screen space
        this.origin = origin;
        this.freq = freq;
        return this;
    }

    setLFOFreq(value) {
        this.freq = value;

    }

    setOriginX(value) {
        this.origin.x = value;
    }

    setOriginY(value) {
        this.origin.y = value;
    }
}

var scene;
var camera;
var renderer;
var container;
var container_height;
var container_width;
var fullscreen = false;
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

var bg_quad;
var lfo;

var start_time;
var current_time;

var freq_slider;

init();
animate();

function init() {
    frame_index = 0;
    start_time = new Date().getTime() / 1000;
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
    camera.position.set(0, 0, 10);

    //set up lfo
    lfo = new LFO();

    //create bg quad
    //first find the correct scale of the quad to cover the canvas
    console.log("camera.position: " + vector3ToString(camera.position));
    //gotta render the scene for the raycaster to work
    renderer.render(scene, camera);

    raycaster.setFromCamera(new THREE.Vector2(1, 1), camera);
    //a constant for calculating the intersection of the top right corner with the xy plane (z=0)
    //console.log("raycaster.ray.origin.z: "+raycaster.ray.origin.z);
    //console.log("raycaster.ray.direction.z: "+raycaster.ray.direction.z);
    var c_top_right = -raycaster.ray.origin.z / raycaster.ray.direction.z;
    //console.log("c_top_right: "+c_top_right);
    //the position of the top right corner in world space 
    var xy_top_right = raycaster.ray.origin.add(raycaster.ray.direction.multiplyScalar(c_top_right));
    //console.log("xy_top_right: "+vector3ToString(xy_top_right));

    raycaster.setFromCamera(new THREE.Vector2(-1, -1), camera);
    //a constant for calculating the intersection of the bottom left corner with the xy plane (z=0)
    var c_btm_left = -raycaster.ray.origin.z / raycaster.ray.direction.z;
    //the position of the top right corner in world space 
    var xy_btm_left = raycaster.ray.origin.add(raycaster.ray.direction.multiplyScalar(c_btm_left));
    //console.log("xy_btm_left: "+vector3ToString(xy_btm_left));

    var bg_world_width = xy_btm_left.x + xy_top_right.x;
    var bg_world_height = xy_btm_left.y + xy_top_right.y;
    var bg_quad_geo = new THREE.PlaneGeometry(bg_world_width / 1.01, bg_world_height / 1.01);
    var bg_quad_mat = new THREE.ShaderMaterial({
        uniforms: {
            bg_tex: { type: "t", value: (new THREE.TextureLoader()).load("images/textures/A_Horseshoe_Einstein_Ring_from_Hubble.jpg") },
            time: { type: "float", value: 0 },
            origin: { type: "vec2", value: lfo.origin },
            freq: { type: "float", value: lfo.freq }
        },
        vertexShader: bgVertexShader(),
        fragmentShader: bgFragmentShader()
    });
    console.log(lfo.freq);
    bg_quad_mat.transparent = true;
    //bg_quad_mat.castShadow = true;
    bg_quad = new THREE.Mesh(bg_quad_geo, bg_quad_mat);
    bg_quad.position.set(0, 0, 0);
    scene.add(bg_quad);



    //set up event listeners


    container.addEventListener('resize', onWindowResize, false);
    container.addEventListener('mousedown', onMouseDown, false);

    document.onkeydown = function (e) {
        //console.log(String.fromCharCode(e.keyCode));
        switch (String.fromCharCode(e.keyCode)) {
            case " ":
                console.log("Fullscreen!");
            default:
                //console.log(String.fromCharCode(e.keyCode));
                return;
        }
    };
    //freq_slider = document.getElementById("freq-slider");
    //console.log(freq_slider);
    //freq_slider.addEventListener('input', onFreqSliderChange(freq_slider.value));
    //freq_slider.onchange = onFreqSliderChange(freq_slider.value);
}

function animate() {
    //requestAnimationFrame(animate);
    //limit the framerate to 30fps
    setTimeout(function () {
        requestAnimationFrame(animate);
    }, 1000 / frames_per_second);
    //console.log("frame: " + frame_index);
    frame_index += 1;

    current_time = new Date().getTime() / 1000;
    bg_quad.material.uniforms.time.value = current_time - start_time;
    renderer.render(scene, camera);
}

/* #region Listeners */

//event listeners
function onMouseDown(event) {
    //get the mouse pos relative to the top left corner of the webgl div
    container_rect = event.target.getBoundingClientRect();
    var pixel_loc_x = event.clientX - container_rect.left;
    var pixel_loc_y = event.clientY - container_rect.top;
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
        var c = -raycaster.ray.origin.z / raycaster.ray.direction.z;
        var xy_intersect = raycaster.ray.origin.add(raycaster.ray.direction.multiplyScalar(c));
        console.log("ray intersect w xy plane is (" + xy_intersect.x + ", " + xy_intersect.y, ", " + xy_intersect.z + ")");
    }

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
}

function onMouseMove(event) {
    var pixel_loc_x = event.clientX - container_rect.left;
    var pixel_loc_y = event.clientY - container_rect.top;
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

function onFreqSliderChange(value) {
    //console.log(value);
    //update lfo object
    lfo.setLFOFreq(value);
    //update shader
    bg_quad.material.uniforms.freq.value = value;
}

function onOriginXSliderChange(value) {
    //console.log(value);
    //update lfo object
    lfo.setOriginX(value);
    bg_quad.material.uniforms.origin.value.x = value;
}

function onOriginYSliderChange(value) {
    console.log(value);
    //update lfo object
    lfo.setOriginY(value);
    bg_quad.material.uniforms.origin.value.y = value;
}

function toggleFullScreen() {
    if (!fullscreen) {
        var elem = container;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
        elem.style.width = '100%';
        elem.style.height = '100%';
    }
    else {

    }
    fullscreen = !fullscreen;
}

/* #endregion */

/* #region Shaders */

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
        uniform float time;
        uniform vec2 origin;
        uniform float freq;

        varying vec2 vUv;

        void main() {
            //start by getting uvs in screen coords [(-1,-1), (1,1)]
            vec2 uv = (vUv - vec2(0.5,0.5));
            //float dist_origin = length(uv-origin);
            //gl_FragColor = vec4(0, 1, 0.5, 0.5);
            gl_FragColor = texture2D(bg_tex, vUv);
            //gl_FragColor.b = 0.7;
            gl_FragColor.g = abs(sin((freq*100.*distance(uv, -origin)) + time));
            //gl_FragColor.b = length(uv);
            gl_FragColor.b = distance(uv, origin);
        }
    `
}

/* #endregion */

/* #region Helper Functions */
function vector3ToString(v) {
    return "(" + v.x + ", " + v.y + ", " + v.z + ")";
}

