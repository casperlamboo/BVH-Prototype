export const length = ({ x, y, z }) => Math.sqrt(x * x + y * y + z * z);
export const scale = ({ x, y, z }, s) => ({ x: x * s, y: y * s, z: z * s });
export const dot = ({ x: xa, y: ya, z: za }, { x: xb, y: yb, z: zb }) => xa * xb + ya * yb + za * zb;
export const add = ({ x: xa, y: ya, z: za }, { x: xb, y: yb, z: zb }) => ({
  x: xa + xb,
  y: ya + yb,
  z: za + zb,
});
export const applyMatrix4 = ({ x, y, z }, m) => {
  const w = 1 / (m[12] * x + m[13] * y + m[14] * z + m[15]);

  return {
    x: (m[0] * x + m[1] * y + m[2]  * z + m[3])  * w,
    y: (m[4] * x + m[5] * y + m[6]  * z + m[7])  * w,
    z: (m[8] * x + m[9] * y + m[10] * z + m[11]) * w,
  };
};
