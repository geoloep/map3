export default `
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 a_position;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(a_position.x, a_position.y, 0.0, 1.0);
}`;
