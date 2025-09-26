import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    productId:{
        type: mongoose.Schema.ObjectId,
        ref : 'Product',
        required : true
    },
    quantity:{
        type : Number,
        default : 1
    },
    userId:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required : true
    }
},
    {
        timestamps: true
    }
)

export const Cart = mongoose.model('Cart', cartSchema)