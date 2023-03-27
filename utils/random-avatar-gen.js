const RandomAvatar = (width = 45, height = 45, pixelCount = 32, border = true, borderSize = 2.5, grid = 8) => {
    let pixelPositions = []
    let avatarSvg = "";
    let insideW, insideH;
    let pixelSize = { height: 0, width: 0 };

    let pixelColor = `rgb(${Math.round(Math.random() * 201) + 40},${Math.round(Math.random() * 201) + 40},${Math.round(Math.random() * 201) + 40})`;
    let backgroundColor = `rgb(${Math.round(Math.random() * 201) + 40},${Math.round(Math.random() * 201) + 40},${Math.round(Math.random() * 201) + 40})`;

    if (border) {
        insideW = width - borderSize * 2;
        insideH = height - borderSize * 2;
    } else {
        insideH = height;
        insideW = width;
    }

    pixelSize.height = (insideH / grid);
    pixelSize.width = (insideW / grid);

    const checkForDuplicate = (pos) => {
        let isDuplicate = false;
        // console.log('position', pos);
        for (let key in pixelPositions) {
            // console.log("\t save positions",pixelPositions[key]);
            if (pos.x === pixelPositions[key].x && pos.y === pixelPositions[key].y) {
                // console.log(pixelPositions[key]);
                // console.log(pos);
                isDuplicate = true;
                break;
            }
        }
        return isDuplicate;
    }


    avatarSvg = `<svg width="${width}px" height="${height}px" viewBox="-${border ? borderSize : 0} -${border ? borderSize : 0} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`
    avatarSvg += `<rect width="${width}" height="${height}" x="-${border ? borderSize : 0}" y="-${border ? borderSize : 0}" style="fill:${pixelColor}"/>`
    avatarSvg += `<rect width="${insideW}" height="${insideH}" x="0" y="0" style="fill:${backgroundColor}"/>`

    for (let i = 0; i < pixelCount; i++) {
        let position = { x: 0, y: 0 };
        do {
            position.x = Math.round(Math.random() * (grid - 1)) * pixelSize.width;
            position.y = Math.round(Math.random() * (grid - 1)) * pixelSize.height;
        } while (checkForDuplicate(position))

        let pixel = `<rect width="${pixelSize.width * 1.05}" height="${pixelSize.height * 1.05}" x="${position.x}" y="${position.y}" style="fill:${pixelColor}"/>`;
        pixelPositions.push({ x: position.x, y: position.y });
        avatarSvg += pixel;
    }
    avatarSvg += "</svg>";
    return avatarSvg;
}

exports.RandomAvatar = RandomAvatar;