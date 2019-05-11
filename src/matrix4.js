export const identity = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];
export const multiply = ([
  a11, a12, a13, a14,
  a21, a22, a23, a24,
  a31, a32, a33, a34,
  a41, a42, a43, a44,
], [
  b11, b12, b13, b14,
  b21, b22, b23, b24,
  b31, b32, b33, b34,
  b41, b42, b43, b44,
]) => {
  const c11 = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
  const c12 = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
  const c13 = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
  const c14 = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

  const c21 = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
  const c22 = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
  const c23 = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
  const c24 = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

  const c31 = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
  const c32 = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
  const c33 = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
  const c34 = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

  const c41 = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
  const c42 = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
  const c43 = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
  const c44 = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

  return [
    c11, c12, c13, c14,
    c21, c22, c23, c24,
    c31, c32, c33, c34,
    c41, c42, c43, c44,
  ];
};
export const rotationX = theta => {
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  return [
    1, 0,  0, 0,
    0, c, -s, 0,
    0, s,  c, 0,
    0, 0,  0, 1,
  ];
};
export const rotationY = theta => {
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  return [
     c, 0, s, 0,
     0, 1, 0, 0,
    -s, 0, c, 0,
     0, 0, 0, 1,
  ];
};
export const rotationZ = theta => {
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  return [
    c, -s, 0, 0,
    s,  c, 0, 0,
    0,  0, 1, 0,
    0,  0, 0, 1,
  ];
};
export const scale = ({ x, y, z }) => [
  x, 0, 0, 0,
  0, y, 0, 0,
  0, 0, z, 0,
  0, 0, 0, 1,
];
export const translate = ({ x, y, z }) => [
  1, 0, 0, x,
  0, 1, 0, y,
  0, 0, 1, z,
  0, 0, 0, 1,
];
export const perspective = (fov, aspect, near, far) => {
  const top = near * Math.tan(0.5 * fov);
  const height = 2 * top;
  const width = aspect * height;

  const bottom = top - height;
  const left = -0.5 * width;
  const right = left + width;

  const x = 2 * near / width;
  const y = 2 * near / height;

  const a = (right + left) / width / 2;
  const b = (top + bottom) / height / 2;
  const c = -(far + near) / (far - near);
  const d = -2 * far * near / (far - near);

  return [
    x, 0,  a, 0,
    0, y,  b, 0,
    0, 0,  c, d,
    0, 0, -1, 0
  ];
};
export const screen = (width, height) => {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  return multiply(
    translate({ x: halfWidth, y: halfHeight, z: 0 }),
    scale({ x: halfWidth, y: halfHeight, z: 1 })
  );
};
