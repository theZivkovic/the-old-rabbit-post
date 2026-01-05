import {Application, Graphics, HTMLText} from "pixi.js";
import {Button} from "@pixi/ui";
import {createBlueBookEntry, getAllBlueBookEntries} from "./apiClient";
import {BlueBookEntry, BlueBookEntryStatus} from "./blueBookEntry";

function formatCharacterText(iconEmoji: string, name: string, count: number) {
  return count === 0
    ? `<b>${iconEmoji} ${name}</b><br/><small>idle</small>`
    : `<b>${iconEmoji} ${name}</b><br/><small>delivering: ${count} x ✉️</small>`;
}

(async () => {
  const app = new Application();
  let blueBookEntries: Array<BlueBookEntry> = [];
  await app.init({background: "#1099bb", resizeTo: window});

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  //

  // add otto's stand
  const ottosStand = new HTMLText({
    text: formatCharacterText(
      "👦",
      "Otto",
      blueBookEntries.filter((x) => x.status === BlueBookEntryStatus.NEW).length
    ),
    style: {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "white",
      align: "left",
    },
  });
  ottosStand.position.set(app.screen.width / 4, app.screen.height / 2);
  app.stage.addChild(ottosStand);

  // add carlo's stand
  const carlosPost = new HTMLText({
    text: formatCharacterText("🧙", "Carlo", 0),
    style: {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "white",
      align: "left",
    },
  });
  carlosPost.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(carlosPost);

  // add postmans
  const postmans: Array<HTMLText> = [];
  const postmanPadding = 100;
  const postmanNames = ["Pete", "Paula", "Penny", "Patty", "Prat"];
  for (let i = 0; i < postmanNames.length; i++) {
    const postman = new HTMLText({
      text: formatCharacterText("👮🏻", postmanNames[i], 0),
      style: {
        fontFamily: "Arial",
        fontSize: 24,
        fill: "white",
        align: "left",
      },
    });
    postman.position.set(
      (3 * app.screen.width) / 4.0,
      postmanPadding +
        (app.screen.height - 2 * postmanPadding) * ((i + 1) / 6.0)
    );
    postmans.push(postman);
    app.stage.addChild(postman);
  }

  const button = new Button(new Graphics().rect(0, 0, 100, 50).fill(0xffffff));

  button.onPress.connect(async () => {
    await createBlueBookEntry();
    await refreshBlueBookEntries();
  });

  app.stage.addChild(button.view!);

  let appTimer = 0;

  app.ticker.add(async (time) => {
    appTimer += time.deltaMS;
    if (appTimer > 1000) {
      appTimer -= 1000;
      await refreshBlueBookEntries();
    }
  });

  async function refreshBlueBookEntries() {
    blueBookEntries = await getAllBlueBookEntries();
    ottosStand.text = formatCharacterText(
      "👦",
      "Otto",
      blueBookEntries.filter((x) => x.status === BlueBookEntryStatus.NEW).length
    );
    carlosPost.text = formatCharacterText(
      "🧙",
      "Carlo",
      blueBookEntries.filter(
        (x) => x.status === BlueBookEntryStatus.TAKEN_BY_CARLO
      ).length
    );
    postmans.forEach((postman, index) => {
      postman.text = formatCharacterText(
        "👮🏻",
        postmanNames[index],
        blueBookEntries.filter(
          (x) =>
            x.status === BlueBookEntryStatus.TAKEN_BY_POSTMAN &&
            x.delivering_by === postmanNames[index]
        ).length
      );
    });
  }
})();
