class LFO {
    constructor(colorA = new THREE.Vector4(0, 0, 0, 1), colorB = new THREE.Vector4(1, 1, 1, 1), origin = new THREE.Vector2(0, 0), freq = 1, opacity=0.5) {
        //a vector2 in screen space
        this.origin = origin;
        this.freq = freq;
        this.colorA = colorA;
        this.colorB = colorB;
        this.opacity = opacity;
        return this;
    }

    setLFOFreq(value) { this.freq = value; }

    setOriginX(value) { this.origin.x = value; }

    setOriginY(value) { this.origin.y = value; }

    setColorARed(value) { this.colorA.x = value; }

    setColorAGreen(value) { this.colorA.y = value; }

    setColorABlue(value) { this.colorA.z = value; }

    setColorBRed(value) { this.colorB.x = value; }

    setColorBGreen(value) { this.colorB.y = value; }

    setColorBBlue(value) { this.colorB.z = value; }

    setAlpha(value) {
        this.colorA.w = value;
        this.colorB.w = value;
    }
}

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

var bg_quad;
var lfo;

var start_time;
var current_time;

var freq_slider;
var colorA_sampler;
var colorB_sampler;

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
            freq: { type: "float", value: lfo.freq },
            colorA: {type: "vec3", value: new THREE.Vector3(0,0,0)},
            colorB: {type: "vec3", value: new THREE.Vector3(1,1,1)},
            opacity: {type: "float", value: 0.5}
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
    //setup color sample
    colorA_sampler = document.getElementsByClassName('color-a-sample')[0];
    colorB_sampler = document.getElementsByClassName('color-b-sample')[0];


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

function onColorARedSliderChange(slider) {
    lfo.colorA.x = slider.value/255;
    console.log(lfo.colorA.x);
    slider.style.background = RGB2HTML(slider.value,0,0);
    updateColorA();
}

function onColorAGreenSliderChange(slider) {
    lfo.colorA.y = slider.value/255;
    console.log(lfo.colorA.y);
    slider.style.background = RGB2HTML(0,slider.value,0);
    updateColorA();
}

function onColorABlueSliderChange(slider) {
    lfo.colorA.z = slider.value/255;
    console.log(lfo.colorA.z);
    slider.style.background = RGB2HTML(0,0,slider.value);
    updateColorA();
}

function updateColorA() {
    colorA_sampler.style.background = RGB2HTML(lfo.colorA.x*255, lfo.colorA.y*255, lfo.colorA.z*255);
    bg_quad.material.uniforms.colorA.value = lfo.colorA;
}

function onColorBRedSliderChange(slider) {
    lfo.colorB.x = slider.value/255;
    console.log(lfo.colorB.x);
    slider.style.background = RGB2HTML(slider.value,0,0);
    updateColorB();
}

function onColorBGreenSliderChange(slider) {
    lfo.colorB.y = slider.value/255;
    console.log(lfo.colorB.y);
    slider.style.background = RGB2HTML(0,slider.value,0);
    updateColorB();
}

function onColorBBlueSliderChange(slider) {
    lfo.colorB.z = slider.value/255;
    console.log(lfo.colorB.z);
    slider.style.background = RGB2HTML(0,0,slider.value);
    updateColorB();
}

function updateColorB() {
    colorB_sampler.style.background = RGB2HTML(lfo.colorB.x*255, lfo.colorB.y*255, lfo.colorB.z*255);
    bg_quad.material.uniforms.colorB.value = lfo.colorB;
}

function onOpacitySliderChange(value) {
    lfo.colorB.opacity = value;
    bg_quad.material.uniforms.opacity.value = value;
}

function fullScreen() {
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
        float circle_constant;

        uniform sampler2D bg_tex;
        uniform float time;
        uniform vec2 origin;
        uniform float freq;
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform float opacity;

        varying vec2 vUv;

        void main() {
            //start by getting uvs in screen coords [(-1,-1), (1,1)]
            vec2 uv = (vUv - vec2(0.5,0.5));
            gl_FragColor.r = 0.;
            //gl_FragColor.b = 0.7;
            //gl_FragColor.g = abs(sin((freq*100.*distance(uv, -origin)) + time));
            circle_constant = abs(sin((freq*100.*distance(uv, -origin)) + time));
            gl_FragColor.r = distance(uv, origin);
            gl_FragColor.rgb = mix(colorA, colorB, circle_constant);
            gl_FragColor.a = opacity;
        }
    `
}

/* #endregion */

/* #region Helper Functions */
function vector3ToString(v) {
    return "(" + v.x + ", " + v.y + ", " + v.z + ")";
}

function RGB2HTML(r, g, b){
    return "rgb("+r+","+g+","+b+")";
}
/*#endregion*/
