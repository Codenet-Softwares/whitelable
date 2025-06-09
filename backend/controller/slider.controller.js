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
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, 'Data must be an array'));
    }

    // const activeImagesCount = await sliderSchema.count({ where: { isActive: true } });

    // if (activeImagesCount + data.length > 3) {
    //   return res
    //     .status(statusCode.badRequest)
    //     .send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 3 active images. Please deactivate or delete existing images.'));
    // }

    let sliderArray = [];

    for (const element of data) {
      const s3FileKey = await awsS3Obj.addDocumentToS3(element.docBase, 'Img_Slider', 'game-slider', 'image/jpeg');

      const cloudfrontUrl = `${process.env.CLOUDFRONT_BASE_URL}/${s3FileKey}`;

      const slider = {
        imageId: uuidv4(),
        image: cloudfrontUrl,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive,
      };

      sliderArray.push(slider);
    }

    const createdSliders = await sliderSchema.bulkCreate(sliderArray);
    return res.status(statusCode.create).send(apiResponseSuccess(createdSliders, true, statusCode.create, 'Slider created successfully.'));
  } catch (error) {
    return res.status(statusCode.internalServerError).send(
      apiResponseErr(
        error.data ?? null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message
      )
    );
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
      return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'No active sliders found.'));
    }
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success, 'Success.'));
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
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success, 'Success.'));
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
    return res.status(statusCode.success).send(apiResponseSuccess(sliderData, true, statusCode.success, 'Slider status updated successfully'));

  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};


export const deleteImgData = async (req, res) => {
  try {
    const { imageId } = req.params;

    const imgData = await sliderSchema.findOne({
      where: { imageId },
    });

    if (!imgData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Image not found'));
    }

    const imageUrl = imgData.image;
    const s3Key = imageUrl.replace(`${process.env.CLOUDFRONT_BASE_URL}/`, '');

    await awsS3Obj.deleteDocumentsFromS3(s3Key, 'game-slider');

    await sliderSchema.destroy({
      where: { imageId },
    });

    return res.status(statusCode.success).send(apiResponseSuccess(imgData, true, statusCode.success, 'Image Deleted Successfully'));
  } catch (error) {
    console.error('Error in deleteImgData:', error);
    return res.status(statusCode.internalServerError)
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
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, 'Data must be an array'));
    }

    // const activeGifsCount = await gifSchema.count({ where: { isActive: true } });

    // if (activeGifsCount + data.length > 2) {
    //   return res
    //     .status(statusCode.badRequest)
    //     .send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 2 active GIFs. Please deactivate or delete existing GIFs.'));
    // }

    let gifArray = [];

    for (const element of data) {
      const s3FileKey = await awsS3Obj.addDocumentToS3(element.docBase, 'Gif', 'gif-slider', 'image/gif');

      // Construct the CloudFront URL
      const cloudfrontUrl = `${process.env.CLOUDFRONT_BASE_URL_GIF}/${s3FileKey}`;

      const gifEntry = {
        imageId: uuidv4(),
        image: cloudfrontUrl,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive ?? true,
      };

      gifArray.push(gifEntry);
    }

    const createdGifs = await gifSchema.bulkCreate(gifArray);
    return res
      .status(statusCode.create)
      .send(apiResponseSuccess(createdGifs, true, statusCode.create, 'GIF created successfully.'));

  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(
        error.data ?? null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message
      ));
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
      return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'No active gif found.'));
    }
    return res.status(statusCode.success).send(apiResponseSuccess(gif, true, statusCode.success, 'Success'));
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
    return res.status(statusCode.success).send(apiResponseSuccess(gif, true, statusCode.success, 'Success'));
  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(error.data ?? null, false, error.responseCode ?? statusCode.internalServerError, error.errMessage ?? error.message));
  }
};

