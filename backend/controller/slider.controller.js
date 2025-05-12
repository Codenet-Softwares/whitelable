import awsS3Obj from "../helper/awsS3.js";
import { apiResponseErr, apiResponseSuccess } from "../helper/errorHandler.js";
import { statusCode } from "../helper/statusCodes.js";
import { v4 as uuidv4 } from 'uuid';
import sliderSchema from "../models/slider.model.js";
import gifSchema from "../models/gif.model.js";
import gameImgSchema from "../models/gameImg.model.js";
import innerImgSchema from "../models/innerSliderImg.model.js";

/*
     Slider Image Function Starts's.....
  */

export const createSlider = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
         return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Data must be an array'));
      
    }

    const activeImagesCount = await sliderSchema.count({ where: { isActive: true } });

    if (activeImagesCount + data.length > 3) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 3 active images. Please deactivate or delete existing images.'));
    }

    let sliderArray = [];

    for (const element of data) {
      const result = await awsS3Obj.addDocumentToS3(element.docBase, 'Img_Slider', 'game-slider', 'image/jpeg');
      const slider = {
        imageId: uuidv4(),
        image: result,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive,
      };
      sliderArray.push(slider);
    }

    const createdSliders = await sliderSchema.bulkCreate(sliderArray);
     return res.status(statusCode.create).send(apiResponseSuccess(createdSliders, true, statusCode.create,'Slider created successfully.'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

//  Done
export const getSliderTextImg = async (req, res) => {
  try {
    const sliders = await sliderSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
      where: {
        isActive: true,
      },
    });
    if (!sliders.length) {
        return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'No active sliders found.'));
    }
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success,'Success.'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const getAllSliderTextImg = async (req, res) => {
  try {
    const sliders = await sliderSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
    });
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success,'Success.'));
  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

// Done
export const activeSlider = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { imageId } = req.params;

    const sliderData = await sliderSchema.findOne({
      where: { imageId },
    });

    if (!sliderData) {
        return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Image not found'));
    }

    sliderData.update({ isActive });
    return res.status(statusCode.success).send(apiResponseSuccess(sliderData, true, statusCode.success,'Slider status updated successfully'));

  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const deleteImgData = async (req, res) => {
  const { imageId } = req.params;

  try {
    const imgData = await sliderSchema.findOne({
      where: {
        imageId: imageId,
      },
    });

    if (!imgData) {
        return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Image not found'));
    }

    await sliderSchema.destroy({
      where: {
        imageId: imageId,
      },
    });
    return res.status(statusCode.success).send(apiResponseSuccess(imgData, true, statusCode.success,'Image Deleted Successfully'));
  } catch (error) {
    console.error('Error in deleteGifData:', error);
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

/*
     Slider Image Function End's.....
  */

/*
     Gif Function Starts's.....
  */
// Done
export const createGif = async (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Data must be an array'));
    }

    const activeGifsCount = await gifSchema.count({ where: { isActive: true } });

    if (activeGifsCount + data.length > 2) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 2 active GIFs. Please deactivate or delete existing GIFs.'));
    }

    let sliderArray = [];

    for (const element of data) {
      const result = await awsS3Obj.addDocumentToS3(element.docBase, 'Gif', 'gif-slider', 'image/gif');
      const slider = {
        imageId: uuidv4(),
        image: result,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive ?? true,
      };
      sliderArray.push(slider);
    }

    const createdSliders = await gifSchema.bulkCreate(sliderArray);
    return res.status(statusCode.create).send(apiResponseSuccess(createdSliders, true, statusCode.create,'Gif created successfully.'));

  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};


