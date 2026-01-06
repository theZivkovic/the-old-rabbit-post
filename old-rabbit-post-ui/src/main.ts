import {Application, FederatedPointerEvent, HTMLText} from "pixi.js";
import {Button} from "@pixi/ui";
import {createBlueBookEntry, getAllBlueBookEntries} from "./apiClient";
import {BlueBookEntryStatus} from "./blueBookEntry";

function formatCharacterText(iconEmoji: string, name: string, count: number) {
  return count === 0
    ? `<b>${iconEmoji} ${name}</b><br/><small>idle</small>`
    : `<b>${iconEmoji} ${name}</b><br/><small>delivering: ${count} x ✉️</small>`;
}

function createOttosStand(app: Application): HTMLText {
  const ottosStand = new HTMLText({
    text: formatCharacterText("👦", "Otto", 0),
    style: {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "white",
      align: "left",
    },
  });
  ottosStand.position.set(app.screen.width / 4, app.screen.height / 2);
  return ottosStand;
}

function createCarlosPost(app: Application): HTMLText {
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
  return carlosPost;
}

function createPostmans(
  app: Application,
  postmanNames: Array<string>
): Array<HTMLText> {
  const postmans: Array<HTMLText> = [];
  const postmanPadding = 100;
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
  }
  return postmans;
}

function createSendButton(
  app: Application,
  onPress: (btn?: Button | undefined, e?: FederatedPointerEvent) => void
): Button {
  const buttonHtml = new HTMLText({
    text: "Send ✉️",
    style: {
      fontFamily: "Arial",
      fontSize: 24,
      fill: "white",
      align: "left",
    },
  });
  buttonHtml.position.set(100, app.screen.height / 2.0);

  const button = new Button(buttonHtml);
  button.onPress.connect(onPress);
  return button;
}

(async () => {
  const app = new Application();
  await app.init({background: "#1099bb", resizeTo: window});

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const postmanNames = ["Pete", "Paula", "Penny", "Patty", "Prat"];

  const ottosStand = createOttosStand(app);
  const carlosPost = createCarlosPost(app);
  const postmans = createPostmans(app, postmanNames);

  const sendButton = createSendButton(app, async () => {
    await createBlueBookEntry();
    await refreshBlueBookEntries();
  });

  app.stage.addChild(ottosStand);
  app.stage.addChild(carlosPost);
  postmans.forEach((postman) => app.stage.addChild(postman));
  app.stage.addChild(sendButton.view!);

  let appTimer = 0;

  const ONE_SECOND_MS = 1000;
  app.ticker.add(async (time) => {
    appTimer += time.deltaMS;
    if (appTimer > ONE_SECOND_MS) {
      appTimer -= ONE_SECOND_MS;
      await refreshBlueBookEntries();
    }
  });

  async function refreshBlueBookEntries() {
    const blueBookEntries = await getAllBlueBookEntries();
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