// Done
export const deleteGifData = async (req, res) => {
  try {
    const { imageId } = req.params;

    const gifData = await gifSchema.findOne({
      where: { imageId },
    });

    if (!gifData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Gif not found'));
    }

    const imageUrl = gifData.image;
    const s3Key = imageUrl.replace(`${process.env.CLOUDFRONT_BASE_URL_GIF}/`, '');

    await awsS3Obj.deleteDocumentsFromS3(s3Key, 'gif-slider');

    await gifSchema.destroy({
      where: { imageId },
    });

    return res.status(statusCode.success).send(apiResponseSuccess(gifData, true, statusCode.success, 'Deleted Gif Successfully'));

  } catch (error) {
    console.error('Error in deleteGifData:', error);
    return res.status(statusCode.internalServerError)
      .send(apiResponseErr(
        error.data ?? null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message
      ));
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
    return res.status(statusCode.success).send(apiResponseSuccess(sliderData, true, statusCode.success, 'Gif status updated successfully'));

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
      return res
        .status(statusCode.badRequest)
        .send(apiResponseErr(null, false, statusCode.badRequest, 'Data must be an array'));
    }

    // const activeImagesCount = await gameImgSchema.count({ where: { isActive: true } });

    // if (activeImagesCount + data.length > 3) {
    //   return res
    //     .status(statusCode.badRequest)
    //     .send(apiResponseErr(null, false, statusCode.badRequest, 'Cannot add more than 3 active images. Please deactivate or delete existing images.'));
    // }

    let imageArray = [];

    for (const element of data) {
      const s3FileKey = await awsS3Obj.addDocumentToS3(element.docBase, 'Game_Img', 'game-slider', 'image/jpeg');

      const cloudfrontUrl = `${process.env.CLOUDFRONT_BASE_URL}/${s3FileKey}`;

      const imageData = {
        imageId: uuidv4(),
        image: cloudfrontUrl,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive ?? true,
      };

      imageArray.push(imageData);
    }

    const createdImages = await gameImgSchema.bulkCreate(imageArray);

    return res
      .status(statusCode.create)
      .send(apiResponseSuccess(createdImages, true, statusCode.create, 'Game image created successfully.'));
  } catch (error) {
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(
        error.data ?? null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message
      ));
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
      return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'No active game image found.'));
    }
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success, 'Success'));
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
    return res.status(statusCode.success).send(apiResponseSuccess(sliders, true, statusCode.success, 'Success'));
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
  try {
    const { imageId } = req.params;
    const imgData = await gameImgSchema.findOne({
      where: { imageId },
    });

    if (!imgData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Game Image not found'));
    }

    const imageUrl = imgData.image;
    const s3Key = imageUrl.replace(`${process.env.CLOUDFRONT_BASE_URL}/`, '');

    await awsS3Obj.deleteDocumentsFromS3(s3Key, 'game-slider');

    await gameImgSchema.destroy({
      where: { imageId },
    });

    return res.status(statusCode.success).send(apiResponseSuccess(imgData, true, statusCode.success, 'Game Img Deleted Successfully'));
  } catch (error) {
    console.error('Error in deleteGameData:', error);
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
      const s3FileKey = await awsS3Obj.addDocumentToS3(element.docBase, 'Inner_Img', 'game-slider', 'image/jpeg');

      const cloudfrontUrl = `${process.env.CLOUDFRONT_BASE_URL}/${s3FileKey}`;

      const slider = {
        imageId: uuidv4(),
        image: cloudfrontUrl,
        text: element.text,
        headingText: element.headingText,
        isActive: element.isActive ?? true,
      };
      sliderArray.push(slider);
    }
    
    const createdSliders = await innerImgSchema.bulkCreate(sliderArray);
    return res.status(statusCode.create).send(apiResponseSuccess(createdSliders, true, statusCode.create, 'Image created successfully.'));

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
      return res.status(statusCode.badRequest).send(apiResponseErr(null, false, statusCode.badRequest, 'No active image found.'));
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
  try {
    const { imageId } = req.params;
    const imgData = await innerImgSchema.findOne({
      where: { imageId },
    });

    if (!imgData) {
      return res.status(statusCode.notFound).send(apiResponseErr(null, false, statusCode.notFound, 'Image not found'));
    }

    const imageUrl = imgData.image;
    const s3Key = imageUrl.replace(`${process.env.CLOUDFRONT_BASE_URL}/`, '');

    await awsS3Obj.deleteDocumentsFromS3(s3Key, 'game-slider');

    await innerImgSchema.destroy({
      where: { imageId },
    });

    return res.status(statusCode.success).send(apiResponseSuccess(imgData, true, statusCode.success, 'Image Deleted Successfully'));

  } catch (error) {
    console.error('Error in deleteInnerImgData:', error);
    return res
      .status(statusCode.internalServerError)
      .send(apiResponseErr(
        error.data ?? null,
        false,
        error.responseCode ?? statusCode.internalServerError,
        error.errMessage ?? error.message
      ));
  }
};


/*
    Inner Img Function Ends's.....
*/