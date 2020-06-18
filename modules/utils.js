function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function getChildFrameByName(frame, name) {
  const frameName = await frame.name();

  if (frameName === name) {
    return frame;
  }
  for (const child of frame.childFrames()) {
    const resFrame = await getChildFrameByName(child, name);
    if (resFrame) return resFrame;
  }
}

module.exports = {
  sleep,
  getChildFrameByName,
}