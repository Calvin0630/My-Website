export default class LFO {
    constructor(origin = new THREE.Vector2(0, 0), freq = 1) {
        //a vector2 in screen space
        this.origin  = origin;
        this.freq = freq;
        return this;
    }
}