export const getGif = async (req, res) => {
  try {
    const gif = await gifSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
      where: {
        isActive: true,
      },
    });
    if (!gif.length) {
        return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'No active gif found.'));
    }
    return res.status(statusCode.success).send(apiResponseSuccess(gif, true, statusCode.success,'Success'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const getAllGif = async (req, res) => {
  try {
    const gif = await gifSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
    });
    return res.status(statusCode.success).send(apiResponseSuccess(gif, true, statusCode.success,'Success'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

// Done
export const deleteGifData = async (req, res) => {
  const { imageId } = req.params;

  try {
    const gifData = await gifSchema.findOne({
      where: {
        imageId: imageId,
      },
    });

    if (!gifData) {
        return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Gif not found'));
    }

    await gifSchema.destroy({
      where: {
        imageId: imageId,
      },
    });

    return res.status(statusCode.success).send(apiResponseSuccess(gifData, true, statusCode.success,'Deleted Gif Successfully'));

  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const activeGif = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { imageId } = req.params;

    const sliderData = await gifSchema.findOne({
      where: { imageId },
    });

    if (!sliderData) {
        return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Gif not found'));
    }

    sliderData.update({ isActive });
    return res.status(statusCode.success).send(apiResponseSuccess(sliderData, true, statusCode.success,'Gif status updated successfully'));

  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

/*
     Gif Function Ends's.....
  */

/*
     Game Img Function Start's.....
  */

export const createGameImg = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Data must be an array'));
    }

    const activeImagesCount = await gameImgSchema.count({ where: { isActive: true } });

    if (activeImagesCount + data.length > 3) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 3 active images. Please deactivate or delete existing images.'));
    }

    let sliderArray = [];

    for (const element of data) {
      const result = await awsS3Obj.addDocumentToS3(element.docBase, 'Game_Img', 'game-slider', 'image/jpeg');
      const slider = {
        imageId: uuidv4(),
        image: result,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive ?? true,
      };
      sliderArray.push(slider);
    }
    const createdSliders = await gameImgSchema.bulkCreate(sliderArray);
    return res.status(statusCode.create).send(apiResponseSuccess(createdSliders, true, statusCode.create,'Game image created successfully.'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const getGameImg = async (req, res) => {
  try {
    const sliders = await gameImgSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
      where: {
        isActive: true,
      },
    });
    if (!sliders.length) {
        return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'No active game image found.'));
    }
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success,'Success'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const getAllGameImg = async (req, res) => {
  try {
    const sliders = await gameImgSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
    });
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success,'Success'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const activeGame = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { imageId } = req.params;

    const sliderData = await gameImgSchema.findOne({
      where: { imageId },
    });

    if (!sliderData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Game image not found'));
    }

    sliderData.update({ isActive });

    return res.status(statusCode.success).send(apiResponseSuccess(sliderData, true, statusCode.success, 'Game image updated successfully'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const deleteGameData = async (req, res) => {
  const { imageId } = req.params;

  try {
    const imgData = await gameImgSchema.findOne({
      where: {
        imageId: imageId,
      },
    });

    if (!imgData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Game Image not found'));
    }

    await gameImgSchema.destroy({
      where: {
        imageId: imageId,
      },
    });

    return res.status(statusCode.success).send(apiResponseSuccess(imgData, true, statusCode.success, 'Game Img Deleted Successfully'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

/*
     Game Img Function Ends's.....
  */

/*
     Inner Img Function Start's.....
  */

export const createInnerImg = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
        return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'Data must be an array'));
    }

    let sliderArray = [];

    for (const element of data) {
      const result = await awsS3Obj.addDocumentToS3(element.docBase, 'Inner_Img', 'game-slider', 'image/jpeg');
      const slider = {
        imageId: uuidv4(),
        image: result,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive ?? true,
      };
      sliderArray.push(slider);
    }
    const createdSliders = await innerImgSchema.bulkCreate(sliderArray);
    return res.status(statusCode.create).send(apiResponseSuccess(createdSliders, true, statusCode.create,'Image created successfully.'));

  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const getInnerImg = async (req, res) => {
  try {
    const sliders = await innerImgSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
      where: {
        isActive: true,
      },
    });
    if (!sliders.length) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'No active image found.'));
    }
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success, 'Success'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const getAllInnerImg = async (req, res) => {
  try {
    const sliders = await innerImgSchema.findAll({
      attributes: ['imageId', 'image', 'text', 'headingText', 'isActive'],
    });
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success, 'Success'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const activeInnerImg = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { imageId } = req.params;

    const sliderData = await innerImgSchema.findOne({
      where: { imageId },
    });

    if (!sliderData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Image not found'));
    }

    sliderData.update({ isActive });

    return res.status(statusCode.success).send(apiResponseSuccess(sliderData, true, statusCode.success, 'Image updated successfully'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

export const deleteInnerImgData = async (req, res) => {
  const { imageId } = req.params;

  try {
    const imgData = await innerImgSchema.findOne({
      where: {
        imageId: imageId,
      },
    });

    if (!imgData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Image not found'));
    }

    await innerImgSchema.destroy({
      where: {
        imageId: imageId,
      },
    });

    return res.status(statusCode.success).send(apiResponseSuccess(imgData, true, statusCode.success, 'Image Deleted Successfully'));
  } catch (error) {
    return res
    .status(statusCode.internalServerError)
    .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

/*
    Inner Img Function Ends's.....
*/
