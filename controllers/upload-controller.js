const uploadImage = (req,res,next) =>{
    return res.status(200).json({foodImage:req.file});
}

exports.uploadImage = uploadImage;