import { rgb } from "pdf-lib";

export function onSaveImage(
  signatureType,
  xyPosition,
  index,
  signKey,
  image,
  isAutoSign,
  widgetsType,
  imgUrl,
  defaultStampImg,
  defaultStampType
) {
  let widgetName;
  const isSignOrInitials =
    widgetsType && ["signature", "initials"].includes(widgetsType);
  //get current page position
  const getXYData = xyPosition[index].pos;
  const updateXYData = getXYData.map((position) => {
    if (position.key === signKey) {
      widgetName = position?.options?.name;
      return {
        ...position,
        SignUrl: imgUrl || image?.src || defaultStampImg,
        ImageType: image?.imgType || defaultStampType,
        ...(isSignOrInitials && { signatureType: signatureType || "" }),
        options: {
          ...position.options,
          response: imgUrl || image?.src || defaultStampImg
        }
      };
    }
    return position;
  });
  const updateXYposition = xyPosition.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: updateXYData };
    }
    return obj;
  });

  // condition when user apply auto sign feature for any type upload image (signature,initials,stamp,image)
  if (isAutoSign) {
    const updatedArray = updateXYposition.map((page) => ({
      ...page,
      pos: page.pos.map(
        (item) =>
          // below condition is check if image widget name same then apply to auto sign other wise not
          // and for other widget like signature,stamp,initials apply auto sign for all remaining widgets
          item.type === widgetsType &&
          (item.type !== "image" || item.options.name === widgetName)
            ? {
                ...item,
                SignUrl: image?.src || defaultStampImg,
                ImageType: image?.imgType || defaultStampType,
                options: {
                  ...item.options,
                  response: image?.src || defaultStampImg
                }
              }
            : item // Otherwise, keep it unchanged
      )
    }));

    return updatedArray;
  } else {
    return updateXYposition;
  }
}

export const onImageSelect = (setImage, file) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onloadend = function (e) {
    let width, height;
    const image = new Image();
    image.src = e.target.result;
    image.onload = function () {
      width = image.width;
      height = image.height;
      const aspectRatio = 460 / 184;
      const imgR = width / height;
      if (imgR > aspectRatio) {
        width = 460;
        height = 460 / imgR;
      } else {
        width = 184 * imgR;
        height = 184;
      }
    };
    image.src = reader.result;
    setImage({ src: image.src, imgType: file.type });
  };
};

export const compressedFileSize = (file, setImage) => {
  // Create a new FileReader instance to read the uploaded file
  const reader = new FileReader();

  // Event listener triggered when the file is read successfully
  reader.onload = (e) => {
    // Create a new Image instance to manipulate the image data
    const img = new Image();

    // Set the image source to the file's data URL (base64 string)
    img.src = e.target.result;

    // Event listener triggered when the image is fully loaded
    img.onload = () => {
      // Create a canvas element to resize and compress the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d"); // Get the drawing context of the canvas

      // Set the canvas dimensions, ensuring they don't exceed 1920x1920
      canvas.width = Math.min(img.width, 1920); // Limit width to 1920px
      canvas.height = Math.min(img.height, 1920); // Limit height to 1920px

      // Draw the image onto the canvas with the specified dimensions
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Get the original file type (default to "image/png" if not recognized)
      const fileType = "image/png"; //file.type || "image/png"
      // Compress the image and convert it into a Blob
      canvas.toBlob(
        (blob) => {
          // Create a new File object from the compressed Blob
          const compressedFile = new File([blob], file.name, {
            type: fileType, // Set the file type to JPEG
            lastModified: Date.now() // Update the last modified timestamp
          });
          // Pass the compressed file to a custom function for further processing
          onImageSelect(setImage, compressedFile);
        },
        fileType, // Output format for the compressed image
        0.3 // Compression quality (30%)
      );
    };
  };

  // Read the file as a data URL (base64 string) to be processed
  reader.readAsDataURL(file);
};

export const fetchImageBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  } catch (error) {
    throw new Error("Error converting URL to base64:", error);
  }
};

export const changeImageWH = async (base64Image) => {
  const newWidth = 300;
  const newHeight = 120;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      const resizedBase64 = canvas.toDataURL("image/png", 1.0);
      resolve(resizedBase64);
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};

export const getWidgetsFontColor = (type) => {
  switch (type) {
    case "red":
      return rgb(1, 0, 0);
    case "black":
      return rgb(0, 0, 0);
    case "blue":
      return rgb(0, 0, 1);
    case "yellow":
      return rgb(0.9, 1, 0);
    default:
      return rgb(0, 0, 0);
  }
};

export const isBase64 = (str) => {
  const base64Pattern =
    /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)?;base64,[A-Za-z0-9+/=]+$/;
  return base64Pattern.test(str);
};

export const forceBreakLongWord = (word, width, font, fontSize) => {
  const parts = [];
  let current = "";

  for (const char of word) {
    const lineWidth = font.widthOfTextAtSize(current + char, fontSize);

    if (lineWidth <= width) {
      current += char;
    } else {
      parts.push(current);
      current = char;
    }
  }
  if (current) parts.push(current);

  return parts;
};

export const isEmptyValue = (val) =>
  val === null ||
  val === undefined ||
  (typeof val === "string" && val.trim() === "") ||
  (Array.isArray(val) && val.length === 0);
