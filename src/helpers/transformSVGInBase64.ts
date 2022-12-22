import { Buffer } from "buffer";

export const transformSVGInBase64 = (svgFile: string) => {
  const imageInBase64 = Buffer.from(svgFile).toString("base64");
  const imageReadyToTagImg = `data:image/svg+xml;base64,${imageInBase64}`;
  return imageReadyToTagImg;
};
