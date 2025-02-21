import { Window } from "@glacier-app/core";
import { getUrl } from "./another.js";

const window = new Window({ title: "Example App" });

window.loadUrl(getUrl());
window.show();
