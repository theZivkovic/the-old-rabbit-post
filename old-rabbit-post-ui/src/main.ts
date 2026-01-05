import {Application, Graphics, HTMLText} from "pixi.js";
import {Button} from "@pixi/ui";
import {BlueBookEntry} from "./blueBookEntry";

async function getAllBlueBookEntries() {
  const response = await fetch("http://localhost:3000/blue-book-entries");
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  return (await response.json()) as Array<BlueBookEntry>;
}

(async () => {
  const app = new Application();
  await app.init({background: "#1099bb", resizeTo: window});

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  //✉️

  // add otto's stand
  const ottosStand = new HTMLText({
    text: "👦",
    style: {
      fontFamily: "Arial",
      fontSize: 72,
      fill: "#ff1010",
      align: "center",
    },
  });
  ottosStand.position.set(app.screen.width / 4, app.screen.height / 2);
  app.stage.addChild(ottosStand);

  // add carlo's stand
  const carlosPost = new HTMLText({
    text: "🧙",
    style: {
      fontFamily: "Arial",
      fontSize: 72,
      fill: "#ff1010",
      align: "center",
    },
  });
  carlosPost.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(carlosPost);

  // add postmans
  const postmanPadding = 100;
  const postmanNames = ["Pete", "Paula", "Penny", "Patty", "Prat"];
  for (let i = 0; i < 5; i++) {
    const postman = new HTMLText({
      text: `👮🏻 ${postmanNames[i]}`,
      style: {
        fontFamily: "Arial",
        fontSize: 48,
        fill: "white",
        align: "center",
      },
    });
    postman.position.set(
      (3 * app.screen.width) / 4.0,
      postmanPadding +
        (app.screen.height - 2 * postmanPadding) * ((i + 1) / 6.0)
    );
    app.stage.addChild(postman);
  }

  const button = new Button(new Graphics().rect(0, 0, 100, 50).fill(0xffffff));

  button.onPress.connect(() => alert("Button pressed!"));

  app.stage.addChild(button.view!);

  let appTimer = 0;

  app.ticker.add(async (time) => {
    appTimer += time.deltaMS;
    if (appTimer > 1000) {
      appTimer -= 1000;
      //const blueBookEntries = await getAllBlueBookEntries();
      //console.log("Blue Book Entries:", blueBookEntries);
    }
  });
})();
