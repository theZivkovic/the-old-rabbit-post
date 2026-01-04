import {Application, Assets, HTMLText, Sprite} from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({background: "#1099bb", resizeTo: window});

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load("/assets/bunny.png");

  const html = new HTMLText({
    text: "👦👮🏻🧙✉️",
    style: {
      fontFamily: "Arial",
      fontSize: 72,
      fill: "#ff1010",
      align: "center",
    },
  });

  html.position.set(app.screen.width / 2 - 50, 20);

  app.stage.addChild(html);

  // Create a bunny Sprite
  const bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;
  });
})();
