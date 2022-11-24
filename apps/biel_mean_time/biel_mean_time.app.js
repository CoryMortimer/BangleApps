// v2

// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);
// position on screen
const X = 115,
  Y = 115;
let previousBeat;
let previousDecibeat;
let currentInterval;

const calculateBeat = () => {
  const dateTime = new Date();
  const timeZoneOffsetMinutes = dateTime.getTimezoneOffset();
  const hourTimezoneOffset = (60 + timeZoneOffsetMinutes) / 60;
  return (
    ((((dateTime.getHours() + hourTimezoneOffset) % 24) +
      dateTime.getMinutes() / 60 +
      dateTime.getSeconds() / 3600 +
      dateTime.getMilliseconds() / 3600000) *
      1000) /
    24
  );
};

const drawTime = (beat) => {
  // Reset the state of the graphics library
  g.reset();
  // draw the current time (4x size 7 segment)
  g.setFont("7x11Numeric7Seg", 4);
  g.setFontAlign(1, 1); // align right bottom

  const wholeBeat = Math.floor(beat);
  const upToMilliBeatStr = ((Math.round(beat * 1000) / 1000) % 1).toFixed(3);
  const decibeat = upToMilliBeatStr.substring(2, 3);
  const centibeat = upToMilliBeatStr.substring(3, 4);
  if (wholeBeat !== previousBeat) {
    previousBeat = wholeBeat;
    g.drawString(wholeBeat, X, Y, true /*clear background*/);
  }

  g.setFont("7x11Numeric7Seg", 2);

  if (decibeat !== previousDecibeat) {
    previousDecibeat = decibeat;
    g.drawString("." + decibeat, X + 20, Y, true /*clear background*/);
  }
  //g.drawString(upToMilliBeat, X+100, Y, true /*clear background*/);
  // draw centiBeat
  g.drawString(centibeat, X + 35, Y, true /*clear background*/);
};

const findNextCentibeatToSyncWith = (currentBeat) => {
  const remainder = currentBeat % 1;
  const nextWholeCentibeat = Math.ceil(remainder * 100);
  const valueToRoundToWholeCentibeat = (nextWholeCentibeat - 0.05) / 100;
  return valueToRoundToWholeCentibeat;
};

const calculateNextTick = () => {
  const currentBeat = calculateBeat();
  drawTime(currentBeat);

  centibeatToSyncWith = findNextCentibeatToSyncWith(currentBeat);
  const fractionalBeats = currentBeat % 1;
  const difference = centibeatToSyncWith - fractionalBeats;

  if (difference > 0) {
    const seconds = difference / 0.011574;
    const milliseconds = Math.floor(seconds * 1000);
    setTimeout(() => {
      drawTime(calculateBeat());
      currentInterval = setInterval(() => {
        drawTime(calculateBeat());
      }, 864);
    }, milliseconds);
  } else {
    currentInterval = setInterval(() => {
      drawTime(calculateBeat());
    }, 864);
  }
};

Bangle.on("lcdPower", (on) => {
  if (currentInterval) clearInterval(currentInterval);
  currentInterval = undefined;
  if (on) {
    calculateNextTick();
  }
});

g.clear();
calculateNextTick();

/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
