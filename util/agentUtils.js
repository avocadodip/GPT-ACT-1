const fs = require("fs");

async function image_to_base64(image_file) {
  return await new Promise((resolve, reject) => {
    fs.readFile(image_file, (err, data) => {
      if (err) {
        console.error("😔 Could not read the file:", err);
        reject();
        return;
      }

      const base64Data = data.toString("base64");
      const dataURI = `data:image/jpeg;base64,${base64Data}`;
      resolve(dataURI);
    });
  });
}

async function sleep(milliseconds) {
  return await new Promise((r, _) => {
    setTimeout(() => {
      r();
    }, milliseconds);
  });
}

// DOM Labeler
async function labelPage(page) {
  const items = await page.evaluate(() => {
    // First, remove any existing markings from a previous invocation
    const existingMarks = document.querySelectorAll(".mark-page-highlight");
    existingMarks.forEach((el) => el.remove());

    // Function to generate random colors for the borders and labels
    function getRandomColor() {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }

    // Process all elements on the page to find those that should be marked
    items = Array.prototype.slice
      .call(document.querySelectorAll("*"))
      .map(function (element) {
        var vw = Math.max(
          document.documentElement.clientWidth || 0,
          window.innerWidth || 0
        );
        var vh = Math.max(
          document.documentElement.clientHeight || 0,
          window.innerHeight || 0
        );

        var rects = [...element.getClientRects()]
          .filter((bb) => {
            var center_x = bb.left + bb.width / 2;
            var center_y = bb.top + bb.height / 2;
            var elAtCenter = document.elementFromPoint(center_x, center_y);

            return elAtCenter === element || element.contains(elAtCenter);
          })
          .map((bb) => {
            const rect = {
              left: Math.max(0, bb.left),
              top: Math.max(0, bb.top),
              right: Math.min(vw, bb.right),
              bottom: Math.min(vh, bb.bottom),
            };
            return {
              ...rect,
              width: rect.right - rect.left,
              height: rect.bottom - rect.top,
            };
          });

        var area = rects.reduce(
          (acc, rect) => acc + rect.width * rect.height,
          0
        );

        return {
          element: element,
          include:
            element.tagName === "INPUT" ||
            element.tagName === "TEXTAREA" ||
            element.tagName === "SELECT" ||
            element.tagName === "BUTTON" ||
            element.tagName === "A" ||
            element.onclick != null ||
            window.getComputedStyle(element).cursor == "pointer" ||
            element.tagName === "IFRAME" ||
            element.tagName === "VIDEO",
          area,
          rects,
          text: element.textContent.trim().replace(/\s{2,}/g, " "),
        };
      })
      .filter((item) => item.include && item.area >= 20);

    // Filter out elements that are fully contained within another marked element
    items = items.filter(
      (x) => !items.some((y) => x.element.contains(y.element) && !(x === y))
    );

    // Mark each identified element with a dashed border and label
    items.forEach(function (item, index) {
      item.rects.forEach((bbox) => {
        const newElement = document.createElement("div");
        newElement.classList.add("mark-page-highlight"); // Add a class for potential cleanup
        const borderColor = getRandomColor();
        newElement.style.outline = `2px dashed ${borderColor}`;
        newElement.style.position = "fixed";
        newElement.style.left = `${bbox.left}px`;
        newElement.style.top = `${bbox.top}px`;
        newElement.style.width = `${bbox.width}px`;
        newElement.style.height = `${bbox.height}px`;
        newElement.style.pointerEvents = "none"; // Ensure the overlay doesn't interfere with interaction
        newElement.style.boxSizing = "border-box";
        newElement.style.zIndex = "2147483647"; // Use a high z-index to overlay on top of most page content

        // Create and add a label to the overlay element
        const label = document.createElement("span");
        label.textContent = index; // Label each element with a unique index
        label.style.position = "absolute";
        label.style.top = "-19px";
        label.style.left = "0px";
        label.style.background = borderColor;
        label.style.color = "white";
        label.style.padding = "2px 4px";
        label.style.fontSize = "12px";
        label.style.borderRadius = "2px";
        newElement.appendChild(label);

        document.body.appendChild(newElement); // Add the overlay to the page
      });
    });

    // At the end of your page.evaluate function, return the items array
    return items.map((item) => {
      // Map or transform items as needed for your use case
      return {
        x: (item.rects[0].left + item.rects[0].right) / 2,
        y: (item.rects[0].top + item.rects[0].bottom) / 2,
        bboxs: item.rects.map(({ left, top, width, height }) => [
          left,
          top,
          width,
          height,
        ]),
      };
    });
  });

  return items;
}

async function waitForEvent(page, event) {
  return page.evaluate((event) => {
    return new Promise((r, _) => {
      document.addEventListener(event, function (e) {
        r();
      });
    });
  }, event);
}

module.exports = { image_to_base64, sleep, labelPage, waitForEvent };
