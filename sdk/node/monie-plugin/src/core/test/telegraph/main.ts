import { Plugin } from "@/plugin";
import { dirname } from "path";


class TelegraphMain extends Plugin {
  constructor() {
    super(__dirname)
  }
}

const telegraph = new TelegraphMain();
telegraph.run();
