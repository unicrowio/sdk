import JSS, { SheetsManager } from "jss";
import preset from "jss-preset-default";

const manager = new SheetsManager();
const jss = JSS.setup(preset());

export { jss, manager };
